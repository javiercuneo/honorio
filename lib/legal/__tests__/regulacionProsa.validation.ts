// ---------------------------------------------------------------
// Validacion del texto de la regulacion en prosa.
//
// **Esta es la validacion mas importante de las diecisiete, y no
// porque cubra mas.** Las otras dieciseis comparan numeros, y hasta
// ahora eso alcanzaba porque todo lo que el motor producia era un
// numero. La prosa no: produce un documento con forma de resolucion
// judicial, que alguien va a pegar en un expediente, y **ninguna de
// las validaciones existentes mira prosa**.
//
// El diagnostico esta escrito en ESTADO.md del repositorio de las
// calculadoras y ya se pago una vez:
//
//   El mismo proceso produce codigo que funciona y prosa
//   confiadamente falsa, porque uno tiene realimentacion y la otra no.
//
// Son tres controles y ninguno es caro:
//
// 1. **Ningun numero inventado.** Cada importe y cada porcentaje del
//    texto tiene que estar en el CalculoResultado que lo origino. Es
//    el mismo razonamiento que el control de citas de
//    verificar-docs.mjs: no dice que el texto sea correcto —eso no se
//    puede automatizar— pero caza la clase de error mas cara.
// 2. **El texto congelado.** Para un resultado fijo, el texto tiene
//    que ser identico caracter por caracter. Cualquier cambio de
//    redaccion aparece en el diff y se revisa a proposito, en vez de
//    colarse.
// 3. **La banda se respeta.** Un punto fuera de la banda no se
//    redacta: devuelve error y texto vacio.
//
// Uso: npx tsx lib/legal/__tests__/regulacionProsa.validation.ts
// ---------------------------------------------------------------

import {
  generarProsa,
  bandasDe,
  verificarNumeros,
  numerosDelTexto,
} from '../regulacion-prosa'
import type { PuntoElegido } from '../regulacion-prosa'
import { buildGeneral } from '../calculate'
import { calcularMediacion } from '../mediacion'
import type { ValorUHOM } from '../uhom'
import type { WizardState, CalculoResultado } from '../types'

let totales = 0
let fallos = 0

function ok(etiqueta: string, condicion: boolean, detalle?: string) {
  totales++
  if (!condicion) {
    fallos++
    console.log('  FAIL ' + etiqueta + (detalle ? '\n       ' + detalle : ''))
  }
}

const UMA = 102_076

function estado(parcial: Partial<WizardState>): WizardState {
  return {
    step: 0,
    valorUMA: UMA,
    tipoProceso: 'conocimiento',
    modoTerminacion: 'sentencia',
    sentenciaResultado: 'admitida',
    aperturaPrueba: true,
    caducidadCriterio: '',
    tuvoExcepciones: null,
    sucesionUnicoLetrado: null,
    medidaOposicion: null,
    homologacionVivienda: null,
    objetoBase: 'sumas_dinero',
    desalojoVivienda: null,
    posesoriasTipo: null,
    alimentosTipo: null,
    baseValor: 50_000_000,
    esProvisorio: false,
    desdeMinimos: false,
    desdeResultado: false,
    ...parcial,
  }
}

/** El punto medio de una banda. **Solo para los tests.** */
function medio(r: CalculoResultado, clave: string): number {
  const banda = bandasDe(r).find((b) => b.clave === clave)
  if (!banda) throw new Error('no hay banda ' + clave)
  return (banda.rango.minUMA + banda.rango.maxUMA) / 2
}

// ================================================================
console.log('1. Ningun numero del texto sale de la nada')
// ================================================================
//
// El barrido: seis casos que recorren las tres etapas de
// transformacion —base, escala y honorarios—, mas la sucesion, que
// trae partidor, y la ejecucion de sentencia, que trae actuaciones
// posteriores.

