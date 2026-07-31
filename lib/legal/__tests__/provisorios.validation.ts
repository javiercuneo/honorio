// ---------------------------------------------------------------
// Validacion del camino provisorio (art. 12).
//
// Regla: la regulacion provisoria se fija "en el minimo que le
// hubiere podido corresponder". No altera ningun factor del calculo;
// altera que solo el minimo tiene sentido.
//
// Por eso se verifican dos cosas distintas:
//   1. que el resultado quede marcado como provisorio, y
//   2. que los numeros sean identicos a los de la misma causa
//      sin marcar (si cambiaran, la regla estaria mal implementada).
//
// El bug que motivo este archivo: el wizard React manda
// modoTerminacion='provisorios' pero nunca seteaba la bandera
// esProvisorio, asi que el dashboard mostraba banda min-max.
//
// Uso: npx tsx lib/legal/__tests__/provisorios.validation.ts
// ---------------------------------------------------------------

import { buildCalculationResult } from '../calculate'
import type { WizardState, CalculoResultado } from '../types'

const UMA = 92482

function makeState(overrides: Partial<WizardState>): WizardState {
  return {
    step: 0,
    valorUMA: UMA,
    tipoProceso: 'conocimiento',
    modoTerminacion: '',
    sentenciaResultado: null,
    aperturaPrueba: null,
    caducidadCriterio: '',
    tuvoExcepciones: null,
    sucesionUnicoLetrado: null,
    medidaOposicion: null,
    homologacionVivienda: null,
    objetoBase: '',
    desalojoVivienda: null,
    posesoriasTipo: null,
    baseValor: 5000000,
    esProvisorio: false,
    desdeMinimos: false,
    desdeResultado: false,
    ...overrides,
  } as WizardState
}

let allPassed = true
let totalTests = 0
let failedTests = 0

function check(label: string, actual: unknown, expected: unknown) {
  totalTests++
  if (actual !== expected) {
    console.log('  FAIL ' + label + ' esperado=' + String(expected) + ' actual=' + String(actual))
    allPassed = false
    failedTests++
    return
  }
  console.log('  OK   ' + label)
}

/** Todas las cifras del resultado, para comparar dos calculos entre si. */
function cifras(r: CalculoResultado): string {
  return JSON.stringify({
    baseFinal: r.baseFinal,
    patro: r.honorarios.patrocinante.rango,
    apo: r.honorarios.apoderado.rango,
    proc: r.honorarios.procurador.rango,
    aux: r.auxiliares,
    segunda: r.segundaInstancia ?? null,
  })
}

console.log('========================================')
console.log('Validacion: honorarios provisorios (art. 12)')
console.log('========================================\n')

// ---- 1. El modo de terminacion alcanza para marcar el resultado ----
// Es la forma en que lo manda el wizard React, y la que usaria
// cualquier consumidor externo del motor.
console.log('modoTerminacion=provisorios')
for (const tipo of ['conocimiento', 'ejecucion_sentencia', 'ejecutivo'] as const) {
  const r = buildCalculationResult(makeState({ tipoProceso: tipo, modoTerminacion: 'provisorios' }))
  check(tipo.padEnd(22) + ' marca provisorio', r.esProvisorio, true)
}

// ---- 2. La bandera sola sigue funcionando ----
// Compatibilidad con el motor clasico, que la setea desde la UI.
console.log('\nbandera esProvisorio suelta')
const porBandera = buildCalculationResult(makeState({ esProvisorio: true }))
check('bandera sin modo         marca provisorio', porBandera.esProvisorio, true)

// ---- 3. Los demas modos no son provisorios ----
console.log('\nmodos que NO son provisorios')
for (const modo of ['', 'sentencia', 'modos_anormales', 'caducidad'] as const) {
  const r = buildCalculationResult(makeState({
    modoTerminacion: modo,
    sentenciaResultado: modo === 'sentencia' ? 'admitida' : null,
    caducidadCriterio: modo === 'caducidad' ? 'art22' : '',
    aperturaPrueba: modo === 'caducidad' ? true : null,
  }))
  check((modo || '(vacio)').padEnd(22) + ' NO provisorio', r.esProvisorio, false)
}

// ---- 4. El art. 12 no cambia los numeros ----
// Provisorio no es una reduccion: es una instruccion sobre que cifra
// del rango corresponde fijar. Si estos dos calculos difirieran,
// alguien habria metido una reduccion donde no va.
console.log('\nel art. 12 no toca el calculo')
const sinMarcar = buildCalculationResult(makeState({ modoTerminacion: '' }))
const provisorio = buildCalculationResult(makeState({ modoTerminacion: 'provisorios' }))
check('cifras identicas         ', cifras(provisorio), cifras(sinMarcar))
check('sin transformaciones nuevas', provisorio.transformaciones.length, sinMarcar.transformaciones.length)

// ---- 5. El minimo que se va a mostrar no es cero ----
// Guarda contra la regresion mas silenciosa: que el dashboard muestre
// una sola columna correctamente, pero vacia.
console.log('\nel minimo existe')
check('minUMA > 0               ', provisorio.honorarios.patrocinante.rango.minUMA > 0, true)
check('minPesos > 0             ', provisorio.honorarios.patrocinante.rango.minPesos > 0, true)

console.log('\n========================================')
console.log('Resultado: ' + (allPassed ? 'TODOS OK' : 'HUBO FALLOS'))
console.log('Tests totales: ' + totalTests + ', fallos: ' + failedTests)
console.log('========================================')

process.exit(allPassed ? 0 : 1)
