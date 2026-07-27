// ---------------------------------------------------------------
// lib/legal/calculate.ts
// Motor juridico puro: calcula honorarios sin side effects.
// Unico punto de entrada: buildCalculationResult(state)
//
// NO conoce React, DOM, ni HTML.
// NO importa adapters.ts ni nada del framework.
// Toda la logica numerica vive exclusivamente aqui.
//
// Milestone 2: implementacion progresiva caso por caso.
// ---------------------------------------------------------------

import type { WizardState, CalculoResultado, EscalaResult, Transformacion } from './types'

// ---- Registry de procesos ----
// Cada proceso registra su funcion build.
// Para agregar un proceso nuevo: implementar buildXxx() y registrar aqui.
export type ProcessBuilder = (state: WizardState) => CalculoResultado

export const PROCESS_REGISTRY: Record<string, ProcessBuilder> = {
  exhorto: buildExhorto,
  incidente: buildIncidente,
}

// ================================================================
// BLOQUES REUTILIZABLES
// ================================================================

/**
 * Calcula la escala arancelaria progresiva del art. 21.
 * Funcion puramente matematica: NO conoce procesos, NO genera
 * transformaciones, NO produce HTML.
 *
 * Implementa las 7 escalas progresivas con acumulacion de maximos
 * del grado inmediato anterior (interpretacion literal del art. 21).
 *
 * @param basePesos - Base regulatoria en pesos
 * @param valorUMA  - Valor de la UMA vigente
 * @returns EscalaResult con los mismos campos que calcularEscalaBase()
 *          del legacy, o null si los parametros son invalidos.
 */
export function calcularEscala(basePesos: number, valorUMA: number): EscalaResult | null {
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
    tituloEscala,
    baseEnUMA,
    minPorc,
    maxPorc,
    maximoEscalaAnterior,
    limiteAnterior,
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
    auxMin,
    auxMax,
  }
}

// ================================================================
// REDUCCIONES DE BASE
// ================================================================

/**
 * Datos minimos necesarios para aplicar reducciones de base.
 * DTO intencionalmente desacoplado de WizardState.
 */
export interface ReduccionesBaseInput {
  tipoProceso: string
  baseValor: number
  objetoBase?: string
  desalojoVivienda?: string | null
  sentenciaResultado?: string | null
  modoTerminacion?: string
  caducidadCriterio?: string
}

/**
 * Resultado de aplicarReduccionesBase.
 */
export interface ReduccionesBaseResult {
  baseFinal: number
  reducciones: Transformacion[]
}

/**
 * Aplica las reducciones a la base regulatoria previstas en los
 * articulos 22, 40 y concordantes de la Ley 27.423.
 *
 * Reglas aplicadas (en orden):
 *   1. Desalojo para vivienda -20% (art. 40) — solo conocimiento
 *   2. Demanda rechazada -30% (art. 22) — conocimiento, ejecucion_sentencia, ejecutivo
 *   3. Caducidad art. 22 -30% (art. 22) — conocimiento, ejecucion_sentencia, ejecutivo
 *
 * Las reglas son multiplicativas entre si.
 * La funcion NO conoce WizardState, HTML ni procesos mas alla
 * de lo necesario para decidir cada regla.
 */