const CASOS: [string, WizardState][] = [
  ['conocimiento, sentencia admitida', estado({})],
  [
    'conocimiento, demanda desestimada (art. 22 sobre la base)',
    estado({ sentenciaResultado: 'rechazada' }),
  ],
  [
    'conocimiento, antes de la apertura a prueba (art. 25 sobre la escala)',
    estado({ modoTerminacion: 'modos_anormales', sentenciaResultado: null, aperturaPrueba: false }),
  ],
  [
    'desalojo de vivienda (arts. 22 y 40 juntos)',
    estado({ objetoBase: 'desalojo', desalojoVivienda: 'vivienda' }),
  ],
  ['sucesion con un solo letrado', estado({ tipoProceso: 'sucesion', sucesionUnicoLetrado: true })],
  [
    'ejecucion de sentencia sin excepciones',
    estado({ tipoProceso: 'ejecucion_sentencia', tuvoExcepciones: false }),
  ],
]

for (const [etiqueta, st] of CASOS) {
  const r = buildGeneral(st)
  if (!r) {
    ok(etiqueta + ': el motor devuelve resultado', false)
    continue
  }

  // Se regulan todas las bandas que el resultado ofrece, en su punto
  // medio. Es el barrido mas exigente: cualquier banda nueva del motor
  // entra sola a este control.
  const puntos: PuntoElegido[] = bandasDe(r).map((b) => ({
    banda: b.clave,
    uma: (b.rango.minUMA + b.rango.maxUMA) / 2,
    profesional: 'Dra. Prueba',
  }))

  const opciones = { resultado: r, puntos }
  const salida = generarProsa(opciones)

  ok(etiqueta + ': sin errores de banda', salida.errores.length === 0, salida.errores.join(' | '))
  ok(etiqueta + ': sin huecos, porque se dio el nombre', salida.huecos.length === 0, salida.huecos.join(' | '))
  ok(etiqueta + ': el texto no esta vacio', salida.texto.length > 200)

  const intrusos = verificarNumeros(salida.texto, opciones)
  ok(
    etiqueta + ': ningun numero inventado',
    intrusos.length === 0,
    'intrusos: ' + intrusos.join(', '),
  )
}

// ================================================================
console.log('2. El control muerde')
// ================================================================
//
// Un control que nunca falla no es un control. Se le mete al texto un
// importe que el resultado no tiene y se comprueba que lo cace.

{
  const r = buildGeneral(estado({}))!
  const puntos: PuntoElegido[] = [
    { banda: 'patrocinante', uma: medio(r, 'patrocinante'), profesional: 'Dra. Prueba' },
  ]
  const opciones = { resultado: r, puntos }
  const salida = generarProsa(opciones)

  ok('el texto limpio pasa', verificarNumeros(salida.texto, opciones).length === 0)

  const adulterado = salida.texto + '\nRegulo ademas la suma de $7.777.777,77.'
  const intrusos = verificarNumeros(adulterado, opciones)
  ok('un importe inventado se caza', intrusos.includes(7_777_777.77), 'intrusos: ' + intrusos.join(', '))

  // Y el caso peor: un digito de mas en un importe que si existe.
  const conTypo = salida.texto.replace(
    r.baseOriginal.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    '500.000.000,00',
  )
  ok(
    'un cero de mas en la base se caza',
    conTypo !== salida.texto && verificarNumeros(conTypo, opciones).length > 0,
  )
}

// ================================================================
console.log('3. La banda se respeta, y fuera de ella no hay texto')
// ================================================================

{
  const r = buildGeneral(estado({}))!
  const banda = bandasDe(r).find((b) => b.clave === 'patrocinante')!

  const arriba = generarProsa({
    resultado: r,
    puntos: [{ banda: 'patrocinante', uma: banda.rango.maxUMA * 1.01, profesional: 'Dra. Prueba' }],
  })
  ok('un punto por encima del maximo da error', arriba.errores.length === 1)
  ok('y no devuelve texto', arriba.texto === '')

  const abajo = generarProsa({
    resultado: r,
    puntos: [{ banda: 'patrocinante', uma: banda.rango.minUMA * 0.99, profesional: 'Dra. Prueba' }],
  })
  ok('un punto por debajo del minimo da error', abajo.errores.length === 1)
  ok('y no devuelve texto', abajo.texto === '')

  // Los bordes son validos: la banda es cerrada.
  for (const [nombre, uma] of [
    ['el minimo exacto', banda.rango.minUMA],
    ['el maximo exacto', banda.rango.maxUMA],
  ] as [string, number][]) {
    const s = generarProsa({
      resultado: r,
      puntos: [{ banda: 'patrocinante', uma, profesional: 'Dra. Prueba' }],
    })
    ok(nombre + ' es valido', s.errores.length === 0, s.errores.join(' | '))
  }

  // Una banda que este resultado no tiene.
  const inexistente = generarProsa({
    resultado: r,
    puntos: [{ banda: 'partidor', uma: 1, profesional: 'Dra. Prueba' }],
  })
  ok('una banda que el resultado no ofrece da error', inexistente.errores.length === 1)
}

