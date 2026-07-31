'use client'

// ---------------------------------------------------------------
// Un solo lugar para todo el chrome de la aplicacion: la marca, la
// identificacion del caso y los controles. Antes habia dos cabeceras
// con anchos distintos que repetian la misma leyenda.
// ---------------------------------------------------------------

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Moon, Settings2, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePrefs } from '@/components/prefs'

function IconButton({
  onClick,
  label,
  activo,
  children,
}: {
  onClick: () => void
  label: string
  activo?: boolean
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-muted-foreground transition-colors',
        'hover:border-border hover:text-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        activo && 'border-border text-accent-foreground',
      )}
    >
      {children}
    </button>
  )
}

function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-6 py-1.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="text-[13px] text-foreground">{label}</span>
      <span
        className={cn(
          'relative h-4 w-7 shrink-0 rounded-full transition-colors',
          checked ? 'bg-primary' : 'bg-border',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 h-3 w-3 rounded-full bg-card transition-transform',
            checked ? 'translate-x-3.5' : 'translate-x-0.5',
          )}
        />
      </span>
    </button>
  )
}

function Ajustes() {
  const { prefs, set } = usePrefs()
  const [abierto, setAbierto] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!abierto) return
    const fuera = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setAbierto(false)
    }
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setAbierto(false)
    document.addEventListener('mousedown', fuera)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('mousedown', fuera)
      document.removeEventListener('keydown', esc)
    }
  }, [abierto])

  return (
    <div ref={ref} className="relative">
      <IconButton
        onClick={() => setAbierto((v) => !v)}
        label="Ajustes de lectura"
        activo={abierto}
      >
        <Settings2 className="h-4 w-4" />
      </IconButton>

      {abierto ? (
        <div className="absolute right-0 top-10 z-50 w-64 rounded-lg border border-border bg-card p-4 shadow-[0_8px_24px_rgb(0_0_0/0.10)]">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-faint">
            Lectura
          </p>
          <div className="mt-2.5">
            <Switch
              checked={prefs.centavos}
              onChange={(v) => set('centavos', v)}
              label="Mostrar centavos"
            />
            <Switch
              checked={prefs.umaDecimales}
              onChange={(v) => set('umaDecimales', v)}
              label="UMA con decimales"
            />
          </div>
          <p className="mt-3 border-t border-hair pt-3 text-[12px] leading-relaxed text-faint">
            Solo cambia como se escribe la cifra. El calculo es siempre el
            mismo.
          </p>
          <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-faint">
            Colores
          </p>
          <p className="mt-1.5 text-[12px] leading-relaxed text-faint">
            Cada regla esta pintada segun el eje que modifica: ocre la base,
            violeta la escala, oxido el honorario.
          </p>
        </div>
      ) : null}
    </div>
  )
}

export function AppTopbar({
  caso,
  children,
}: {
  /** Identificacion del caso en una linea. */
  caso?: string
  /** Acciones propias de la pantalla. */
  children?: ReactNode
}) {
  const { prefs, alternarTema } = usePrefs()

  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-6 py-4 md:px-8">
        <div className="flex min-w-0 items-baseline gap-3">
          <span className="font-meter text-[19px] font-semibold uppercase tracking-[0.06em] text-foreground">
            Honorio
          </span>
          {caso ? (
            <span className="truncate font-mono text-[11px] uppercase tracking-[0.1em] text-faint">
              {caso}
            </span>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {children}
          <span className="mx-1 h-5 w-px bg-hair" aria-hidden="true" />
          <IconButton
            onClick={alternarTema}
            label={prefs.tema === 'dark' ? 'Tema claro' : 'Tema oscuro'}
          >
            {prefs.tema === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </IconButton>
          <Ajustes />
        </div>
      </div>
    </header>
  )
}