export function aplicarReduccionesBase(input: ReduccionesBaseInput): ReduccionesBaseResult {
  let baseFinal = input.baseValor
  const reducciones: Transformacion[] = []

  // Regla 1: Desalojo para vivienda — art. 40
  if (
    input.tipoProceso === 'conocimiento' &&
    input.objetoBase === 'desalojo' &&
    input.desalojoVivienda === 'vivienda'
  ) {
    const anterior = baseFinal
    baseFinal *= 0.8
    reducciones.push({
      id: 'base-desalojo-vivienda',
      etapa: 'base',
      concepto: 'Desalojo para vivienda: -20% (art.40)',
      articulo: 'art. 40',
      visible: true,
      valorPrevio: anterior,
      factor: 0.8,
      valorPosterior: baseFinal,
    })
  }

  // Regla 2: Demanda rechazada — art. 22
  if (
    (input.tipoProceso === 'conocimiento' ||
     input.tipoProceso === 'ejecucion_sentencia' ||
     input.tipoProceso === 'ejecutivo') &&
    input.sentenciaResultado === 'rechazada'
  ) {
    const anterior = baseFinal
    baseFinal *= 0.7
    reducciones.push({
      id: 'base-demanda-rechazada',
      etapa: 'base',
      concepto: 'Demanda rechazada: -30% (art.22)',
      articulo: 'art. 22',
      visible: true,
      valorPrevio: anterior,
      factor: 0.7,
      valorPosterior: baseFinal,
    })
  }

  // Regla 3: Caducidad tratada como demanda desestimada — art. 22
  if (
    (input.tipoProceso === 'conocimiento' ||
     input.tipoProceso === 'ejecucion_sentencia' ||
     input.tipoProceso === 'ejecutivo') &&
    input.modoTerminacion === 'caducidad' &&
    input.caducidadCriterio === 'art22'
  ) {
    const anterior = baseFinal
    baseFinal *= 0.7
    reducciones.push({
      id: 'base-caducidad-art22',
      etapa: 'base',
      concepto: 'Caducidad tratada como demanda desestimada: -30% (art.22)',
      articulo: 'art. 22',
      visible: true,
      valorPrevio: anterior,
      factor: 0.7,
      valorPosterior: baseFinal,
    })
  }

  return { baseFinal, reducciones }
}

// ================================================================
// REDUCCIONES DE ESCALA
// ================================================================

/**
 * Datos minimos necesarios para aplicar reducciones de escala.
 * DTO desacoplado de WizardState.
 */
export interface ReduccionesEscalaInput {
  tipoProceso: string
  sucesionUnicoLetrado?: boolean | null
  modoTerminacion?: string
  caducidadCriterio?: string
  aperturaPrueba?: boolean | null
}

/**
 * Resultado de aplicarReduccionesEscala.
 * Devuelve el factor acumulado y las transformaciones que documentan
 * cada regla aplicada sobre la cadena de factores.
 */
export interface ReduccionesEscalaResult {
  factorEscala: number
  reducciones: Transformacion[]
}

/**
 * Aplica las reducciones de escala previstas en los articulos 25,
 * 35 y 41 de la Ley 27.423.
 *
 * Reglas aplicadas (multiplicativas, en orden):
 *   1. Unico letrado en sucesion -50% (art. 35) — solo sucesion
 *   2. Ejecucion de sentencia -50% (art. 41) — solo ejecucion_sentencia
 *   3. Terminacion anormal antes de apertura a prueba -50% (art. 25)
 *      — conocimiento, ejecucion_sentencia, ejecutivo
 *   4. Caducidad art. 25 antes de apertura a prueba -50% (art. 25)
 *      — conocimiento, ejecucion_sentencia, ejecutivo
 *
 * Cada transformacion registra el valor del factorEscala acumulado
 * antes y despues de aplicar la regla.
 * La funcion NO conoce WizardState, HTML ni procesos.
 */
