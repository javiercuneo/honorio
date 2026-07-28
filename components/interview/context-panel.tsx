'use client'

import { motion } from 'motion/react'
import { Check, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { WizardStepDef, Answers } from '@/lib/wizard/wizard-schema'
import { resumenPaso } from '@/lib/wizard/wizard-schema'

type ContextPanelProps = {
  steps: WizardStepDef[]
  answers: Answers
  currentIndex: number
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
  onJump,
}: ContextPanelProps) {
  const answered = steps.filter((s) => isStepAnswered(s, answers)).length

  return (
    <aside className="flex flex-col gap-5">
      <div className="rounded-3xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Resumen del caso
          </h2>
          <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
            {answered}/{steps.length}
          </span>
        </div>

        <ol className="mt-4 space-y-0.5">
          {steps.map((step, i) => {
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
                    'group flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
                    reachable ? 'hover:bg-secondary/70' : 'cursor-not-allowed opacity-55',
                    isCurrent && 'bg-secondary',
                  )}
                >
                  <span
                    className={cn(
                      'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] transition-colors',
                      isDone
                        ? 'border-transparent bg-foreground text-background'
                        : isCurrent
                          ? 'border-foreground/40 text-foreground'
                          : 'border-border text-muted-foreground',
                    )}
                  >
                    {isDone ? (
                      <Check className="h-3 w-3" strokeWidth={3} />
                    ) : reachable ? (
                      i + 1
                    ) : (
                      <Lock className="h-2.5 w-2.5" />
                    )}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        'block truncate text-[13px] font-medium leading-tight',
                        isCurrent || isDone ? 'text-card-foreground' : 'text-muted-foreground',
                      )}
                    >
                      {step.resumenLabel}
                    </span>
                    <motion.span
                      initial={false}
                      animate={{ opacity: value ? 1 : 0.6 }}
                      className={cn(
                        'mt-0.5 block truncate text-[12px] leading-tight',
                        value ? 'text-accent-foreground' : 'text-muted-foreground/70',
                      )}
                    >
                      {value ?? 'Pendiente'}
                    </motion.span>
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
      </div>

      <p className="px-2 text-[12px] leading-relaxed text-muted-foreground/80">
        Las opciones que elijas se ven reflejadas en este panel
      </p>
    </aside>
  )
}
