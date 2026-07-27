'use client'

import { motion } from 'motion/react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CardOption } from '@/lib/legal/types'

type OptionCardProps = {
  option: CardOption
  selected: boolean
  index: number
  multi?: boolean
  onSelect: () => void
}

export function OptionCard({
  option,
  selected,
  index,
  multi = false,
  onSelect,
}: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      role={multi ? 'checkbox' : 'radio'}
      aria-checked={selected}
      className={cn(
        'group relative flex h-full w-full flex-col items-start gap-3 rounded-2xl border bg-card p-4 text-left transition-all duration-200',
        'hover:-translate-y-0.5 hover:shadow-[0_12px_30px_-18px_rgba(0,0,0,0.28)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        selected
          ? 'border-foreground/25 shadow-[0_16px_40px_-24px_rgba(0,0,0,0.35)]'
          : 'border-border hover:border-foreground/15',
      )}
    >
      <span className="flex w-full items-center justify-between gap-2">
        <span
          className={cn(
            'flex h-6 w-6 shrink-0 items-center justify-center border text-[11px] font-medium transition-colors duration-200',
            multi ? 'rounded-md' : 'rounded-full',
            selected
              ? 'border-transparent bg-foreground text-background'
              : 'border-border text-muted-foreground group-hover:border-foreground/30',
          )}
        >
          {selected ? (
            <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
          ) : (
            String.fromCharCode(65 + index)
          )}
        </span>
        {option.hint ? (
          <span
            className={cn(
              'shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider transition-colors',
              selected ? 'bg-accent text-accent-foreground' : 'bg-secondary text-muted-foreground',
            )}
          >
            {option.hint}
          </span>
        ) : null}
      </span>

      <span className="flex-1">
        <span className="block text-[15px] font-medium leading-tight text-card-foreground">
          {option.label}
        </span>
        <span className="mt-1 block text-[13px] leading-relaxed text-muted-foreground">
          {option.description}
        </span>
      </span>
    </button>
  )
}
