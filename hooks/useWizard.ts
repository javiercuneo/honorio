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

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Answers, WizardState } from '@/lib/legal/types'
import type { WizardStepDef } from '@/lib/wizard/wizard-schema'
import { PROCESS_STEP_MAP } from '@/lib/wizard/wizard-schema'
import { pasosVisibles, podarInalcanzables } from '@/lib/wizard/reachability'
import * as adapters from '@/lib/legal/adapters'

export type Phase = 'intro' | 'question' | 'dashboard'

export interface UseWizardReturn {
  phase: Phase
  currentStep: WizardStepDef | null
  index: number
  answers: Answers
  visibleSteps: WizardStepDef[]
  totalSteps: number
  maxTotalSteps: number
  completedSteps: number
  errorMessage: string | null
  setAnswer: (value: string | string[] | number | boolean | null) => void
  next: () => string | null
  back: () => void
  jumpTo: (target: number) => void
  restart: () => void
  calculate: () => string
}

export function useWizard(allSteps: WizardStepDef[], initialValues?: Partial<Answers>): UseWizardReturn {
  const [phase, setPhase] = useState<Phase>('intro')
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Answers>((initialValues ?? {}) as Answers)
  const initialValuesRef = useRef(initialValues)

  useEffect(() => {
    const newUma = initialValues?.umaInicio
    const oldUma = initialValuesRef.current?.umaInicio
    if (newUma !== undefined && newUma !== oldUma) {
      setAnswers((prev) => {
        if (prev.umaInicio === newUma) return prev
        return { ...prev, umaInicio: newUma }
      })
    }
    initialValuesRef.current = initialValues
  }, [initialValues?.umaInicio])
  const [errorMessage, setError] = useState<string | null>(null)

  // ---- Computar pasos visibles segun condiciones ----
  const visibleSteps = useMemo(
    () => pasosVisibles(allSteps, answers),
    [allSteps, answers],
  )

  const totalSteps = visibleSteps.length
  // Total de pasos posibles para el proceso elegido.
  // Se descuentan los pasos cuya condicion ya es definitivamente falsa
  // (sus dependencias estan respondidas y no la cumplen), de modo que
  // sub-pasos mutuamente excluyentes no inflen el total.
  const maxTotalSteps = useMemo(() => {
    const tipo = answers.tipoProceso as string | undefined
    if (!tipo) return visibleSteps.length
    const stepIds = PROCESS_STEP_MAP[tipo]
    if (!stepIds) return visibleSteps.length
    const visibleIds = new Set(visibleSteps.map((s) => s.id))
    return allSteps.filter((step) => {
      if (!stepIds.includes(step.id)) return false
      if (!step.condition) return true
      if (step.condition(answers)) return true
      // Condicion aun indefinida: alguna dependencia esta visible y sin responder.
      const deps = step.dependsOn ?? []
      return deps.some((dep) => {
        if (!visibleIds.has(dep)) return false
        const v = answers[dep]
        return v === undefined || v === null || v === ''
      })
    }).length
  }, [allSteps, answers, visibleSteps.length])
  const completedSteps = visibleSteps.filter((s) => {
    const v = answers[s.id]
    return v !== undefined && v !== null && v !== ''
  }).length

  const currentStep = visibleSteps[index] ?? null

  // ---- Actualizar respuesta ----
  // Cambiar una respuesta puede dejar huerfanas a las que dependian de
  // ella. Se podan en el acto: si el paso ya no se pregunta, la respuesta
  // no existe. Esto reemplaza el nuleo ad-hoc de las sub-opciones de
  // 'objeto' —era el mismo problema, resuelto para un solo caso— y cierra
  // el resto: cambiar de proceso ya no arrastra la terminacion anterior.
  const setAnswer = useCallback(
    (value: string | string[] | number | boolean | null) => {
      if (!currentStep) return
      setError(null)
      setAnswers((prev) =>
        podarInalcanzables(allSteps, { ...prev, [currentStep.id]: value } as Answers),
      )
    },
    [allSteps, currentStep],
  )

  // ---- Validar paso actual ----
  const validateCurrent = useCallback((): string | null => {
    if (!currentStep) return 'Paso inválido'

    const value = answers[currentStep.id]
    if (currentStep.kind === 'numeric') {
      if (typeof value !== 'number' || (value as number) <= 0) {
        if (currentStep.id === 'base') {
          return 'Debe ingresar un monto válido para la base regulatoria.'
        }
      }
      return null
    }

    if (currentStep.kind === 'cards') {
      if (currentStep.select === 'single') {
        if (!value || (typeof value === 'string' && value.length === 0)) {
          return 'Debe seleccionar una opción.'
        }
      }
      if (currentStep.select === 'multi') {
        if (!Array.isArray(value) || value.length === 0) {
          return 'Debe seleccionar al menos una opción.'
        }
      }
    }

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
    setAnswers((prev) => {
      const uma = prev.umaInicio
      return (uma ? { umaInicio: uma } : {}) as Answers
    })
    setIndex(0)
    setPhase('intro')
    setError(null)
    adapters.resetWizardState()
  }, [])

  // ---- Ejecutar calculo final ----
  // El estado del motor se reconstruye entero, no se parchea: `wizardState`
  // es un objeto mutable de larga vida y un parcheo incremental deja
  // adentro respuestas que la poda ya descarto. Reconstruirlo hace que
  // `answers` sea la unica fuente de verdad.
  const calculate = useCallback((): string => {
    adapters.resetWizardState()
    syncAllToLegacy(answers)
    adapters.recolectarDatos()
    return adapters.calcularFinalHTML()
  }, [answers])

  return {
    phase,
    currentStep,
    index,
    answers,
    visibleSteps,
    totalSteps,
    maxTotalSteps,
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
    desalojoVivienda: 'desalojoVivienda',
    posesoriasTipo: 'posesoriasTipo',
    base: 'baseValor',
  }

  const key = mapping[stepId]
  if (!key) return

  const newVal = transformToLegacy(stepId, value)
  if (newVal !== undefined) {
    ;(ws as any)[key] = newVal
  }
}

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

    // Sub-opciones de objeto: el motor espera el id crudo ('vivienda' |
    // 'civil' | 'laboral') o null, igual que wizardState del motor clasico.
    case 'desalojoVivienda':
    case 'posesoriasTipo':
      return typeof value === 'string' && value ? value : null

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

function syncAllToLegacy(answers: Answers) {
  for (const [stepId, value] of Object.entries(answers)) {
    if (value !== undefined && value !== null) {
      syncToLegacy(stepId, value)
    }
  }
}
