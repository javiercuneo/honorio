// ---------------------------------------------------------------
// Test de equivalencia: aplicarReduccionesFinales() (TS) vs legacy
//
// Uso: npx tsx lib/legal/__tests__/reduccionesFinales.validation.ts
// ---------------------------------------------------------------

import { aplicarReduccionesFinales, type ReduccionesFinalesInput } from '../calculate'

// ---- Legacy reference: logic from calculations.js lineas 160-177 ----
function legacyFactorFinal(input: {
  tipoProceso: string
  tuvoExcepciones?: boolean | null
  objetoBase?: string
  posesoriasTipo?: string | null
}): number {
  let factor = 1
  if (input.tipoProceso === 'ejecutivo' && input.tuvoExcepciones === false) {
    factor = 0.9
  } else if (input.tipoProceso === 'ejecucion_sentencia' && input.tuvoExcepciones === false) {
    factor = 0.9
  }
  if (input.tipoProceso === 'conocimiento' && input.objetoBase === 'posesorias_interdictos' && input.posesoriasTipo === 'beneficio') {
    factor *= 0.8
  }
  if (input.tipoProceso === 'conocimiento' && input.objetoBase === 'incidencia_colectiva') {
    factor *= 0.75
  }
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
    input: { tipoProceso: 'conocimiento', objetoBase: 'sumas_dinero' },
    expectReduccionesCount: 0,
  },
  {
    label: 'ejecutivo sin excepciones -10%',
    input: { tipoProceso: 'ejecutivo', tuvoExcepciones: false },
    expectReduccionesCount: 1,
    expectIds: ['final-ejecutivo-sin-excepciones'],
  },
  {
    label: 'ejecucion sentencia sin excepciones -10%',
    input: { tipoProceso: 'ejecucion_sentencia', tuvoExcepciones: false },
    expectReduccionesCount: 1,
    expectIds: ['final-ejecucion-sin-excepciones'],
  },
  {
    label: 'posesorias beneficio -20%',
    input: { tipoProceso: 'conocimiento', objetoBase: 'posesorias_interdictos', posesoriasTipo: 'beneficio' },
    expectReduccionesCount: 1,
    expectIds: ['final-posesorias-beneficio'],
  },
  {
    label: 'incidencia colectiva -25%',
    input: { tipoProceso: 'conocimiento', objetoBase: 'incidencia_colectiva' },
    expectReduccionesCount: 1,
    expectIds: ['final-incidencia-colectiva'],
  },
  {
    label: 'ejecutivo CON excepciones => no aplica',
    input: { tipoProceso: 'ejecutivo', tuvoExcepciones: true },
    expectReduccionesCount: 0,
  },
  {
    label: 'ejecucion sentencia CON excepciones => no aplica',
    input: { tipoProceso: 'ejecucion_sentencia', tuvoExcepciones: true },
    expectReduccionesCount: 0,
  },
  {
    label: 'ejecutivo con excepciones null => no aplica',
    input: { tipoProceso: 'ejecutivo', tuvoExcepciones: null },
    expectReduccionesCount: 0,
  },
  {
    label: 'posesorias otro tipo (demas) => no aplica',
    input: { tipoProceso: 'conocimiento', objetoBase: 'posesorias_interdictos', posesoriasTipo: 'demas' },
    expectReduccionesCount: 0,
  },
  {
    label: 'conocimiento + desalojo => no aplica reduccion final',
    input: { tipoProceso: 'conocimiento', objetoBase: 'desalojo' },
    expectReduccionesCount: 0,
  },
  {
    label: 'sucesion => no aplica ninguna',
    input: { tipoProceso: 'sucesion' },
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
  const legacyFactor = legacyFactorFinal(tc.input as any)
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