// ---------------------------------------------------------------
// hooks/useWizard.ts
// Hook de orquestacion del wizard legal.
// Conecta el schema declarativo con los adapters del motor legacy.
// NO contiene reglas juridicas � solo Orquestacion.
//
// Responsabilidades:
// - Computar la lista de pasos visibles (segun condiciones del schema)
// - Mantener estado de respuestas del usuario (React state)
// - Proveer navegacion (siguiente, anterior, saltar)
// - Sincronizar con el motor legacy via adapters
// - Orquestar validacion y calculo
//
// Fases: intro ? question ? dashboard
// ---------------------------------------------------------------

'use client'

import { useCallback, useMemo, useState } from 'react'
import type { Answers, WizardState } from '@/lib/legal/types'
import type { WizardStepDef } from '@/lib/wizard/wizard-schema'
import * as adapters from '@/lib/legal/adapters'

export type Phase = 'intro' | 'question' | 'dashboard'

export interface UseWizardReturn {
  phase: Phase
  currentStep: WizardStepDef | null
  index: number
  answers: Answers
  visibleSteps: WizardStepDef[]
  totalSteps: number
  completedSteps: number
  errorMessage: string | null
  setAnswer: (value: string | string[] | number | boolean | null) => void
  next: () => string | null
  back: () => void
  jumpTo: (target: number) => void
  restart: () => void
  calculate: () => string
}

export function useWizard(allSteps: WizardStepDef[]): UseWizardReturn {
  const [phase, setPhase] = useState<Phase>('intro')
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Answers>({})
  const [errorMessage, setError] = useState<string | null>(null)

  // ---- Computar pasos visibles segun condiciones ----
  const visibleSteps = useMemo(() => {
    return allSteps.filter((step) => {
      if (!step.condition) return true
      return step.condition(answers)
    })
  }, [allSteps, answers])

  const totalSteps = visibleSteps.length
  const completedSteps = visibleSteps.filter((s) => {
    const v = answers[s.id]
    return v !== undefined && v !== null && v !== ''
  }).length

  const currentStep = visibleSteps[index] ?? null

  // ---- Actualizar respuesta ----
  const setAnswer = useCallback(
    (value: string | string[] | number | boolean | null) => {
      if (!currentStep) return
      setError(null)
      setAnswers((prev) => ({ ...prev, [currentStep.id]: value }))

      // Sincronizar con wizardState del motor legacy
      syncToLegacy(currentStep.id, value)
    },
    [currentStep],
  )

  // ---- Validar paso actual ----
  const validateCurrent = useCallback((): string | null => {
    if (!currentStep) return 'Paso invalido'

    // Validacion generica: verificar que haya respuesta
    const value = answers[currentStep.id]
    if (currentStep.kind === 'numeric') {
      if (typeof value !== 'number' || (value as number) <= 0) {
        if (currentStep.id === 'base') {
          return 'Debe ingresar un monto valido para la base regulatoria.'
        }
      }
      return null
    }

    if (currentStep.kind === 'cards') {
      if (currentStep.select === 'single') {
        if (!value || (typeof value === 'string' && value.length === 0)) {
          return 'Debe seleccionar una opcion.'
        }
      }
      if (currentStep.select === 'multi') {
        if (!Array.isArray(value) || value.length === 0) {
          return 'Debe seleccionar al menos una opcion.'
        }
      }
    }

    // Validacion personalizada del schema
    if (currentStep.validate) {
      return currentStep.validate(value, answers)
    }

    return null
  }, [currentStep, answers])

  // ---- Navegacion ----
  const next = useCallback((): string | null => {
    const err = validateCurrent()
    if (err) {
      setError(err)
      return err
    }
    setError(null)

    if (index < visibleSteps.length - 1) {
      setIndex((i) => i + 1)
    } else {
      setPhase('dashboard')
    }
    return null
  }, [validateCurrent, index, visibleSteps.length])

  const back = useCallback(() => {
    setError(null)
    if (phase === 'dashboard') {
      setPhase('question')
      setIndex(visibleSteps.length - 1)
      return
    }
    if (index > 0) {
      setIndex((i) => i - 1)
    } else {
      setPhase('intro')
    }
  }, [phase, index, visibleSteps.length])

  const jumpTo = useCallback((target: number) => {
    setError(null)
    setPhase('question')
    setIndex(target)
  }, [])

  const restart = useCallback(() => {
    setAnswers({})
    setIndex(0)
    setPhase('intro')
    setError(null)
    adapters.resetWizardState()
  }, [])

  // ---- Ejecutar calculo final ----
  const calculate = useCallback((): string => {
    // 1. Sincronizar todas las respuestas con el motor legacy
    syncAllToLegacy(answers)

    // 2. Recolectar datos (el motor legacy lee inputs del DOM)
    adapters.recolectarDatos()

    // 3. Ejecutar calculo y capturar HTML
    return adapters.calcularFinalHTML()
  }, [answers])

  return {
    phase,
    currentStep,
    index,
    answers,
    visibleSteps,
    totalSteps,
    completedSteps,
    errorMessage,
    setAnswer,
    next,
    back,
    jumpTo,
    restart,
    calculate,
  }
}

// ---- Helpers de sincronizacion ----

/**
 * Sincroniza una respuesta individual con el wizardState del motor legacy.
 */
function syncToLegacy(stepId: string, value: string | string[] | number | boolean | null) {
  const ws = adapters.getWizardState()
  const mapping: Record<string, keyof WizardState> = {
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
    base: 'baseValor',
  }

  const key = mapping[stepId]
  if (!key) return

  const newVal = transformToLegacy(stepId, value)
  if (newVal !== undefined) {
    ;(ws as any)[key] = newVal
  }
}

/**
 * Transforma el formato de respuesta React al formato que espera el motor legacy.
 */
function transformToLegacy(
  stepId: string,
  value: string | string[] | number | boolean | null,
): unknown {
  switch (stepId) {
    case 'umaInicio':
      return typeof value === 'number' ? value : undefined

    case 'tipoProceso':
    case 'modoTerminacion':
    case 'objeto':
      return typeof value === 'string' ? value : ''

    case 'sentenciaResultado':
      return typeof value === 'string' && value ? value : null

    case 'aperturaPrueba':
      return value === 'despues'
        ? true
        : value === 'antes'
          ? false
          : null

    case 'caducidadCriterio':
      return typeof value === 'string' ? value : ''

    case 'tuvoExcepciones':
      return value === 'si' ? true : value === 'no' ? false : null

    case 'sucesionUnicoLetrado':
      return value === 'unico' ? true : value === 'varios' ? false : null

    case 'medidaOposicion':
      return value === 'con' ? true : value === 'sin' ? false : null

    case 'homologacionVivienda':
      return value === 'vivienda' ? true : value === 'otros' ? false : null

    case 'base':
      return typeof value === 'number' ? value : 0

    default:
      return value
  }
}

/**
 * Sincroniza todas las respuestas acumuladas con el motor legacy.
 * Se llama antes de calcularFinal().
 */
function syncAllToLegacy(answers: Answers) {
  for (const [stepId, value] of Object.entries(answers)) {
    if (value !== undefined && value !== null) {
      syncToLegacy(stepId, value)
    }
  }
}
