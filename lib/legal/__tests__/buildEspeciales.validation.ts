// ---------------------------------------------------------------
// Validacion end-to-end: buildMedidaCautelar() y buildHomologacion()
// (TS) vs legacy calcularFinal()
//
// Uso: npx tsx lib/legal/__tests__/buildEspeciales.validation.ts
// ---------------------------------------------------------------

import { buildMedidaCautelar, buildHomologacion } from "../calculate"
import type { WizardState } from "../types"

// ================================================================
// REFERENCIA LEGACY: calcularEscalaBase() copia exacta de core.js
// ================================================================

function legacyCalcularEscalaBase(basePesos: number, valorUMA: number): any {
  if (!basePesos || !valorUMA || valorUMA <= 0) return null
  const baseEnUMA = basePesos / valorUMA
  let minComp: number, maxComp: number, tituloEscala: string
  let minPorc: number, maxPorc: number
  let maximoEscalaAnterior = 0
  let limiteAnterior = 0

  if (baseEnUMA <= 15) {
    tituloEscala = "1a escala (hasta 15 UMA): 22% a 33%"
    minComp = baseEnUMA * 0.22
    maxComp = baseEnUMA * 0.33
    minPorc = 22; maxPorc = 33
  } else if (baseEnUMA <= 45) {
    tituloEscala = "2a escala (16-45 UMA): 20% a 26%"
    minComp = (baseEnUMA - 15) * 0.20 + 4.95
    maxComp = (baseEnUMA - 15) * 0.26 + 4.95
    minPorc = 20; maxPorc = 26
    maximoEscalaAnterior = 4.95
    limiteAnterior = 15
  } else if (baseEnUMA <= 90) {
    tituloEscala = "3a escala (46-90 UMA): 18% a 24%"
    minComp = (baseEnUMA - 45) * 0.18 + 11.7
    maxComp = (baseEnUMA - 45) * 0.24 + 11.7
    minPorc = 18; maxPorc = 24
    maximoEscalaAnterior = 11.7
    limiteAnterior = 45
  } else if (baseEnUMA <= 150) {
    tituloEscala = "4a escala (91-150 UMA): 17% a 22%"
    minComp = (baseEnUMA - 90) * 0.17 + 21.6
    maxComp = (baseEnUMA - 90) * 0.22 + 21.6
    minPorc = 17; maxPorc = 22
    maximoEscalaAnterior = 21.6
    limiteAnterior = 90
  } else if (baseEnUMA <= 450) {
    tituloEscala = "5a escala (151-450 UMA): 15% a 20%"
    minComp = (baseEnUMA - 150) * 0.15 + 33
    maxComp = (baseEnUMA - 150) * 0.20 + 33
    minPorc = 15; maxPorc = 20
    maximoEscalaAnterior = 33
    limiteAnterior = 150
  } else if (baseEnUMA <= 750) {
    tituloEscala = "6a escala (451-750 UMA): 13% a 17%"
    minComp = (baseEnUMA - 450) * 0.13 + 90
    maxComp = (baseEnUMA - 450) * 0.17 + 90
    minPorc = 13; maxPorc = 17
    maximoEscalaAnterior = 90
    limiteAnterior = 450
  } else {
    tituloEscala = "7a escala (+750 UMA): 12% a 15%"
    minComp = (baseEnUMA - 750) * 0.12 + 127.5
    maxComp = (baseEnUMA - 750) * 0.15 + 127.5
    minPorc = 12; maxPorc = 15
    maximoEscalaAnterior = 127.5
    limiteAnterior = 750
  }

  return {
    tituloEscala, baseEnUMA, minPorc, maxPorc,
    maximoEscalaAnterior, limiteAnterior,
    patrocinante: {
      full: { min: minComp, max: maxComp },
    },
    apoderado: {
      full: { min: minComp * 1.4, max: maxComp * 1.4 },
    },
    auxMin: baseEnUMA * 0.05,
    auxMax: baseEnUMA * 0.10,
  }
}

// ================================================================
// REFERENCIA LEGACY: MEDIDA CAUTELAR
// Replica exacta de la logica en calculations.js lineas 52-89
// ================================================================

interface LegacyOutput {
  baseOriginal: number
  baseFinal: number
  baseEnUMA: number
  minPorc: number
  maxPorc: number
  minFinal: number
  maxFinal: number
  minApoFinal: number
  maxApoFinal: number
  minProc: number
  maxProc: number
  auxMin: number
  auxMax: number
}

