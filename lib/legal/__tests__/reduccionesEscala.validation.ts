// ---------------------------------------------------------------
// Test de equivalencia: aplicarReduccionesEscala() (TS) vs legacy
//
// Verifica que el bloque extraido produzca exactamente los mismos
// valores que el calculo de factorEscala en calculations.js.
//
// Uso: npx tsx lib/legal/__tests__/reduccionesEscala.validation.ts
// ---------------------------------------------------------------

import { aplicarReduccionesEscala, type ReduccionesEscalaInput } from '../calculate'

// ---- Legacy reference: logic from calculations.js lineas 139-158 ----
function legacyFactorEscala(input: {
  tipoProceso: string
  sucesionUnicoLetrado?: boolean | null
  modoTerminacion?: string
  caducidadCriterio?: string
  aperturaPrueba?: boolean | null
}): number {
  let factor = 1
  if (input.tipoProceso === 'sucesion' && input.sucesionUnicoLetrado) {
    factor *= 0.5
  }
  if (input.tipoProceso === 'ejecucion_sentencia') {
    factor *= 0.5
  }
  if (
    (input.tipoProceso === 'conocimiento' || input.tipoProceso === 'ejecucion_sentencia' || input.tipoProceso === 'ejecutivo') &&
    input.modoTerminacion === 'modos_anormales' && input.aperturaPrueba === false
  ) {
    factor *= 0.5
  }
  if (
    (input.tipoProceso === 'conocimiento' || input.tipoProceso === 'ejecucion_sentencia' || input.tipoProceso === 'ejecutivo') &&
    input.modoTerminacion === 'caducidad' && input.caducidadCriterio === 'art25' && input.aperturaPrueba === false
  ) {
    factor *= 0.5
  }
  return factor
}

// ---- Test cases ----
interface TestCase {
  label: string
  input: ReduccionesEscalaInput
  expectReduccionesCount: number
  expectIds?: string[]
}

const TEST_CASES: TestCase[] = [
  {
    label: 'sin reducciones',
    input: { tipoProceso: 'conocimiento', modoTerminacion: 'sentencia', aperturaPrueba: null },
    expectReduccionesCount: 0,
  },
  {
    label: 'unico letrado sucesion -50%',
    input: { tipoProceso: 'sucesion', sucesionUnicoLetrado: true },
    expectReduccionesCount: 1,
    expectIds: ['escala-unico-letrado'],
  },
  {
    label: 'ejecucion sentencia -50%',
    input: { tipoProceso: 'ejecucion_sentencia' },
    expectReduccionesCount: 1,
    expectIds: ['escala-ejecucion-sentencia'],
  },
  {
    label: 'modos anormales sin prueba -50%',
    input: { tipoProceso: 'conocimiento', modoTerminacion: 'modos_anormales', aperturaPrueba: false },
    expectReduccionesCount: 1,
    expectIds: ['escala-modos-anormales-sin-prueba'],
  },
  {
    label: 'caducidad art25 sin prueba -50%',
    input: { tipoProceso: 'ejecutivo', modoTerminacion: 'caducidad', caducidadCriterio: 'art25', aperturaPrueba: false },
    expectReduccionesCount: 1,
    expectIds: ['escala-caducidad-art25-sin-prueba'],
  },
  {
    label: 'ejecucion + modos anormales (multiplicativo)',
    input: { tipoProceso: 'ejecucion_sentencia', modoTerminacion: 'modos_anormales', aperturaPrueba: false },
    expectReduccionesCount: 2,
    expectIds: ['escala-ejecucion-sentencia', 'escala-modos-anormales-sin-prueba'],
  },
  {
    label: 'ejecucion + caducidad art25 (multiplicativo)',
    input: { tipoProceso: 'ejecucion_sentencia', modoTerminacion: 'caducidad', caducidadCriterio: 'art25', aperturaPrueba: false },
    expectReduccionesCount: 2,
    expectIds: ['escala-ejecucion-sentencia', 'escala-caducidad-art25-sin-prueba'],
  },
  {
    label: 'modos anormales CON prueba => no aplica',
    input: { tipoProceso: 'conocimiento', modoTerminacion: 'modos_anormales', aperturaPrueba: true },
    expectReduccionesCount: 0,
  },
  {
    label: 'caducidad art22 => no aplica reduccion escala',
    input: { tipoProceso: 'conocimiento', modoTerminacion: 'caducidad', caducidadCriterio: 'art22', aperturaPrueba: false },
    expectReduccionesCount: 0,
  },
  {
    label: 'sucesion sin unico letrado',
    input: { tipoProceso: 'sucesion', sucesionUnicoLetrado: false },
    expectReduccionesCount: 0,
  },
  {
    label: 'conocimiento + sentencia admitida',
    input: { tipoProceso: 'conocimiento', modoTerminacion: 'sentencia', aperturaPrueba: null },
    expectReduccionesCount: 0,
  },
  {
    label: 'ejecutivo + caducidad art25 + prueba (no aplica)',
    input: { tipoProceso: 'ejecutivo', modoTerminacion: 'caducidad', caducidadCriterio: 'art25', aperturaPrueba: true },
    expectReduccionesCount: 0,
  },
]

