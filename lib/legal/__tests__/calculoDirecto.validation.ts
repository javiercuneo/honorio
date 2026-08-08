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
