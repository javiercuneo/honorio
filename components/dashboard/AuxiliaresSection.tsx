import { pesos, formatNumberImpactful } from "./format"
import type { Rango } from "@/lib/legal/types"

interface AuxiliaresSectionProps {
  rango: Rango
  esProvisorio?: boolean
}

export function AuxiliaresSection({ rango, esProvisorio }: AuxiliaresSectionProps) {
  return (
    <div className="rounded-2xl border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse font-mono text-[12px]">
          <thead>
            <tr className="border-b border-border/50 text-[10px] uppercase tracking-wider text-muted-foreground/50">
              <th className="px-4 py-3 text-left font-medium">Auxiliares de justicia</th>
              <th className="px-4 py-3 text-right font-medium">Monto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            <tr>
              <td className="px-4 py-3 text-left text-muted-foreground">
                {esProvisorio ? "Mínimo" : "Rango"}
              </td>
              <td className="px-4 py-3">
                <div className="text-right">
                  <div className="whitespace-nowrap font-mono text-[12px]">
                    <span className="text-value-min" title={pesos(rango.minPesos)}>
                      {formatNumberImpactful(rango.minPesos).abrev}
                    </span>
                    {!esProvisorio && (
                      <>
                        {" / "}
                        <span className="text-value-max" title={pesos(rango.maxPesos)}>
                          {formatNumberImpactful(rango.maxPesos).abrev}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="whitespace-nowrap text-[10px] font-mono text-muted-foreground/70">
                    {rango.minUMA.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} UMA
                    {!esProvisorio && (
                      <>
                        {" / "}
                        {rango.maxUMA.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{" "}
                        UMA
                      </>
                    )}
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
