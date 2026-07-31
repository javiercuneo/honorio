// ---------------------------------------------------------------
// components/interview/interview-experience.tsx
// Orquestador principal del wizard legal.
// Usa el schema declarativo (ALL_STEPS) y el hook useWizard.
// NO contiene reglas juridicas. Solo orquestacion UI.
//
// Conecta:
//   Schema (datos puros) ? Hook (orquestacion) ? Componentes UI (render)
//                                                            ? Adapters (motor legacy)
// ---------------------------------------------------------------

'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ALL_STEPS, type WizardStepDef } from '@/lib/wizard/wizard-schema'
import { useWizard } from '@/hooks/useWizard'
import { useLegacyReady } from '@/components/LegacyLoader'
import { AppTopbar } from './app-topbar'
import { LETRAS } from './option-card'
import { ProgressRail } from './progress-rail'
import { ContextPanel } from './context-panel'
import { StepShell } from './step-shell'
import { NumericField } from './numeric-field'
import { CardsField } from './cards-field'
import { LandingView } from './landing-view'
import { IntroView } from './intro-view'
import { DashboardView } from './dashboard-view'
import { MinimosView } from './minimos-view'

const transition = { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }

export function InterviewExperience() {
  const [showLanding, setShowLanding] = useState(true)
  const [showMinimos, setShowMinimos] = useState(false)
  const { ready, error: legacyError, umaValorCargado } = useLegacyReady()
  const initialUma = umaValorCargado ? { umaInicio: umaValorCargado } : undefined
  const wizard = useWizard(ALL_STEPS, initialUma)

  const [direction, setDirection] = useState(1)

  const go = useCallback((dir: number, updater: () => void) => {
    setDirection(dir)
    updater()
  }, [])

  const handleNext = () => {
    go(1, () => wizard.next())
  }

  const handleBack = () => {
    go(-1, () => wizard.back())
  }

  const handleJumpTo = (target: number) => {
    go(target >= wizard.index ? 1 : -1, () => wizard.jumpTo(target))
  }

  const handleRestart = () => {
    go(-1, () => wizard.restart())
  }

  const hasAnswer = wizard.currentStep
    ? isStepAnswered(wizard.currentStep, wizard.answers)
    : false

  const currentStepDef = wizard.currentStep as WizardStepDef | null
  const esUltimoPaso = wizard.index === wizard.visibleSteps.length - 1

  // Auto-avance en seleccion unica. No corre en el ultimo paso: disparar
  // el calculo tiene que ser un acto deliberado. El retardo alcanza para
  // que la tarjeta se vea marcada antes de que la pantalla cambie.
  const avanceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => {
    if (avanceRef.current) clearTimeout(avanceRef.current)
  }, [])

  const autoAvanzar = useCallback(() => {
    if (esUltimoPaso) return
    if (avanceRef.current) clearTimeout(avanceRef.current)
    avanceRef.current = setTimeout(() => go(1, () => wizard.next()), 260)
  }, [esUltimoPaso, go, wizard])

  // Teclado: la letra de cada tarjeta la selecciona, Enter avanza,
  // flecha izquierda vuelve. Las letras se muestran desde siempre; hasta
  // ahora no hacian nada.
  useEffect(() => {
    if (wizard.phase !== 'question') return

    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const target = e.target as HTMLElement | null
      const escribiendo =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)

      if (e.key === 'Enter') {
        if (escribiendo) return
        if (hasAnswer) {
          e.preventDefault()
          go(1, () => wizard.next())
        }
        return
      }

      if (e.key === 'ArrowLeft' && !escribiendo) {
        e.preventDefault()
        go(-1, () => wizard.back())
        return
      }

      if (escribiendo) return
      if (!currentStepDef || currentStepDef.kind === 'numeric') return

      const i = LETRAS.indexOf(e.key.toUpperCase())
      const opcion = i >= 0 ? currentStepDef.options[i] : undefined
      if (!opcion) return

      e.preventDefault()
      if (currentStepDef.select === 'multi') {
        const actuales = Array.isArray(wizard.answers[currentStepDef.id])
          ? (wizard.answers[currentStepDef.id] as string[])
          : []
        const set = new Set(actuales)
        if (set.has(opcion.id)) set.delete(opcion.id)
        else set.add(opcion.id)
        wizard.setAnswer(Array.from(set))
      } else {
        wizard.setAnswer(opcion.id)
        autoAvanzar()
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [wizard, currentStepDef, hasAnswer, go, autoAvanzar])

  // ---- Landing ----
  if (showLanding) {
    return <LandingView onStart={() => setShowLanding(false)} />
  }

  // ---- Carga pendiente del motor (solo antes del wizard) ----
  if (wizard.phase === 'question' && !ready && !legacyError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-foreground border-t-transparent mx-auto" />
          <p className="font-mono text-[13px] text-muted-foreground">
            Cargando motor juridico...
          </p>
        </div>
      </div>
    )
  }

  if (wizard.phase === 'question' && !ready && legacyError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="text-center max-w-md">
          <p className="font-mono text-[13px] text-destructive">
            Error al cargar el motor juridico: {legacyError}
          </p>
          <p className="mt-2 text-[12px] text-muted-foreground">
            Verifique que los archivos en /public/legacy/ existen.
          </p>
        </div>
      </div>
    )
  }

  // ---- Minimos Arancelarios ----
  if (showMinimos && !ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-foreground border-t-transparent mx-auto" />
          <p className="font-mono text-[13px] text-muted-foreground">
            Cargando motor juridico...
          </p>
        </div>
      </div>
    )
  }

  if (showMinimos && ready && !umaValorCargado) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="text-center max-w-md">
          <p className="font-mono text-[13px] text-destructive">
            No se pudo cargar el valor de la UMA desde Google Sheets.
          </p>
          <p className="mt-2 text-[12px] text-muted-foreground">
            Los valores de referencia no están disponibles sin el valor de la UMA.
          </p>
        </div>
      </div>
    )
  }

  if (showMinimos) {
    return <MinimosView onBack={() => setShowMinimos(false)} umaValor={umaValorCargado!} />
  }

  // ---- Dashboard ----
  // La cabecera la pone DashboardView (AppTopbar): una sola para toda
  // la pantalla, con la marca, el caso y los controles.
  if (wizard.phase === 'dashboard') {
    return (
      <DashboardView
        wizard={wizard}
        onBack={() => go(-1, () => wizard.back())}
        onRestart={handleRestart}
        onShowMinimos={() => setShowMinimos(true)}
      />
    )
  }

  const activeKey = wizard.phase === 'question' ? `q-${wizard.index}` : 'intro'
  const currentStep = wizard.currentStep as WizardStepDef | null

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppTopbar caso={wizard.phase === 'question' ? 'Entrevista' : undefined}>
        <button
          type="button"
          onClick={() => setShowMinimos(true)}
          className="rounded-md px-2.5 py-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Mínimos
        </button>
      </AppTopbar>

      <div className="mx-auto flex max-w-5xl flex-col px-6 pb-10 md:px-8">
        {wizard.phase === 'question' ? (
          <div className="py-5">
            <ProgressRail
              total={wizard.maxTotalSteps}
              current={wizard.index}
              completed={wizard.completedSteps}
              showFraction={!!wizard.answers.tipoProceso}
            />
          </div>
        ) : null}

        {/* Body */}
        <div className="grid flex-1 items-start gap-10 pb-8 pt-3 md:grid-cols-[minmax(0,1fr)_300px] md:gap-12 lg:gap-16">
          <div className="flex min-h-[60vh] flex-col">
            <div className="flex-1">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={activeKey}
                  custom={direction}
                  initial={{ opacity: 0, y: 16 * direction }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 * direction }}
                  transition={transition}
                >
                  {wizard.phase === 'intro' ? (
                    <IntroView onStart={() => go(1, () => wizard.jumpTo(0))} onShowMinimos={() => setShowMinimos(true)} />
                  ) : currentStep ? (
                    <StepShell
                      eyebrow={currentStep.eyebrow}
                      question={currentStep.pregunta}
                      helper={currentStep.ayuda}
                      explanation={currentStep.explicacion}
                    >
                      {currentStep.kind === 'numeric' ? (
                        <NumericField
                          step={currentStep}
                          value={
                            typeof wizard.answers[currentStep.id] === 'number'
                              ? (wizard.answers[currentStep.id] as number)
                              : currentStep.default
                          }
                          onChange={wizard.setAnswer}
                        />
                      ) : (
                        <CardsField
                          step={currentStep}
                          value={wizard.answers[currentStep.id] as string | string[] | undefined}
                          onChange={wizard.setAnswer}
                          onElegir={autoAvanzar}
                        />
                      )}
                    </StepShell>
                  ) : null}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer navigation */}
            {wizard.phase === 'question' ? (
              <div className="mt-10 flex items-center justify-between gap-4 border-t border-border pt-5">
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  className="h-10 px-3 text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="mr-1.5 h-4 w-4" />
                  Atrás
                </Button>

                <div className="flex items-center gap-4">
                  {wizard.errorMessage ? (
                    <span className="max-w-[200px] text-right text-[12px] leading-tight text-destructive">
                      {wizard.errorMessage}
                    </span>
                  ) : (
                    <span className="hidden items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-faint sm:flex">
                      {currentStep?.kind === 'numeric' ? (
                        <>
                          <Tecla>Enter</Tecla> para continuar
                        </>
                      ) : (
                        <>
                          <Tecla>A</Tecla>
                          <Tecla>B</Tecla>
                          <Tecla>C</Tecla> para elegir
                        </>
                      )}
                    </span>
                  )}
                  <Button
                    onClick={handleNext}
                    disabled={!hasAnswer}
                    className="group h-10 px-5 disabled:opacity-40"
                  >
                    {esUltimoPaso ? 'Calcular honorarios' : 'Continuar'}
                    <ArrowRight className="ml-1.5 h-4 w-4 transition-transform duration-300 group-enabled:group-hover:translate-x-0.5" />
                  </Button>
                </div>
              </div>
            ) : null}
          </div>

          {/* Context panel */}
          <div className="md:sticky md:top-8">
            <AnimatePresence>
              {wizard.phase !== 'intro' ? (
                <motion.div
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={transition}
                >
                  <ContextPanel
                    steps={wizard.visibleSteps}
                    answers={wizard.answers}
                    currentIndex={wizard.index}
                    maxTotalSteps={wizard.maxTotalSteps}
                    onJump={handleJumpTo}
                  />
                </motion.div>
              ) : (
                <IntroAside />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

/** Tecla dibujada como tecla, para que la pista de teclado se lea como tal. */
function Tecla({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-sm border border-border bg-secondary px-1 text-[10px] text-muted-foreground">
      {children}
    </span>
  )
}

function IntroAside() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={transition}
      className="hidden rounded-3xl border border-border bg-card p-6 md:block"
    >
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        ¿Cómo funciona?

      </p>
      <div className="mt-5 space-y-5">
        {[
          { n: '01', t: 'Inicio', d: 'Ingresá el valor de la UMA' },
          { n: '02', t: 'Seleccioná el tipo de proceso', d: 'Ejecutivo, Sucesión y demás' },
          { n: '03', t: 'Indicá las opciones procesales que cambian el cálculo', d: 'El juicio terminó por sentencia, acuerdo, etc.' },
          { n: '04', t: 'Elegí el objeto del juicio', d: 'Desalojo, Escrituración, u otros' },
          { n: '05', t: 'Ingresá la base regulatoria', d: 'El monto del juicio' },
          { n: '06', t: 'Obtené el cálculo', d: 'Según las variables elegidas' },
        ].map((item) => (
          <div key={item.n} className="flex gap-4">
            <span className="font-mono text-[12px] text-muted-foreground/70">{item.n}</span>
            <div>
              <p className="text-[14px] font-medium leading-tight text-card-foreground">
                {item.t}
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{item.d}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// ---- Helper ----
function isStepAnswered(step: WizardStepDef, answers: Record<string, unknown>): boolean {
  const value = answers[step.id]
  if (step.kind === 'numeric') return typeof value === 'number'
  if (step.select === 'multi') return Array.isArray(value) && value.length > 0
  return typeof value === 'string' && value.length > 0
}
