// ---------------------------------------------------------------
// Validacion del calculo directo (sin entrevista, sin reducciones).
//
// El control que importa es el primero: **el modo directo tiene que
// dar exactamente lo mismo que la entrevista recorrida por un caso
// sin ninguna reduccion.** Si los dos caminos alguna vez difieren,
// uno de los dos esta mal, y esto lo dice sin que nadie tenga que
// acordarse de comparar a mano.
//
// El segundo control es un ancla externa: los numeros de la hoja de
// calculo que se venia usando antes de que esto existiera. No salen
// del motor, asi que si el motor cambia y la hoja no, se nota.
//
// Uso: npx tsx lib/legal/__tests__/calculoDirecto.validation.ts
// ---------------------------------------------------------------

import { calcularDirecto, fraccionDeRango } from '../calculo-directo'
import { buildGeneral } from '../calculate'
import type { WizardState } from '../types'

let totales = 0
let fallos = 0

/** Los honorarios se comparan en UMA, que es la unidad del calculo. */
const EPS = 1e-9

function ok(etiqueta: string, condicion: boolean, detalle?: string) {
  totales++
  if (!condicion) {
    fallos++
    console.log('  FAIL ' + etiqueta + (detalle ? '\n       ' + detalle : ''))
  }
}

function igual(etiqueta: string, actual: number, esperado: number, eps = EPS) {
  ok(
    etiqueta,
    Math.abs(actual - esperado) < eps,
    'actual=' + actual + '  esperado=' + esperado,
  )
}

// ================================================================
// 1. El control cruzado contra la entrevista
// ================================================================
//
// Un conocimiento con sentencia admitida, apertura a prueba y objeto
// "sumas de dinero" no dispara ninguna de las nueve reglas de
// resolveReglas(): ni las tres de base, ni las tres de escala, ni las
// tres finales. Es el caso sin reducciones, y por eso su resultado
// tiene que ser identico al del modo directo.

function estadoSinReducciones(base: number, uma: number): WizardState {
  return {
    step: 0,
    valorUMA: uma,
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
    baseValor: base,
    exhortoInciso: '',
    exhortoMontoTipo: '',
    exhortoMonto: 0,
    exhortoActos: 0,
    esProvisorio: false,
    desdeMinimos: false,
    desdeResultado: false,
  }
}

console.log('Control cruzado: modo directo vs entrevista sin reducciones')

const CASOS_CRUZADOS: [number, number][] = [
  [1_000_000, 102_076],
  [21_368_714.99, 102_076],
  [50_000_000, 102_076],
  [500_000, 102_076],
  [900_000_000, 102_076],
]

for (const [base, uma] of CASOS_CRUZADOS) {
  const d = calcularDirecto(base, uma)
  const g = buildGeneral(estadoSinReducciones(base, uma))
  const et = 'base ' + base.toLocaleString('es-AR')

  if (!d) {
    ok(et + ' devuelve resultado', false)
    continue
  }

  // La entrevista no aplico ninguna transformacion: si aplico alguna,
  // el caso elegido dejo de ser "sin reducciones" y este control ya no
  // prueba lo que dice probar.
  ok(
    et + ' la entrevista no aplica transformaciones',
    g.transformaciones.length === 0,
    'aplico: ' + g.transformaciones.map((t) => t.id).join(', '),
  )
  igual(et + ' base sin reducir', g.baseFinal, g.baseOriginal)

  igual(et + ' patrocinante min', d.patrocinante.tres.minUMA, g.honorarios.patrocinante.rango.minUMA)
  igual(et + ' patrocinante max', d.patrocinante.tres.maxUMA, g.honorarios.patrocinante.rango.maxUMA)
  igual(et + ' apoderado min', d.apoderado.tres.minUMA, g.honorarios.apoderado.rango.minUMA)
  igual(et + ' apoderado max', d.apoderado.tres.maxUMA, g.honorarios.apoderado.rango.maxUMA)
  igual(et + ' procurador min', d.procurador.tres.minUMA, g.honorarios.procurador.rango.minUMA)
  igual(et + ' procurador max', d.procurador.tres.maxUMA, g.honorarios.procurador.rango.maxUMA)
  igual(et + ' auxiliares min', d.auxiliares.rango.minUMA, g.auxiliares.minUMA)
  igual(et + ' auxiliares max', d.auxiliares.rango.maxUMA, g.auxiliares.maxUMA)

  igual(et + ' base en UMA', d.baseEnUMA, g.escala!.baseEnUMA)
  ok(et + ' mismo titulo de escala', d.escala.titulo === g.escala!.titulo,
     'directo="' + d.escala.titulo + '"  entrevista="' + g.escala!.titulo + '"')

  if (g.segundaInstancia) {
    igual(et + ' 2a instancia patro 30 %',
      d.segundaInstancia.patrocinante.minimo.minUMA,
      g.segundaInstancia.patrocinante.minimo.minUMA)
    igual(et + ' 2a instancia patro revocada',
      d.segundaInstancia.patrocinante.revocada.maxUMA,
      g.segundaInstancia.patrocinante.revocada.maxUMA)
  }
}

