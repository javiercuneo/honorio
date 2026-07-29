// ---------------------------------------------------------------
// Validacion end-to-end: buildExhorto() y buildIncidente() (TS)
// vs la logica legacy en calculations.js (calcularFinal, tipo
// 'exhorto' / 'incidente', lineas 10-51).
//
// Uso: npx tsx lib/legal/__tests__/buildExhortoIncidente.validation.ts
// ---------------------------------------------------------------

import { buildCalculationResult } from "../calculate"
import type { WizardState } from "../types"

// ================================================================
// REFERENCIA LEGACY: EXHORTO (art. 50)
// Replica exacta de calculations.js lineas 11-29
// ================================================================

interface LegacyExhorto {
  incisoA: number
  incisoBMin: number
  incisoBMax: number
  incisoCMin: number
  incisoCMax: number
}

function legacyExhorto(state: WizardState): LegacyExhorto {
  const uma = state.valorUMA
  const minA = 3, minB = 10, maxB = 20, minC = 7, maxC = 30
  return {
    incisoA: minA * uma,
    incisoBMin: minB * uma,
    incisoBMax: maxB * uma,
    incisoCMin: minC * uma,
    incisoCMax: maxC * uma,
  }
}

// ================================================================
// REFERENCIA LEGACY: INCIDENTE (art. 29 inc. g)
// Replica exacta de calculations.js lineas 33-48
// ================================================================

interface LegacyIncidente {
  minUMA: number
  maxUMA: number
  minPesos: number
  maxPesos: number
}

function legacyIncidente(state: WizardState): LegacyIncidente | null {
  const uma = state.valorUMA
  const base = state.baseValor
  if (base <= 0) return null
  const baseUMA = base / uma
  const minUMA = baseUMA * 0.02
  const maxUMA = baseUMA * 0.20
  return { minUMA, maxUMA, minPesos: minUMA * uma, maxPesos: maxUMA * uma }
}

// ================================================================
// TEST HARNESS
// ================================================================

const UMA = 92482
const TOL = 1e-9

function makeState(overrides: Partial<WizardState>): WizardState {
  return {
    step: 0,
    valorUMA: UMA,
    tipoProceso: "exhorto",
    modoTerminacion: "",
    sentenciaResultado: null,
    aperturaPrueba: null,
    caducidadCriterio: "",
    tuvoExcepciones: null,
    sucesionUnicoLetrado: null,
    medidaOposicion: null,
    homologacionVivienda: null,
    objetoBase: "",
    desalojoVivienda: null,
    posesoriasTipo: null,
    baseValor: 0,
    esProvisorio: false,
    desdeMinimos: false,
    desdeResultado: false,
    ...overrides,
  } as WizardState
}

let passed = 0
let failed = 0
const failures: string[] = []

function check(label: string, vLeg: number, vTS: number, field: string) {
  const diff = Math.abs(vLeg - vTS)
  if (diff > TOL) {
    console.log("  FAIL " + label.padEnd(45) + " " + field + ": legacy=" + vLeg + " TS=" + vTS + " diff=" + diff)
    failures.push(label + " / " + field)
    return false
  }
  return true
}

console.log("======================================================================")
console.log("Validacion end-to-end: buildExhorto / buildIncidente vs legacy")
console.log("UMA = " + UMA)
console.log("======================================================================")

// ---- Exhorto: el resultado no depende de baseValor, solo de valorUMA ----
const EXHORTO_UMAS = [1, 92482, 500000]
for (const uma of EXHORTO_UMAS) {
  const label = "exhorto UMA=" + uma
  const state = makeState({ tipoProceso: "exhorto", valorUMA: uma })
  const leg = legacyExhorto(state)
  const ts = buildCalculationResult(state)
  const ex = ts.exhorto

  if (!ex) {
    console.log("  FAIL " + label.padEnd(45) + " TS no genero campo 'exhorto'")
    failures.push(label + " / campo exhorto ausente")
    failed++
    continue
  }

  let ok = true
  ok = check(label, leg.incisoA, ex.incisoA, "incisoA") && ok
  ok = check(label, leg.incisoBMin, ex.incisoB.minPesos, "incisoB.min") && ok
  ok = check(label, leg.incisoBMax, ex.incisoB.maxPesos, "incisoB.max") && ok
  ok = check(label, leg.incisoCMin, ex.incisoC.minPesos, "incisoC.min") && ok
  ok = check(label, leg.incisoCMax, ex.incisoC.maxPesos, "incisoC.max") && ok

  if (ok) {
    console.log("  OK   " + label.padEnd(45) + " 5 campos coinciden")
    passed++
  } else {
    failed++
  }
}

// ---- Incidente: depende de baseValor y valorUMA ----
const INCIDENTE_CASES = [
  { label: "incidente base 5.000.000", baseValor: 5_000_000 },
  { label: "incidente base 1 UMA", baseValor: UMA },
  { label: "incidente base grande (5000 UMA)", baseValor: 5000 * UMA },
  { label: "incidente base cero (buildEmpty)", baseValor: 0 },
]

for (const tc of INCIDENTE_CASES) {
  const state = makeState({ tipoProceso: "incidente", baseValor: tc.baseValor })
  const leg = legacyIncidente(state)
  const ts = buildCalculationResult(state)
  const rango = ts.honorarios?.patrocinante?.rango

  if (leg === null) {
    const isEmpty = !rango || (rango.minPesos === 0 && rango.maxPesos === 0)
    if (isEmpty) {
      console.log("  OK   " + tc.label.padEnd(45) + " ambos producen resultado vacio")
      passed++
    } else {
      console.log("  FAIL " + tc.label.padEnd(45) + " legacy=null pero TS tiene resultado")
      failures.push(tc.label + " / legacy=null vs TS objeto")
      failed++
    }
    continue
  }

  if (!rango) {
    console.log("  FAIL " + tc.label.padEnd(45) + " TS no genero honorarios.patrocinante.rango")
    failures.push(tc.label + " / rango ausente")
    failed++
    continue
  }

  let ok = true
  ok = check(tc.label, leg.minUMA, rango.minUMA, "minUMA") && ok
  ok = check(tc.label, leg.maxUMA, rango.maxUMA, "maxUMA") && ok
  ok = check(tc.label, leg.minPesos, rango.minPesos, "minPesos") && ok
  ok = check(tc.label, leg.maxPesos, rango.maxPesos, "maxPesos") && ok

  if (ok) {
    console.log("  OK   " + tc.label.padEnd(45) + " 4 campos coinciden")
    passed++
  } else {
    failed++
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