let allPassed = true
let totalTests = 0
let failedTests = 0

console.log('========================================')
console.log('Validacion: aplicarReduccionesEscala() vs legacy')
console.log('========================================\n')

for (const tc of TEST_CASES) {
  const label = tc.label.padEnd(40)
  const legacyFactor = legacyFactorEscala(tc.input as any)
  const modernResult = aplicarReduccionesEscala(tc.input)

  // Compare factorEscala
  totalTests++
  const diff = Math.abs(legacyFactor - modernResult.factor)
  if (diff > 1e-10) {
    console.log('  FAIL ' + label + ' factorEscala')
    console.log('       legacy=' + legacyFactor.toFixed(6))
    console.log('       modern=' + modernResult.factor.toFixed(6))
    console.log('       diff=' + diff.toExponential(2))
    allPassed = false
    failedTests++
  } else {
    console.log('  OK   ' + label + ' factor=' + modernResult.factor.toFixed(4) + '  reducciones=' + modernResult.transformaciones.length)
  }

  // Compare reducciones count
  totalTests++
  if (modernResult.transformaciones.length !== tc.expectReduccionesCount) {
    console.log('  FAIL ' + label + ' reducciones count')
    console.log('       expected=' + tc.expectReduccionesCount + ' actual=' + modernResult.transformaciones.length)
    allPassed = false
    failedTests++
  }

  // Validate each reduccion structure
  for (let i = 0; i < modernResult.transformaciones.length; i++) {
    const r = modernResult.transformaciones[i]

    totalTests++
    if (!r.id || !r.etapa || !r.concepto || !r.articulo) {
      console.log('  FAIL ' + label + ' reduccion[' + i + '] campos incompletos')
      allPassed = false
      failedTests++
    }

    totalTests++
    if (r.etapa !== 'escala') {
      console.log('  FAIL ' + label + ' reduccion[' + i + '] etapa=' + r.etapa + ' (debe ser escala)')
      allPassed = false
      failedTests++
    }

    // Verify factor is 0.5 (all escala reductions are -50%)
    totalTests++
    if (r.factor !== 0.5) {
      console.log('  FAIL ' + label + ' reduccion[' + i + '] factor=' + r.factor + ' (debe ser 0.5)')
      allPassed = false
      failedTests++
    }

    // Verify valorPosterior = valorPrevio * factor
    totalTests++
    const expectedPost = r.valorPrevio * r.factor
    const diffPost = Math.abs(expectedPost - r.valorPosterior)
    if (diffPost > 1e-10) {
      console.log('  FAIL ' + label + ' reduccion[' + i + '] cadena de factores rota')
      allPassed = false
      failedTests++
    }
  }

  // Validate specific IDs
  if (tc.expectIds) {
    const actualIds = modernResult.transformaciones.map(r => r.id)
    for (const expectedId of tc.expectIds) {
      totalTests++
      if (!actualIds.includes(expectedId)) {
        console.log('  FAIL ' + label + ' falta id=' + expectedId)
        console.log('       actual=' + JSON.stringify(actualIds))
        allPassed = false
        failedTests++
      }
    }
  }
}

console.log('\n========================================')
console.log('Resultado: ' + (allPassed ? 'TODOS OK' : 'HUBO FALLOS'))
console.log('Tests totales: ' + totalTests + ', fallos: ' + failedTests)
console.log('========================================')

process.exit(allPassed ? 0 : 1)