// ================================================================
console.log('4. El hueco del profesional es visible y se declara')
// ================================================================

{
  const r = buildGeneral(estado({}))!
  const salida = generarProsa({
    resultado: r,
    puntos: [{ banda: 'patrocinante', uma: medio(r, 'patrocinante') }],
  })

  ok('el hueco se declara', salida.huecos.length === 1, salida.huecos.join(' | '))
  ok('y aparece en el texto en mayusculas y entre corchetes', salida.texto.includes('[PROFESIONAL]'))
}

// ================================================================
console.log('5. Lo que el generador NO escribe')
// ================================================================
//
// Son decisiones, no olvidos, y por eso se validan: si alguna vuelve a
// aparecer tiene que ser a proposito y con este control en rojo.

{
  const r = buildGeneral(estado({}))!
  const salida = generarProsa({
    resultado: r,
    puntos: [{ banda: 'patrocinante', uma: medio(r, 'patrocinante'), profesional: 'Dra. Prueba' }],
  })
  const t = salida.texto.toLowerCase()

  const PROHIBIDAS: [string, string][] = [
    ['ley 21.839', 'el motor calcula solo por la 27.423'],
    ['21839', 'idem, sin puntos'],
    ['apertura de cuenta', 'es practica del juzgado, no de la ley'],
    ['banco de la nacion', 'idem'],
    ['deox', 'idem'],
    ['domicilio real', 'las pautas de notificacion son del juzgado'],
    ['remision del expediente a la camara', 'la elevacion tambien'],
    ['audiencia de mediacion', 'son honorarios que el motor no calcula'],
    ['caratula', 'Honorio no la tiene y no va como hueco'],
    ['juzgado nacional', 'idem: un juzgado de relleno se pega y no se corrige'],
    ['fojas', 'la narracion del expediente es de otro producto'],
  ]

  for (const [frase, motivo] of PROHIBIDAS) {
    ok('no dice «' + frase + '» — ' + motivo, !t.includes(frase))
  }
}

// ================================================================
console.log('6. El mediador entra con su unidad, no con la UMA')
// ================================================================

{
  const uhom: ValorUHOM = {
    unidad: 'UHOM',
    valor: 12_960,
    fuente: 'Tabla oficial del Ministerio de Justicia',
    url: null,
    capturado: '2026-08-08',
  }

  const r = buildGeneral(estado({ baseValor: 8_000_000, sentenciaResultado: 'rechazada' }))!
  const med = calcularMediacion(r.baseFinal, uhom)
  ok('el mediador calcula', med !== null)

  if (med) {
    const opciones = {
      resultado: r,
      puntos: [
        { banda: 'patrocinante', uma: medio(r, 'patrocinante'), profesional: 'Dra. Prueba' },
      ],
      mediacion: med,
      mediador: 'Dra. Mediadora',
    }
    const salida = generarProsa(opciones)

    ok('el texto nombra al mediador', salida.texto.includes('Dra. Mediadora'))
    ok('y usa UHOM', salida.texto.includes('UHOM'))
    ok(
      'ningun numero inventado con el mediador adentro',
      verificarNumeros(salida.texto, opciones).length === 0,
    )

    // El caso que el plan usa de ejemplo: base $8.000.000 con el art. 22
    // baja a $5.600.000, cae en el item E y da 16 UHOM = $207.360.
    ok('cae en el item E', med.item.item === 'E', 'item=' + med.item.item)
    ok('16 UHOM', Math.abs(med.honorarioUHOM - 16) < 1e-9)
    ok('$207.360', Math.abs(med.honorarioPesos - 207_360) < 1e-6)
    ok('y el importe esta en el texto', salida.texto.includes('207.360,00'))
  }
}