function legacyMedidaCautelar(state: WizardState): LegacyOutput | null {
  const baseFinal = state.baseValor
  if (baseFinal <= 0) return null
  const factor = state.medidaOposicion ? 0.5 : 0.25
  const calcBase = legacyCalcularEscalaBase(baseFinal, state.valorUMA)
  if (!calcBase) return null

  const minFinal = calcBase.patrocinante.full.min * factor
  const maxFinal = calcBase.patrocinante.full.max * factor
  const minApoFinal = calcBase.apoderado.full.min * factor
  const maxApoFinal = calcBase.apoderado.full.max * factor
  const minProc = minFinal * 0.4
  const maxProc = maxFinal * 0.4

  return {
    baseOriginal: state.baseValor,
    baseFinal,
    baseEnUMA: calcBase.baseEnUMA,
    minPorc: calcBase.minPorc,
    maxPorc: calcBase.maxPorc,
    minFinal, maxFinal,
    minApoFinal, maxApoFinal,
    minProc, maxProc,
    auxMin: calcBase.auxMin,
    auxMax: calcBase.auxMax,
  }
}

// ================================================================
// REFERENCIA LEGACY: HOMOLOGACION DESOCUPACION
// Replica exacta de la logica en calculations.js lineas 91-117
// ================================================================

function legacyHomologacion(state: WizardState): LegacyOutput | null {
  let baseFinal = state.baseValor
  if (baseFinal <= 0) return null
  if (state.homologacionVivienda) baseFinal *= 0.8
  const calcBase = legacyCalcularEscalaBase(baseFinal, state.valorUMA)
  if (!calcBase) return null

  const minFinal = calcBase.patrocinante.full.min * 0.5
  const maxFinal = calcBase.patrocinante.full.max * 0.5
  const minApoFinal = calcBase.apoderado.full.min * 0.5
  const maxApoFinal = calcBase.apoderado.full.max * 0.5
  const minProc = minFinal * 0.4
  const maxProc = maxFinal * 0.4

  return {
    baseOriginal: state.baseValor,
    baseFinal,
    baseEnUMA: calcBase.baseEnUMA,
    minPorc: calcBase.minPorc,
    maxPorc: calcBase.maxPorc,
    minFinal, maxFinal,
    minApoFinal, maxApoFinal,
    minProc, maxProc,
    auxMin: calcBase.auxMin,
    auxMax: calcBase.auxMax,
  }
}

// ================================================================
// EXTRACT: extrae los mismos campos numericos de CalculoResultado
// ================================================================

function extractFromTS(r: any): LegacyOutput {
  const h = r.honorarios || {}
  const p = h.patrocinante?.rango || {}
  const a = h.apoderado?.rango || {}
  const pr = h.procurador?.rango || {}
  const aux = r.auxiliares || {}

  return {
    baseOriginal: r.baseOriginal || 0,
    baseFinal: r.baseFinal || 0,
    baseEnUMA: r.escala?.baseEnUMA || 0,
    minPorc: r.escala?.porcentajeMin || 0,
    maxPorc: r.escala?.porcentajeMax || 0,
    minFinal: p.minUMA || 0,
    maxFinal: p.maxUMA || 0,
    minApoFinal: a.minUMA || 0,
    maxApoFinal: a.maxUMA || 0,
    minProc: pr.minUMA || 0,
    maxProc: pr.maxUMA || 0,
    auxMin: aux.minUMA || 0,
    auxMax: aux.maxUMA || 0,
  }
}

// ================================================================
// TEST HARNESS
// ================================================================

const UMA = 92482
const FIELDS: (keyof LegacyOutput)[] = [
  "baseOriginal", "baseFinal", "baseEnUMA", "minPorc", "maxPorc",
  "minFinal", "maxFinal", "minApoFinal", "maxApoFinal", "minProc", "maxProc",
  "auxMin", "auxMax",
]
const TOL = 1e-10

function makeState(overrides: Partial<WizardState>): Partial<WizardState> {
  return {
    valorUMA: UMA,
    tipoProceso: "medida_cautelar",
    baseValor: 5000000,
    medidaOposicion: null,
    homologacionVivienda: null,
    esProvisorio: false,
    ...overrides,
  }
}

const ESCALA_COUNTS = [0, 1, 10, 15, 16, 45, 46, 90, 91, 150, 151, 450, 451, 750, 751, 5000]

const CAUTELAR_CASES = ESCALA_COUNTS.map((c) => ({
  label: "cautelar escala " + c + " UMA base",
  processType: "medida_cautelar" as const,
  state: makeState({ baseValor: c * UMA }),
}))

