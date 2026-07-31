'use client'

import type { ReactNode } from 'react'
import { ExplanationDisclosure } from './explanation-disclosure'
import type { Explanation } from '@/lib/legal/types'

type StepShellProps = {
  eyebrow: string
  question: string
  helper: string
  explanation: Explanation
  children: ReactNode
}

const VACIO = 'Complete los datos segun corresponda.'

export function StepShell({
  eyebrow,
  question,
  helper,
  explanation,
  children,
}: StepShellProps) {
  const tieneFundamento =
    explanation.full?.some((line) => line && line !== VACIO) ?? false

  return (
    <div>
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent-foreground">
        {eyebrow}
      </span>
      <h1 className="mt-3 text-pretty font-meter text-[34px] leading-[1.05] tracking-tight text-foreground md:text-[42px]">
        {question}
      </h1>
      <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-muted-foreground">
        {helper}
      </p>

      <div className="mt-8">{children}</div>

      {tieneFundamento ? (
        <div className="mt-8">
          <ExplanationDisclosure explanation={explanation} />
        </div>
      ) : null}
    </div>
  )
}
