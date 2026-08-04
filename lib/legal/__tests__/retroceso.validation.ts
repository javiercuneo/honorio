// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 L. Javier Cuneo Libarona
// ---------------------------------------------------------------
// Validacion del flujo "hacia atras" de la entrevista.
//
// El bug que motivo este archivo: llegar a un juicio de conocimiento,
// elegir "honorarios provisorios", volver atras y cambiar a sucesion.
// El paso de terminacion desaparece —la sucesion no lo pregunta— pero
// la respuesta seguia en el estado, y el resultado salia marcado como
// provisorio. Es un caso que la entrevista no puede producir yendo
// hacia adelante, y ademas un error juridico: en el sucesorio no se
// admiten regulaciones provisorias salvo excepcion, y en esa excepcion
// la regulacion es definitiva, con minimo y maximo.
//
// El mismo agujero tenia otras dos salidas, con consecuencia numerica:
//   - 'sentencia + rechazada' -> cambiar a 'modos anormales' dejaba la
//     base reducida un 30% (art. 22) sin haberlo preguntado.
//   - 'modos anormales + antes de prueba' -> cambiar a 'caducidad /
//     art. 22' dejaba la escala reducida un 50% (art. 25) idem.
//
// Se verifican tres cosas:
//   1. que la poda deje estados identicos a los de una corrida limpia,
//      para TODO cruce posible entre procesos (barrido exhaustivo),
//   2. que los tres casos concretos den los numeros de la corrida
//      limpia, y
//   3. que el motor rechace por su cuenta la combinacion imposible,
//      sin depender de que el llamador la haya podado.
//
// Uso: npx tsx lib/legal/__tests__/retroceso.validation.ts
// ---------------------------------------------------------------

import { buildCalculationResult, esRegulacionProvisoria } from '../calculate'
import type { Answers, WizardState } from '../types'
import { ALL_STEPS, PROCESS_STEP_MAP } from '../../wizard/wizard-schema'
import { pasosVisibles, podarInalcanzables } from '../../wizard/reachability'

const UMA = 92482
const BASE = 50_000_000

let allPassed = true
let totalTests = 0
let failedTests = 0

function check(label: string, actual: unknown, expected: unknown) {
  totalTests++
  const ok = JSON.stringify(actual) === JSON.stringify(expected)
  if (!ok) {
    allPassed = false
    failedTests++
    console.log(`  FALLO  ${label}`)
    console.log(`         esperado: ${JSON.stringify(expected)}`)
    console.log(`         obtenido: ${JSON.stringify(actual)}`)
  } else {
    console.log(`  ok     ${label}`)
  }
}

// ---- Puente answers -> WizardState ----
// Replica el mapeo de hooks/useWizard.ts. Si aquel cambia, este tiene
// que cambiar con el, o la validacion deja de validar el flujo real.
const MAPPING: Record<string, keyof WizardState> = {
  umaInicio: 'valorUMA',
  tipoProceso: 'tipoProceso',
  modoTerminacion: 'modoTerminacion',
  sentenciaResultado: 'sentenciaResultado',
  aperturaPrueba: 'aperturaPrueba',
  caducidadCriterio: 'caducidadCriterio',
  tuvoExcepciones: 'tuvoExcepciones',
  sucesionUnicoLetrado: 'sucesionUnicoLetrado',
  medidaOposicion: 'medidaOposicion',
  homologacionVivienda: 'homologacionVivienda',
  objeto: 'objetoBase',
  desalojoVivienda: 'desalojoVivienda',
  posesoriasTipo: 'posesoriasTipo',
  base: 'baseValor',
}

function transformToLegacy(stepId: string, value: unknown): unknown {
  switch (stepId) {
    case 'umaInicio': return typeof value === 'number' ? value : undefined
    case 'tipoProceso':
    case 'modoTerminacion':
    case 'objeto': return typeof value === 'string' ? value : ''
    case 'sentenciaResultado': return typeof value === 'string' && value ? value : null
    case 'aperturaPrueba': return value === 'despues' ? true : value === 'antes' ? false : null
    case 'caducidadCriterio': return typeof value === 'string' ? value : ''
    case 'desalojoVivienda':
    case 'posesoriasTipo': return typeof value === 'string' && value ? value : null
    case 'tuvoExcepciones': return value === 'si' ? true : value === 'no' ? false : null
    case 'sucesionUnicoLetrado': return value === 'unico' ? true : value === 'varios' ? false : null
    case 'medidaOposicion': return value === 'con' ? true : value === 'sin' ? false : null
    case 'homologacionVivienda': return value === 'vivienda' ? true : value === 'otros' ? false : null
    case 'base': return typeof value === 'number' ? value : 0
    default: return value
  }
}

