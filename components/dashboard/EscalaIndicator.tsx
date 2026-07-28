'use client'

import type { EscalaAplicada } from "@/lib/legal/types"

interface EscalaIndicatorProps {
  escala: EscalaAplicada
}

function pct(v: number) {
  return v + "%"
}

const ESCALAS_ART21 = [
  { num: 1, max: "30", rango: "0 a 30", minPct: 12, maxPct: 14 },
  { num: 2, max: "60", rango: "31 a 60", minPct: 12, maxPct: 14 },
  { num: 3, max: "120", rango: "61 a 120", minPct: 15, maxPct: 18 },
  { num: 4, max: "300", rango: "121 a 300", minPct: 15, maxPct: 18 },
  { num: 5, max: "600", rango: "301 a 600", minPct: 18, maxPct: 24 },
  { num: 6, max: "1.500", rango: "601 a 1.500", minPct: 18, maxPct: 24 },
  { num: 7, max: "\u221E", rango: "1.501+", minPct: 18, maxPct: 24 },
]

export function EscalaIndicator({ escala }: EscalaIndicatorProps) {
  const scaleMatch = escala.titulo.match(/\d+/)
  const currentScale = scaleMatch ? parseInt(scaleMatch[0], 10) : null

  const excedente = escala.escalera?.excedente
  const baseEnUMA = escala.baseEnUMA

  return (
    <div className="flex h-full flex-col rounded-2xl border border-border bg-card px-6 pb-6 pt-6 md:px-8 md:pb-8 md:pt-8">
      <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.16em] text-foreground/70">
        Tabla Art. 21
      </p>

      <div className="min-w-0 flex-1 overflow-x-auto">
        <table className="w-full border-collapse font-mono text-[11px]">
          <thead>
            <tr className="border-b border-border/50 text-[10px] uppercase tracking-wider text-muted-foreground/50">
              <th className="pb-2 text-left font-medium">Escala</th>
              <th className="pb-2 text-right font-medium">MAX (Excedente)</th>
              <th className="pb-2 text-right font-medium">UMA (Rango)</th>
              <th className="pb-2 text-right font-medium">Alicuotas</th>
            </tr>
          </thead>
          <tbody>
            {ESCALAS_ART21.map((row) => {
              const isActive = row.num === currentScale
              return (
                <tr
                  key={row.num}
                  className={
                    isActive
                      ? "border-l-4 border-accent-foreground bg-accent/10 font-bold text-foreground"
                      : "text-muted-foreground/40"
                  }
                >
                  <td className="py-2 pr-4 text-left">
                    {row.num}
                    {isActive && (
                      <span className="ml-2 rounded-full bg-accent-foreground/10 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-accent-foreground">
                        Aplicable
                      </span>
                    )}
                  </td>
                  <td className="py-2 text-right">
                    {isActive && excedente != null ? excedente.toFixed(0) : row.max}
                  </td>
                  <td className="py-2 text-right">
                    {isActive && baseEnUMA ? `${baseEnUMA.toFixed(0)} UMA` : `${row.rango} UMA`}
                  </td>
                  <td className="py-2 text-right whitespace-nowrap">
                    {isActive
                      ? `${pct(escala.porcentajeMinAplicado)} a ${pct(escala.porcentajeMaxAplicado)}`
                      : `${row.minPct}% a ${row.maxPct}%`}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
