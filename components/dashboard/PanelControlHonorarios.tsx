"use client"

import { useState, useCallback } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { pesos, formatNumberImpactful } from "./format"
import type { Rango, Transformacion, SegundaInstanciaRol } from "@/lib/legal/types"

interface RoleEntry {
  rol: "patrocinante" | "apoderado" | "procurador"
  label: string
  rango: Rango
  transformaciones?: Transformacion[]
  segundaInstancia?: SegundaInstanciaRol
}

interface PanelControlHonorariosProps {
  roles: RoleEntry[]
  esProvisorio?: boolean
}

type EtapaKey = "2" | "1"

const ETAPA_CONFIG: Record<EtapaKey, { factor: number; label: string }> = {
  "2": { factor: 2 / 3, label: "Dos etapas (2/3)" },
  "1": { factor: 1 / 3, label: "Una etapa (1/3)" },
}

const ETAPA_TX_BORDER: Record<Transformacion["etapa"], string> = {
  base: "border-l-axis-base",
  escala: "border-l-axis-escala",
  honorarios: "border-l-axis-honorarios",
}

interface RoleState {
  detalleOpen: boolean
}

function RealValue({ value }: { value: number }) {
  return (
    <span title={pesos(value)} className="cursor-help">
      {formatNumberImpactful(value).abrev}
    </span>
  )
}

