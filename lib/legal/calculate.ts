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

import type { WizardState, CalculoResultado, EscalaResult, Transformacion, Rango, Partidor, SegundaInstancia, SegundaInstanciaRol } from './types'

// ---- Registry de procesos ----
// Cada proceso registra su funcion build.
// Para agregar un proceso nuevo: implementar buildXxx() y registrar aqui.
export type ProcessBuilder = (state: WizardState) => CalculoResultado

export const PROCESS_REGISTRY: Record<string, ProcessBuilder> = {
  conocimiento: buildGeneral,
  ejecucion_sentencia: buildGeneral,
  ejecutivo: buildGeneral,
  sucesion: buildGeneral,
  medida_cautelar: buildMedidaCautelar,
  homologacion_desocupacion: buildHomologacion,
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
  baseValor: number
  esViviendaProtegida?: boolean
  demandaRechazada?: boolean
  caducidadArt22?: boolean
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

  // Regla 1: Vivienda protegida - art. 40 (desalojo vivienda u homologacion)
  if (input.esViviendaProtegida) {
    const anterior = baseFinal
    baseFinal *= 0.8
    reducciones.push({
      id: 'base-desalojo-vivienda',
      etapa: 'base',
      concepto: 'Vivienda',
      articulo: 'art. 40',
      visible: true,
      valorPrevio: anterior,
      factor: 0.8,
      valorPosterior: baseFinal,
    })
  }

  // Regla 2: Demanda rechazada - art. 22
  if (input.demandaRechazada) {
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

  // Regla 3: Caducidad tratada como demanda desestimada - art. 22
  if (input.caducidadArt22) {
    const anterior = baseFinal
    baseFinal *= 0.7
    reducciones.push({
      id: 'base-caducidad-art22',
      etapa: 'base',
      concepto: 'Demanda desestimada',
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
  /** Aplica art. 25: modos anormales/caducidad sin apertura a prueba */
  aplicaArt25?: boolean
  /** Aplica art. 35: unico letrado en sucesion */
  aplicaArt35?: boolean
  /** Aplica art. 41: ejecucion de sentencia */
  aplicaArt41?: boolean
}

/**
 * Resultado de aplicarReduccionesEscala.
 * Devuelve el factor acumulado y las transformaciones que documentan
 * cada regla aplicada sobre la cadena de factores.
 */
export interface TransformacionEscalaResult {
  factor: number
  transformaciones: Transformacion[]
}

/**
 * Aplica las reducciones de escala previstas en los articulos 25, 35 y
 * 41 de la Ley 27.423.
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
export function aplicarReduccionesEscala(input: ReduccionesEscalaInput): TransformacionEscalaResult {
  let factor = 1
  const transformaciones: Transformacion[] = []

  if (input.aplicaArt35) {
    const anterior = factor
    factor *= 0.5
    transformaciones.push({
      id: 'escala-unico-letrado',
      etapa: 'escala',
      concepto: '50% por unico letrado en sucesion (art.35)',
      articulo: 'art. 35',
      visible: true,
      valorPrevio: anterior,
      factor: 0.5,
      valorPosterior: factor,
    })
  }

  if (input.aplicaArt41) {
    const anterior = factor
    factor *= 0.5
    transformaciones.push({
      id: 'escala-ejecucion-sentencia',
      etapa: 'escala',
      concepto: '50% por ejecucion de sentencia (art.41)',
      articulo: 'art. 41',
      visible: true,
      valorPrevio: anterior,
      factor: 0.5,
      valorPosterior: factor,
    })
  }

  if (input.aplicaArt25) {
    const anterior = factor
    factor *= 0.5
    transformaciones.push({
      id: 'escala-art25',
      etapa: 'escala',
      concepto: '50% por terminacion anormal o caducidad art.25 sin apertura a prueba (art.25)',
      articulo: 'art. 25',
      visible: true,
      valorPrevio: anterior,
      factor: 0.5,
      valorPosterior: factor,
    })
  }

  return { factor, transformaciones }
}

// ================================================================
// REDUCCIONES FINALES SOBRE HONORARIOS
// ================================================================

/**
 * Datos minimos necesarios para aplicar reducciones finales.
 * DTO desacoplado de WizardState.
 */
export interface ReduccionesFinalesInput {
  /** Art. 34/41: ejecutivo o ejecucion sentencia sin excepciones */
  aplicaArt34?: boolean
  /** Art. 38: posesorias/interdictos beneficio exclusivo */
  aplicaArt38?: boolean
  /** Art. 49: incidencia colectiva */
  aplicaArt49?: boolean
}

/**
 * Resultado de aplicarReduccionesFinales.
 */
export interface ReduccionesFinalesResult {
  factorFinal: number
  reducciones: Transformacion[]
}

/**
 * Aplica las reducciones finales sobre honorarios previstas en los
 * articulos 34, 38 y 49 de la Ley 27.423.
 *
 * Reglas aplicadas (en orden, con las primeras dos como if/else if):
 *   1. Ejecutivo sin excepciones -10% (art. 34) — solo ejecutivo
 *   2. Ejecucion de sentencia sin excepciones -10% (art. 41 + 34)
 *      — solo ejecucion_sentencia
 *   3. Posesorias/interdictos beneficio exclusivo -20% (art. 38)
 *      — solo conocimiento (multiplicativo)
 *   4. Incidencia colectiva -25% (art. 49)
 *      — solo conocimiento (multiplicativo)
 */
export function aplicarReduccionesFinales(
  input: ReduccionesFinalesInput
): ReduccionesFinalesResult {
  let factorFinal = 1
  const reducciones: Transformacion[] = []

  if (input.aplicaArt34) {
    const anterior = factorFinal
    factorFinal = 0.9
    reducciones.push({
      id: 'final-ejecucion-sin-excepciones',
      etapa: 'honorarios',
      concepto: '10% adicional por ejecucion de sentencia sin excepciones (art.34 + art.41)',
      articulo: 'art. 34',
      visible: true,
      valorPrevio: anterior,
      factor: 0.9,
      valorPosterior: factorFinal,
    })
  }

  if (input.aplicaArt38) {
    const anterior = factorFinal
    factorFinal *= 0.8
    reducciones.push({
      id: 'final-posesorias-beneficio',
      etapa: 'honorarios',
      concepto: '20% por art. 38 (posesorias/interdictos beneficio exclusivo)',
      articulo: 'art. 38',
      visible: true,
      valorPrevio: anterior,
      factor: 0.8,
      valorPosterior: factorFinal,
    })
  }

  if (input.aplicaArt49) {
    const anterior = factorFinal
    factorFinal *= 0.75
    reducciones.push({
      id: 'final-incidencia-colectiva',
      etapa: 'honorarios',
      concepto: '25% por art. 49 (incidencia colectiva)',
      articulo: 'art. 49',
      visible: true,
      valorPrevio: anterior,
      factor: 0.75,
      valorPosterior: factorFinal,
    })
  }

  return { factorFinal, reducciones }
}// ================================================================
// FUNCIONES HELPER: APODERADO, PROCURADOR, AUXILIARES
// ================================================================

/**
 * Calcula los honorarios del apoderado: patrocinante + 40% (art. 20).
 */
export function calcularApoderado(minPatroUMA: number, maxPatroUMA: number, valorUMA: number): Rango {
  const minUMA = minPatroUMA * 1.4
  const maxUMA = maxPatroUMA * 1.4
  return {
    minUMA,
    maxUMA,
    minPesos: minUMA * valorUMA,
    maxPesos: maxUMA * valorUMA,
  }
}

/**
 * Calcula los honorarios del procurador: 40% del patrocinante (art. 20).
 */
export function calcularProcurador(minPatroUMA: number, maxPatroUMA: number, valorUMA: number): Rango {
  const minUMA = minPatroUMA * 0.4
  const maxUMA = maxPatroUMA * 0.4
  return {
    minUMA,
    maxUMA,
    minPesos: minUMA * valorUMA,
    maxPesos: maxUMA * valorUMA,
  }
}

/**
 * Calcula los honorarios de auxiliares de justicia: 5% a 10% de la base
 * en UMA (art. 21 antepenultimo parrafo).
 *
 * @param baseEnUMA - Base regulatoria expresada en UMA (ya reducida)
 * @param valorUMA  - Valor de la UMA vigente
 */
export function calcularAuxiliares(baseEnUMA: number, valorUMA: number): Rango {
  const minUMA = baseEnUMA * 0.05
  const maxUMA = baseEnUMA * 0.10
  return {
    minUMA,
    maxUMA,
    minPesos: minUMA * valorUMA,
    maxPesos: maxUMA * valorUMA,
  }
}

// ================================================================
// SEGUNDA INSTANCIA Y PARTIDOR
// ================================================================

/**
 * Calcula los honorarios de segunda instancia (art. 30).
 *
 * Minimo: 30% de primera instancia
 * Maximo: 35% de primera instancia
 * Maximo con sentencia revocada: 40% de primera instancia
 */
export function calcularSegundaInstancia(
  minPatro: number,
  maxPatro: number,
  minApo: number,
  maxApo: number,
  minProc: number,
  maxProc: number,
  valorUMA: number,
): SegundaInstancia {
  const buildRol = (min: number, max: number): SegundaInstanciaRol => ({
    minimo: { minUMA: min * 0.30, maxUMA: min * 0.30, minPesos: min * 0.30 * valorUMA, maxPesos: min * 0.30 * valorUMA },
    maximo: { minUMA: max * 0.35, maxUMA: max * 0.35, minPesos: max * 0.35 * valorUMA, maxPesos: max * 0.35 * valorUMA },
    revocada: { minUMA: max * 0.40, maxUMA: max * 0.40, minPesos: max * 0.40 * valorUMA, maxPesos: max * 0.40 * valorUMA },
  })

  return {
    patrocinante: buildRol(minPatro, maxPatro),
    apoderado: buildRol(minApo, maxApo),
    procurador: buildRol(minProc, maxProc),
  }
}

/**
 * Calcula los honorarios del partidor (art. 35 ultima parte).
 * Solo aplica para procesos de sucesion.
 *
 * Minimo: 2% de la base
 * Maximo: 3% de la base
 */
export function calcularPartidor(basePesos: number, valorUMA: number): Partidor | null {
  if (!basePesos || basePesos <= 0) return null
  const minPesos = basePesos * 0.02
  const maxPesos = basePesos * 0.03
  return {
    minPorcentaje: 2,
    maxPorcentaje: 3,
    minUMA: minPesos / valorUMA,
    maxUMA: maxPesos / valorUMA,
    minPesos,
    maxPesos,
  }
}

/**
 * Art. 12: si el profesional se aparta antes de la conclusion del proceso,
 * la regulacion provisoria se fija "en el minimo que le hubiere podido
 * corresponder". No cambia ningun factor del calculo: cambia que solo el
 * minimo tiene sentido, y el maximo no debe enunciarse.
 *
 * Se deriva de `modoTerminacion` y no se lee solo de la bandera, para que
 * cualquier consumidor del motor (wizard, API, otra app) obtenga el mismo
 * resultado mandando unicamente el modo de terminacion. La bandera se
 * respeta si viene puesta, por compatibilidad con el motor clasico.
 */
export function esRegulacionProvisoria(state: WizardState): boolean {
  return state.esProvisorio === true || state.modoTerminacion === 'provisorios'
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


// ================================================================
// FACTORES PROPIOS DE PROCESOS ESPECIALES
// ================================================================

/**
 * Factor de escala para medida cautelar (art. 29 inc. e).
 * 0.25 sin oposicion, 0.50 con oposicion.
 */
export function aplicarFactorCautelar(input: { medidaOposicion: boolean | null }): TransformacionEscalaResult {
  const factor = input.medidaOposicion ? 0.5 : 0.25
  const transformaciones: Transformacion[] = [{
    id: 'escala-cautelar',
    etapa: 'escala',
    concepto: input.medidaOposicion
      ? '50% de la escala por medida cautelar con oposicion'
      : '25% de la escala por medida cautelar sin oposicion',
    articulo: 'art. 29 inc. e',
    visible: true,
    valorPrevio: 1,
    factor,
    valorPosterior: factor,
  }]
  return { factor, transformaciones }
}

/**
 * Factor de escala para homologacion de desocupacion (art. 40).
 * 0.5 fijo sobre los valores de escala.
 */
export function aplicarFactorHomologacion(): TransformacionEscalaResult {
  const factor = 0.5
  const transformaciones: Transformacion[] = [{
    id: 'escala-homologacion',
    etapa: 'escala',
    concepto: '50% por homologacion de desocupacion (art.40)',
    articulo: 'art. 40',
    visible: true,
    valorPrevio: 1,
    factor,
    valorPosterior: factor,
  }]
  return { factor, transformaciones }
}

// ---- Implementaciones por tipo de proceso ----

export function buildMedidaCautelar(state: WizardState): CalculoResultado {
  const uma = state.valorUMA
  const base = state.baseValor

  const escala = calcularEscala(base, uma)
  if (!escala) return buildEmpty(state)

  const { factor, transformaciones: txFactor } = aplicarFactorCautelar({
    medidaOposicion: state.medidaOposicion,
  })

  const minFinal = escala.patrocinante.full.min * factor
  const maxFinal = escala.patrocinante.full.max * factor
  const apo = calcularApoderado(minFinal, maxFinal, uma)
  const proc = calcularProcurador(minFinal, maxFinal, uma)
  const aux = calcularAuxiliares(escala.baseEnUMA, uma)

  return {
    tipoProceso: 'medida_cautelar',
    esProvisorio: esRegulacionProvisoria(state),
    baseOriginal: base,
    baseFinal: base,
    valorUMA: uma,
    escala: {
      titulo: escala.tituloEscala,
      baseEnUMA: escala.baseEnUMA,
      porcentajeMin: escala.minPorc,
      porcentajeMax: escala.maxPorc,
      porcentajeMinAplicado: escala.minPorc * factor,
      porcentajeMaxAplicado: escala.maxPorc * factor,
      escalera: escala.maximoEscalaAnterior > 0 ? {
        maximoEscalaAnterior: escala.maximoEscalaAnterior,
        limiteAnterior: escala.limiteAnterior,
        excedente: escala.baseEnUMA - escala.limiteAnterior,
      } : undefined,
    },
    honorarios: {
      patrocinante: { rango: { minUMA: minFinal, maxUMA: maxFinal, minPesos: minFinal * uma, maxPesos: maxFinal * uma } },
      apoderado: { rango: apo },
      procurador: { rango: proc },
    },
    auxiliares: aux,
    transformaciones: txFactor,
  }
}

export function buildHomologacion(state: WizardState): CalculoResultado {
  const uma = state.valorUMA

  const { baseFinal, reducciones: txBase } = aplicarReduccionesBase({
    baseValor: state.baseValor,
    esViviendaProtegida: state.homologacionVivienda === true,
  })

  const escala = calcularEscala(baseFinal, uma)
  if (!escala) return buildEmpty(state)

  const { factor, transformaciones: txFactor } = aplicarFactorHomologacion()

  const minFinal = escala.patrocinante.full.min * factor
  const maxFinal = escala.patrocinante.full.max * factor
  const apo = calcularApoderado(minFinal, maxFinal, uma)
  const proc = calcularProcurador(minFinal, maxFinal, uma)
  const aux = calcularAuxiliares(escala.baseEnUMA, uma)

  return {
    tipoProceso: 'homologacion_desocupacion',
    esProvisorio: esRegulacionProvisoria(state),
    baseOriginal: state.baseValor,
    baseFinal,
    valorUMA: uma,
    escala: {
      titulo: escala.tituloEscala,
      baseEnUMA: escala.baseEnUMA,
      porcentajeMin: escala.minPorc,
      porcentajeMax: escala.maxPorc,
      porcentajeMinAplicado: escala.minPorc * factor,
      porcentajeMaxAplicado: escala.maxPorc * factor,
      escalera: escala.maximoEscalaAnterior > 0 ? {
        maximoEscalaAnterior: escala.maximoEscalaAnterior,
        limiteAnterior: escala.limiteAnterior,
        excedente: escala.baseEnUMA - escala.limiteAnterior,
      } : undefined,
    },
    honorarios: {
      patrocinante: { rango: { minUMA: minFinal, maxUMA: maxFinal, minPesos: minFinal * uma, maxPesos: maxFinal * uma } },
      apoderado: { rango: apo },
      procurador: { rango: proc },
    },
    auxiliares: aux,
    transformaciones: [
      ...txBase,
      ...txFactor,
    ],
  }
}
// ================================================================
// RESOLUCION DE REGLAS JURIDICAS
// ================================================================
// Centraliza la traduccion de WizardState a condiciones de dominio.
// Unico punto que conoce el tipo de proceso.
// Las funciones de dominio (aplicarReducciones*) reciben solo booleanos.

interface ReglasProceso {
  esViviendaProtegida: boolean
  demandaRechazada: boolean
  caducidadArt22: boolean
  aplicaArt25: boolean
  aplicaArt35: boolean
  aplicaArt41: boolean
  aplicaArt34: boolean
  aplicaArt38: boolean
  aplicaArt49: boolean
}

function resolveReglas(state: WizardState): ReglasProceso {
  const tipo = state.tipoProceso

  // Base
  const esViviendaProtegida = tipo === 'conocimiento'
    && state.objetoBase === 'desalojo'
    && state.desalojoVivienda === 'vivienda'
  const demandaRechazada = ['conocimiento', 'ejecucion_sentencia', 'ejecutivo'].includes(tipo)
    && state.sentenciaResultado === 'rechazada'
  const caducidadArt22 = ['conocimiento', 'ejecucion_sentencia', 'ejecutivo'].includes(tipo)
    && state.modoTerminacion === 'caducidad'
    && state.caducidadCriterio === 'art22'

  // Escala
  const aplicaArt35 = tipo === 'sucesion' && state.sucesionUnicoLetrado === true
  const aplicaArt41 = tipo === 'ejecucion_sentencia'
  const aplicaArt25 = (
       ['conocimiento', 'ejecucion_sentencia', 'ejecutivo'].includes(tipo)
    && state.modoTerminacion === 'modos_anormales'
    && state.aperturaPrueba === false
  ) || (
       ['conocimiento', 'ejecucion_sentencia', 'ejecutivo'].includes(tipo)
    && state.modoTerminacion === 'caducidad'
    && state.caducidadCriterio === 'art25'
    && state.aperturaPrueba === false
  ) || (
       ['conocimiento', 'ejecucion_sentencia', 'ejecutivo'].includes(tipo)
    && state.modoTerminacion === 'caducidad'
    && state.caducidadCriterio === 'art22'
    && state.aperturaPrueba === false
  )

  // Finales
  const aplicaArt34 = (tipo === 'ejecutivo' && state.tuvoExcepciones === false)
    || (tipo === 'ejecucion_sentencia' && state.tuvoExcepciones === false)
  const aplicaArt38 = tipo === 'conocimiento'
    && state.objetoBase === 'posesorias_interdictos'
    && state.posesoriasTipo === 'beneficio'
  const aplicaArt49 = tipo === 'conocimiento'
    && state.objetoBase === 'incidencia_colectiva'

  return {
    esViviendaProtegida,
    demandaRechazada,
    caducidadArt22,
    aplicaArt25,
    aplicaArt35,
    aplicaArt41,
    aplicaArt34,
    aplicaArt38,
    aplicaArt49,
  }
}
export function buildGeneral(state: WizardState): CalculoResultado {
  const uma = state.valorUMA
  const tipo = state.tipoProceso
  const reglas = resolveReglas(state)

  // 1. Base reductions
  const { baseFinal, reducciones: txBase } = aplicarReduccionesBase({
    baseValor: state.baseValor,
    esViviendaProtegida: reglas.esViviendaProtegida,
    demandaRechazada: reglas.demandaRechazada,
    caducidadArt22: reglas.caducidadArt22,
  })

  // 2. Scale
  const escala = calcularEscala(baseFinal, uma)
  if (!escala) return buildEmpty(state)

  // 3. Scale reductions
  const { factor, transformaciones: txEscala } = aplicarReduccionesEscala({
    aplicaArt25: reglas.aplicaArt25,
    aplicaArt35: reglas.aplicaArt35,
    aplicaArt41: reglas.aplicaArt41,
  })

  const minEscala = escala.patrocinante.full.min * factor
  const maxEscala = escala.patrocinante.full.max * factor
  const minApoEscala = escala.apoderado.full.min * factor
  const maxApoEscala = escala.apoderado.full.max * factor

  // 4. Final reductions
  const { factorFinal, reducciones: txFinal } = aplicarReduccionesFinales({
    aplicaArt34: reglas.aplicaArt34,
    aplicaArt38: reglas.aplicaArt38,
    aplicaArt49: reglas.aplicaArt49,
  })

  const minFinal = minEscala * factorFinal
  const maxFinal = maxEscala * factorFinal
  const minApoFinal = minApoEscala * factorFinal
  const maxApoFinal = maxApoEscala * factorFinal

  // 5. Procurador (40% of final patrocinante)
  const proc = calcularProcurador(minFinal, maxFinal, uma)

  // 6. Auxiliares (5%-10% of base in UMA)
  const aux = calcularAuxiliares(escala.baseEnUMA, uma)

  // 7. Apoderado
  const apo = calcularApoderado(minFinal, maxFinal, uma)

  // 8. Segunda instancia
  const segundaInstancia = calcularSegundaInstancia(
    minFinal, maxFinal,
    minApoFinal, maxApoFinal,
    proc.minUMA, proc.maxUMA,
    uma,
  )

  // 9. Partidor (solo sucesion)
  const partidor = tipo === 'sucesion'
    ? calcularPartidor(baseFinal, uma)
    : undefined

  return {
    tipoProceso: tipo,
    esProvisorio: esRegulacionProvisoria(state),
    baseOriginal: state.baseValor,
    baseFinal,
    valorUMA: uma,
    escala: {
      titulo: escala.tituloEscala,
      baseEnUMA: escala.baseEnUMA,
      porcentajeMin: escala.minPorc,
      porcentajeMax: escala.maxPorc,
      porcentajeMinAplicado: escala.minPorc * factor * factorFinal,
      porcentajeMaxAplicado: escala.maxPorc * factor * factorFinal,
      escalera: escala.maximoEscalaAnterior > 0 ? {
        maximoEscalaAnterior: escala.maximoEscalaAnterior,
        limiteAnterior: escala.limiteAnterior,
        excedente: escala.baseEnUMA - escala.limiteAnterior,
      } : undefined,
    },
    honorarios: {
      patrocinante: { rango: { minUMA: minFinal, maxUMA: maxFinal, minPesos: minFinal * uma, maxPesos: maxFinal * uma } },
      apoderado: { rango: apo },
      procurador: { rango: proc },
    },
    auxiliares: aux,
    segundaInstancia,
    partidor: partidor ?? undefined,
    transformaciones: [
      ...txBase,
      ...txEscala,
      ...txFinal,
    ],
  }
}
function buildEmpty(state: WizardState): CalculoResultado {
  return {
    tipoProceso: state.tipoProceso,
    esProvisorio: esRegulacionProvisoria(state),
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
