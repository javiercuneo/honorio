// ---------------------------------------------------------------
// Test de equivalencia: aplicarReduccionesEscala() (TS) vs legacy
//
// Verifica que el bloque extraido produzca exactamente los mismos
// valores que el calculo de factorEscala en calculations.js.
//
// Uso: npx tsx lib/legal/__tests__/reduccionesEscala.validation.ts
// ---------------------------------------------------------------

import { aplicarReduccionesEscala, type ReduccionesEscalaInput } from '../calculate'

// ---- Legacy reference: simplified to domain booleans ----
function legacyFactorEscala(input: ReduccionesEscalaInput): number {
  let factor = 1
  if (input.aplicaArt35) { factor *= 0.5 }
  if (input.aplicaArt41) { factor *= 0.5 }
  if (input.aplicaArt25) { factor *= 0.5 }
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
    input: {},
    expectReduccionesCount: 0,
  },
  {
    label: 'unico letrado sucesion -50%',
    input: { aplicaArt35: true },
    expectReduccionesCount: 1,
    expectIds: ['escala-unico-letrado'],
  },
  {
    label: 'ejecucion sentencia -50%',
    input: { aplicaArt41: true },
    expectReduccionesCount: 1,
    expectIds: ['escala-ejecucion-sentencia'],
  },
  {
    label: 'art.25 (modos anormales o caducidad) -50%',
    input: { aplicaArt25: true },
    expectReduccionesCount: 1,
    expectIds: ['escala-art25'],
  },
  {
    label: 'art.25 (caducidad art25) -50%',
    input: { aplicaArt25: true },
    expectReduccionesCount: 1,
    expectIds: ['escala-art25'],
  },
  {
    label: 'ejecucion + art.25 (multiplicativo)',
    input: { aplicaArt41: true, aplicaArt25: true },
    expectReduccionesCount: 2,
    expectIds: ['escala-ejecucion-sentencia', 'escala-art25'],
  },
  {
    label: 'art.25 + art.35 (multiplicativo)',
    input: { aplicaArt35: true, aplicaArt25: true },
    expectReduccionesCount: 2,
    expectIds: ['escala-unico-letrado', 'escala-art25'],
  },
  {
    label: 'todos juntos (multiplicativo)',
    input: { aplicaArt25: true, aplicaArt35: true, aplicaArt41: true },
    expectReduccionesCount: 3,
    expectIds: ['escala-unico-letrado', 'escala-ejecucion-sentencia', 'escala-art25'],
  },
  {
    label: 'art.25 false => no aplica',
    input: { aplicaArt25: false },
    expectReduccionesCount: 0,
  },
  {
    label: 'art.35 false',
    input: { aplicaArt35: false },
    expectReduccionesCount: 0,
  },
  {
    label: 'art.41 false',
    input: { aplicaArt41: false },
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
  const legacyFactor = legacyFactorEscala(tc.input)
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