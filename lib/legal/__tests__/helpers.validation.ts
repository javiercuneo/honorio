// ---------------------------------------------------------------
// Test de equivalencia: helper functions vs legacy inline math
//
// Verifica que calcularApoderado, calcularProcurador y
// calcularAuxiliares produzcan los mismos valores que las
// operaciones inline del legacy.
//
// Uso: npx tsx lib/legal/__tests__/helpers.validation.ts
// ---------------------------------------------------------------

import { calcularApoderado, calcularProcurador, calcularAuxiliares } from '../calculate'

const UMA = 92482

interface TestCase {
  label: string
  minPatro: number
  maxPatro: number
  baseEnUMA: number
}

const TEST_CASES: TestCase[] = [
  { label: 'valores tipicos',  minPatro: 10, maxPatro: 20, baseEnUMA: 50 },
  { label: 'valores chicos',   minPatro: 0.5, maxPatro: 1.5, baseEnUMA: 3 },
  { label: 'valores grandes',  minPatro: 1000, maxPatro: 2000, baseEnUMA: 5000 },
  { label: 'cero',             minPatro: 0, maxPatro: 0, baseEnUMA: 0 },
]

let allPassed = true
let totalTests = 0
let failedTests = 0

console.log('========================================')
console.log('Validacion: helpers vs legacy inline')
console.log('========================================\n')

for (const tc of TEST_CASES) {
  const label = tc.label.padEnd(20)

  // ---- Apoderado: legacy = patro * 1.4 ----
  const legacyApoMin = tc.minPatro * 1.4
  const legacyApoMax = tc.maxPatro * 1.4
  const legacyApoMinPesos = legacyApoMin * UMA
  const legacyApoMaxPesos = legacyApoMax * UMA

  const apo = calcularApoderado(tc.minPatro, tc.maxPatro, UMA)

  const checks: { name: string; actual: number; expected: number }[] = [
    { name: 'apo.minUMA', actual: apo.minUMA, expected: legacyApoMin },
    { name: 'apo.maxUMA', actual: apo.maxUMA, expected: legacyApoMax },
    { name: 'apo.minPesos', actual: apo.minPesos, expected: legacyApoMinPesos },
    { name: 'apo.maxPesos', actual: apo.maxPesos, expected: legacyApoMaxPesos },
  ]

  for (const c of checks) {
    totalTests++
    const diff = Math.abs(c.actual - c.expected)
    if (diff > 1e-10) {
      console.log('  FAIL ' + label + ' ' + c.name + ' esperado=' + c.expected.toFixed(6) + ' actual=' + c.actual.toFixed(6))
      allPassed = false
      failedTests++
    }
  }

  // ---- Procurador: legacy = patro * 0.4 ----
  const legacyProcMin = tc.minPatro * 0.4
  const legacyProcMax = tc.maxPatro * 0.4
  const proc = calcularProcurador(tc.minPatro, tc.maxPatro, UMA)

  const procChecks: { name: string; actual: number; expected: number }[] = [
    { name: 'proc.minUMA', actual: proc.minUMA, expected: legacyProcMin },
    { name: 'proc.maxUMA', actual: proc.maxUMA, expected: legacyProcMax },
    { name: 'proc.minPesos', actual: proc.minPesos, expected: legacyProcMin * UMA },
    { name: 'proc.maxPesos', actual: proc.maxPesos, expected: legacyProcMax * UMA },
  ]

  for (const c of procChecks) {
    totalTests++
    const diff = Math.abs(c.actual - c.expected)
    if (diff > 1e-10) {
      console.log('  FAIL ' + label + ' ' + c.name + ' esperado=' + c.expected.toFixed(6) + ' actual=' + c.actual.toFixed(6))
      allPassed = false
      failedTests++
    }
  }

  // ---- Auxiliares: legacy = baseEnUMA * 0.05 y 0.10 ----
  const legacyAuxMin = tc.baseEnUMA * 0.05
  const legacyAuxMax = tc.baseEnUMA * 0.10
  const aux = calcularAuxiliares(tc.baseEnUMA, UMA)

  const auxChecks: { name: string; actual: number; expected: number }[] = [
    { name: 'aux.minUMA', actual: aux.minUMA, expected: legacyAuxMin },
    { name: 'aux.maxUMA', actual: aux.maxUMA, expected: legacyAuxMax },
    { name: 'aux.minPesos', actual: aux.minPesos, expected: legacyAuxMin * UMA },
    { name: 'aux.maxPesos', actual: aux.maxPesos, expected: legacyAuxMax * UMA },
  ]

  for (const c of auxChecks) {
    totalTests++
    const diff = Math.abs(c.actual - c.expected)
    if (diff > 1e-10) {
      console.log('  FAIL ' + label + ' ' + c.name + ' esperado=' + c.expected.toFixed(6) + ' actual=' + c.actual.toFixed(6))
      allPassed = false
      failedTests++
    }
  }

  if (checks.every(c => Math.abs(c.actual - c.expected) <= 1e-10) &&
      procChecks.every(c => Math.abs(c.actual - c.expected) <= 1e-10) &&
      auxChecks.every(c => Math.abs(c.actual - c.expected) <= 1e-10)) {
    console.log('  OK   ' + label + ' 12 campos coinciden')
  }
}

console.log('\n========================================')
console.log('Resultado: ' + (allPassed ? 'TODOS OK' : 'HUBO FALLOS'))
console.log('Tests totales: ' + totalTests + ', fallos: ' + failedTests)
console.log('========================================')

process.exit(allPassed ? 0 : 1)