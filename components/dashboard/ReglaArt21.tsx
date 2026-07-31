"use client"

// ---------------------------------------------------------------
// Dos graficos que contestan la misma pregunta desde angulos
// distintos:
//   ReglaArt21     donde cae la base dentro de la escala progresiva
//   BarraExcedente cuanto del honorario viene del piso del grado
//                  anterior y cuanto de la alicuota del tramo
//
// El segundo es el que hace visible la regla del excedente: casi
// todo el honorario suele venir del piso, y la alicuota apenas roza.
//
// Solo presentacion: los tramos son la transcripcion de la escala
// legal. El calculo lo hace lib/legal/calculate.ts.
// ---------------------------------------------------------------

import { cn } from "@/lib/utils"
import { useUma, usePesos } from "./primitives"

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
      <div
        className="flex items-stretch overflow-hidden rounded-md border border-border"
        role="img"
        aria-label={`La base cae en el tramo ${activo.n} de la escala del articulo 21, de ${activo.label} UMA`}
      >
        {ESCALAS_ART21.map((t) => {
          const activa = t.n === activo.n
          return (
            <div
              key={t.n}
              className={cn(
                "relative flex-1 border-r border-hair px-1.5 py-2 text-center last:border-r-0",
                activa ? "bg-axis-escala-tint" : "bg-secondary",
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
                  className="pointer-events-none absolute inset-y-0 w-[2px] bg-axis-escala"
                  style={{ left: `${posicion}%` }}
                  aria-hidden="true"
                />
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/**
 * Proporcion entre el piso del grado anterior y el aporte del
 * excedente. Ambos valores llegan ya calculados: aca solo se
 * convierten en anchos.
 */
export function BarraExcedente({
  pisoUMA,
  aporteUMA,
  limiteAnterior,
  alicuota,
  excedenteUMA,
  valorUMA,
}: {
  pisoUMA: number
  aporteUMA: number
  limiteAnterior: number
  alicuota: string
  excedenteUMA: number
  valorUMA: number
}) {
  const uma = useUma()
  const money = usePesos()

  const total = pisoUMA + aporteUMA
  if (total <= 0) return null
  const anchoPiso = (pisoUMA / total) * 100

  return (
    <div>
      <div
        className="flex h-9 overflow-hidden rounded-md border border-border"
        role="img"
        aria-label={`El piso del grado anterior aporta ${uma(pisoUMA)} UMA y el excedente ${uma(aporteUMA)} UMA`}
      >
        <div
          className="flex items-center bg-axis-escala-tint px-3"
          style={{ width: `${anchoPiso}%` }}
        >
          <span className="truncate font-mono text-[10px] uppercase tracking-wider text-axis-escala-tint-foreground">
            Piso del grado anterior
          </span>
        </div>
        <div
          className="flex items-center bg-secondary px-2"
          style={{ width: `${100 - anchoPiso}%` }}
        />
      </div>

      <div className="mt-2 flex flex-wrap justify-between gap-x-6 gap-y-1 font-mono text-[11px] text-faint">
        <span>
          Máximo hasta {Math.round(limiteAnterior)} UMA{" "}
          <span className="tabular-nums text-foreground">{money(pisoUMA * valorUMA)}</span>
        </span>
        <span>
          {alicuota} del excedente de{" "}
          <span className="tabular-nums text-foreground">
            {money(excedenteUMA * valorUMA)}
          </span>{" "}
          <span className="tabular-nums text-foreground">
            {money(aporteUMA * valorUMA)}
          </span>
        </span>
      </div>
    </div>
  )
}
