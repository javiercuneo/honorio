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

import { useCallback, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ALL_STEPS, type WizardStepDef } from '@/lib/wizard/wizard-schema'
import { useWizard } from '@/hooks/useWizard'
import { useLegacyReady } from '@/components/LegacyLoader'
import { withBasePath } from '@/lib/basePath'
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
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-5 pb-10 md:px-8">
        {/* Header */}
        <header className="flex items-center justify-between gap-6 py-6">
          <Brand />
          {wizard.phase === 'question' ? (
          <div className="hidden w-64 md:block lg:w-80">
            <ProgressRail
              total={wizard.maxTotalSteps}
              current={wizard.index}
              completed={wizard.completedSteps}
              showFraction={!!wizard.answers.tipoProceso}
            />
          </div>
          ) : null}
        </header>

        {/* Mobile progress */}
        {wizard.phase === 'question' ? (
        <div className="mb-2 md:hidden">
          <ProgressRail
            total={wizard.totalSteps}
            current={wizard.index}
            completed={wizard.completedSteps}
          />
        </div>
        ) : null}

        {/* Body */}
        <div className="grid flex-1 items-start gap-10 py-8 md:grid-cols-[minmax(0,1fr)_320px] md:gap-14 lg:gap-20">
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
                        />
                      )}
                    </StepShell>
                  ) : null}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer navigation */}
            {wizard.phase === 'question' ? (
              <div className="mt-10 flex items-center justify-between border-t border-border pt-5">
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  className="h-11 rounded-full px-4 text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Atras
                </Button>

                <div className="flex items-center gap-4">
                  {wizard.errorMessage && (
                    <span className="text-[12px] text-destructive max-w-[180px] text-right leading-tight">
                      {wizard.errorMessage}
                    </span>
                  )}
                  <span className="hidden font-mono text-[11px] uppercase tracking-wider text-muted-foreground/70 sm:block">
                    {hasAnswer ? 'Listo' : (currentStep?.kind === 'numeric' ? 'Ingrese un valor' : 'Seleccione una opcion')}
                  </span>
                  <Button
                    onClick={handleNext}
                    disabled={!hasAnswer}
                    className="group h-11 rounded-full px-6 disabled:opacity-40"
                  >
                    {wizard.index === wizard.visibleSteps.length - 1
                      ? 'Calcular honorarios'
                      : 'Continuar'}
                    <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-300 group-enabled:group-hover:translate-x-0.5" />
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

function Brand() {
  return (
    <img src={withBasePath('/honorio.png')} alt="Honorio" width="147" className="h-auto" />
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
          { n: '03', t: 'Indicá opciones procesles que cambian el cálculo', d: 'El juicio terminó por sentencia, acuerdo, etc.' },
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
