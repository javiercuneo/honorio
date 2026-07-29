import { Split } from "lucide-react"
import { FormattedAmount } from "./FormattedAmount"
import { umas } from "./format"
import type { Partidor } from "@/lib/legal/types"

interface PartidorSectionProps {
  partidor: Partidor
  esProvisorio?: boolean
}

export function PartidorSection({ partidor, esProvisorio }: PartidorSectionProps) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <div className="h-px flex-1 bg-border" />
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/40">
          Honorarios del partidor · Art. 35
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="rounded-2xl border border-dashed border-border bg-card/50 p-5 md:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted/40">
            <Split className="h-4 w-4 text-muted-foreground/60" />
          </div>
          <div className="flex-1">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground/60">
              Regulacion del partidor
            </p>
            <div className="mt-2 flex items-end gap-6">
              <div>
                <FormattedAmount value={partidor.minPesos} />
                <p className="mt-0.5 font-mono text-[11px] text-muted-foreground/50">
                  {umas(partidor.minUMA)} · {partidor.minPorcentaje}% minimo
                </p>
              </div>
              {!esProvisorio && (
                <div>
                  <FormattedAmount value={partidor.maxPesos} />
                  <p className="mt-0.5 font-mono text-[11px] text-muted-foreground/50">
                    {umas(partidor.maxUMA)} · {partidor.maxPorcentaje}% maximo
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