const HOMOLOG_CASES = ESCALA_COUNTS.map((c) => ({
  label: "homologacion escala " + c + " UMA base",
  processType: "homologacion_desocupacion" as const,
  state: makeState({ tipoProceso: "homologacion_desocupacion", baseValor: c * UMA }),
}))

interface TestCase {
  label: string
  processType: "medida_cautelar" | "homologacion_desocupacion"
  state: Partial<WizardState>
}

const TEST_CASES: TestCase[] = [
  ...CAUTELAR_CASES,
  {
    label: "cautelar con oposicion",
    processType: "medida_cautelar",
    state: makeState({ medidaOposicion: true }),
  },
  {
    label: "cautelar sin oposicion (default)",
    processType: "medida_cautelar",
    state: makeState({ medidaOposicion: false }),
  },
  {
    label: "cautelar base cero (buildEmpty)",
    processType: "medida_cautelar",
    state: makeState({ baseValor: 0 }),
  },
  {
    label: "cautelar base muy baja",
    processType: "medida_cautelar",
    state: makeState({ baseValor: 1 }),
  },
  ...HOMOLOG_CASES,
  {
    label: "homologacion con vivienda (-20% base)",
    processType: "homologacion_desocupacion",
    state: makeState({ tipoProceso: "homologacion_desocupacion", homologacionVivienda: true }),
  },
  {
    label: "homologacion sin vivienda",
    processType: "homologacion_desocupacion",
    state: makeState({ tipoProceso: "homologacion_desocupacion", homologacionVivienda: false }),
  },
  {
    label: "homologacion base cero (buildEmpty)",
    processType: "homologacion_desocupacion",
    state: makeState({ tipoProceso: "homologacion_desocupacion", baseValor: 0 }),
  },
  {
    label: "homologacion base muy baja",
    processType: "homologacion_desocupacion",
    state: makeState({ tipoProceso: "homologacion_desocupacion", baseValor: 1 }),
  },
]

// ================================================================
// COMPARISON LOOP
// ================================================================

function runBuilder(processType: string, state: WizardState): any {
  if (processType === "medida_cautelar") return buildMedidaCautelar(state)
  if (processType === "homologacion_desocupacion") return buildHomologacion(state)
  return null
}

function runLegacy(processType: string, state: WizardState): LegacyOutput | null {
  if (processType === "medida_cautelar") return legacyMedidaCautelar(state)
  if (processType === "homologacion_desocupacion") return legacyHomologacion(state)
  return null
}

let passed = 0
let failed = 0
const failures: string[] = []

console.log("======================================================================")
console.log("Validacion end-to-end: builders especiales vs legacy")
console.log("UMA = " + UMA + ", casos = " + TEST_CASES.length)
console.log("======================================================================")

for (const tc of TEST_CASES) {
  const st = tc.state as WizardState
  const leg = runLegacy(tc.processType, st)
  const ts = runBuilder(tc.processType, st)
  const label = tc.label.padEnd(50)

  if (leg === null) {
    const isEmpty = !ts.baseFinal && !ts.honorarios?.patrocinante?.rango?.minUMA
    if (isEmpty) {
      console.log("  OK   " + label + " ambos producen resultado vacio")
      passed++
      continue
    }
    console.log("  FAIL " + label + " legacy=null pero TS tiene resultado")
    failures.push(label + " legacy=null vs TS objeto")
    failed++
    continue
  }

  const flatTS = extractFromTS(ts)
  let caseOk = true

  for (const field of FIELDS) {
    const vLeg = leg[field]
    const vTS = flatTS[field]
    const diff = Math.abs(vLeg - vTS)
    if (diff > TOL) {
      if (caseOk) {
        console.log("  FAIL " + label)
        caseOk = false
      }
      console.log("       " + field + ": legacy=" + vLeg.toFixed(10) + "  TS=" + vTS.toFixed(10) + "  diff=" + diff.toExponential(2))
    }
  }

  if (caseOk) {
    console.log("  OK   " + label + " " + FIELDS.length + " campos coinciden")
    passed++
  } else {
    failed++
    failures.push(label + " (ver detalle arriba)")
  }
}

console.log()
console.log("======================================================================")
console.log("Resultado: " + passed + " OK, " + failed + " FAIL, " + (passed + failed) + " total")
console.log("======================================================================")
if (failures.length > 0) {
  console.log()
  console.log("DETALLE DE FALLOS:")
  for (const f of failures) console.log(f)
}
process.exit(failures.length > 0 ? 1 : 0)