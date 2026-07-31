"use client"

import { X } from "lucide-react"
import type { EscalaAplicada } from "@/lib/legal/types"

interface ScaleBreakdownModalProps {
  isOpen: boolean
  onClose: () => void
  escala: EscalaAplicada
}

const ESCALAS_ART21 = [
  { rango: "Hasta 15 UMA", minPct: 22, maxPct: 33 },
  { rango: "16 a 45 UMA", minPct: 20, maxPct: 26 },
  { rango: "46 a 90 UMA", minPct: 18, maxPct: 24 },
  { rango: "91 a 150 UMA", minPct: 17, maxPct: 22 },
  { rango: "151 a 450 UMA", minPct: 15, maxPct: 20 },
  { rango: "451 a 750 UMA", minPct: 13, maxPct: 17 },
  { rango: "Más de 751 UMA", minPct: 12, maxPct: 15 },
]

function pct(v: number): string {
  return v + "%"
}

export function ScaleBreakdownModal({ isOpen, onClose, escala }: ScaleBreakdownModalProps) {
  if (!isOpen) return null

  const scaleMatch = escala.titulo.match(/\d+/)
  const currentScaleNum = scaleMatch ? parseInt(scaleMatch[0], 10) : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card p-6 md:p-8">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-foreground">Desglose de Escala (Art. 21)</h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-muted"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <div className="mt-4 space-y-4 text-[13px] leading-relaxed text-muted-foreground">
          <p>
            La escala del artículo 21 se aplica por tramos: cada grado toma el máximo
            acumulado del grado anterior y le suma la alícuota del tramo actual sobre el excedente.
          </p>

          {escala.escalera && escala.escalera.maximoEscalaAnterior > 0 ? (
            <p>
              En este caso, el grado inmediato anterior acumula{" "}
              <span className="font-medium text-foreground">
                {escala.escalera.maximoEscalaAnterior.toFixed(2)} UMA
              </span>{" "}
              hasta{" "}
              <span className="font-medium text-foreground">
                {escala.escalera.limiteAnterior.toFixed(0)} UMA
              </span>
              . La base de este cálculo excede ese límite en{" "}
              <span className="font-medium text-foreground">
                {escala.escalera.excedente.toFixed(2)} UMA
              </span>
              , que es lo que se regula a la alícuota del tramo{" "}
              <span className="font-medium">{escala.titulo.split(":")[0]}</span>.
            </p>
          ) : (
            <p>
              Esta base cae dentro del primer tramo de la escala, por lo que no hay excedente de
              un grado anterior que sumar.
            </p>
          )}
        </div>

        <div className="mt-6 overflow-x-auto rounded-xl border border-border/60">
          <table className="w-full border-collapse font-mono text-[11px]">
            <thead>
              <tr className="border-b border-border/50 text-[10px] uppercase tracking-wider text-muted-foreground/50">
                <th className="px-3 py-2 text-left font-medium">Rango de UMA</th>
                <th className="px-3 py-2 text-right font-medium">Alícuotas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {ESCALAS_ART21.map((row, idx) => {
                const isActive = idx + 1 === currentScaleNum
                return (
                  <tr
                    key={idx}
                    className={
                      isActive
                        ? "border-l-2 border-axis-escala bg-axis-escala-tint font-semibold text-axis-escala-tint-foreground"
                        : "text-muted-foreground/60"
                    }
                  >
                    <td className="whitespace-nowrap px-3 py-2 text-left">{row.rango}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-right">
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

        <div className="mt-4 rounded-lg border border-border/40 bg-muted/20 p-3 text-[12px] text-muted-foreground">
          <span className="font-medium text-foreground">Tu caso:</span> Base de{" "}
          <span className="font-medium text-foreground">{escala.baseEnUMA.toFixed(0)} UMA</span>{" "}
          aplica alícuota de {pct(escala.porcentajeMinAplicado)} a {pct(escala.porcentajeMaxAplicado)}
        </div>
      </div>
    </div>
  )
}
