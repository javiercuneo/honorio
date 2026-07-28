'use client'

import { useState, useCallback, useMemo } from "react"
import { ChevronDown, Gavel, User, Briefcase, Scale } from "lucide-react"
import { cn } from "@/lib/utils"
import { FormattedAmount } from "./FormattedAmount"
import { pesos, umas } from "./format"
import type { Rango, Transformacion, SegundaInstanciaRol } from "@/lib/legal/types"

interface ProfessionalCardProps {
  rol: "patrocinante" | "apoderado" | "procurador"
  label: string
  rango: Rango
  transformaciones?: Transformacion[]
  segundaInstancia?: SegundaInstanciaRol
}

const ICON_MAP: Record<string, typeof Gavel> = {
  patrocinante: Gavel,
  apoderado: User,
  procurador: Briefcase,
}

type EtapaKey = "1" | "2" | "completo"

const ETAPA_CONFIG: Record<EtapaKey, { factor: number; label: string }> = {
  "1": { factor: 1/3, label: "1\u00aa Etapa (1/3)" },
  "2": { factor: 2/3, label: "2 Etapas (2/3)" },
  "completo": { factor: 1, label: "Juicio Completo (3/3)" },
}

const ETAPA_ORDER: EtapaKey[] = ["1", "2", "completo"]

