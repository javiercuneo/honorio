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
    exhortoInciso: "",
    exhortoMontoTipo: "",
    exhortoMonto: 0,
    exhortoActos: 0,
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

// ---- Exhorto: cada inciso, contra las constantes del art. 50 ----
//
// **El caso ya no son los tres incisos a la vez.** La entrevista
// pregunta cual rige, asi que la validacion corre uno por vez y
// compara contra la constante que le toca. Las cifras del legacy no
// cambiaron —3, 10-20 y 7-30 UMA siguen siendo las mismas—: lo que
// cambio es que ahora solo sale la del inciso elegido.
const EXHORTO_UMAS = [1, 92482, 500000]
for (const uma of EXHORTO_UMAS) {
  const leg = legacyExhorto(makeState({ valorUMA: uma }))

  // Inciso a): piso, sin banda.
  {
    const label = "exhorto inc. a UMA=" + uma
    const ts = buildCalculationResult(makeState({ valorUMA: uma, exhortoInciso: "a" }))
    const ex = ts.exhorto
    if (!ex || !ex.piso) {
      console.log("  FAIL " + label.padEnd(45) + " no genero piso del inciso a")
      failures.push(label + " / piso ausente")
      failed++
    } else if (ex.banda) {
      console.log("  FAIL " + label.padEnd(45) + " el inciso a no puede traer banda cerrada")
      failures.push(label + " / banda indebida")
      failed++
    } else if (check(label, leg.incisoA, ex.piso.pesos, "piso")) {
      console.log("  OK   " + label.padEnd(45) + " piso de 3 UMA, sin techo")
      passed++
    } else {
      failed++
    }
  }

  // Incisos b) y c): banda cerrada, sin piso.
  const cerrados: [("b" | "c"), number, number][] = [
    ["b", leg.incisoBMin, leg.incisoBMax],
    ["c", leg.incisoCMin, leg.incisoCMax],
  ]
  for (const [inc, min, max] of cerrados) {
    const label = "exhorto inc. " + inc + " UMA=" + uma
    const ts = buildCalculationResult(makeState({ valorUMA: uma, exhortoInciso: inc }))
    const ex = ts.exhorto
    if (!ex || !ex.banda) {
      console.log("  FAIL " + label.padEnd(45) + " no genero banda")
      failures.push(label + " / banda ausente")
      failed++
      continue
    }
    if (ex.piso) {
      console.log("  FAIL " + label.padEnd(45) + " un inciso con escala no lleva piso aparte")
      failures.push(label + " / piso indebido")
      failed++
      continue
    }
    let ok = true
    ok = check(label, min, ex.banda.minPesos, "banda.min") && ok
    ok = check(label, max, ex.banda.maxPesos, "banda.max") && ok
    if (ok) {
      console.log("  OK   " + label.padEnd(45) + " banda cerrada, 2 campos coinciden")
      passed++
    } else {
      failed++
    }
  }
}

// ---- Sin inciso elegido no hay respuesta ----
// La entrevista a mitad de camino no puede producir un exhorto
// inventado: `buildExhorto()` cae en `buildEmpty()`.
{
  const ts = buildCalculationResult(makeState({ exhortoInciso: "" }))
  if (ts.exhorto) {
    console.log("  FAIL " + "exhorto sin inciso".padEnd(45) + " genero un resultado igual")
    failures.push("exhorto sin inciso / resultado indebido")
    failed++
  } else {
    console.log("  OK   " + "exhorto sin inciso".padEnd(45) + " no inventa inciso")
    passed++
  }
}

// ---- La referencia no toca la banda ----
// Es la regla que gobierna todo el rediseno: el monto del juicio
// exhortante entra como pauta y **no multiplica nada**. Si un dia
// alguien lo conecta a la cifra del abogado, esto falla.
{
  const uma = 92482
  const sinMonto = buildCalculationResult(makeState({ valorUMA: uma, exhortoInciso: "c" }))
  const conMonto = buildCalculationResult(
    makeState({
      valorUMA: uma,
      exhortoInciso: "c",
      exhortoMontoTipo: "consta",
      exhortoMonto: 750_000_000,
    }),
  )
  const a = sinMonto.exhorto!.banda!
  const b = conMonto.exhorto!.banda!
  const igual = a.minPesos === b.minPesos && a.maxPesos === b.maxPesos
  if (!igual) {
    console.log("  FAIL " + "referencia no altera la banda".padEnd(45) + " la banda cambio con el monto")
    failures.push("referencia / altero la banda")
    failed++
  } else if (!conMonto.exhorto!.referencia) {
    console.log("  FAIL " + "referencia no altera la banda".padEnd(45) + " no se genero la referencia")
    failures.push("referencia / ausente")
    failed++
  } else {
    console.log("  OK   " + "referencia no altera la banda".padEnd(45) + " la banda es la misma con y sin monto")
    passed++
  }

  // Y el auxiliar del inciso c) **no queda topeado en 30 UMA**: con
  // esta base el 10 % del art. 21 la supera, que es exactamente el
  // caso de Sala C. Ver EXHORTO_AUXILIARES.
  const aux = conMonto.auxiliares
  const label = "auxiliar del inc. c sin tope del inciso"
  if (aux.maxUMA <= 30) {
    console.log("  FAIL " + label.padEnd(45) + " maxUMA=" + aux.maxUMA + " quedo dentro del techo")
    failures.push(label + " / topeado")
    failed++
  } else {
    console.log("  OK   " + label.padEnd(45) + " maxUMA=" + aux.maxUMA.toFixed(2))
    passed++
  }

  // El inciso b) no lleva auxiliares: en sus actos no interviene
  // ningun perito.
  const b2 = buildCalculationResult(
    makeState({
      valorUMA: uma,
      exhortoInciso: "b",
      exhortoMontoTipo: "consta",
      exhortoMonto: 750_000_000,
    }),
  )
  if (b2.auxiliares.maxUMA !== 0) {
    console.log("  FAIL " + "inc. b sin auxiliares".padEnd(45) + " genero banda de auxiliares")
    failures.push("inc. b / auxiliares indebidos")
    failed++
  } else {
    console.log("  OK   " + "inc. b sin auxiliares".padEnd(45) + " ningun perito en actos registrales")
    passed++
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
