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
    const next = clamp(Math.round(parsed / step.step) * step.step, step.min, step.max)
    onChange(next)
  }

  const pct = step.max > step.min ? ((value - step.min) / (step.max - step.min)) * 100 : 0

  return (
    <div className="max-w-lg">
      <div className="flex items-end gap-2">
        {step.prefix ? (
          <span className="pb-2 font-serif text-4xl leading-none text-muted-foreground md:text-5xl">
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
            'w-full min-w-0 bg-transparent font-serif text-6xl leading-none tracking-tight text-foreground outline-none md:text-7xl',
            'caret-foreground selection:bg-accent',
          )}
        />
        {step.suffix ? (
          <span className="pb-2 font-serif text-4xl leading-none text-muted-foreground md:text-5xl">
            {step.suffix}
          </span>
        ) : null}
      </div>
      <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        {step.unidad}
      </p>

      <div className="mt-8">
        <div className="relative h-9">
          <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-border" />
          <div
            className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-foreground"
            style={{ width: `${pct}%` }}
          />
          <div
            className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-foreground shadow-[0_2px_8px_-2px_rgba(0,0,0,0.4)]"
            style={{ left: `${pct}%` }}
            aria-hidden="true"
          />
          <input
            type="range"
            min={step.min}
            max={step.max}
            step={step.step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            aria-label={`${step.pregunta} slider`}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        </div>
        <div className="mt-1 flex justify-between font-mono text-[10px] uppercase tracking-wider text-muted-foreground/70">
          <span>{step.format(step.min)}</span>
          <span>{step.format(step.max)}</span>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {step.presets.map((preset) => {
          const active = preset === value
          return (
            <button
              key={preset}
              type="button"
              onClick={() => onChange(preset)}
              aria-pressed={active}
              className={cn(
                'rounded-full border px-3.5 py-1.5 font-mono text-[12px] tabular-nums transition-all duration-200',
                active
                  ? 'border-foreground/25 bg-foreground text-background'
                  : 'border-border bg-card text-muted-foreground hover:border-foreground/20 hover:text-foreground',
              )}
            >
              {step.format(preset)}
            </button>
          )
        })}
      </div>
    </div>
  )
}
