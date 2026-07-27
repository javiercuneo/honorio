// ---------------------------------------------------------------
// Test de equivalencia: aplicarReduccionesBase() (TS) vs legacy
//
// Verifica que el bloque extraido produzca exactamente los mismos
// valores que el calculo de baseReducida en calculations.js.
//
// Uso: npx tsx lib/legal/__tests__/reduccionesBase.validation.ts
// ---------------------------------------------------------------

import { aplicarReduccionesBase } from '../calculate'

// ---- Legacy reference: logic from calculations.js lineas 117-137 ----
function legacyCalcularBaseReducida(input: {
  baseValor: number
  esViviendaProtegida: boolean
  demandaRechazada: boolean
  caducidadArt22: boolean
}): number {
  let baseReducida = input.baseValor

  if (input.esViviendaProtegida) {
    baseReducida *= 0.8
  }
  if (input.demandaRechazada) {
    baseReducida *= 0.7
  }
  if (input.caducidadArt22) {
    baseReducida *= 0.7
  }

  return baseReducida
}

// ---- Test cases ----
const BASE = 1000000

interface TestCase {
  label: string
  input: {
    baseValor: number
    esViviendaProtegida?: boolean
    demandaRechazada?: boolean
    caducidadArt22?: boolean
  }
  expectReduccionesCount: number
  expectIds?: string[]
}

const TEST_CASES: TestCase[] = [
  {
    label: 'sin reducciones',
    input: { baseValor: BASE },
    expectReduccionesCount: 0,
  },
  {
    label: 'desalojo vivienda -20%',
    input: { baseValor: BASE, esViviendaProtegida: true },
    expectReduccionesCount: 1,
    expectIds: ['base-desalojo-vivienda'],
  },
  {
    label: 'demanda rechazada -30%',
    input: { baseValor: BASE, demandaRechazada: true },
    expectReduccionesCount: 1,
    expectIds: ['base-demanda-rechazada'],
  },
  {
    label: 'caducidad art22 -30%',
    input: { baseValor: BASE, caducidadArt22: true },
    expectReduccionesCount: 1,
    expectIds: ['base-caducidad-art22'],
  },
  {
    label: 'desalojo + rechazada (multiplicativo)',
    input: { baseValor: BASE, esViviendaProtegida: true, demandaRechazada: true },
    expectReduccionesCount: 2,
    expectIds: ['base-desalojo-vivienda', 'base-demanda-rechazada'],
  },
  {
    label: 'desalojo + caducidad art22',
    input: { baseValor: BASE, esViviendaProtegida: true, caducidadArt22: true },
    expectReduccionesCount: 2,
    expectIds: ['base-desalojo-vivienda', 'base-caducidad-art22'],
  },
  {
    label: 'ejecutivo no aplica desalojo',
    input: { baseValor: BASE, esViviendaProtegida: false },
    expectReduccionesCount: 0,
  },
  {
    label: 'ejecutivo + rechazada (debe aplicar)',
    input: { baseValor: BASE, demandaRechazada: true },
    expectReduccionesCount: 1,
    expectIds: ['base-demanda-rechazada'],
  },
  {
    label: 'sucesion + rechazada (no debe aplicar)',
    input: { baseValor: BASE, demandaRechazada: false },
    expectReduccionesCount: 0,
  },
  {
    label: 'caducidad art25 => no aplica reduccion base',
    input: { baseValor: BASE, caducidadArt22: false },
    expectReduccionesCount: 0,
  },
  {
    label: 'base cero',
    input: { baseValor: 0, esViviendaProtegida: true, demandaRechazada: true },
    expectReduccionesCount: 2,
    expectIds: ['base-desalojo-vivienda', 'base-demanda-rechazada'],
  },
]
let allPassed = true
let totalTests = 0
let failedTests = 0

console.log('========================================')
console.log('Validacion: aplicarReduccionesBase() vs legacy')
console.log('========================================\n')

for (const tc of TEST_CASES) {
  const label = tc.label.padEnd(35)
  const legacyResult = legacyCalcularBaseReducida(tc.input as any)
  const modernResult = aplicarReduccionesBase(tc.input)

  // Compare baseFinal
  totalTests++
  const diffBase = Math.abs(legacyResult - modernResult.baseFinal)
  if (diffBase > 1e-10) {
    console.log('  FAIL ' + label + ' baseFinal')
    console.log('       legacy=' + legacyResult.toFixed(2))
    console.log('       modern=' + modernResult.baseFinal.toFixed(2))
    console.log('       diff=' + diffBase.toExponential(2))
    allPassed = false
    failedTests++
  } else {
    console.log('  OK   ' + label + ' base=' + modernResult.baseFinal.toFixed(2) + '  reducciones=' + modernResult.reducciones.length)
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

    // Check required fields exist
    totalTests++
    if (!r.id || !r.etapa || !r.concepto || !r.articulo || r.visible === undefined || r.valorPrevio === undefined || r.factor === undefined || r.valorPosterior === undefined) {
      console.log('  FAIL ' + label + ' reduccion[' + i + '] campos incompletos')
      allPassed = false
      failedTests++
    }

    // Check etapa is 'base'
    totalTests++
    if (r.etapa !== 'base') {
      console.log('  FAIL ' + label + ' reduccion[' + i + '] etapa=' + r.etapa + ' (debe ser base)')
      allPassed = false
      failedTests++
    }

    // Check factor is in [0,1]
    totalTests++
    if (r.factor <= 0 || r.factor > 1) {
      console.log('  FAIL ' + label + ' reduccion[' + i + '] factor=' + r.factor + ' fuera de rango (0,1]')
      allPassed = false
      failedTests++
    }

    // Check valorPrevio * factor â‰ˆ valorPosterior
    totalTests++
    const expectedPost = r.valorPrevio * r.factor
    const diffPost = Math.abs(expectedPost - r.valorPosterior)
    if (diffPost > 1e-10) {
      console.log('  FAIL ' + label + ' reduccion[' + i + '] valorPosterior=' + r.valorPosterior + ' != previo*factor=' + expectedPost)
      allPassed = false
      failedTests++
    }
  }

  // Validate specific IDs if expected
  if (tc.expectIds) {
    const actualIds = modernResult.reducciones.map(r => r.id)
    for (const expectedId of tc.expectIds) {
      totalTests++
      if (!actualIds.includes(expectedId)) {
        console.log('  FAIL ' + label + ' falta reduccion id=' + expectedId)
        console.log('       actual=' + JSON.stringify(actualIds))
        allPassed = false
        failedTests++
      }
    }
    totalTests++
    if (actualIds.length !== tc.expectIds.length) {
      console.log('  FAIL ' + label + ' cantidad de ids no coincide')
      allPassed = false
      failedTests++
    }
  }
}

console.log('\n========================================')
console.log('Resultado: ' + (allPassed ? 'TODOS OK' : 'HUBO FALLOS'))
console.log('Tests totales: ' + totalTests + ', fallos: ' + failedTests)
console.log('========================================')

process.exit(allPassed ? 0 : 1)