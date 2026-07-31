'use client'

import { Check, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { WizardStepDef, Answers } from '@/lib/wizard/wizard-schema'
import { resumenPaso } from '@/lib/wizard/wizard-schema'

type ContextPanelProps = {
  steps: WizardStepDef[]
  answers: Answers
  currentIndex: number
  maxTotalSteps: number
  onJump: (index: number) => void
}

function isStepAnswered(step: WizardStepDef, answers: Answers): boolean {
  const value = answers[step.id]
  if (step.kind === 'numeric') return typeof value === 'number'
  if (step.select === 'multi') return Array.isArray(value) && value.length > 0
  return typeof value === 'string' && value.length > 0
}

export function ContextPanel({
  steps,
  answers,
  currentIndex,
  maxTotalSteps,
  onJump,
}: ContextPanelProps) {
  const answeredCount = steps.filter((step) => isStepAnswered(step, answers)).length

  // Antes de elegir el tipo de proceso todavia no se sabe que pasos
  // vienen: se muestra uno pendiente en vez de prometer una lista.
  const showGeneric = !answers.tipoProceso
  const displaySteps =
    showGeneric && currentIndex < steps.length - 1
      ? steps.slice(0, Math.min(currentIndex + 1, steps.length)).concat({
          id: 'pending',
          resumenLabel: 'Siguiente paso',
          pregunta: '',
          ayuda: '',
          explicacion: { brief: '', expanded: '', full: [] },
          eyebrow: '',
        } as unknown as WizardStepDef)
      : steps

  return (
    <aside className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between px-1">
        <h2 className="font-mono text-[10px] uppercase tracking-[0.16em] text-faint">
          Respuestas
        </h2>
        {answers.tipoProceso ? (
          <span className="font-mono text-[10px] tabular-nums text-faint">
            {answeredCount}/{maxTotalSteps}
          </span>
        ) : null}
      </div>

      <ol className="mt-2.5">
        {displaySteps.map((step, i) => {
          const value = resumenPaso(step, answers)
          const isCurrent = i === currentIndex
          const isDone = isStepAnswered(step, answers)
          const reachable = isDone || i <= currentIndex

          return (
            <li key={step.id}>
              <button
                type="button"
                disabled={!reachable}
                onClick={() => reachable && onJump(i)}
                className={cn(
                  'flex w-full items-start gap-2.5 rounded-md px-2 py-2 text-left transition-colors',
                  reachable
                    ? 'hover:bg-secondary'
                    : 'cursor-not-allowed opacity-50',
                  isCurrent && 'bg-secondary',
                )}
              >
                <span
                  className={cn(
                    'mt-px flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border font-mono text-[9px] transition-colors',
                    isDone
                      ? 'border-transparent bg-accent-foreground text-primary-foreground'
                      : isCurrent
                        ? 'border-accent-foreground text-accent-foreground'
                        : 'border-border text-faint',
                  )}
                >
                  {isDone ? (
                    <Check className="h-2.5 w-2.5" strokeWidth={3} />
                  ) : reachable ? (
                    i + 1
                  ) : (
                    <Lock className="h-2 w-2" />
                  )}
                </span>

                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      'block truncate text-[12px] leading-tight',
                      isCurrent || isDone ? 'text-foreground' : 'text-faint',
                    )}
                  >
                    {step.resumenLabel}
                  </span>
                  {value ? (
                    <span className="mt-0.5 block truncate text-[12px] leading-tight text-accent-foreground">
                      {value}
                    </span>
                  ) : null}
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </aside>
  )
}
