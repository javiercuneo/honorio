// ---------------------------------------------------------------
// Validacion end-to-end: buildGeneral() (TS) vs legacy calcularFinal()
//
// Verifica que buildGeneral() produzca exactamente los mismos
// valores numericos que la logica interna de calcularFinal()
// para procesos de conocimiento, ejecucion_sentencia, ejecutivo y sucesion.
//
// Uso: npx tsx lib/legal/__tests__/buildGeneral.validation.ts
// ---------------------------------------------------------------

import { buildGeneral } from "../calculate"
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
// REFERENCIA LEGACY: replica exacta de la logica numerica de
// calcularFinal() para el caso general (conocimiento, ejecucion,
// ejecutivo, sucesion) sin generar HTML.
// ================================================================

interface LegacyOutput {
  baseFinal: number
  baseEnUMA: number
  minPorc: number
  maxPorc: number
  factorEscala: number
  factorFinal: number
  minFinal: number
  maxFinal: number
  minApoFinal: number
  maxApoFinal: number
  minProc: number
  maxProc: number
  auxMin: number
  auxMax: number
  patMinSeg: number
  patMaxSeg: number
  patMaxRev: number
  apoMinSeg: number
  apoMaxSeg: number
  apoMaxRev: number
  procMinSeg: number
  procMaxSeg: number
  procMaxRev: number
  partidorMinPesos: number
  partidorMaxPesos: number
}