// ================================================================
// 2. El ancla externa: la hoja de calculo
// ================================================================
//
// Valores tomados de la planilla que se usaba antes de que este modo
// existiera, con su base y su UMA. No derivan del motor.

console.log('Ancla externa: la hoja de calculo')

const hoja = calcularDirecto(21_368_714.99, 102_076)!
const CIFRAS = 1e-3

igual('hoja · base en UMA', hoja.baseEnUMA, 209.341, CIFRAS)
ok('hoja · 5a escala', hoja.escala.titulo.startsWith('5ª'), hoja.escala.titulo)
igual('hoja · patrocinante 3 etapas min', hoja.patrocinante.tres.minUMA, 41.901, CIFRAS)
igual('hoja · patrocinante 3 etapas max', hoja.patrocinante.tres.maxUMA, 44.868, CIFRAS)
igual('hoja · apoderado 3 etapas min', hoja.apoderado.tres.minUMA, 58.662, CIFRAS)
igual('hoja · apoderado 3 etapas max', hoja.apoderado.tres.maxUMA, 62.816, CIFRAS)
igual('hoja · patrocinante 2 etapas min', hoja.patrocinante.dos.minUMA, 27.934, CIFRAS)
igual('hoja · patrocinante 2 etapas max', hoja.patrocinante.dos.maxUMA, 29.912, CIFRAS)
igual('hoja · patrocinante 1 etapa min', hoja.patrocinante.una.minUMA, 13.967, CIFRAS)
igual('hoja · patrocinante 1 etapa max', hoja.patrocinante.una.maxUMA, 14.956, CIFRAS)
igual('hoja · apoderado 1 etapa min', hoja.apoderado.una.minUMA, 19.554, CIFRAS)
igual('hoja · apoderado 1 etapa max', hoja.apoderado.una.maxUMA, 20.939, CIFRAS)
igual('hoja · auxiliares min', hoja.auxiliares.rango.minUMA, 10.467, CIFRAS)
igual('hoja · auxiliares max', hoja.auxiliares.rango.maxUMA, 20.934, CIFRAS)
igual('hoja · auxiliares promedio', hoja.auxiliares.promedioUMA, 15.701, CIFRAS)

// ================================================================
// 2 bis. Ancla externa: un fallo que hace la cuenta
// ================================================================
//
// CFed. Mendoza, Sala B, "Castañeda c/ Estado Nacional y SENASA",
// FMZ 61000834/2010/CA1-CA3, 12/03/2021. Es la mejor ancla que tiene
// este archivo y por lejos: **no es una hoja de calculo nuestra, es un
// tribunal enumerando los siete pasos y corriendolos con numeros.**
//
// La sentencia dice, textual:
//
//   "Piso minimo que no se puede franquear (maximo del grado inmediato
//    anterior de la escala): 11,7 UMA (26% de 45 UMA)."
//   "Excedente: 26,07 UMA (71,07 BR - 45 UMA)."
//   "el juez no puede regular menos de 16,39 UMA ni mas de 17,95 UMA."
//
// Base $226.872,44 con la UMA de la Ac. CSJN 2/20, $3.192.
//
// Es lo que funda ESCALA_CORRELACION, y por eso vale como control y no
// solo como cita: si algun dia alguien "arregla" el factor de
// correlacion para que acumule todos los maximos previos, esto falla
// contra una sentencia y no contra una opinion nuestra.

console.log('Ancla externa: CFed. Mendoza, Sala B, "Castañeda"')

const cast = calcularDirecto(226_872.44, 3_192)!

// La sentencia trunca en el centesimo en vez de redondear -escribe
// 17,95 donde la cuenta da 17,9581-, asi que se compara con esa
// tolerancia y no con la del resto del archivo.
const TRUNCA = 0.01

