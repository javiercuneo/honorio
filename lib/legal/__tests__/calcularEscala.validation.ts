// ---------------------------------------------------------------
// Test de equivalencia: calcularEscala() (TS) vs calcularEscalaBase() (legacy)
//
// Verifica que la migracion a TypeScript produzca exactamente los
// mismos valores que la funcion original de core.js.
//
// Uso: npx tsx lib/legal/__tests__/calcularEscala.validation.ts
// ---------------------------------------------------------------

import { calcularEscala } from '../calculate'

// ---- Legacy reference: exact copy from core.js ----
function calcularEscalaBase(basePesos: number, valorUMA: number): any {
  if (!basePesos || !valorUMA || valorUMA <= 0) return null
  const baseEnUMA = basePesos / valorUMA
  let minComp: number, maxComp: number, tituloEscala: string
  let minPorc: number, maxPorc: number
  let maximoEscalaAnterior = 0
  let limiteAnterior = 0

  if (baseEnUMA <= 15) {
    tituloEscala = '1\u00aa escala (hasta 15 UMA): 22% a 33%'
    minComp = baseEnUMA * 0.22
    maxComp = baseEnUMA * 0.33
    minPorc = 22; maxPorc = 33
  } else if (baseEnUMA <= 45) {
    tituloEscala = '2\u00aa escala (16-45 UMA): 20% a 26%'
    minComp = (baseEnUMA - 15) * 0.20 + 4.95
    maxComp = (baseEnUMA - 15) * 0.26 + 4.95
    minPorc = 20; maxPorc = 26
    maximoEscalaAnterior = 4.95
    limiteAnterior = 15
  } else if (baseEnUMA <= 90) {
    tituloEscala = '3\u00aa escala (46-90 UMA): 18% a 24%'
    minComp = (baseEnUMA - 45) * 0.18 + 11.7
    maxComp = (baseEnUMA - 45) * 0.24 + 11.7
    minPorc = 18; maxPorc = 24
    maximoEscalaAnterior = 11.7
    limiteAnterior = 45
  } else if (baseEnUMA <= 150) {
    tituloEscala = '4\u00aa escala (91-150 UMA): 17% a 22%'
    minComp = (baseEnUMA - 90) * 0.17 + 21.6
    maxComp = (baseEnUMA - 90) * 0.22 + 21.6
    minPorc = 17; maxPorc = 22
    maximoEscalaAnterior = 21.6
    limiteAnterior = 90
  } else if (baseEnUMA <= 450) {
    tituloEscala = '5\u00aa escala (151-450 UMA): 15% a 20%'
    minComp = (baseEnUMA - 150) * 0.15 + 33
    maxComp = (baseEnUMA - 150) * 0.20 + 33
    minPorc = 15; maxPorc = 20
    maximoEscalaAnterior = 33
    limiteAnterior = 150
  } else if (baseEnUMA <= 750) {
    tituloEscala = '6\u00aa escala (451-750 UMA): 13% a 17%'
    minComp = (baseEnUMA - 450) * 0.13 + 90
    maxComp = (baseEnUMA - 450) * 0.17 + 90
    minPorc = 13; maxPorc = 17
    maximoEscalaAnterior = 90
    limiteAnterior = 450
  } else {
    tituloEscala = '7\u00aa escala (+750 UMA): 12% a 15%'
    minComp = (baseEnUMA - 750) * 0.12 + 127.5
    maxComp = (baseEnUMA - 750) * 0.15 + 127.5
    minPorc = 12; maxPorc = 15
    maximoEscalaAnterior = 127.5
    limiteAnterior = 750
  }

  const auxMin = baseEnUMA * 0.05
  const auxMax = baseEnUMA * 0.10
  const etapaUnMin = minComp / 3
  const etapaUnMax = maxComp / 3
  const etapaDosMin = minComp * 2 / 3
  const etapaDosMax = maxComp * 2 / 3

  return {
    tituloEscala, baseEnUMA, minPorc, maxPorc,
    maximoEscalaAnterior, limiteAnterior,
    patrocinante: {
      full: { min: minComp, max: maxComp },
      uno: { min: etapaUnMin, max: etapaUnMax },
      dos: { min: etapaDosMin, max: etapaDosMax },
    },
    apoderado: {
      full: { min: minComp * 1.4, max: maxComp * 1.4 },
      uno: { min: etapaUnMin * 1.4, max: etapaUnMax * 1.4 },
      dos: { min: etapaDosMin * 1.4, max: etapaDosMax * 1.4 },
    },
    auxMin, auxMax,
  }
}

// ---- Test harness ----
const UMA_VALUE = 92482

interface TestCase {
  label: string
  basePesos: number
  umaValue?: number
}

