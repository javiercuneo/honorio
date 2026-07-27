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
  throw new Error('buildExhorto no implementado')
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