igual('Castañeda · base en UMA', cast.baseEnUMA, 71.07, TRUNCA)
ok('Castañeda · 3a escala', cast.escala.titulo.startsWith('3ª'), cast.escala.titulo)
igual('Castañeda · piso del grado anterior', cast.escala.maximoEscalaAnterior, 11.7)
igual('Castañeda · el piso es el 26 % de 45 UMA', cast.escala.maximoEscalaAnterior, 45 * 0.26)
igual('Castañeda · excedente sobre 45 UMA', cast.escala.excedente, 26.07, TRUNCA)
igual('Castañeda · regulacion minima', cast.patrocinante.tres.minUMA, 16.39, TRUNCA)
igual('Castañeda · regulacion maxima', cast.patrocinante.tres.maxUMA, 17.95, TRUNCA)

// Y lo que el fallo descarta sin nombrarlo: acumular todos los maximos
// previos daria 12,75 de piso, y la banda entera se correria.
ok(
  'Castañeda · el piso NO es 12,75 (la lectura contraria)',
  Math.abs(cast.escala.maximoEscalaAnterior - 12.75) > 1e-6,
  'el piso quedo en ' + cast.escala.maximoEscalaAnterior,
)

// Un cuarto de una etapa, que la hoja tenia como fila fija.
const cuarto = fraccionDeRango(hoja.patrocinante.una, 0.25)
igual('hoja · 1/4 de etapa min', cuarto.minUMA, 3.492, CIFRAS)
igual('hoja · 1/4 de etapa max', cuarto.maxUMA, 3.739, CIFRAS)

// ================================================================
// 3. Invariantes entre roles y etapas
// ================================================================

console.log('Invariantes')

for (const [base, uma] of CASOS_CRUZADOS) {
  const d = calcularDirecto(base, uma)!
  const et = 'base ' + base.toLocaleString('es-AR')

  // Art. 20: el apoderado es 1,4 veces el patrocinante; el procurador
  // el 40 %. En las tres etapas, no solo en el completo.
  for (const etapa of ['tres', 'dos', 'una'] as const) {
    igual(et + ' apoderado=1,4x patro (' + etapa + ')',
      d.apoderado[etapa].minUMA, d.patrocinante[etapa].minUMA * 1.4)
    igual(et + ' procurador=0,4x patro (' + etapa + ')',
      d.procurador[etapa].maxUMA, d.patrocinante[etapa].maxUMA * 0.4)
  }

  // Art. 29: dos etapas son 2/3 del completo; una, 1/3.
  igual(et + ' dos etapas = 2/3', d.patrocinante.dos.minUMA, d.patrocinante.tres.minUMA * 2 / 3)
  igual(et + ' una etapa = 1/3', d.patrocinante.una.maxUMA, d.patrocinante.tres.maxUMA / 3)

  // Los pesos son la UMA por el valor, siempre.
  igual(et + ' pesos = UMA x valor', d.patrocinante.tres.minPesos, d.patrocinante.tres.minUMA * uma)

  // Art. 21: los auxiliares son el 5 % y el 10 % de la base.
  igual(et + ' auxiliares 5 %', d.auxiliares.rango.minUMA, d.baseEnUMA * 0.05)
  igual(et + ' auxiliares 10 %', d.auxiliares.rango.maxUMA, d.baseEnUMA * 0.10)
  igual(et + ' promedio auxiliares',
    d.auxiliares.promedioUMA,
    (d.auxiliares.rango.minUMA + d.auxiliares.rango.maxUMA) / 2)

  // El excedente es lo que pasa del limite del tramo anterior.
  igual(et + ' excedente', d.escala.excedente, d.baseEnUMA - d.escala.limiteAnterior)
}

// ================================================================
// 4. La base no se redondea
// ================================================================
//
// calculadoras/honorarios.html redondeaba la base en UMA cuando caia
// cerca de un borde de tramo y **calculaba con el redondeo**. Con
// 15,4 UMA daba lo de 15. Esto comprueba que aca no pasa.

console.log('Sin redondeo en los bordes de tramo')

const UMA_T = 100_000
for (const enUMA of [15.4, 45.4, 90.4, 150.4, 450.4, 750.4]) {
  const conDecimales = calcularDirecto(enUMA * UMA_T, UMA_T)!
  const redondeado = calcularDirecto(Math.round(enUMA) * UMA_T, UMA_T)!
  ok(
    'base ' + enUMA + ' UMA no se trata como ' + Math.round(enUMA),
    Math.abs(conDecimales.patrocinante.tres.minUMA - redondeado.patrocinante.tres.minUMA) > 1e-6,
    'las dos dan ' + conDecimales.patrocinante.tres.minUMA,
  )
  igual('base ' + enUMA + ' UMA se conserva', conDecimales.baseEnUMA, enUMA, 1e-9)
}