const TEST_CASES: TestCase[] = [
  { label: '0 UMA (cero)',          basePesos: 0 },
  { label: '1 UMA',                basePesos: 1 * UMA_VALUE },
  { label: '10 UMA',               basePesos: 10 * UMA_VALUE },
  { label: '15 UMA (limite 1a)',   basePesos: 15 * UMA_VALUE },
  { label: '16 UMA (inicio 2a)',   basePesos: 16 * UMA_VALUE },
  { label: '45 UMA (limite 2a)',   basePesos: 45 * UMA_VALUE },
  { label: '46 UMA (inicio 3a)',   basePesos: 46 * UMA_VALUE },
  { label: '90 UMA (limite 3a)',   basePesos: 90 * UMA_VALUE },
  { label: '91 UMA (inicio 4a)',   basePesos: 91 * UMA_VALUE },
  { label: '150 UMA (limite 4a)',  basePesos: 150 * UMA_VALUE },
  { label: '151 UMA (inicio 5a)',  basePesos: 151 * UMA_VALUE },
  { label: '450 UMA (limite 5a)',  basePesos: 450 * UMA_VALUE },
  { label: '451 UMA (inicio 6a)',  basePesos: 451 * UMA_VALUE },
  { label: '750 UMA (limite 6a)',  basePesos: 750 * UMA_VALUE },
  { label: '751 UMA (inicio 7a)',  basePesos: 751 * UMA_VALUE },
  { label: '5000 UMA (muy alto)',  basePesos: 5000 * UMA_VALUE },
]

interface EscalaFields {
  tituloEscala: string
  baseEnUMA: number
  minPorc: number
  maxPorc: number
  maximoEscalaAnterior: number
  limiteAnterior: number
  'patrocinante.full.min': number
  'patrocinante.full.max': number
  'patrocinante.uno.min': number
  'patrocinante.uno.max': number
  'patrocinante.dos.min': number
  'patrocinante.dos.max': number
  'apoderado.full.min': number
  'apoderado.full.max': number
  'apoderado.uno.min': number
  'apoderado.uno.max': number
  'apoderado.dos.min': number
  'apoderado.dos.max': number
  auxMin: number
  auxMax: number
}

function flattenResult(r: any): EscalaFields {
  return {
    tituloEscala: r.tituloEscala,
    baseEnUMA: r.baseEnUMA,
    minPorc: r.minPorc,
    maxPorc: r.maxPorc,
    maximoEscalaAnterior: r.maximoEscalaAnterior,
    limiteAnterior: r.limiteAnterior,
    'patrocinante.full.min': r.patrocinante.full.min,
    'patrocinante.full.max': r.patrocinante.full.max,
    'patrocinante.uno.min': r.patrocinante.uno.min,
    'patrocinante.uno.max': r.patrocinante.uno.max,
    'patrocinante.dos.min': r.patrocinante.dos.min,
    'patrocinante.dos.max': r.patrocinante.dos.max,
    'apoderado.full.min': r.apoderado.full.min,
    'apoderado.full.max': r.apoderado.full.max,
    'apoderado.uno.min': r.apoderado.uno.min,
    'apoderado.uno.max': r.apoderado.uno.max,
    'apoderado.dos.min': r.apoderado.dos.min,
    'apoderado.dos.max': r.apoderado.dos.max,
    auxMin: r.auxMin,
    auxMax: r.auxMax,
  }
}

const TOLERANCE = 1e-10
const STRING_FIELDS = new Set(['tituloEscala'])
let allPassed = true
let totalTests = 0
let failedTests = 0

console.log('========================================')
console.log('Validacion: calcularEscala() vs calcularEscalaBase()')
console.log('UMA = ' + UMA_VALUE)
console.log('')
console.log('========================================')

for (const tc of TEST_CASES) {
  const uma = tc.umaValue ?? UMA_VALUE
  const legacy = calcularEscalaBase(tc.basePesos, uma)
  const modern = calcularEscala(tc.basePesos, uma)

  const label = tc.label.padEnd(25)
  const baseLabel = '$' + tc.basePesos.toLocaleString('es-AR')

  if (legacy === null && modern === null) {
    console.log('  OK  ' + label + ' base=' + baseLabel + '  ambos null')
    continue
  }

  if (legacy === null || modern === null) {
    console.log('  FAIL ' + label + ' base=' + baseLabel + '  uno es null')
    const lstatus = legacy === null ? 'null' : 'object'
    const mstatus = modern === null ? 'null' : 'object'
    console.log('       legacy=' + lstatus + ', modern=' + mstatus)
    allPassed = false
    failedTests++
    continue
  }

  const flatLegacy = flattenResult(legacy)
  const flatModern = flattenResult(modern)

  const allFieldNames = Object.keys(flatLegacy) as (keyof EscalaFields)[]
  let casePassed = true

  for (const field of allFieldNames) {
    totalTests++
    const vLegacy = flatLegacy[field]
    const vModern = flatModern[field]

    if (STRING_FIELDS.has(field)) {
      if (vLegacy !== vModern) {
        console.log('  FAIL ' + label + ' campo=' + field)
        console.log('       legacy="' + vLegacy + '"')
        console.log('       modern="' + vModern + '"')
        casePassed = false
        failedTests++
      }
    } else {
      const diff = Math.abs((vLegacy as number) - (vModern as number))
      if (diff > TOLERANCE) {
        console.log('  FAIL ' + label + ' campo=' + field)
        console.log('       legacy=' + (vLegacy as number).toFixed(10))
        console.log('       modern=' + (vModern as number).toFixed(10))
        console.log('       diff=' + diff.toExponential(2))
        casePassed = false
        failedTests++
      }
    }
  }

  if (casePassed) {
    console.log('  OK   ' + label + ' base=' + baseLabel + '  ' + allFieldNames.length + ' campos coinciden')
  } else {
    allPassed = false
  }
}

console.log('')
console.log('========================================')
console.log('Resultado: ' + (allPassed ? 'TODOS OK' : 'HUBO FALLOS'))
console.log('Tests totales: ' + totalTests + ', fallos: ' + failedTests)
console.log('========================================')

process.exit(allPassed ? 0 : 1)