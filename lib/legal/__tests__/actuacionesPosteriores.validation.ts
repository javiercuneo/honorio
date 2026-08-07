// ---------------------------------------------------------------
// Validacion: actuaciones posteriores a la ejecucion propiamente
// dicha (art. 41, ultima oracion).
//
//   "Las actuaciones posteriores a la ejecucion propiamente dicha se
//    regularan en un cuarenta por ciento (40%) de la escala del citado
//    articulo."
//
// Lo que esta validacion existe para impedir, que es la forma
// concreta de equivocarse acá: **que el 40 % se tome de la escala ya
// reducida** en vez de la del art. 21. El mismo art. 41 aplica la
// mitad de la escala a la ejecucion y un -10 % si no hubo
// excepciones; las posteriores no cuelgan de ninguna de las dos.
//
// Las reducciones de **base** si tienen que estar adentro, porque
// llegan en la escala. Eso tambien se comprueba.
//
// Uso: npx tsx lib/legal/__tests__/actuacionesPosteriores.validation.ts
// ---------------------------------------------------------------

import { buildGeneral, calcularActuacionesPosteriores, calcularEscala } from '../calculate'
import type { WizardState } from '../types'

const UMA = 92482
const TOL = 1e-9

let ok = 0
let fail = 0

function chequear(nombre: string, actual: number, esperado: number) {
  if (Math.abs(actual - esperado) <= TOL) {
    ok++
    return
  }
  fail++
  console.log(
    `  FALLA ${nombre}: esperado=${esperado.toFixed(8)} actual=${actual.toFixed(8)}`,
  )
}

function chequearVerdad(nombre: string, condicion: boolean) {
  if (condicion) {
    ok++
    return
  }
  fail++
  console.log(`  FALLA ${nombre}`)
}

function estado(overrides: Partial<WizardState>): WizardState {
  return {
    valorUMA: UMA,
    tipoProceso: 'ejecucion_sentencia',
    baseValor: 5000000,
    objetoBase: '' as never,
    desalojoVivienda: null,
    sentenciaResultado: null,
    modoTerminacion: '' as never,
    caducidadCriterio: '' as never,
    sucesionUnicoLetrado: null,
    aperturaPrueba: null,
    tuvoExcepciones: null,
    posesoriasTipo: null,
    esProvisorio: false,
    ...overrides,
  } as WizardState
}

console.log('========================================')
console.log('Validacion: art. 41, actuaciones posteriores')
console.log('========================================\n')

// ---------------------------------------------------------------
// 1. La funcion aislada: 40 % y los roles del art. 20
// ---------------------------------------------------------------
console.log('1. La funcion, contra la formula')

for (const [min, max] of [[0, 0], [10, 20], [61.93, 80.5], [500, 800]]) {
  const r = calcularActuacionesPosteriores(min, max, UMA)
  const eMin = min * 0.4
  const eMax = max * 0.4

  chequear(`patro.minUMA (${min})`, r.patrocinante.minUMA, eMin)
  chequear(`patro.maxUMA (${max})`, r.patrocinante.maxUMA, eMax)
  chequear(`patro.minPesos (${min})`, r.patrocinante.minPesos, eMin * UMA)
  chequear(`patro.maxPesos (${max})`, r.patrocinante.maxPesos, eMax * UMA)
  // Art. 20: apoderado 1,4 y procurador 0,4 del patrocinante.
  chequear(`apo.minUMA (${min})`, r.apoderado.minUMA, eMin * 1.4)
  chequear(`apo.maxUMA (${max})`, r.apoderado.maxUMA, eMax * 1.4)
  chequear(`proc.minUMA (${min})`, r.procurador.minUMA, eMin * 0.4)
  chequear(`proc.maxUMA (${max})`, r.procurador.maxUMA, eMax * 0.4)
}

// ---------------------------------------------------------------
// 2. De punta a punta: sale de la escala del art. 21, no de la mitad
// ---------------------------------------------------------------
console.log('2. De punta a punta, contra la escala del art. 21')

const BASES = [500000, 5000000, 50000000, 500000000]