export function aplicarReduccionesEscala(input: ReduccionesEscalaInput): ReduccionesEscalaResult {
  let factorEscala = 1
  const reducciones: Transformacion[] = []

  // Regla 1: Unico letrado en sucesion — art. 35
  if (input.tipoProceso === 'sucesion' && input.sucesionUnicoLetrado === true) {
    const anterior = factorEscala
    factorEscala *= 0.5
    reducciones.push({
      id: 'escala-unico-letrado',
      etapa: 'escala',
      concepto: '50% por unico letrado en sucesion (art.35)',
      articulo: 'art. 35',
      visible: true,
      valorPrevio: anterior,
      factor: 0.5,
      valorPosterior: factorEscala,
    })
  }

  // Regla 2: Ejecucion de sentencia — art. 41
  if (input.tipoProceso === 'ejecucion_sentencia') {
    const anterior = factorEscala
    factorEscala *= 0.5
    reducciones.push({
      id: 'escala-ejecucion-sentencia',
      etapa: 'escala',
      concepto: '50% por ejecucion de sentencia (art.41)',
      articulo: 'art. 41',
      visible: true,
      valorPrevio: anterior,
      factor: 0.5,
      valorPosterior: factorEscala,
    })
  }

  // Regla 3: Terminacion anormal antes de apertura a prueba — art. 25
  if (
    (input.tipoProceso === 'conocimiento' ||
     input.tipoProceso === 'ejecucion_sentencia' ||
     input.tipoProceso === 'ejecutivo') &&
    input.modoTerminacion === 'modos_anormales' &&
    input.aperturaPrueba === false
  ) {
    const anterior = factorEscala
    factorEscala *= 0.5
    reducciones.push({
      id: 'escala-modos-anormales-sin-prueba',
      etapa: 'escala',
      concepto: '50% por terminacion anormal antes de apertura a prueba (art.25)',
      articulo: 'art. 25',
      visible: true,
      valorPrevio: anterior,
      factor: 0.5,
      valorPosterior: factorEscala,
    })
  }

  // Regla 4: Caducidad art. 25 antes de apertura a prueba — art. 25
  if (
    (input.tipoProceso === 'conocimiento' ||
     input.tipoProceso === 'ejecucion_sentencia' ||
     input.tipoProceso === 'ejecutivo') &&
    input.modoTerminacion === 'caducidad' &&
    input.caducidadCriterio === 'art25' &&
    input.aperturaPrueba === false
  ) {
    const anterior = factorEscala
    factorEscala *= 0.5
    reducciones.push({
      id: 'escala-caducidad-art25-sin-prueba',
      etapa: 'escala',
      concepto: '50% por caducidad tratada como modo anormal antes de prueba (art.25)',
      articulo: 'art. 25',
      visible: true,
      valorPrevio: anterior,
      factor: 0.5,
      valorPosterior: factorEscala,
    })
  }

  return { factorEscala, reducciones }
}

/**
 * Construye el resultado estructurado del calculo de honorarios.
 * Entry point unico: delega internamente segun el tipo de proceso.
 */
export function buildCalculationResult(state: WizardState): CalculoResultado {
  const builder = PROCESS_REGISTRY[state.tipoProceso]
  if (builder) return builder(state)
  return buildEmpty(state)
}

// ---- Implementaciones por tipo de proceso ----
// Cada una se completara en la Fase 2 del plan de migracion.
// Mientras tanto, buildEmpty() sirve como placeholder.

function buildExhorto(state: WizardState): CalculoResultado {
  const uma = state.valorUMA

  // Constantes del art. 50
  const incisoA_UMA = 3
  const incisoB_minUMA = 10
  const incisoB_maxUMA = 20
  const incisoC_minUMA = 7
  const incisoC_maxUMA = 30

  const incisoA = incisoA_UMA * uma
  const incisoB_min = incisoB_minUMA * uma
  const incisoB_max = incisoB_maxUMA * uma
  const incisoC_min = incisoC_minUMA * uma
  const incisoC_max = incisoC_maxUMA * uma

  const overallMinUMA = incisoA_UMA
  const overallMaxUMA = incisoC_maxUMA

  return {
    tipoProceso: 'exhorto',
    esProvisorio: false,
    baseOriginal: 0,
    baseFinal: 0,
    valorUMA: uma,
    honorarios: {
      patrocinante: { rango: { minUMA: overallMinUMA, maxUMA: overallMaxUMA, minPesos: overallMinUMA * uma, maxPesos: overallMaxUMA * uma } },
      apoderado: { rango: { minUMA: overallMinUMA, maxUMA: overallMaxUMA, minPesos: overallMinUMA * uma, maxPesos: overallMaxUMA * uma } },
      procurador: { rango: { minUMA: overallMinUMA, maxUMA: overallMaxUMA, minPesos: overallMinUMA * uma, maxPesos: overallMaxUMA * uma } },
    },
    auxiliares: { minUMA: 0, maxUMA: 0, minPesos: 0, maxPesos: 0 },
    exhorto: {
      incisoA: incisoA,
      incisoB: { minUMA: incisoB_minUMA, maxUMA: incisoB_maxUMA, minPesos: incisoB_min, maxPesos: incisoB_max },
      incisoC: { minUMA: incisoC_minUMA, maxUMA: incisoC_maxUMA, minPesos: incisoC_min, maxPesos: incisoC_max },
    },
    transformaciones: [
      {
        id: 'exhorto-inciso-a',
        etapa: 'honorarios',
        concepto: 'Inciso a) notificaciones - honorario fijo',
        articulo: 'art. 50 inc. a',
        visible: true,
        valorPrevio: 0,
        factor: incisoA_UMA,
        valorPosterior: incisoA,
      },
      {
        id: 'exhorto-inciso-b',
        etapa: 'honorarios',
        concepto: 'Inciso b) inscripciones y actos registrales',
        articulo: 'art. 50 inc. b',
        visible: true,
        valorPrevio: 0,
        factor: incisoB_minUMA,
        valorPosterior: incisoB_max,
      },
      {
        id: 'exhorto-inciso-c',
        etapa: 'honorarios',
        concepto: 'Inciso c) diligencias de prueba',
        articulo: 'art. 50 inc. c',
        visible: true,
        valorPrevio: 0,
        factor: incisoC_minUMA,
        valorPosterior: incisoC_max,
      },
    ],
  }
}