// ================================================================
// 4 bis. El hueco entre un grado y el siguiente
// ================================================================
//
// La tabla del art. 21 esta escrita con enteros y entre un renglon y
// el otro queda un hueco: el primero cierra en 15 UMA y el segundo se
// rotula desde 16, asi que 15,4 no esta nombrada por ninguno. Igual
// en los otros cinco cortes.
//
// Honorio la toma en el grado de ARRIBA y mide el excedente desde el
// limite cerrado —15— y no desde el entero del rotulo —16—. Es un
// hueco de criterio declarado, sin fallo ni doctrina detras, y esta
// escrito arriba de calcularEscala(). Esto lo fija en numeros: es una
// eleccion, y una eleccion se puede cambiar sin querer.

console.log('El hueco entre grados cae en el grado de arriba')

/** Cada corte con el grado de arriba que le corresponde. */
const CORTES: [corte: number, tituloDeArriba: string][] = [
  [15, '2ª escala (16-45 UMA): 20% a 26%'],
  [45, '3ª escala (46-90 UMA): 18% a 24%'],
  [90, '4ª escala (91-150 UMA): 17% a 22%'],
  [150, '5ª escala (151-450 UMA): 15% a 20%'],
  [450, '6ª escala (451-750 UMA): 13% a 17%'],
  [750, '7ª escala (+750 UMA): 12% a 15%'],
]

for (const [corte, tituloDeArriba] of CORTES) {
  for (const decimal of [0.1, 0.4, 0.5, 0.6, 0.9]) {
    const enUMA = corte + decimal
    const d = calcularDirecto(enUMA * UMA_T, UMA_T)!
    const et = 'base ' + enUMA + ' UMA'

    ok(
      et + ' cae en el grado de arriba',
      d.escala.titulo === tituloDeArriba,
      'cayo en ' + d.escala.titulo,
    )

    // Lo que separa esto de un redondeo: el excedente se mide desde el
    // limite que la ley cierra, no desde el entero del rotulo. Con
    // 15,4 son 0,4 UMA de excedente sobre 15, y no 15,4 - 16.
    igual(et + ' mide el excedente desde ' + corte, d.escala.limiteAnterior, corte)
    igual(et + ' excedente', d.escala.excedente, decimal, 1e-9)
  }

  // El limite exacto NO se va para arriba: el renglon de abajo dice
  // "hasta 15" y 15 esta adentro. Los cortes del motor son `<=`.
  const enElLimite = calcularDirecto(corte * UMA_T, UMA_T)!
  ok(
    'base ' + corte + ' UMA exacta se queda en el grado de abajo',
    enElLimite.escala.titulo !== tituloDeArriba,
    'cayo en ' + enElLimite.escala.titulo,
  )
}

// Y el otro lado del hueco, para que quede dicho que no hay salto: el
// entero del rotulo cae en el mismo grado que el decimal que lo
// precede. Si algun dia alguien implementara el rotulo literalmente,
// 15,4 y 16 quedarian en grados distintos y esto lo cazaria.
for (const [corte, tituloDeArriba] of CORTES) {
  const rotulo = calcularDirecto((corte + 1) * UMA_T, UMA_T)!
  ok(
    'base ' + (corte + 1) + ' UMA cae en el mismo grado que ' + (corte + 0.4),
    rotulo.escala.titulo === tituloDeArriba,
    'cayo en ' + rotulo.escala.titulo,
  )
}

// ================================================================
// 5. Fracciones de etapa y entradas invalidas
// ================================================================

console.log('Fracciones y bordes')

const r = calcularDirecto(50_000_000, 102_076)!.patrocinante.una
igual('fraccion 0,3 sobre min', fraccionDeRango(r, 0.3).minUMA, r.minUMA * 0.3)
igual('fraccion 0,3 sobre pesos', fraccionDeRango(r, 0.3).maxPesos, r.maxPesos * 0.3)
igual('fraccion 1 no cambia nada', fraccionDeRango(r, 1).minUMA, r.minUMA)
igual('fraccion 0 anula', fraccionDeRango(r, 0).maxPesos, 0)

ok('base 0 devuelve null', calcularDirecto(0, 102_076) === null)
ok('UMA 0 devuelve null', calcularDirecto(1_000_000, 0) === null)
ok('UMA negativa devuelve null', calcularDirecto(1_000_000, -1) === null)

// ================================================================

console.log('\n========================================')
console.log('Resultado: ' + (fallos === 0 ? 'TODOS OK' : 'HUBO FALLOS'))
console.log('Tests totales: ' + totales + ', fallos: ' + fallos)
console.log('========================================')

process.exit(fallos === 0 ? 0 : 1)