for (const base of BASES) {
  const escala = calcularEscala(base, UMA)
  if (!escala) {
    chequearVerdad(`escala calculable para base ${base}`, false)
    continue
  }

  const r = buildGeneral(estado({ baseValor: base, tuvoExcepciones: true }))
  const post = r.actuacionesPosteriores
  if (!post) {
    chequearVerdad(`ejecucion_sentencia devuelve posteriores (base ${base})`, false)
    continue
  }

  // Lo central: 40 % de la escala completa del art. 21.
  chequear(
    `base ${base}: posteriores.min = escala.min x 0,40`,
    post.patrocinante.minUMA,
    escala.patrocinante.full.min * 0.4,
  )
  chequear(
    `base ${base}: posteriores.max = escala.max x 0,40`,
    post.patrocinante.maxUMA,
    escala.patrocinante.full.max * 0.4,
  )

  // Y la relacion que lo hace evidente: la ejecucion va al 50 % y las
  // posteriores al 40 % de lo mismo, asi que son 0,8 del honorario.
  // Si alguna vez el 40 % se tomara de la escala ya partida al medio,
  // esta comprobacion daria 0,4 y no 0,8.
  chequear(
    `base ${base}: posteriores = honorario de la ejecucion x 0,8`,
    post.patrocinante.minUMA,
    r.honorarios.patrocinante.rango.minUMA * 0.8,
  )
}

// ---------------------------------------------------------------
// 3. El -10 % del art. 41 no las toca
// ---------------------------------------------------------------
console.log('3. El -10 % por no haber excepciones no las alcanza')

const conExc = buildGeneral(estado({ tuvoExcepciones: true }))
const sinExc = buildGeneral(estado({ tuvoExcepciones: false }))

chequearVerdad(
  'sin excepciones el honorario de la ejecucion baja',
  sinExc.honorarios.patrocinante.rango.minUMA <
    conExc.honorarios.patrocinante.rango.minUMA,
)
chequear(
  'las posteriores no cambian (min)',
  sinExc.actuacionesPosteriores!.patrocinante.minUMA,
  conExc.actuacionesPosteriores!.patrocinante.minUMA,
)
chequear(
  'las posteriores no cambian (max)',
  sinExc.actuacionesPosteriores!.patrocinante.maxUMA,
  conExc.actuacionesPosteriores!.patrocinante.maxUMA,
)

// ---------------------------------------------------------------
// 4. Las reducciones de base si estan adentro
// ---------------------------------------------------------------
console.log('4. Las reducciones de base llegan por la escala')

const plena = buildGeneral(estado({ baseValor: 50000000, tuvoExcepciones: true }))
const rechazada = buildGeneral(
  estado({ baseValor: 50000000, tuvoExcepciones: true, sentenciaResultado: 'rechazada' }),
)
const escalaReducida = calcularEscala(50000000 * 0.7, UMA)!

chequearVerdad(
  'con la demanda rechazada las posteriores bajan',
  rechazada.actuacionesPosteriores!.patrocinante.minUMA <
    plena.actuacionesPosteriores!.patrocinante.minUMA,
)
chequear(
  'y salen de la escala sobre la base ya reducida',
  rechazada.actuacionesPosteriores!.patrocinante.minUMA,
  escalaReducida.patrocinante.full.min * 0.4,
)

// ---------------------------------------------------------------
// 5. Solo la ejecucion de sentencia las tiene
// ---------------------------------------------------------------
console.log('5. Ningun otro proceso las devuelve')

for (const tipo of ['conocimiento', 'ejecutivo', 'sucesion'] as const) {
  const r = buildGeneral(estado({ tipoProceso: tipo }))
  chequearVerdad(
    `${tipo} no devuelve actuacionesPosteriores`,
    r.actuacionesPosteriores === undefined,
  )
}

console.log('\n========================================')
console.log(`Resultado: ${fail === 0 ? 'TODOS OK' : 'HUBO FALLOS'}`)
console.log(`Afirmaciones: ${ok + fail}, fallos: ${fail}`)
console.log('========================================')

process.exit(fail === 0 ? 0 : 1)