function legacyGeneralCase(st: Partial<WizardState>): LegacyOutput | null {
  const tipo = st.tipoProceso || ""
  const uma = st.valorUMA || 92482
  const baseValor = st.baseValor || 0

  // Base reductions (exact replica of calcularFinal lines 119-145)
  let baseReducida = baseValor
  if (
    tipo === "conocimiento" &&
    st.objetoBase === "desalojo" &&
    st.desalojoVivienda === "vivienda"
  ) {
    baseReducida *= 0.8
  }
  if (
    (tipo === "conocimiento" || tipo === "ejecucion_sentencia" || tipo === "ejecutivo") &&
    st.sentenciaResultado === "rechazada"
  ) {
    baseReducida *= 0.7
  }
  if (
    (tipo === "conocimiento" || tipo === "ejecucion_sentencia" || tipo === "ejecutivo") &&
    st.modoTerminacion === "caducidad" &&
    st.caducidadCriterio === "art22"
  ) {
    baseReducida *= 0.7
  }
  const baseFinal = baseReducida
  const calcBase = legacyCalcularEscalaBase(baseFinal, uma)
  if (!calcBase) return null

  // Scale reductions (exact replica of calcularFinal lines 147-173)
  let factorEscala = 1
  if (tipo === "sucesion" && st.sucesionUnicoLetrado === true) {
    factorEscala *= 0.5
  }
  if (tipo === "ejecucion_sentencia") {
    factorEscala *= 0.5
  }
  if (
    (tipo === "conocimiento" || tipo === "ejecucion_sentencia" || tipo === "ejecutivo") &&
    st.modoTerminacion === "modos_anormales" &&
    st.aperturaPrueba === false
  ) {
    factorEscala *= 0.5
  }
  if (
    (tipo === "conocimiento" || tipo === "ejecucion_sentencia" || tipo === "ejecutivo") &&
    st.modoTerminacion === "caducidad" &&
    st.caducidadCriterio === "art25" &&
    st.aperturaPrueba === false
  ) {
    factorEscala *= 0.5
  }
  const minEscala = calcBase.patrocinante.full.min * factorEscala
  const maxEscala = calcBase.patrocinante.full.max * factorEscala
  const minApoEscala = calcBase.apoderado.full.min * factorEscala
  const maxApoEscala = calcBase.apoderado.full.max * factorEscala

  // Final reductions (exact replica of calcularFinal lines 175-200)
  let factorFinal = 1
  if (tipo === "ejecutivo" && st.tuvoExcepciones === false) {
    factorFinal = 0.9
  } else if (tipo === "ejecucion_sentencia" && st.tuvoExcepciones === false) {
    factorFinal = 0.9
  }
  if (
    tipo === "conocimiento" &&
    st.objetoBase === "posesorias_interdictos" &&
    st.posesoriasTipo === "beneficio"
  ) {
    factorFinal *= 0.8
  }
  if (tipo === "conocimiento" && st.objetoBase === "incidencia_colectiva") {
    factorFinal *= 0.75
  }
  const minFinal = minEscala * factorFinal
  const maxFinal = maxEscala * factorFinal
  const minApoFinal = minApoEscala * factorFinal
  const maxApoFinal = maxApoEscala * factorFinal
  const minProc = minFinal * 0.4
  const maxProc = maxFinal * 0.4
  const auxMin = calcBase.auxMin
  const auxMax = calcBase.auxMax

  // Segunda instancia (exact replica of calcularFinal lines 226-234)
  const patMinSeg = minFinal * 0.30
  const patMaxSeg = maxFinal * 0.35
  const patMaxRev = maxFinal * 0.40
  const apoMinSeg = minApoFinal * 0.30
  const apoMaxSeg = maxApoFinal * 0.35
  const apoMaxRev = maxApoFinal * 0.40
  const procMinSeg = minProc * 0.30
  const procMaxSeg = maxProc * 0.35
  const procMaxRev = maxProc * 0.40

  // Partidor (solo sucesion)
  let partidorMinPesos = 0
  let partidorMaxPesos = 0
  if (tipo === "sucesion") {
    partidorMinPesos = baseFinal * 0.02
    partidorMaxPesos = baseFinal * 0.03
  }

  return {
    baseFinal,
    baseEnUMA: calcBase.baseEnUMA,
    minPorc: calcBase.minPorc,
    maxPorc: calcBase.maxPorc,
    factorEscala,
    factorFinal,
    minFinal,
    maxFinal,
    minApoFinal,
    maxApoFinal,
    minProc,
    maxProc,
    auxMin,
    auxMax,
    patMinSeg,
    patMaxSeg,
    patMaxRev,
    apoMinSeg,
    apoMaxSeg,
    apoMaxRev,
    procMinSeg,
    procMaxSeg,
    procMaxRev,
    partidorMinPesos,
    partidorMaxPesos,
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
  const seg = r.segundaInstancia || {}
  const part = r.partidor || {}

  const segPat = seg.patrocinante || {}
  const segApo = seg.apoderado || {}
  const segProc = seg.procurador || {}
  const segPatMin = segPat.minimo || {}
  const segPatMax = segPat.maximo || {}
  const segPatRev = segPat.revocada || {}
  const segApoMin = segApo.minimo || {}
  const segApoMax = segApo.maximo || {}
  const segApoRev = segApo.revocada || {}
  const segProcMin = segProc.minimo || {}
  const segProcMax = segProc.maximo || {}
  const segProcRev = segProc.revocada || {}

  return {
    baseFinal: r.baseFinal || 0,
    baseEnUMA: r.escala?.baseEnUMA || 0,
    minPorc: r.escala?.porcentajeMin || 0,
    maxPorc: r.escala?.porcentajeMax || 0,
    factorEscala: 0,
    factorFinal: 0,
    minFinal: p.minUMA || 0,
    maxFinal: p.maxUMA || 0,
    minApoFinal: a.minUMA || 0,
    maxApoFinal: a.maxUMA || 0,
    minProc: pr.minUMA || 0,
    maxProc: pr.maxUMA || 0,
    auxMin: aux.minUMA || 0,
    auxMax: aux.maxUMA || 0,
    patMinSeg: segPatMin.minUMA || 0,
    patMaxSeg: segPatMax.maxUMA || 0,
    patMaxRev: segPatRev.maxUMA || 0,
    apoMinSeg: segApoMin.minUMA || 0,
    apoMaxSeg: segApoMax.maxUMA || 0,
    apoMaxRev: segApoRev.maxUMA || 0,
    procMinSeg: segProcMin.minUMA || 0,
    procMaxSeg: segProcMax.maxUMA || 0,
    procMaxRev: segProcRev.maxUMA || 0,
    partidorMinPesos: part.minPesos || 0,
    partidorMaxPesos: part.maxPesos || 0,
  }
}


// ================================================================
// TEST HARNESS
// ================================================================


const UMA = 92482

interface TestCase {
  label: string
  state: Partial<WizardState>
}

function makeState(overrides: Partial<WizardState>): Partial<WizardState> {
  return {
    valorUMA: UMA,
    tipoProceso: "conocimiento",
    baseValor: 5000000,
    objetoBase: "" as any,
    desalojoVivienda: null,
    sentenciaResultado: null,
    modoTerminacion: "" as any,
    caducidadCriterio: "" as any,
    sucesionUnicoLetrado: null,
    aperturaPrueba: null,
    tuvoExcepciones: null,
    posesoriasTipo: null,
    esProvisorio: false,
    ...overrides,
  }
}

function addScaleCases(): TestCase[] {
  const counts = [0, 1, 10, 15, 16, 45, 46, 90, 91, 150, 151, 450, 451, 750, 751, 5000]
  return counts.map((c) => ({
    label: "escala " + c + " UMA base",
    state: makeState({
      tipoProceso: "conocimiento",
      baseValor: c * UMA,
    }),
  }))
}

const TEST_CASES: TestCase[] = [
  // ---- Pure scale tests (16 cases) ----
  ...addScaleCases(),

  // ---- Base reduction tests (8 cases) ----
  {
    label: "desalojo vivienda -20%",
    state: makeState({
      tipoProceso: "conocimiento",
      objetoBase: "desalojo" as any,
      desalojoVivienda: "vivienda",
    }),
  },
  {
    label: "demanda rechazada -30%",
    state: makeState({
      tipoProceso: "conocimiento",
      sentenciaResultado: "rechazada",
    }),
  },
  {
    label: "caducidad art22 -30%",
    state: makeState({
      tipoProceso: "conocimiento",
      modoTerminacion: "caducidad" as any,
      caducidadCriterio: "art22" as any,
    }),
  },
  {
    label: "desalojo + demanda rechazada",
    state: makeState({
      tipoProceso: "conocimiento",
      objetoBase: "desalojo" as any,
      desalojoVivienda: "vivienda",
      sentenciaResultado: "rechazada",
    }),
  },
  {
    label: "rechazada + caducidad art22",
    state: makeState({
      tipoProceso: "conocimiento",
      sentenciaResultado: "rechazada",
      modoTerminacion: "caducidad" as any,
      caducidadCriterio: "art22" as any,
    }),
  },
  {
    label: "ejecutivo sin reduccion base",
    state: makeState({
      tipoProceso: "ejecutivo",
      sentenciaResultado: "admitida",
    }),
  },
  {
    label: "sucesion sin reduccion base",
    state: makeState({
      tipoProceso: "sucesion",
    }),
  },
  {
    label: "desalojo + rechazada + caducidad art22",
    state: makeState({
      tipoProceso: "conocimiento",
      objetoBase: "desalojo" as any,
      desalojoVivienda: "vivienda",
      sentenciaResultado: "rechazada",
      modoTerminacion: "caducidad" as any,
      caducidadCriterio: "art22" as any,
    }),
  },

  // ---- Scale reduction tests (7 cases) ----
  {
    label: "sucesion unico letrado -50%",
    state: makeState({
      tipoProceso: "sucesion",
      sucesionUnicoLetrado: true,
    }),
  },
  {
    label: "ejecucion sentencia -50% escala",
    state: makeState({
      tipoProceso: "ejecucion_sentencia",
    }),
  },
  {
    label: "modos anormales sin prueba -50%",
    state: makeState({
      tipoProceso: "conocimiento",
      modoTerminacion: "modos_anormales" as any,
      aperturaPrueba: false,
    }),
  },
  {
    label: "caducidad art25 sin prueba -50%",
    state: makeState({
      tipoProceso: "conocimiento",
      modoTerminacion: "caducidad" as any,
      caducidadCriterio: "art25" as any,
      aperturaPrueba: false,
    }),
  },
  {
    label: "sucesion unico letrado (ya probado arriba)",
    state: makeState({
      tipoProceso: "sucesion",
      sucesionUnicoLetrado: true,
    }),
  },
  {
    label: "conocimiento normal sin reduccion escala",
    state: makeState({
      tipoProceso: "conocimiento",
      modoTerminacion: "sentencia" as any,
    }),
  },
  {
    label: "caducidad art25 con prueba (no aplica)",
    state: makeState({
      tipoProceso: "conocimiento",
      modoTerminacion: "caducidad" as any,
      caducidadCriterio: "art25" as any,
      aperturaPrueba: true,
    }),
  },

  // ---- Final reduction tests (6 cases) ----
  {
    label: "ejecutivo sin excepciones -10%",
    state: makeState({
      tipoProceso: "ejecutivo",
      tuvoExcepciones: false,
    }),
  },
  {
    label: "ejecucion sentencia sin excepciones -10%",
    state: makeState({
      tipoProceso: "ejecucion_sentencia",
      tuvoExcepciones: false,
    }),
  },
  {
    label: "posesorias beneficio -20%",
    state: makeState({
      tipoProceso: "conocimiento",
      objetoBase: "posesorias_interdictos" as any,
      posesoriasTipo: "beneficio",
    }),
  },
  {
    label: "incidencia colectiva -25%",
    state: makeState({
      tipoProceso: "conocimiento",
      objetoBase: "incidencia_colectiva" as any,
    }),
  },
  {
    label: "ejecutivo con excepciones (sin reduccion)",
    state: makeState({
      tipoProceso: "ejecutivo",
      tuvoExcepciones: true,
    }),
  },
  {
    label: "posesorias + incidencia colectiva",
    state: makeState({
      tipoProceso: "conocimiento",
      objetoBase: "posesorias_interdictos" as any,
      posesoriasTipo: "beneficio",
    }),
  },

  // ---- Complex combinations (10 cases) ----
  {
    label: "ejecutivo + rechazada + sin excepciones",
    state: makeState({
      tipoProceso: "ejecutivo",
      sentenciaResultado: "rechazada",
      tuvoExcepciones: false,
    }),
  },
  {
    label: "ejecucion sentencia + rechazada + sin excepciones",
    state: makeState({
      tipoProceso: "ejecucion_sentencia",
      sentenciaResultado: "rechazada",
      tuvoExcepciones: false,
    }),
  },
  {
    label: "conocimiento + rechazada + modos anormales",
    state: makeState({
      tipoProceso: "conocimiento",
      sentenciaResultado: "rechazada",
      modoTerminacion: "modos_anormales" as any,
      aperturaPrueba: false,
    }),
  },
  {
    label: "conocimiento + desalojo vivienda + caducidad art25",
    state: makeState({
      tipoProceso: "conocimiento",
      objetoBase: "desalojo" as any,
      desalojoVivienda: "vivienda",
      modoTerminacion: "caducidad" as any,
      caducidadCriterio: "art25" as any,
      aperturaPrueba: false,
    }),
  },
  {
    label: "conocimiento + rechazada + posesorias beneficio",
    state: makeState({
      tipoProceso: "conocimiento",
      sentenciaResultado: "rechazada",
      objetoBase: "posesorias_interdictos" as any,
      posesoriasTipo: "beneficio",
    }),
  },
  {
    label: "ejecutivo + rechazada + caducidad art22 + sin excepciones",
    state: makeState({
      tipoProceso: "ejecutivo",
      sentenciaResultado: "rechazada",
      modoTerminacion: "caducidad" as any,
      caducidadCriterio: "art22" as any,
      tuvoExcepciones: false,
    }),
  },
  {
    label: "sucesion unico letrado base alta",
    state: makeState({
      tipoProceso: "sucesion",
      baseValor: 50000000,
      sucesionUnicoLetrado: true,
    }),
  },
  {
    label: "ejecucion sentencia + rechazada + caducidad art25 + sin excepciones",
    state: makeState({
      tipoProceso: "ejecucion_sentencia",
      sentenciaResultado: "rechazada",
      modoTerminacion: "caducidad" as any,
      caducidadCriterio: "art25" as any,
      aperturaPrueba: false,
      tuvoExcepciones: false,
    }),
  },
  {
    label: "conocimiento varios (posesorias+rechazada+art22+incidencia)",
    state: makeState({
      tipoProceso: "conocimiento",
      baseValor: 10000000,
      objetoBase: "posesorias_interdictos" as any,
      desalojoVivienda: "vivienda",
      sentenciaResultado: "rechazada",
      modoTerminacion: "caducidad" as any,
      caducidadCriterio: "art22" as any,
      posesoriasTipo: "beneficio",
    }),
  },
  {
    label: "conocimiento base 0 (escala null -> buildEmpty)",
    state: makeState({
      baseValor: 0,
    }),
  },

  // ---- Edge cases (3 cases) ----
  {
    label: "base muy baja 1 peso",
    state: makeState({
      baseValor: 1,
    }),
  },
  {
    label: "base extremadamente alta",
    state: makeState({
      baseValor: 1e12,
    }),
  },
  {
    label: "tipo proceso vacio (fallback buildEmpty)",
    state: makeState({
      tipoProceso: "" as any,
    }),
  },
]


// ================================================================
// COMPARISON LOOP
// ================================================================

const TOL = 1e-10
const FIELDS: (keyof LegacyOutput)[] = [
  "baseFinal", "baseEnUMA", "minPorc", "maxPorc",
  
  "minFinal", "maxFinal", "minApoFinal", "maxApoFinal", "minProc", "maxProc",
  "auxMin", "auxMax",
  "patMinSeg", "patMaxSeg", "patMaxRev",
  "apoMinSeg", "apoMaxSeg", "apoMaxRev",
  "procMinSeg", "procMaxSeg", "procMaxRev",
  "partidorMinPesos", "partidorMaxPesos",
]

let passed = 0
let failed = 0
const failures: string[] = []

console.log("======================================================================")
console.log("Validacion end-to-end: buildGeneral() vs legacyGeneralCase()")
console.log("UMA = " + UMA + ", casos = " + TEST_CASES.length)
console.log("======================================================================")

for (const tc of TEST_CASES) {
  const st = tc.state as WizardState
  const leg = legacyGeneralCase(st)
  const ts = buildGeneral(st)

  const label = tc.label.padEnd(55)

  // Both null -> skip
  if (leg === null && !ts.baseFinal && !ts.honorarios?.patrocinante?.rango?.minUMA) {
    console.log("  OK   " + label + " ambos producen resultado vacio")
    passed++
    continue
  }

  // Compare null vs non-null
  if (leg === null) {
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