// ================================================================
console.log('7. El texto congelado')
// ================================================================
//
// Para un resultado fijo, el texto tiene que ser identico caracter por
// caracter. **Si este control falla, no significa que algo este mal:**
// significa que la redaccion cambio. Se lee el diff, se comprueba que
// el cambio sea el que se quiso, y se actualiza la constante de abajo.
//
// Sin esto, una reescritura del generador puede cambiar lo que dice
// una resolucion sin que nada lo note.

const ESPERADO = `AUTOS Y VISTOS:

) Base regulatoria:
Tomo como base regulatoria la suma de $50.000.000,00.
Expresada en UMA, con el valor vigente de $102.076,00, la base es de 489,83 UMA.

) Escala aplicable:
Aplico la 6ª escala (451-750 UMA): 13% a 17% (art. 21).
Tengo en consideracion el factor de correlacion, en cuanto a que los honorarios no pueden ser inferiores al maximo del grado inmediato anterior de la escala mas el excedente de la alicuota que corresponde al grado siguiente (art. 21). En el caso, el maximo de la escala anterior es de 90,00 UMA, y las alicuotas se aplican sobre el excedente de 39,83 UMA por sobre las 450,00 UMA del limite anterior.

) Regulacion:
En funcion del monto del asunto referenciado, la complejidad del procedimiento, el resultado obtenido, el merito de la labor profesional, la calidad, eficacia y extension del trabajo realizado y lo dispuesto por el art. 16 de la ley 27.423, regulo los honorarios del siguiente modo:
- Dra. Prueba, letrado patrocinante (art. 21): 96,77 UMA, equivalente al dia de la fecha a $9.878.026,00.

) IVA y plazo:
La regulacion de honorarios no contiene la alicuota que establece ese impuesto. En consecuencia el beneficiario que se encuentre inscripto debera acreditar su condicion y el obligado al pago adicionarle el monto correspondiente (conf. CSJN, 16/06/1993, "Cia. General de Combustibles SA").
Los honorarios deberan ser abonados en el plazo de 10 dias corridos (art. 54 de la ley 27.423).
Notifiquese.
`

{
  const r = buildGeneral(estado({}))!
  const salida = generarProsa({
    resultado: r,
    puntos: [
      { banda: 'patrocinante', uma: r.honorarios.patrocinante.rango.maxUMA, profesional: 'Dra. Prueba' },
    ],
  })

  if (salida.texto !== ESPERADO) {
    console.log('\n  ---- El texto generado ----')
    console.log(salida.texto)
    console.log('  ---- fin ----\n')
  }
  ok('el texto es identico al congelado', salida.texto === ESPERADO)
}

// ================================================================
console.log('8. El lector de numeros lee lo que el generador escribe')
// ================================================================
//
// El control 1 vale lo que valga este: si `numerosDelTexto` no ve un
// importe, el control pasa en verde sobre un numero inventado.

{
  const leidos = numerosDelTexto(
    '$1.234.567,89 y 45,50 UMA y 17,00 % y el art. 21 del Decreto 2536/2011',
  )
  ok('lee el importe con separadores', leidos.includes(1_234_567.89), leidos.join(', '))
  ok('lee la cifra en UMA', leidos.includes(45.5))
  ok('lee el porcentaje', leidos.includes(17))

  // Y lo que **no** tiene que leer, que es la mitad del control: un
  // entero suelto es un identificador, no una cifra del calculo.
  ok('no lee el numero de articulo', !leidos.includes(21))
  ok('no lee el numero del decreto', !leidos.includes(2536), leidos.join(', '))
  ok('no lee el anio', !leidos.includes(2011))
  ok('lee exactamente tres numeros', leidos.length === 3, leidos.join(', '))
}

// ================================================================

console.log('\n========================================')
console.log('Resultado: ' + (fallos === 0 ? 'TODOS OK' : 'HUBO FALLOS'))
console.log('Tests totales: ' + totales + ', fallos: ' + fallos)
console.log('========================================')

process.exit(fallos === 0 ? 0 : 1)
