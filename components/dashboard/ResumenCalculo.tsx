import { Scale, TrendingDown } from "lucide-react"
import { pesos, umas, porcentaje, PROCESO_LABEL, TERMINACION_LABEL, SENTENCIA_LABEL, OBJETO_LABEL } from "./format"
import { FormattedAmount } from "./FormattedAmount"
import type { ProcesoTipo } from "@/lib/legal/types"

interface ResumenCalculoProps {
  tipoProceso: ProcesoTipo
  modoTerminacion?: string
  sentenciaResultado?: string
  esProvisorio: boolean
  objetoBase?: string
  baseOriginal: number
  baseFinal: number
  valorUMA: number
}

export function ResumenCalculo({
  tipoProceso,
  modoTerminacion,
  sentenciaResultado,
  esProvisorio,
  objetoBase,
  baseOriginal,
  baseFinal,
  valorUMA,
}: ResumenCalculoProps) {
  const label = PROCESO_LABEL[tipoProceso] ?? tipoProceso
  const terminacionLabel = modoTerminacion ? TERMINACION_LABEL[modoTerminacion] : null
  const sentenciaLabel = sentenciaResultado ? SENTENCIA_LABEL[sentenciaResultado] : null
  const objetoLabel = objetoBase ? OBJETO_LABEL[objetoBase] ?? objetoBase : null
  const baseEnUMA = valorUMA > 0 ? baseFinal / valorUMA : 0
  const tieneReduccion = baseOriginal > 0 && Math.abs(baseFinal - baseOriginal) / baseOriginal > 0.001
  const pctReduccion = baseOriginal > 0 ? (1 - baseFinal / baseOriginal) : 0

  return (
    <div className="flex h-full flex-col rounded-2xl border border-border bg-card px-6 pb-6 pt-6 md:px-8 md:pb-8 md:pt-8">
      <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.16em] text-foreground/70">
        Caratula del Expediente
      </p>

      <div className="flex flex-wrap items-start gap-2">
        <span className="inline-flex items-center gap-2 rounded-lg border border-border bg-accent/10 px-3.5 py-1.5 font-mono text-[12px] font-medium uppercase tracking-[0.16em] text-accent-foreground">
          <Scale className="h-3.5 w-3.5" />
          {label}
        </span>
        {objetoLabel && (
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/20 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            {objetoLabel}
          </span>
        )}
        {terminacionLabel && (
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/30 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            {terminacionLabel}
          </span>
        )}
        {sentenciaLabel && (
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/30 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            {sentenciaLabel}
          </span>
        )}
        {esProvisorio && (
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300">
            Provisorio
          </span>
        )}
      </div>

      <div className="mt-6 flex-1 space-y-6">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            Base regulatoria
          </p>
          <FormattedAmount value={baseFinal} className="mt-1.5 block text-2xl leading-none" />
          <p className="mt-0.5 font-mono text-[12px] text-muted-foreground">{umas(baseEnUMA)}</p>
          {tieneReduccion && (
            <div className="mt-1.5 flex items-center gap-1.5">
              <TrendingDown className="h-3.5 w-3.5 text-amber-600" />
              <span className="font-mono text-[12px] text-amber-600">{porcentaje(pctReduccion)}</span>
              <span className="font-mono text-[11px] text-muted-foreground line-through">{pesos(baseOriginal)}</span>
            </div>
          )}
        </div>

        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground/50">
            Valor UMA
          </p>
          <p className="mt-0.5 font-mono text-xs text-muted-foreground">{pesos(valorUMA)}</p>
        </div>
      </div>
    </div>
  )
}
