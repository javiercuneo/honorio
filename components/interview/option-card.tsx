'use client'

// ---------------------------------------------------------------
// Tarjeta de opcion. La letra de la izquierda no es decorativa: es la
// tecla que selecciona esa opcion, y por eso se compone como una tecla.
// Seleccionado usa el acento, el mismo color que marca foco y estado
// activo en el resto de la app.
// ---------------------------------------------------------------

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

export const LETRAS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

export function OptionCard({
  option,
  selected,
  index,
  multi = false,
  onSelect,
}: OptionCardProps) {
  const letra = LETRAS[index]

  return (
    <button
      type="button"
      onClick={onSelect}
      role={multi ? 'checkbox' : 'radio'}
      aria-checked={selected}
      aria-keyshortcuts={letra}
      className={cn(
        'group relative flex h-full w-full flex-col items-start gap-3 rounded-lg border p-4 text-left',
        'transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        selected
          ? 'border-accent-foreground bg-accent'
          : 'border-border bg-card hover:border-foreground/25',
      )}
    >
      <span className="flex w-full items-center justify-between gap-2">
        <span
          className={cn(
            'flex h-6 min-w-6 shrink-0 items-center justify-center rounded-sm border px-1 font-mono text-[11px] transition-colors',
            selected
              ? 'border-transparent bg-accent-foreground text-primary-foreground'
              : 'border-border bg-secondary text-faint group-hover:text-muted-foreground',
          )}
        >
          {selected ? (
            <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
          ) : (
            letra
          )}
        </span>
        {option.hint ? (
          <span
            className={cn(
              'shrink-0 rounded-sm px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider transition-colors',
              selected
                ? 'bg-card/70 text-accent-foreground'
                : 'bg-secondary text-faint',
            )}
          >
            {option.hint}
          </span>
        ) : null}
      </span>

      <span className="flex-1">
        <span
          className={cn(
            'block text-[15px] font-medium leading-tight',
            selected ? 'text-accent-foreground' : 'text-card-foreground',
          )}
        >
          {option.label}
        </span>
        <span className="mt-1 block text-[13px] leading-relaxed text-muted-foreground">
          {option.description}
        </span>
      </span>
    </button>
  )
}
