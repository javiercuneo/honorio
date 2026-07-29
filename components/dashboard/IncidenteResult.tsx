import { pesos, umas } from "./format"
import type { CalculoResultado } from "@/lib/legal/types"

interface IncidenteResultProps {
  resultado: CalculoResultado
}

export function IncidenteResult({ resultado }: IncidenteResultProps) {
  const inc = resultado.incidente
  const rango = resultado.honorarios.patrocinante.rango
  if (!inc) return null

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="rounded-2xl border border-border bg-card px-6 pb-6 pt-6 md:px-8 md:pb-8 md:pt-8">
        <h2 className="text-xl font-bold text-foreground">Incidente &mdash; Art. 29 inc. g</h2>
        <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
          Base: {pesos(resultado.baseFinal)} &middot; UMA: {pesos(resultado.valorUMA)}
        </p>

        <div className="mt-6 overflow-hidden rounded-xl border border-border">
          <table className="w-full border-collapse font-mono text-[13px]">
            <thead>
              <tr className="border-b border-border/50 bg-muted/20 text-[10px] uppercase tracking-wider text-muted-foreground/60">
                <th className="px-4 py-2.5 text-left font-medium">Concepto</th>
                <th className="px-4 py-2.5 text-right font-medium">UMA</th>
                <th className="px-4 py-2.5 text-right font-medium">Pesos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              <tr>
                <td className="px-4 py-3 text-left text-foreground">
                  Mínimo ({inc.porcentajeMin}%)
                </td>
                <td className="px-4 py-3 text-right text-muted-foreground">
                  {umas(rango.minUMA)}
                </td>
                <td className="px-4 py-3 text-right font-medium text-value-min">
                  {pesos(rango.minPesos)}
                </td>
              </tr>
              {!resultado.esProvisorio && (
                <tr>
                  <td className="px-4 py-3 text-left text-foreground">
                    Máximo ({inc.porcentajeMax}%)
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    {umas(rango.maxUMA)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-value-max">
                    {pesos(rango.maxPesos)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <details className="group mt-5">
          <summary className="cursor-pointer font-mono text-[11px] uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground">
            Ver texto del artículo
          </summary>
          <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
            Según el inciso g) del art. 29, "los incidentes se dividirán en 2 etapas;
            la primera se compone del planteo que lo origine, sea verbal o escrito, y
            la segunda, del desarrollo hasta su conclusión".
          </p>
        </details>
      </div>
    </div>
  )
}
