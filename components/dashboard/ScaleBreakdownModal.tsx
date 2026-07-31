"use client"

import { useEffect } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { EscalaAplicada } from "@/lib/legal/types"
import { umaNum, pct } from "./format"
import { Etiqueta } from "./primitives"
import { ESCALAS_ART21, tramoDe } from "./ReglaArt21"

interface ScaleBreakdownModalProps {
  isOpen: boolean
  onClose: () => void
  escala: EscalaAplicada
}

export function ScaleBreakdownModal({
  isOpen,
  onClose,
  escala,
}: ScaleBreakdownModalProps) {
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const activo = tramoDe(escala.baseEnUMA)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Escala del articulo 21"
      onClick={onClose}
    >
      <div
        className="max-h-[88vh] w-full max-w-xl overflow-y-auto rounded-lg border border-border bg-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-4">
          <div className="flex items-baseline gap-2.5">
            <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground">
              Escala arancelaria
            </h3>
            <span className="font-mono text-[10px] uppercase tracking-wider text-faint">
              art. 21
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-sm p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 py-5">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="pb-2 text-left">
                  <Etiqueta>Base en UMA</Etiqueta>
                </th>
                <th className="pb-2 text-right">
                  <Etiqueta>Alicuota del tramo</Etiqueta>
                </th>
              </tr>
            </thead>
            <tbody>
              {ESCALAS_ART21.map((t) => {
                const activa = t.n === activo.n
                return (
                  <tr
                    key={t.n}
                    className={cn(
                      "border-t border-hair font-mono text-[12px] tabular-nums",
                      activa
                        ? "bg-axis-escala-tint text-axis-escala-tint-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    <td className="px-2 py-2 text-left">
                      {t.n}
                      <span className="mx-2 text-faint">·</span>
                      {t.label}
                    </td>
                    <td className="px-2 py-2 text-right">
                      {pct(t.min)} a {pct(t.max)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          <div className="mt-5 space-y-3 border-t border-hair pt-4 text-[13px] leading-relaxed text-muted-foreground">
            <p className="font-law text-[15px] leading-relaxed">
              &ldquo;En ningun caso los honorarios podran ser inferiores al
              maximo del grado inmediato anterior de la escala, con mas el
              incremento por aplicacion al excedente de la alicuota que
              corresponde al grado siguiente.&rdquo;
            </p>
            <p>
              Es la regla del excedente. Por eso la alicuota del tramo no se
              aplica a toda la base: se toma como piso el maximo que acumula el
              grado anterior y solo lo que excede ese limite tributa la alicuota
              del tramo en curso.
            </p>
            {escala.escalera ? (
              <p>
                En este caso el piso es{" "}
                <span className="font-mono tabular-nums text-foreground">
                  {umaNum(escala.escalera.maximoEscalaAnterior)} UMA
                </span>{" "}
                —el maximo hasta{" "}
                {umaNum(escala.escalera.limiteAnterior, 0)} UMA— y el excedente
                sujeto a alicuota es de{" "}
                <span className="font-mono tabular-nums text-foreground">
                  {umaNum(escala.escalera.excedente)} UMA
                </span>
                .
              </p>
            ) : (
              <p>
                La base de este calculo cae en el primer tramo, de modo que no
                hay grado anterior que acumular: la alicuota se aplica sobre el
                total.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
