'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import type { NumericStepDef } from '@/lib/wizard/wizard-schema'

type NumericFieldProps = {
  step: NumericStepDef
  value: number
  onChange: (value: string | string[] | number) => void
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v))
}

export function NumericField({ step, value, onChange }: NumericFieldProps) {
  const [draft, setDraft] = useState(value.toLocaleString('es-AR'))
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setDraft(value.toLocaleString('es-AR'))
  }, [value])

  const commit = (raw: string) => {
    const parsed = Number(raw.replace(/[^0-9.,]/g, '').replace(/\./g, '').replace(',', '.'))
    if (Number.isNaN(parsed)) {
      setDraft(value.toLocaleString('es-AR'))
      return
    }
    const next = clamp(parsed, step.min, step.max)
    onChange(next)
  }

  return (
    <div className="max-w-lg">
      <div className="flex items-end gap-2">
        {step.prefix ? (
          <span className="pb-2 font-meter text-4xl leading-none text-muted-foreground md:text-5xl">
            {step.prefix}
          </span>
        ) : null}
        <input
          ref={inputRef}
          inputMode="decimal"
          aria-label={step.pregunta}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={(e) => commit(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              commit((e.target as HTMLInputElement).value)
              inputRef.current?.blur()
            }
          }}
          className={cn(
            'w-full min-w-0 bg-transparent font-meter text-6xl leading-none tracking-tight text-foreground outline-none md:text-7xl',
            'caret-foreground selection:bg-accent',
          )}
        />
        {step.suffix ? (
          <span className="pb-2 font-meter text-4xl leading-none text-muted-foreground md:text-5xl">
            {step.suffix}
          </span>
        ) : null}
      </div>
      <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        {step.unidad}
      </p>
    </div>
  )
}