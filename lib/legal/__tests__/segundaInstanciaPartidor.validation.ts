// ---------------------------------------------------------------
// Test de equivalencia: calcularSegundaInstancia y calcularPartidor
// vs legacy inline.
//
// Uso: npx tsx lib/legal/__tests__/segundaInstanciaPartidor.validation.ts
// ---------------------------------------------------------------

import { calcularSegundaInstancia, calcularPartidor } from '../calculate'

const UMA = 92482

// === Segunda Instancia ===
interface TestCaseSegunda {
  label: string
  minPatro: number; maxPatro: number
  minApo: number; maxApo: number
  minProc: number; maxProc: number
}

const SEGUNDA_CASES: TestCaseSegunda[] = [
  { label: 'valores tipicos',  minPatro: 10, maxPatro: 20, minApo: 14, maxApo: 28, minProc: 4, maxProc: 8 },
  { label: 'cero',             minPatro: 0, maxPatro: 0, minApo: 0, maxApo: 0, minProc: 0, maxProc: 0 },
  { label: 'grandes',          minPatro: 500, maxPatro: 800, minApo: 700, maxApo: 1120, minProc: 200, maxProc: 320 },
]

let allPassed = true
let totalTests = 0
let failedTests = 0

console.log('========================================')
console.log('Validacion: segunda instancia y partidor')
console.log('========================================\n')

for (const tc of SEGUNDA_CASES) {
  const label = tc.label.padEnd(20)
  const result = calcularSegundaInstancia(tc.minPatro, tc.maxPatro, tc.minApo, tc.maxApo, tc.minProc, tc.maxProc, UMA)

  // Legacy reference calculations
  const roles: [string, typeof tc.minPatro, typeof tc.maxPatro, typeof result.patrocinante][] = [
    ['patro', tc.minPatro, tc.maxPatro, result.patrocinante],
    ['apo',   tc.minApo,   tc.maxApo,   result.apoderado],
    ['proc',  tc.minProc,  tc.maxProc,  result.procurador],
  ]

  for (const [rolName, min, max, rolResult] of roles) {
    const expectedMin = min * 0.30
    const expectedMax = max * 0.35
    const expectedRev = max * 0.40

    const checks: { name: string; actual: number; expected: number }[] = [
      { name: 'minimo.minUMA', actual: rolResult.minimo.minUMA, expected: expectedMin },
      { name: 'minimo.maxUMA', actual: rolResult.minimo.maxUMA, expected: expectedMin },
      { name: 'minimo.minPesos', actual: rolResult.minimo.minPesos, expected: expectedMin * UMA },
      { name: 'minimo.maxPesos', actual: rolResult.minimo.maxPesos, expected: expectedMin * UMA },
      { name: 'maximo.minUMA', actual: rolResult.maximo.minUMA, expected: expectedMax },
      { name: 'maximo.maxUMA', actual: rolResult.maximo.maxUMA, expected: expectedMax },
      { name: 'maximo.minPesos', actual: rolResult.maximo.minPesos, expected: expectedMax * UMA },
      { name: 'maximo.maxPesos', actual: rolResult.maximo.maxPesos, expected: expectedMax * UMA },
      { name: 'revocada.minUMA', actual: rolResult.revocada.minUMA, expected: expectedRev },
      { name: 'revocada.maxUMA', actual: rolResult.revocada.maxUMA, expected: expectedRev },
      { name: 'revocada.minPesos', actual: rolResult.revocada.minPesos, expected: expectedRev * UMA },
      { name: 'revocada.maxPesos', actual: rolResult.revocada.maxPesos, expected: expectedRev * UMA },
    ]

    for (const c of checks) {
      totalTests++
      const diff = Math.abs(c.actual - c.expected)
      if (diff > 1e-10) {
        console.log('  FAIL ' + label + ' ' + rolName + '.' + c.name)
        console.log('       esperado=' + c.expected.toFixed(6) + ' actual=' + c.actual.toFixed(6))
        allPassed = false
        failedTests++
      }
    }
  }

  console.log('  OK   ' + label + ' 36 campos coinciden')
}

// === Partidor ===
interface TestCasePartidor {
  label: string
  basePesos: number
  expectNull?: boolean
}

const PARTIDOR_CASES: TestCasePartidor[] = [
  { label: 'base tipica',     basePesos: 1000000 },
  { label: 'base cero',       basePesos: 0, expectNull: true },
  { label: 'base negativa',   basePesos: -500, expectNull: true },
  { label: 'base grande',     basePesos: 50000000 },
]

for (const tc of PARTIDOR_CASES) {
  const label = tc.label.padEnd(20)
  const result = calcularPartidor(tc.basePesos, UMA)

  if (tc.expectNull) {
    totalTests++
    if (result !== null) {
      console.log('  FAIL ' + label + ' deberia ser null')
      allPassed = false
      failedTests++
    } else {
      console.log('  OK   ' + label + ' null (esperado)')
    }
    continue
  }

  if (result === null) {
    console.log('  FAIL ' + label + ' no deberia ser null')
    allPassed = false
    failedTests++
    continue
  }

  const expectedMinPesos = tc.basePesos * 0.02
  const expectedMaxPesos = tc.basePesos * 0.03

  const pChecks: { name: string; actual: number; expected: number }[] = [
    { name: 'minPorcentaje', actual: result.minPorcentaje, expected: 2 },
    { name: 'maxPorcentaje', actual: result.maxPorcentaje, expected: 3 },
    { name: 'minPesos', actual: result.minPesos, expected: expectedMinPesos },
    { name: 'maxPesos', actual: result.maxPesos, expected: expectedMaxPesos },
    { name: 'minUMA', actual: result.minUMA, expected: expectedMinPesos / UMA },
    { name: 'maxUMA', actual: result.maxUMA, expected: expectedMaxPesos / UMA },
  ]

  for (const c of pChecks) {
    totalTests++
    const diff = Math.abs(c.actual - c.expected)
    if (diff > 1e-10) {
      console.log('  FAIL ' + label + ' partidor.' + c.name + ' esperado=' + c.expected.toFixed(6) + ' actual=' + c.actual.toFixed(6))
      allPassed = false
      failedTests++
    }
  }

  if (pChecks.every(c => Math.abs(c.actual - c.expected) <= 1e-10)) {
    console.log('  OK   ' + label + ' 6 campos coinciden')
  }
}

console.log('\n========================================')
console.log('Resultado: ' + (allPassed ? 'TODOS OK' : 'HUBO FALLOS'))
console.log('Tests totales: ' + totalTests + ', fallos: ' + failedTests)
console.log('========================================')

process.exit(allPassed ? 0 : 1)