function ValorCell({
  minP,
  maxP,
  minU,
  maxU,
  esProvisorio,
}: {
  minP: number
  maxP: number
  minU: number
  maxU: number
  esProvisorio?: boolean
}) {
  const minAbrev = formatNumberImpactful(minP)
  const maxAbrev = formatNumberImpactful(maxP)

  return (
    <div className="text-right">
      <div className="whitespace-nowrap font-mono text-[12px]">
        <span className="text-value-min" title={minAbrev.full}>
          {minAbrev.abrev}
        </span>
        {!esProvisorio && (
          <>
            {" / "}
            <span className="text-value-max" title={maxAbrev.full}>
              {maxAbrev.abrev}
            </span>
          </>
        )}
      </div>
      <div className="whitespace-nowrap text-[10px] font-mono text-muted-foreground/70">
        {minU.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} UMA
        {!esProvisorio && (
          <>
            {" / "}
            {maxU.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{" "}
            UMA
          </>
        )}
      </div>
    </div>
  )
}

export function PanelControlHonorarios({ roles, esProvisorio }: PanelControlHonorariosProps) {
  const [visibleRoles, setVisibleRoles] = useState<Set<string>>(
    () => new Set([roles[0]?.rol || "patrocinante"])
  )
  const [showEtapas, setShowEtapas] = useState(false)
  const [showSegundaInstancia, setShowSegundaInstancia] = useState(false)
  const [roleStates, setRoleStates] = useState<Record<string, RoleState>>(() => {
    const states: Record<string, RoleState> = {}
    for (const r of roles) {
      states[r.rol] = { detalleOpen: false }
    }
    return states
  })

  const toggleRole = useCallback((key: string) => {
    setVisibleRoles((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }, [])

  const updateState = useCallback((rol: string, patch: Partial<RoleState>) => {
    setRoleStates((prev) => ({
      ...prev,
      [rol]: { ...prev[rol], ...patch },
    }))
  }, [])

  const visibleEntries = roles.filter((r) => visibleRoles.has(r.rol))
  const hasSegundaInstancia = roles.some((r) => r.segundaInstancia)
  const hasTransformaciones = roles.some((r) => r.transformaciones && r.transformaciones.length > 0)

  if (visibleEntries.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4 md:px-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-foreground/70">
            Honorarios
          </p>
          <div className="flex flex-wrap gap-2">
            {roles.map((entry) => (
              <button
                key={entry.rol}
                type="button"
                onClick={() => toggleRole(entry.rol)}
                className="rounded-full border border-accent/30 bg-card px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-foreground transition-colors"
              >
                {entry.label}
              </button>
            ))}
          </div>
        </div>
        <div className="px-6 py-10 text-center">
          <p className="font-mono text-[11px] text-muted-foreground">
            Seleccione un rol para ver honorarios
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-border bg-card">
      {/* Header con botones de rol */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4 md:px-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-foreground/70">
          Honorarios
        </p>
        <div className="flex flex-wrap gap-2">
          {roles.map((entry) => {
            const active = visibleRoles.has(entry.rol)
            return (
              <button
                key={entry.rol}
                type="button"
                onClick={() => toggleRole(entry.rol)}
                className={cn(
                  "rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-wider transition-colors",
                  active
                    ? "border-accent/30 bg-card text-foreground"
                    : "border-transparent bg-muted/30 text-muted-foreground/40 line-through"
                )}
              >
                {entry.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* SECCIÓN 1: Rango principal */}
      <div className="overflow-x-auto border-b border-border">
        <table className="w-full border-collapse font-mono text-[12px]">
          <tbody>
            <tr>
              <td className="px-4 py-3 text-left text-muted-foreground font-medium">
                {esProvisorio ? "Mínimo" : "Rango"}
              </td>
              {visibleEntries.map((r) => (
                <td key={r.rol} className="px-4 py-3">
                  <ValorCell
                    minP={r.rango.minPesos}
                    maxP={r.rango.maxPesos}
                    minU={r.rango.minUMA}
                    maxU={r.rango.maxUMA}
                    esProvisorio={esProvisorio}
                  />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* SECCIÓN 2: Por Etapa (colapsable) */}
      {!esProvisorio && (
        <div className="border-b border-border">
          <button
            onClick={() => setShowEtapas(!showEtapas)}
            className="w-full px-4 py-3 flex items-center justify-between font-mono text-[11px] uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
          >
            <span>Por etapa</span>
            {showEtapas ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {showEtapas && (
            <div className="overflow-x-auto bg-muted/10">
              <table className="w-full border-collapse border-t border-border/30 font-mono text-[12px]">
                <tbody className="divide-y divide-border/30">
                  {Object.entries(ETAPA_CONFIG).map(([key, cfg]) => (
                    <tr key={key}>
                      <td className="px-4 py-3 text-left text-muted-foreground text-[11px]">
                        {cfg.label}
                      </td>
                      {visibleEntries.map((r) => (
                        <td key={r.rol} className="px-4 py-3">
                          <ValorCell
                            minP={r.rango.minPesos * cfg.factor}
                            maxP={r.rango.maxPesos * cfg.factor}
                            minU={r.rango.minUMA * cfg.factor}
                            maxU={r.rango.maxUMA * cfg.factor}
                            esProvisorio={esProvisorio}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SECCIÓN 3: Segunda Instancia (colapsable) */}
      {hasSegundaInstancia && (
        <div className="border-b border-border">
          <button
            onClick={() => setShowSegundaInstancia(!showSegundaInstancia)}
            className="w-full px-4 py-3 flex items-center justify-between font-mono text-[11px] uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
          >
            <span>Segunda Instancia (Art. 30)</span>
            {showSegundaInstancia ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {showSegundaInstancia && (
            <div className="overflow-x-auto bg-muted/10">
              <table className="w-full border-collapse border-t border-border/30 font-mono text-[12px]">
                <tbody className="divide-y divide-border/30">
                  <tr>
                    <td className="px-4 py-3 text-left text-muted-foreground text-[11px]">
                      Mínimo (30%)
                    </td>
                    {visibleEntries.map((r) => (
                      <td key={r.rol} className="px-4 py-3">
                        {r.segundaInstancia ? (
                          <ValorCell
                            minP={r.segundaInstancia.minimo.minPesos}
                            maxP={r.segundaInstancia.minimo.minPesos}
                            minU={r.segundaInstancia.minimo.minUMA}
                            maxU={r.segundaInstancia.minimo.minUMA}
                            esProvisorio
                          />
                        ) : (
                          <span className="text-[10px] text-muted-foreground/50">&mdash;</span>
                        )}
                      </td>
                    ))}
                  </tr>
                  {!esProvisorio && (
                    <>
                      <tr>
                        <td className="px-4 py-3 text-left text-muted-foreground text-[11px]">
                          Máximo (35%)
                        </td>
                        {visibleEntries.map((r) => (
                          <td key={r.rol} className="px-4 py-3">
                            {r.segundaInstancia ? (
                              <ValorCell
                                minP={r.segundaInstancia.maximo.maxPesos}
                                maxP={r.segundaInstancia.maximo.maxPesos}
                                minU={r.segundaInstancia.maximo.maxUMA}
                                maxU={r.segundaInstancia.maximo.maxUMA}
                                esProvisorio
                              />
                            ) : (
                              <span className="text-[10px] text-muted-foreground/50">&mdash;</span>
                            )}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-left text-muted-foreground text-[11px]">
                          Revocada (40%)
                        </td>
                        {visibleEntries.map((r) => (
                          <td key={r.rol} className="px-4 py-3">
                            {r.segundaInstancia ? (
                              <ValorCell
                                minP={r.segundaInstancia.revocada.maxPesos}
                                maxP={r.segundaInstancia.revocada.maxPesos}
                                minU={r.segundaInstancia.revocada.maxUMA}
                                maxU={r.segundaInstancia.revocada.maxUMA}
                                esProvisorio
                              />
                            ) : (
                              <span className="text-[10px] text-muted-foreground/50">&mdash;</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SECCIÓN 4: Detalle de Transformaciones */}
      {hasTransformaciones && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse font-mono text-[12px]">
            <tbody className="divide-y divide-border/30">
              <tr>
                <td className="px-4 py-3 text-left text-muted-foreground text-[11px]">Detalle</td>
                {visibleEntries.map((r) => {
                  const st = roleStates[r.rol] ?? { detalleOpen: false }
                  const hasTx = r.transformaciones && r.transformaciones.length > 0
                  return (
                    <td key={r.rol} className="px-4 py-3 text-right">
                      {hasTx ? (
                        <button
                          type="button"
                          onClick={() => updateState(r.rol, { detalleOpen: !st.detalleOpen })}
                          className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {st.detalleOpen ? "Ocultar" : "Ver"}
                          <ChevronDown
                            className={cn("h-3 w-3 transition-transform", st.detalleOpen && "rotate-180")}
                          />
                        </button>
                      ) : (
                        <span className="text-[10px] text-muted-foreground/50">&mdash;</span>
                      )}
                    </td>
                  )
                })}
              </tr>

              {visibleEntries.map((r) => {
                const st = roleStates[r.rol] ?? { detalleOpen: false }
                if (!st.detalleOpen || !r.transformaciones || r.transformaciones.length === 0)
                  return null
                return (
                  <tr key={`detalle-${r.rol}`}>
                    <td className="px-4 py-2 text-left text-[10px] text-muted-foreground/50">
                      {r.label}
                    </td>
                    <td colSpan={visibleEntries.length} className="space-y-1 px-4 py-2">
                      {r.transformaciones.map((tx) => (
                        <div
                          key={tx.id}
                          className={cn(
                            "rounded border-l-2 bg-muted/20 px-2 py-1 text-[10px]",
                            ETAPA_TX_BORDER[tx.etapa]
                          )}
                        >
                          <span className="font-medium text-foreground">{tx.concepto}</span>
                          <span className="text-muted-foreground">
                            {": "}
                            {pesos(tx.valorPrevio)}
                            {" → "}
                            {pesos(tx.valorPosterior)}
                          </span>
                          <span className="text-muted-foreground/40">
                            {" · "}
                            Factor: {tx.factor}
                            {tx.articulo ? " · " + tx.articulo : ""}
                          </span>
                        </div>
                      ))}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
