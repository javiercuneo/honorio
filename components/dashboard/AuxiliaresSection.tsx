import { Scale } from "lucide-react"
import { FormattedAmount } from "./FormattedAmount"
import { umas } from "./format"
import type { Rango } from "@/lib/legal/types"

interface AuxiliaresSectionProps {
  rango: Rango
}

export function AuxiliaresSection({ rango }: AuxiliaresSectionProps) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <div className="h-px flex-1 bg-border" />
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/40">
          Auxiliares de justicia
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="rounded-2xl border border-dashed border-border bg-card/50 p-5 md:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted/40">
            <Scale className="h-4 w-4 text-muted-foreground/60" />
          </div>
          <div className="flex-1">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground/60">
              Regulacion de auxiliares
            </p>
            <div className="mt-2 flex items-end gap-6">
              <div>
                <FormattedAmount value={rango.minPesos} />
                <p className="mt-0.5 font-mono text-[11px] text-muted-foreground/50">
                  {umas(rango.minUMA)} minimo
                </p>
              </div>
              <div>
                <FormattedAmount value={rango.maxPesos} />
                <p className="mt-0.5 font-mono text-[11px] text-muted-foreground/50">
                  {umas(rango.maxUMA)} maximo
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
