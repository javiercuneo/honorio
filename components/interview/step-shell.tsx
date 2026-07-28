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

export function StepShell({
  eyebrow,
  question,
  helper,
  explanation,
  children,
}: StepShellProps) {
  return (
    <div>
      <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent-foreground">
        {eyebrow}
      </span>
      <h1 className="mt-4 text-pretty font-serif text-4xl leading-[1.05] tracking-tight text-foreground md:text-5xl">
        {question}
      </h1>
      <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted-foreground">
        {helper}
      </p>

      <div className="mt-8">{children}</div>

      {explanation.full && explanation.full.length > 0 && explanation.full.some(line => line !== 'Complete los datos segun corresponda.') ? (
        <ExplanationDisclosure explanation={explanation} />) : null}
    </div>
  )
}
