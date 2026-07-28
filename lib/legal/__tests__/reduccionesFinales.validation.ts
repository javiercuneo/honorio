// ---------------------------------------------------------------
// Test de equivalencia: aplicarReduccionesFinales() (TS) vs legacy
//
// Uso: npx tsx lib/legal/__tests__/reduccionesFinales.validation.ts
// ---------------------------------------------------------------

import { aplicarReduccionesFinales, type ReduccionesFinalesInput } from '../calculate'

// ---- Legacy reference: simplified to domain booleans ----
function legacyFactorFinal(input: ReduccionesFinalesInput): number {
  let factor = 1
  if (input.aplicaArt34) { factor = 0.9 }
  if (input.aplicaArt38) { factor *= 0.8 }
  if (input.aplicaArt49) { factor *= 0.75 }
  return factor
}

// ---- Test cases ----
interface TestCase {
  label: string
  input: ReduccionesFinalesInput
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
    label: 'art.34 (ejecutivo/ejecucion sin excepciones) -10%',
    input: { aplicaArt34: true },
    expectReduccionesCount: 1,
    expectIds: ['final-ejecucion-sin-excepciones'],
  },
  {
    label: 'art.38 (posesorias beneficio) -20%',
    input: { aplicaArt38: true },
    expectReduccionesCount: 1,
    expectIds: ['final-posesorias-beneficio'],
  },
  {
    label: 'art.49 (incidencia colectiva) -25%',
    input: { aplicaArt49: true },
    expectReduccionesCount: 1,
    expectIds: ['final-incidencia-colectiva'],
  },
  {
    label: 'art.34 + art.38 (multiplicativo)',
    input: { aplicaArt34: true, aplicaArt38: true },
    expectReduccionesCount: 2,
    expectIds: ['final-ejecucion-sin-excepciones', 'final-posesorias-beneficio'],
  },
  {
    label: 'art.34 + art.49 (multiplicativo)',
    input: { aplicaArt34: true, aplicaArt49: true },
    expectReduccionesCount: 2,
    expectIds: ['final-ejecucion-sin-excepciones', 'final-incidencia-colectiva'],
  },
  {
    label: 'art.38 + art.49 (multiplicativo)',
    input: { aplicaArt38: true, aplicaArt49: true },
    expectReduccionesCount: 2,
    expectIds: ['final-posesorias-beneficio', 'final-incidencia-colectiva'],
  },
  {
    label: 'todos juntos (multiplicativo)',
    input: { aplicaArt34: true, aplicaArt38: true, aplicaArt49: true },
    expectReduccionesCount: 3,
    expectIds: ['final-ejecucion-sin-excepciones', 'final-posesorias-beneficio', 'final-incidencia-colectiva'],
  },
  {
    label: 'art.34 false => no aplica',
    input: { aplicaArt34: false },
    expectReduccionesCount: 0,
  },
  {
    label: 'art.38 false => no aplica',
    input: { aplicaArt38: false },
    expectReduccionesCount: 0,
  },
  {
    label: 'art.49 false => no aplica',
    input: { aplicaArt49: false },
    expectReduccionesCount: 0,
  },
]

let allPassed = true
let totalTests = 0
let failedTests = 0

console.log('========================================')
console.log('Validacion: aplicarReduccionesFinales() vs legacy')
console.log('========================================\n')

for (const tc of TEST_CASES) {
  const label = tc.label.padEnd(40)
  const legacyFactor = legacyFactorFinal(tc.input)
  const modernResult = aplicarReduccionesFinales(tc.input)

  // Compare factorFinal
  totalTests++
  const diff = Math.abs(legacyFactor - modernResult.factorFinal)
  if (diff > 1e-10) {
    console.log('  FAIL ' + label + ' factorFinal')
    console.log('       legacy=' + legacyFactor.toFixed(6))
    console.log('       modern=' + modernResult.factorFinal.toFixed(6))
    console.log('       diff=' + diff.toExponential(2))
    allPassed = false
    failedTests++
  } else {
    console.log('  OK   ' + label + ' factor=' + modernResult.factorFinal.toFixed(4) + '  reducciones=' + modernResult.reducciones.length)
  }

  // Compare reducciones count
  totalTests++
  if (modernResult.reducciones.length !== tc.expectReduccionesCount) {
    console.log('  FAIL ' + label + ' reducciones count')
    console.log('       expected=' + tc.expectReduccionesCount + ' actual=' + modernResult.reducciones.length)
    allPassed = false
    failedTests++
  }

  // Validate each reduccion structure
  for (let i = 0; i < modernResult.reducciones.length; i++) {
    const r = modernResult.reducciones[i]

    totalTests++
    if (!r.id || !r.etapa || !r.concepto || !r.articulo) {
      console.log('  FAIL ' + label + ' reduccion[' + i + '] campos incompletos')
      allPassed = false
      failedTests++
    }

    totalTests++
    if (r.etapa !== 'honorarios') {
      console.log('  FAIL ' + label + ' reduccion[' + i + '] etapa=' + r.etapa + ' (debe ser honorarios)')
      allPassed = false
      failedTests++
    }

    // Verify valorPosterior = valorPrevio * factor (or = factor for overwrite rules)
    totalTests++
    const expectedPost = r.valorPrevio * r.factor
    const diffPost = Math.abs(expectedPost - r.valorPosterior)
    if (diffPost > 1e-10) {
      console.log('  FAIL ' + label + ' reduccion[' + i + '] cadena rota: ' + r.valorPrevio + ' * ' + r.factor + ' = ' + expectedPost + ' pero valorPosterior=' + r.valorPosterior)
      allPassed = false
      failedTests++
    }
  }

  // Validate specific IDs
  if (tc.expectIds) {
    const actualIds = modernResult.reducciones.map(r => r.id)
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