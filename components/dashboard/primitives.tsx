'use client'

// ---------------------------------------------------------------
// Piezas visuales compartidas del dashboard.
// Solo presentacion: ningun calculo juridico vive aca.
//
// Dos reglas que sostienen todo lo demas:
//   1. Los numeros no se ocultan nunca; las frases, siempre.
//      Por eso Cifra siempre esta a la vista y todo fundamento va
//      dentro de <Disclosure>.
//   2. El "por qué" es un unico signo: mismo texto, mismo tamano,
//      mismo lugar. Si cada explicacion tuviera su propia forma, el
//      mecanismo para bajar ruido seria la fuente de ruido.
//
// Sistema de color por eje: cada regla de la ley modifica uno de los
// tres ejes del calculo, y ese eje tiene siempre el mismo color.
//   base       arts. 22, 40          -> ocre
//   escala     arts. 25, 35, 37, 41  -> violeta
//   honorarios arts. 34, 38, 49      -> oxido
// ---------------------------------------------------------------

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { usePrefs } from "@/components/prefs"
import { pesos, splitPesos, umaNum } from "./format"

export type Axis = "base" | "escala" | "honorarios"

export const AXIS_ORDER: Axis[] = ["base", "escala", "honorarios"]

export const AXIS_LABEL: Record<Axis, string> = {
  base: "Base",
  escala: "Escala",
  honorarios: "Honorario",
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

/**
 * El ajuste por rol (art. 20) no es una reduccion por una razon
 * procesal: ubica al rol respecto del patrocinante. Por eso vive fuera
 * del sistema de tres ejes y no se confunde con el oxido.
 */
export const ROL_TINT = "bg-rol-tint text-rol-tint-foreground"

/** Prosa: justificada y con particion de palabras. */
export function Prosa({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <p
      lang="es"
      className={cn(
        "hyphens-auto text-justify text-[13px] leading-relaxed text-muted-foreground",
        className,
      )}
    >
      {children}
    </p>
  )
}

/** Insignia compacta: un factor, un ajuste, una quita. */
export function Insignia({
  tono,
  children,
}: {
  tono: string
  children: ReactNode
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-baseline rounded-sm px-1.5 py-0.5 font-mono text-[11px] tabular-nums",
        tono,
      )}
    >
      {children}
    </span>
  )
}

// ---- Formateadores atados a las preferencias de lectura ----

export function usePesos() {
  const { prefs } = usePrefs()
  return (v: number) => pesos(v, prefs.centavos)
}

export function useUma() {
  const { prefs } = usePrefs()
  return (v: number) => umaNum(v, prefs.umaDecimales ? 2 : 0)
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

type CifraSize = "hero" | "xl" | "lg" | "md" | "sm"

const CIFRA_SIZE: Record<CifraSize, string> = {
  hero: "text-[42px] leading-[1] md:text-[58px]",
  xl: "text-[26px] leading-[1.05]",
  lg: "text-[20px] leading-[1.1]",
  md: "text-[15px] leading-[1.2]",
  sm: "text-[13px] leading-[1.2]",
}

const CIFRA_DEC: Record<CifraSize, string> = {
  hero: "text-[0.34em]",
  xl: "text-[0.5em]",
  lg: "text-[0.55em]",
  md: "text-[0.7em]",
  sm: "text-[0.78em]",
}

/**
 * Importe en pesos. Los centavos se componen mas chicos para que la
 * cifra se lea de un golpe sin perder exactitud, y desaparecen si el
 * lector eligio no verlos.
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
  const { prefs } = usePrefs()
  const { entero, decimal } = splitPesos(value, prefs.centavos)
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
  className,
}: {
  value: number
  className?: string
}) {
  const uma = useUma()
  return (
    <span className={cn("tabular-nums", className)}>
      {uma(value)}
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
    <section className={cn("rounded-lg border border-border bg-card", className)}>
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
        "flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-b border-border px-7 py-4",
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

// ---- Filas ----

const PUNTEADO =
  "min-w-6 flex-1 translate-y-[-3px] border-b border-dotted border-hair"

/**
 * Fila del ledger: concepto a la izquierda, valor a la derecha, unidos
 * por una linea de puntos. El ojo sigue la fila sin perderse.
 */
export function LedgerRow({
  concepto,
  articulo,
  valor,
  sub,
  destacado,
  className,
}: {
  concepto: ReactNode
  articulo?: string
  valor: ReactNode
  sub?: ReactNode
  destacado?: boolean
  className?: string
}) {
  return (
    <div className={cn("flex items-baseline gap-3 py-2", className)}>
      <span
        className={cn(
          "flex items-baseline gap-2 text-[13px]",
          destacado ? "font-medium text-foreground" : "text-muted-foreground",
        )}
      >
        {concepto}
        {articulo ? <Articulo>{articulo}</Articulo> : null}
      </span>
      <span className={PUNTEADO} aria-hidden="true" />
      <span className="shrink-0 text-right">
        <span className="block">{valor}</span>
        {sub ? <span className="block">{sub}</span> : null}
      </span>
    </div>
  )
}

/**
 * El unico modo de esconder informacion en toda la app.
 * Siempre la misma palabra, siempre al borde derecho de la fila.
 */
export function Disclosure({
  concepto,
  articulo,
  valor,
  children,
  className,
}: {
  concepto: ReactNode
  articulo?: string
  valor?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <details className={cn("group", className)}>
      <summary className="flex cursor-pointer list-none items-baseline gap-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <span className="flex items-baseline gap-2 text-[13px] text-muted-foreground">
          {concepto}
          {articulo ? <Articulo>{articulo}</Articulo> : null}
        </span>
        <span className={PUNTEADO} aria-hidden="true" />
        {valor ? <span className="shrink-0 text-right">{valor}</span> : null}
        <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-accent-foreground">
          por qué
        </span>
      </summary>
      <div
        lang="es"
        className="max-w-2xl hyphens-auto pb-3 pr-8 text-justify text-[13px] leading-relaxed text-muted-foreground"
      >
        {children}
      </div>
    </details>
  )
}

/** Texto de la ley: si aparece serif, se esta leyendo la norma. */
export function Norma({ children }: { children: ReactNode }) {
  return (
    <p className="font-law text-[15px] leading-relaxed text-foreground/80">
      {children}
    </p>
  )
}

/** Cierre de un bloque: la cifra con la que sale. */
export function Total({
  etiqueta,
  children,
}: {
  etiqueta: string
  children: ReactNode
}) {
  return (
    <div className="mt-1 flex flex-wrap items-end justify-between gap-x-4 gap-y-1 border-t border-hair pt-3">
      <Etiqueta>{etiqueta}</Etiqueta>
      <span className="text-right">{children}</span>
    </div>
  )
}

/** Ficha: una cifra con su rotulo. Se escanea de un vistazo. */
export function Tile({
  etiqueta,
  valor,
  sub,
  destacado,
}: {
  etiqueta: ReactNode
  valor: ReactNode
  sub?: ReactNode
  destacado?: boolean
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card px-6 py-5",
        destacado && "border-l-2 border-l-accent-foreground",
      )}
    >
      <Etiqueta>{etiqueta}</Etiqueta>
      <div className="mt-2.5">{valor}</div>
      {sub ? (
        <div className="mt-1.5 font-mono text-[11px] text-faint">{sub}</div>
      ) : null}
    </div>
  )
}