export function ProfessionalCard({
  rol,
  label,
  rango,
  transformaciones,
  segundaInstancia,
}: ProfessionalCardProps) {
  const [etapa, setEtapa] = useState<EtapaKey>("completo")
  const [pctSlider, setPctSlider] = useState(100)
  const [detalleOpen, setDetalleOpen] = useState(false)
  const [segundaOpen, setSegundaOpen] = useState(false)

  const Icon = ICON_MAP[rol] ?? Gavel

  const handleSlider = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPctSlider(Number(e.target.value))
  }, [])

  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Math.min(100, Math.max(0, Number(e.target.value) || 0))
    setPctSlider(v)
  }, [])

  const proportional = useMemo(() => {
    const cfg = ETAPA_CONFIG[etapa]
    const sliderFrac = pctSlider / 100
    const stageFactor = cfg.factor * sliderFrac

    return {
      minPesos: rango.minPesos * stageFactor,
      maxPesos: rango.maxPesos * stageFactor,
      minUMA: rango.minUMA * stageFactor,
      maxUMA: rango.maxUMA * stageFactor,
    }
  }, [etapa, pctSlider, rango])

  return (
    <div className="rounded-2xl border border-border bg-card transition-colors hover:border-accent/20">
      <div className="px-5 pb-4 pt-5 md:px-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/15">
              <Icon className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                {label}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 text-right">
            <div>
              <p className="font-mono text-xl font-medium leading-none text-emerald-600 dark:text-emerald-400">
                {abrev(rango.minPesos)}
              </p>
              <p className="mt-0.5 font-mono text-[10px] text-emerald-600/70 dark:text-emerald-400/70">minimo</p>
            </div>
            <div>
              <p className="font-mono text-xl font-medium leading-none text-indigo-600 dark:text-indigo-400">
                {abrev(rango.maxPesos)}
              </p>
              <p className="mt-0.5 font-mono text-[10px] text-indigo-600/70 dark:text-indigo-400/70">maximo</p>
            </div>
          </div>
        </div>

        <div className="mt-2 flex items-end gap-6 pl-[3.25rem]">
          <div>
            <p className="font-mono text-[11px] text-muted-foreground">{pesos(rango.minPesos)}</p>
            <p className="font-mono text-[10px] text-muted-foreground/50">{umas(rango.minUMA)} minimo</p>
          </div>
          <div>
            <p className="font-mono text-[11px] text-muted-foreground">{pesos(rango.maxPesos)}</p>
            <p className="font-mono text-[10px] text-muted-foreground/50">{umas(rango.maxUMA)} maximo</p>
          </div>
        </div>

        <div className="mt-4 pl-[3.25rem]">
          <div className="flex overflow-hidden rounded-lg border border-border">
            {ETAPA_ORDER.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setEtapa(key)}
                className={cn(
                  "flex-1 px-3 py-1.5 font-mono text-[11px] transition-colors",
                  etapa === key
                    ? "bg-accent text-accent-foreground"
                    : "bg-card text-muted-foreground hover:bg-muted/30"
                )}
              >
                {ETAPA_CONFIG[key].label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3 pl-[3.25rem]">
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/50">
            Calcular porcentaje de una etapa
          </span>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={0}
              max={100}
              value={pctSlider}
              onChange={handleSlider}
              className="h-1 w-20 cursor-pointer appearance-none rounded-full bg-muted accent-accent-foreground md:w-24"
            />
            <input
              type="number"
              min={0}
              max={100}
              value={pctSlider}
              onChange={handleInput}
              className="w-12 rounded-md border border-border bg-card px-1.5 py-1 text-center font-mono text-[12px] text-foreground outline-none focus:border-accent-foreground"
            />
            <span className="font-mono text-[11px] text-muted-foreground">%</span>
          </div>
        </div>

        {(etapa !== "completo" || pctSlider < 100) && (
          <div className="mt-3 rounded-xl border border-border/60 bg-muted/20 p-3 pl-[3.25rem]">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/50">
              Resultado proporcional
            </p>
            <div className="mt-1.5 flex items-center gap-6">
              <div>
                <p className="font-mono text-[13px] font-medium text-emerald-600 dark:text-emerald-400">
                  {abrev(proportional.minPesos)}
                </p>
                <p className="font-mono text-[10px] text-muted-foreground/60">
                  {umas(proportional.minUMA)} minimo
                </p>
              </div>
              <div>
                <p className="font-mono text-[13px] font-medium text-indigo-600 dark:text-indigo-400">
                  {abrev(proportional.maxPesos)}
                </p>
                <p className="font-mono text-[10px] text-muted-foreground/60">
                  {umas(proportional.maxUMA)} maximo
                </p>
              </div>
            </div>
            <p className="mt-1 font-mono text-[10px] text-muted-foreground/40">
              {etapa === "completo" ? "Cien por ciento del juicio" : `${ETAPA_CONFIG[etapa].label}: ${pctSlider}%`}
            </p>
          </div>
        )}
      </div>

      <div className="border-t border-border">
        <button
          type="button"
          onClick={() => setSegundaOpen((v) => !v)}
          className="flex w-full items-center gap-2 px-5 py-2.5 text-left transition-colors hover:bg-muted/20 md:px-6"
        >
          <Scale className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="flex-1 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            Segunda instancia &mdash; Art. 30
          </span>
          {segundaInstancia && (
            <span className="font-mono text-[10px] text-muted-foreground/50">
              {pesos(segundaInstancia.minimo.minPesos)} &ndash; {pesos(segundaInstancia.maximo.maxPesos)}
            </span>
          )}
          <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", segundaOpen && "rotate-180")} />
        </button>

        {segundaOpen && segundaInstancia && (
          <div className="border-t border-border px-5 pb-3 pt-3 md:px-6">
            <div className="overflow-hidden rounded-lg border border-border/50">
              <table className="w-full border-collapse font-mono text-[11px]">
                <thead>
                  <tr className="bg-muted/20">
                    <th className="px-3 py-1.5 text-left font-medium text-muted-foreground">Concepto</th>
                    <th className="px-3 py-1.5 text-right font-medium text-muted-foreground">Pesos</th>
                    <th className="px-3 py-1.5 text-right font-medium text-muted-foreground">UMA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  <tr>
                    <td className="px-3 py-1.5 text-muted-foreground">Minimo</td>
                    <td className="px-3 py-1.5 text-right text-foreground">{pesos(segundaInstancia.minimo.minPesos)}</td>
                    <td className="px-3 py-1.5 text-right text-muted-foreground">{umas(segundaInstancia.minimo.minUMA)}</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-1.5 text-muted-foreground">Maximo</td>
                    <td className="px-3 py-1.5 text-right text-foreground">{pesos(segundaInstancia.maximo.maxPesos)}</td>
                    <td className="px-3 py-1.5 text-right text-muted-foreground">{umas(segundaInstancia.maximo.maxUMA)}</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-1.5 text-muted-foreground">Revocada</td>
                    <td className="px-3 py-1.5 text-right text-foreground">{pesos(segundaInstancia.revocada.maxPesos)}</td>
                    <td className="px-3 py-1.5 text-right text-muted-foreground">{umas(segundaInstancia.revocada.maxUMA)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {transformaciones && transformaciones.length > 0 && (
          <>
            <button
              type="button"
              onClick={() => setDetalleOpen((v) => !v)}
              className="flex w-full items-center gap-2 border-t border-border px-5 py-2.5 text-left transition-colors hover:bg-muted/20 md:px-6"
            >
              <span className="flex-1 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                Ver detalle del calculo
              </span>
              <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", detalleOpen && "rotate-180")} />
            </button>

            {detalleOpen && (
              <div className="border-t border-border px-5 pb-4 pt-3 md:px-6">
                <div className="space-y-2">
                  {transformaciones.map((tx) => (
                    <div key={tx.id} className="rounded-lg bg-muted/20 px-3 py-2">
                      <p className="font-mono text-[12px] font-medium text-foreground">{tx.concepto}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 font-mono text-[11px] text-muted-foreground">
                        <span>{pesos(tx.valorPrevio)}</span>
                        <span className="text-muted-foreground/40">&rarr;</span>
                        <span className="font-medium text-foreground">{pesos(tx.valorPosterior)}</span>
                        <span className="text-muted-foreground/30">&middot;</span>
                        <span>Factor: {tx.factor}</span>
                        {tx.articulo && (
                          <>
                            <span className="text-muted-foreground/30">&middot;</span>
                            <span>{tx.articulo}</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function abrev(value: number): string {
  if (!isFinite(value) || value === 0) return "$0"
  if (value >= 1_000_000_000) return "$" + (value / 1_000_000_000).toFixed(1).replace(".0", "") + "B"
  if (value >= 1_000_000) return "$" + (value / 1_000_000).toFixed(1).replace(".0", "") + "M"
  return "$" + value.toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}