function estadoDesde(answers: Answers): WizardState {
  const ws: WizardState = {
    step: 0, valorUMA: UMA, tipoProceso: '', modoTerminacion: '',
    sentenciaResultado: null, aperturaPrueba: null, caducidadCriterio: '',
    tuvoExcepciones: null, sucesionUnicoLetrado: null, medidaOposicion: null,
    homologacionVivienda: null, objetoBase: '', desalojoVivienda: null,
    posesoriasTipo: null, baseValor: 0, esProvisorio: false,
    desdeMinimos: false, desdeResultado: false,
  }
  for (const [stepId, value] of Object.entries(answers)) {
    if (value === undefined || value === null) continue
    const key = MAPPING[stepId]
    if (!key) continue
    const v = transformToLegacy(stepId, value)
    if (v !== undefined) (ws as unknown as Record<string, unknown>)[key] = v
  }
  return ws
}

// ---- Enumeracion de toda corrida limpia posible ----
function enumerarCorridas(tipo: string): Answers[] {
  let acc: Answers[] = [{ umaInicio: UMA, tipoProceso: tipo }]
  for (const id of PROCESS_STEP_MAP[tipo]) {
    if (id === 'umaInicio' || id === 'tipoProceso') continue
    const step = ALL_STEPS.find((s) => s.id === id)!
    const next: Answers[] = []
    for (const a of acc) {
      if (step.condition && !step.condition(a)) { next.push(a); continue }
      if (step.kind === 'numeric') { next.push({ ...a, [id]: BASE }); continue }
      for (const opt of step.options) next.push({ ...a, [id]: opt.id })
    }
    acc = next
  }
  return acc
}

const TIPOS = Object.keys(PROCESS_STEP_MAP)
const corridas: Record<string, Answers[]> = {}
for (const t of TIPOS) corridas[t] = enumerarCorridas(t)

console.log('========================================')
console.log('Flujo hacia atras — poda de respuestas')
console.log('========================================')
console.log('\ncorridas limpias enumeradas por proceso')
for (const t of TIPOS) console.log(`  ${t.padEnd(28)} ${corridas[t].length}`)

// ---- 1. Barrido exhaustivo ----
// Volver atras y cambiar de rumbo equivale a fusionar dos corridas: las
// respuestas de la primera que la segunda no vuelve a preguntar quedan
// pegadas. Despues de podar, el estado tiene que ser indistinguible de
// una corrida limpia de la segunda: ni una respuesta de mas, ni una de
// menos, y el mismo calculo.
console.log('\nbarrido exhaustivo de cruces')
let pares = 0
const fallas: string[] = []

for (const de of TIPOS) {
  for (const a of TIPOS) {
    for (const corridaA of corridas[de]) {
      for (const corridaB of corridas[a]) {
        pares++
        const mezclado: Answers = { ...corridaA, ...corridaB }
        const podado = podarInalcanzables(ALL_STEPS, mezclado)

        // (a) ninguna respuesta huerfana
        const vivos = new Set(pasosVisibles(ALL_STEPS, podado).map((s) => s.id))
        const huerfanas = Object.keys(podado).filter((k) => !vivos.has(k))
        if (huerfanas.length > 0) {
          fallas.push(`${de}->${a}: sobreviven ${huerfanas.join(',')}`)
          continue
        }

        // (b) ninguna pregunta sin responder
        const sinResponder = [...vivos].filter((id) => !(id in podado))
        if (sinResponder.length > 0) {
          fallas.push(`${de}->${a}: quedan sin responder ${sinResponder.join(',')}`)
          continue
        }

        // (c) mismo calculo que la corrida limpia de destino
        const rPodado = buildCalculationResult(estadoDesde(podado))
        const rLimpio = buildCalculationResult(estadoDesde(corridaB))
        if (JSON.stringify(rPodado) !== JSON.stringify(rLimpio)) {
          fallas.push(`${de}->${a}: el calculo difiere de la corrida limpia`)
        }
      }
    }
  }
}

check(`${pares.toLocaleString('es-AR')} cruces sin fuga`.padEnd(34), fallas.slice(0, 5), [])

// ---- 2. Los tres casos concretos ----
// Se comparan contra la corrida limpia equivalente, no contra numeros
// fijos: lo que se afirma es que volver atras no cambia el resultado,
// no cual es el resultado (de eso se ocupan las otras validaciones).
console.log('\nlos tres casos que motivaron el arreglo')

