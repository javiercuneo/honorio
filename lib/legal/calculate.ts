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

import type { WizardState, CalculoResultado } from './types'

/**
 * Construye el resultado estructurado del calculo de honorarios.
 * Entry point unico: delega internamente segun el tipo de proceso.
 */
export function buildCalculationResult(state: WizardState): CalculoResultado {
  const tipo = state.tipoProceso

  switch (tipo) {
    case 'exhorto':
      return buildExhorto(state)
    case 'incidente':
      return buildIncidente(state)
    case 'medida_cautelar':
      return buildMedidaCautelar(state)
    case 'homologacion_desocupacion':
      return buildHomologacion(state)
    case 'conocimiento':
    case 'ejecucion_sentencia':
    case 'ejecutivo':
    case 'sucesion':
      return buildGeneral(state)
    default:
      return buildEmpty(state)
  }
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
  throw new Error('buildIncidente no implementado')
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