'use client'

import { OptionCard } from './option-card'
import { cn } from '@/lib/utils'
import type { CardsStepDef } from '@/lib/wizard/wizard-schema'

type CardsFieldProps = {
  step: CardsStepDef
  value: string | string[] | undefined
  onChange: (value: string | string[] | number) => void
  /** Se dispara al elegir en un paso de seleccion unica. */
  onElegir?: () => void
}

export function CardsField({ step, value, onChange, onElegir }: CardsFieldProps) {
  const multi = step.select === 'multi'
  const selectedIds = multi
    ? Array.isArray(value)
      ? value
      : []
    : typeof value === 'string'
      ? [value]
      : []

  const handleSelect = (id: string) => {
    if (!multi) {
      onChange(id)
      onElegir?.()
      return
    }
    const set = new Set(selectedIds)
    if (set.has(id)) set.delete(id)
    else set.add(id)
    onChange(Array.from(set))
  }

  const cols =
    step.options.length >= 9
      ? 'sm:grid-cols-2 lg:grid-cols-3'
      : step.options.length >= 6
        ? 'sm:grid-cols-2 lg:grid-cols-4'
        : 'sm:grid-cols-3'

  return (
    <div
      role={multi ? 'group' : 'radiogroup'}
      aria-label={step.pregunta}
      className={cn('grid grid-cols-1 gap-2.5', cols)}
    >
      {step.options.map((option, index) => (
        <OptionCard
          key={option.id}
          option={option}
          index={index}
          multi={multi}
          selected={selectedIds.includes(option.id)}
          onSelect={() => handleSelect(option.id)}
        />
      ))}
    </div>
  )
}
