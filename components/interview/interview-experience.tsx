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
import { ArrowLeft, ArrowRight, Scale } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ALL_STEPS, type WizardStepDef } from '@/lib/wizard/wizard-schema'
import { useWizard } from '@/hooks/useWizard'
import { LegacyLoader } from '@/components/LegacyLoader'
import { ProgressRail } from './progress-rail'
import { ContextPanel } from './context-panel'
import { StepShell } from './step-shell'
import { NumericField } from './numeric-field'
import { CardsField } from './cards-field'
import { IntroView } from './intro-view'
import { DashboardView } from './dashboard-view'

const transition = { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }

export function InterviewExperience() {
  const wizard = useWizard(ALL_STEPS)
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

  // ---- Dashboard ----
  if (wizard.phase === 'dashboard') {
    return (
      <LegacyLoader>
      <div className="min-h-screen bg-background text-foreground">
        <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6 md:px-8">
          <Brand />
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            Resultado del calculo
          </span>
        </header>
        <motion.div
          key="dashboard"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: transition.ease }}
        >
          <DashboardView
            wizard={wizard}
            onBack={() => go(-1, () => wizard.back())}
            onRestart={handleRestart}
          />
        </motion.div>
      </div>
    </LegacyLoader>
    )
  }

  const activeKey = wizard.phase === 'question' ? `q-${wizard.index}` : 'intro'
  const currentStep = wizard.currentStep as WizardStepDef | null

  return (
    <LegacyLoader>
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-5 pb-10 md:px-8">
        {/* Header */}
        <header className="flex items-center justify-between gap-6 py-6">
          <Brand />
          <div className="hidden w-64 md:block lg:w-80">
            <ProgressRail
              total={wizard.totalSteps}
              current={wizard.index}
              completed={wizard.completedSteps}
            />
          </div>
        </header>

        {/* Mobile progress */}
        <div className="mb-2 md:hidden">
          <ProgressRail
            total={wizard.totalSteps}
            current={wizard.index}
            completed={wizard.completedSteps}
          />
        </div>

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
                    <IntroView onStart={() => go(1, () => wizard.jumpTo(0))} />
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
                    {hasAnswer ? 'Listo' : 'Seleccione una opcion'}
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
    </LegacyLoader>
  )
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-foreground text-background">
        <Scale className="h-4 w-4" />
      </div>
      <span className="text-[15px] font-medium tracking-tight">Honorio</span>
    </div>
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
        Como funciona
      </p>
      <div className="mt-5 space-y-5">
        {[
          { n: '01', t: 'Un paso a la vez', d: 'Cada pantalla presenta una sola decision clara.' },
          { n: '02', t: 'El calculo se construye en vivo', d: 'Cada respuesta alimenta el resultado final.' },
          { n: '03', t: 'Resultado completo', d: 'El asistente genera los honorarios segun la Ley 27.423.' },
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
