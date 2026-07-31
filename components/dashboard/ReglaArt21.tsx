"use client"

// ---------------------------------------------------------------
// La escala del art. 21 dibujada como una regla graduada.
// Solo presentacion: los tramos son la transcripcion de la escala
// legal para poder ubicar visualmente donde cae la base.
// El calculo lo hace lib/legal/calculate.ts.
// ---------------------------------------------------------------

import { cn } from "@/lib/utils"
import { umaNum, pct } from "./format"

export interface TramoArt21 {
  n: number
  desde: number
  hasta: number
  label: string
  min: number
  max: number
}

export const ESCALAS_ART21: TramoArt21[] = [
  { n: 1, desde: 0, hasta: 15, label: "hasta 15", min: 22, max: 33 },
  { n: 2, desde: 15, hasta: 45, label: "16–45", min: 20, max: 26 },
  { n: 3, desde: 45, hasta: 90, label: "46–90", min: 18, max: 24 },
  { n: 4, desde: 90, hasta: 150, label: "91–150", min: 17, max: 22 },
  { n: 5, desde: 150, hasta: 450, label: "151–450", min: 15, max: 20 },
  { n: 6, desde: 450, hasta: 750, label: "451–750", min: 13, max: 17 },
  { n: 7, desde: 750, hasta: Infinity, label: "+750", min: 12, max: 15 },
]

export function tramoDe(baseEnUMA: number): TramoArt21 {
  return (
    ESCALAS_ART21.find((t) => baseEnUMA <= t.hasta) ??
    ESCALAS_ART21[ESCALAS_ART21.length - 1]
  )
}

export function ReglaArt21({ baseEnUMA }: { baseEnUMA: number }) {
  const activo = tramoDe(baseEnUMA)
  const span = isFinite(activo.hasta) ? activo.hasta - activo.desde : 750
  const posicion = Math.min(
    100,
    Math.max(0, ((baseEnUMA - activo.desde) / span) * 100),
  )

  return (
    <div>
      <div className="flex items-stretch overflow-hidden rounded-md border border-border">
        {ESCALAS_ART21.map((t) => {
          const activa = t.n === activo.n
          return (
            <div
              key={t.n}
              className={cn(
                "relative flex-1 border-r border-hair px-1.5 py-2 text-center last:border-r-0",
                activa ? "bg-axis-escala-tint" : "bg-card",
              )}
            >
              <div
                className={cn(
                  "font-mono text-[10px] tabular-nums tracking-tight",
                  activa
                    ? "font-semibold text-axis-escala-tint-foreground"
                    : "text-faint",
                )}
              >
                {t.label}
              </div>
              <div
                className={cn(
                  "mt-0.5 font-mono text-[9px] tabular-nums tracking-tight",
                  activa ? "text-axis-escala-tint-foreground" : "text-faint/70",
                )}
              >
                {t.min}–{t.max}%
              </div>

              {activa ? (
                <span
                  className="pointer-events-none absolute inset-y-0 w-px bg-axis-escala"
                  style={{ left: `${posicion}%` }}
                  aria-hidden="true"
                />
              ) : null}
            </div>
          )
        })}
      </div>

      <div className="mt-1.5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-faint">
        <span className="h-px w-3 bg-axis-escala" aria-hidden="true" />
        Base de {umaNum(baseEnUMA)} UMA · tramo {activo.n} de 7 ·{" "}
        {pct(activo.min)} a {pct(activo.max)}
      </div>
    </div>
  )
}