function buildIncidente(state: WizardState): CalculoResultado {
  const uma = state.valorUMA
  const base = state.baseValor

  const baseEnUMA = base / uma
  const porcentajeMin = 0.02
  const porcentajeMax = 0.20
  const minUMA = baseEnUMA * porcentajeMin
  const maxUMA = baseEnUMA * porcentajeMax
  const minPesos = minUMA * uma
  const maxPesos = maxUMA * uma

  return {
    tipoProceso: 'incidente',
    esProvisorio: false,
    baseOriginal: base,
    baseFinal: base,
    valorUMA: uma,
    honorarios: {
      patrocinante: { rango: { minUMA, maxUMA, minPesos, maxPesos } },
      apoderado: { rango: { minUMA: 0, maxUMA: 0, minPesos: 0, maxPesos: 0 } },
      procurador: { rango: { minUMA: 0, maxUMA: 0, minPesos: 0, maxPesos: 0 } },
    },
    auxiliares: { minUMA: 0, maxUMA: 0, minPesos: 0, maxPesos: 0 },
    incidente: {
      porcentajeMin: 2,
      porcentajeMax: 20,
    },
    transformaciones: [
      {
        id: 'incidente-minimo',
        etapa: 'honorarios',
        concepto: 'Honorarios m\u00ednimos para incidente (2% de la base)',
        articulo: 'art. 29 inc. g',
        visible: true,
        valorPrevio: base,
        factor: porcentajeMin,
        valorPosterior: minPesos,
      },
      {
        id: 'incidente-maximo',
        etapa: 'honorarios',
        concepto: 'Honorarios m\u00e1ximos para incidente (20% de la base)',
        articulo: 'art. 29 inc. g',
        visible: true,
        valorPrevio: base,
        factor: porcentajeMax,
        valorPosterior: maxPesos,
      },
    ],
  }
}

function buildMedidaCautelar(state: WizardState): CalculoResultado {
  throw new Error('buildMedidaCautelar no implementado')
}

function buildHomologacion(state: WizardState): CalculoResultado {
  throw new Error('buildHomologacion no implementado')
}

function buildGeneral(state: WizardState): CalculoResultado {
  throw new Error('buildGeneral no implementado')
}

function buildEmpty(state: WizardState): CalculoResultado {
  return {
    tipoProceso: state.tipoProceso,
    esProvisorio: state.esProvisorio,
    baseOriginal: state.baseValor,
    baseFinal: state.baseValor,
    valorUMA: state.valorUMA,
    honorarios: {
      patrocinante: { rango: { minUMA: 0, maxUMA: 0, minPesos: 0, maxPesos: 0 } },
      apoderado: { rango: { minUMA: 0, maxUMA: 0, minPesos: 0, maxPesos: 0 } },
      procurador: { rango: { minUMA: 0, maxUMA: 0, minPesos: 0, maxPesos: 0 } },
    },
    auxiliares: { minUMA: 0, maxUMA: 0, minPesos: 0, maxPesos: 0 },
    transformaciones: [],
  }
}