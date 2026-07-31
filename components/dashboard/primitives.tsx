// ---------------------------------------------------------------
// Piezas visuales compartidas del dashboard.
// Solo presentacion: ningun calculo juridico vive aca.
//
// Sistema de color por eje: cada regla de la ley modifica uno de los
// tres ejes del calculo, y ese eje tiene siempre el mismo color.
//   base       arts. 22, 40          -> ocre
//   escala     arts. 25, 35, 37, 41  -> violeta
//   honorarios arts. 34, 38, 49      -> oxido
// ---------------------------------------------------------------

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { splitPesos, umaNum } from "./format"

export type Axis = "base" | "escala" | "honorarios"

export const AXIS_ORDER: Axis[] = ["base", "escala", "honorarios"]

export const AXIS_LABEL: Record<Axis, string> = {
  base: "Base",
  escala: "Escala",
  honorarios: "Honorario",
}

export const AXIS_TITLE: Record<Axis, string> = {
  base: "Incide en la base regulatoria",
  escala: "Incide en la escala aplicable",
  honorarios: "Incide en el honorario final",
}

// Clases completas y estaticas: Tailwind no resuelve nombres compuestos.
export const AXIS_INK: Record<Axis, string> = {
  base: "text-axis-base",
  escala: "text-axis-escala",
  honorarios: "text-axis-honorarios",
}

export const AXIS_FILL: Record<Axis, string> = {
  base: "bg-axis-base",
  escala: "bg-axis-escala",
  honorarios: "bg-axis-honorarios",
}

export const AXIS_TINT: Record<Axis, string> = {
  base: "bg-axis-base-tint text-axis-base-tint-foreground",
  escala: "bg-axis-escala-tint text-axis-escala-tint-foreground",
  honorarios: "bg-axis-honorarios-tint text-axis-honorarios-tint-foreground",
}

export const AXIS_TINT_BG: Record<Axis, string> = {
  base: "bg-axis-base-tint",
  escala: "bg-axis-escala-tint",
  honorarios: "bg-axis-honorarios-tint",
}

// ---- Tipografia de servicio ----

export function Etiqueta({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        "font-mono text-[10px] uppercase tracking-[0.16em] text-faint",
        className,
      )}
    >
      {children}
    </span>
  )
}

/** Cita de articulo: siempre mono, siempre igual en toda la app. */
export function Articulo({ children }: { children: ReactNode }) {
  return (
    <span className="font-mono text-[10px] uppercase tracking-wider text-faint">
      {children}
    </span>
  )
}

// ---- Cifras ----

type CifraSize = "hero" | "lg" | "md" | "sm"

const CIFRA_SIZE: Record<CifraSize, string> = {
  hero: "text-[34px] leading-[1.05] md:text-[44px]",
  lg: "text-[21px] leading-[1.1]",
  md: "text-[15px] leading-[1.2]",
  sm: "text-[13px] leading-[1.2]",
}

const CIFRA_DEC: Record<CifraSize, string> = {
  hero: "text-[0.4em]",
  lg: "text-[0.55em]",
  md: "text-[0.7em]",
  sm: "text-[0.78em]",
}

/**
 * Importe en pesos, siempre completo. Los centavos se componen mas
 * chicos para que la cifra se lea de un golpe sin perder exactitud.
 */
export function Cifra({
  value,
  size = "md",
  className,
  tachado,
}: {
  value: number
  size?: CifraSize
  className?: string
  tachado?: boolean
}) {
  const { entero, decimal } = splitPesos(value)
  return (
    <span
      className={cn(
        "font-meter tabular-nums tracking-tight",
        CIFRA_SIZE[size],
        tachado && "line-through decoration-[1.5px]",
        className,
      )}
    >
      {entero}
      {decimal ? (
        <span className={cn("text-faint", CIFRA_DEC[size])}>,{decimal}</span>
      ) : null}
    </span>
  )
}

export function EnUMA({
  value,
  digits = 2,
  className,
}: {
  value: number
  digits?: number
  className?: string
}) {
  return (
    <span className={cn("font-mono text-[11px] tabular-nums text-faint", className)}>
      {umaNum(value, digits)}
      <span className="ml-1 tracking-wider">UMA</span>
    </span>
  )
}

// ---- Contenedores ----

export function Card({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <section
      className={cn("rounded-lg border border-border bg-card", className)}
    >
      {children}
    </section>
  )
}

export function CardHeader({
  titulo,
  articulo,
  children,
  className,
}: {
  titulo: string
  articulo?: string
  children?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-b border-border px-6 py-4",
        className,
      )}
    >
      <div className="flex items-baseline gap-2.5">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground">
          {titulo}
        </h2>
        {articulo ? <Articulo>{articulo}</Articulo> : null}
      </div>
      {children}
    </div>
  )
}

/**
 * Control segmentado. Un solo elemento activo, marcado con el acento:
 * el mismo color que marca foco y seleccion en el resto de la app.
 */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
  ariaLabel: string
}) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="inline-flex rounded-md border border-border bg-secondary p-0.5"
    >
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            role="tab"
            aria-selected={active}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn(
              "rounded-sm px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              active
                ? "bg-card text-accent-foreground shadow-[0_1px_2px_rgb(0_0_0/0.06)]"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

/**
 * Fila del ledger: concepto a la izquierda, valor a la derecha,
 * unidos por una linea de puntos. El ojo sigue la fila sin perderse.
 */
export function LedgerRow({
  concepto,
  articulo,
  valor,
  sub,
  axis,
  destacado,
  className,
}: {
  concepto: ReactNode
  articulo?: string
  valor: ReactNode
  sub?: ReactNode
  axis?: Axis
  destacado?: boolean
  className?: string
}) {
  return (
    <div className={cn("flex items-baseline gap-3 py-1.5", className)}>
      <span
        className={cn(
          "flex items-baseline gap-2",
          destacado ? "text-foreground" : "text-muted-foreground",
          destacado ? "text-[13px] font-medium" : "text-[13px]",
        )}
      >
        {axis ? (
          <span
            className={cn("h-1.5 w-1.5 shrink-0 rounded-full", AXIS_FILL[axis])}
            aria-hidden="true"
          />
        ) : null}
        {concepto}
        {articulo ? <Articulo>{articulo}</Articulo> : null}
      </span>
      <span
        className="min-w-6 flex-1 translate-y-[-3px] border-b border-dotted border-hair"
        aria-hidden="true"
      />
      <span className="shrink-0 text-right">
        <span className="block">{valor}</span>
        {sub ? <span className="block">{sub}</span> : null}
      </span>
    </div>
  )
}
