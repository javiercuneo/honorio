import { pesos, formatNumberImpactful } from "./format"
import type { Partidor } from "@/lib/legal/types"

interface PartidorSectionProps {
  partidor: Partidor
  esProvisorio?: boolean
}

function uma(value: number): string {
  if (!isFinite(value)) return "N/A"
  return value.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function PartidorSection({ partidor, esProvisorio }: PartidorSectionProps) {
  return (
    <div className="rounded-2xl border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse font-mono text-[12px]">
          <thead>
            <tr className="border-b border-border/50 text-[10px] uppercase tracking-wider text-muted-foreground/50">
              <th className="px-4 py-3 text-left font-medium">Partidor (Art. 35)</th>
              <th className="px-4 py-3 text-right font-medium">Monto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            <tr>
              <td className="px-4 py-3 text-left text-muted-foreground">
                Mínimo ({partidor.minPorcentaje}%)
              </td>
              <td className="px-4 py-3">
                <div className="text-right">
                  <div className="whitespace-nowrap font-mono text-[12px]">
                    <span className="text-value-min" title={pesos(partidor.minPesos)}>
                      {formatNumberImpactful(partidor.minPesos).abrev}
                    </span>
                  </div>
                  <div className="whitespace-nowrap text-[10px] font-mono text-muted-foreground/70">
                    {partidor.minUMA.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{" "}
                    UMA
                  </div>
                </div>
              </td>
            </tr>
            {!esProvisorio && (
              <tr>
                <td className="px-4 py-3 text-left text-muted-foreground">
                  Máximo ({partidor.maxPorcentaje}%)
                </td>
                <td className="px-4 py-3">
                  <div className="text-right">
                    <div className="whitespace-nowrap font-mono text-[12px]">
                      <span className="text-value-max" title={pesos(partidor.maxPesos)}>
                        {formatNumberImpactful(partidor.maxPesos).abrev}
                      </span>
                    </div>
                    <div className="whitespace-nowrap text-[10px] font-mono text-muted-foreground/70">
                      {partidor.maxUMA.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{" "}
                      UMA
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