const casos: { nombre: string; sucio: Answers; limpio: Answers }[] = [
  {
    nombre: 'sucesion arrastra provisorios ',
    sucio: { umaInicio: UMA, tipoProceso: 'sucesion', modoTerminacion: 'provisorios', objeto: 'sumas_dinero', sucesionUnicoLetrado: 'unico', base: BASE },
    limpio: { umaInicio: UMA, tipoProceso: 'sucesion', sucesionUnicoLetrado: 'unico', base: BASE },
  },
  {
    nombre: 'modos anormales arrastra -30%',
    sucio: { umaInicio: UMA, tipoProceso: 'conocimiento', modoTerminacion: 'modos_anormales', aperturaPrueba: 'despues', sentenciaResultado: 'rechazada', objeto: 'sumas_dinero', base: BASE },
    limpio: { umaInicio: UMA, tipoProceso: 'conocimiento', modoTerminacion: 'modos_anormales', aperturaPrueba: 'despues', objeto: 'sumas_dinero', base: BASE },
  },
  {
    nombre: 'caducidad art22 arrastra -50%',
    sucio: { umaInicio: UMA, tipoProceso: 'conocimiento', modoTerminacion: 'caducidad', caducidadCriterio: 'art22', aperturaPrueba: 'antes', objeto: 'sumas_dinero', base: BASE },
    limpio: { umaInicio: UMA, tipoProceso: 'conocimiento', modoTerminacion: 'caducidad', caducidadCriterio: 'art22', objeto: 'sumas_dinero', base: BASE },
  },
]

for (const c of casos) {
  const podado = podarInalcanzables(ALL_STEPS, c.sucio)
  check(c.nombre + ' — poda   ', podado, c.limpio)
  const rSucio = buildCalculationResult(estadoDesde(podado))
  const rLimpio = buildCalculationResult(estadoDesde(c.limpio))
  check(c.nombre + ' — cifras ', rSucio.honorarios.patrocinante.rango, rLimpio.honorarios.patrocinante.rango)
}

// ---- 3. El motor se defiende solo ----
// La poda es la primera linea, pero el motor tambien lo consume una API
// o un tercero. Un estado imposible no debe depender de que el llamador
// lo haya limpiado.
console.log('\nel motor rechaza la combinacion imposible')
function conProvisorios(tipo: string): WizardState {
  return estadoDesde({ umaInicio: UMA, tipoProceso: tipo, modoTerminacion: 'provisorios', base: BASE })
}
for (const tipo of ['sucesion', 'medida_cautelar', 'homologacion_desocupacion', 'exhorto', 'incidente']) {
  check(`${tipo.padEnd(26)} NO provisorio`, esRegulacionProvisoria(conProvisorios(tipo)), false)
  check(`${tipo.padEnd(26)} bandera suelta ignorada`, esRegulacionProvisoria({ ...conProvisorios(tipo), esProvisorio: true }), false)
}
for (const tipo of ['conocimiento', 'ejecucion_sentencia', 'ejecutivo']) {
  check(`${tipo.padEnd(26)} SI provisorio`, esRegulacionProvisoria(conProvisorios(tipo)), true)
}

// Los dos criterios de la caducidad son alternativos. Con el art. 22 la
// apertura a prueba no juega: la quita es de base, no de escala. Se
// verifica contra el motor, no contra la poda, porque es una regla
// juridica y no una limpieza de estado.
console.log('\ncaducidad art. 22: la apertura a prueba no juega')
const art22 = (apertura: boolean | null): WizardState => ({
  ...estadoDesde({ umaInicio: UMA, tipoProceso: 'conocimiento', modoTerminacion: 'caducidad', caducidadCriterio: 'art22', objeto: 'sumas_dinero', base: BASE }),
  aperturaPrueba: apertura,
})
const reglasDe = (s: WizardState) => buildCalculationResult(s).transformaciones.map((t) => t.id)
check('sin apertura a prueba     ', reglasDe(art22(null)), ['base-caducidad-art22'])
check('antes de apertura a prueba', reglasDe(art22(false)), ['base-caducidad-art22'])
check('despues de apertura       ', reglasDe(art22(true)), ['base-caducidad-art22'])

// Con el art. 25, en cambio, el momento si importa.
console.log('\ncaducidad art. 25: la apertura a prueba si juega')
const art25 = (apertura: boolean | null): WizardState => ({
  ...estadoDesde({ umaInicio: UMA, tipoProceso: 'conocimiento', modoTerminacion: 'caducidad', caducidadCriterio: 'art25', objeto: 'sumas_dinero', base: BASE }),
  aperturaPrueba: apertura,
})
check('antes de apertura a prueba', reglasDe(art25(false)), ['escala-art25'])
check('despues de apertura       ', reglasDe(art25(true)), [])

console.log('\n========================================')
console.log('Resultado: ' + (allPassed ? 'TODOS OK' : 'HUBO FALLOS'))
console.log('Tests totales: ' + totalTests + ', fallos: ' + failedTests)
console.log('========================================')

process.exit(allPassed ? 0 : 1)
