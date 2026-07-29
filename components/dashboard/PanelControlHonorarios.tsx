"use client"

import { useState, useCallback } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { pesos, umas } from "./format"
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

type EtapaKey = "1" | "2" | "completo"

const ETAPA_CONFIG: Record<EtapaKey, { factor: number; label: string }> = {
  "1": { factor: 1 / 3, label: "1/3" },
  "2": { factor: 2 / 3, label: "2/3" },
  "completo": { factor: 1, label: "3/3" },
}

const ETAPA_ORDER: EtapaKey[] = ["1", "2", "completo"]

const ETAPA_TX_BORDER: Record<Transformacion["etapa"], string> = {
  base: "border-l-axis-base",
  escala: "border-l-axis-escala",
  honorarios: "border-l-axis-honorarios",
}

interface RoleState {
  etapa: EtapaKey
  pctSlider: number
  detalleOpen: boolean
}

function abrev(value: number): string {
  if (!isFinite(value) || value === 0) return "$0"
  if (value >= 1_000_000_000) return "$" + (value / 1_000_000_000).toFixed(1).replace(".0", "") + "B"
  if (value >= 1_000_000) return "$" + (value / 1_000_000).toFixed(1).replace(".0", "") + "M"
  return "$" + value.toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

export function PanelControlHonorarios({ roles, esProvisorio }: PanelControlHonorariosProps) {
  const [visibleRoles, setVisibleRoles] = useState<Set<string>>(
    () => new Set(roles.map((r) => r.rol))
  )

  const [roleStates, setRoleStates] = useState<Record<string, RoleState>>(() => {
    const states: Record<string, RoleState> = {}
    for (const r of roles) {
      states[r.rol] = { etapa: "completo", pctSlider: 100, detalleOpen: false }
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

  if (visibleEntries.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4 md:px-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-foreground/70">
            Panel de Control de Honorarios
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
            Seleccione un rol para ver los honorarios
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4 md:px-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-foreground/70">
          Panel de Control de Honorarios
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

      <div className="overflow-x-auto">
        <table className="w-full border-collapse font-mono text-[12px]">
          <thead>
            <tr className="border-b border-border/50 text-[10px] uppercase tracking-wider text-muted-foreground/50">
              <th className="px-4 py-3 text-left font-medium">Concepto</th>
              {visibleEntries.map((r) => (
                <th key={r.rol} className="px-4 py-3 text-right font-medium">
                  {r.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            <tr>
              <td className="px-4 py-3 text-left text-muted-foreground">
                {esProvisorio ? "Mínimo ($)" : "Mínimo / Máximo ($)"}
              </td>
              {visibleEntries.map((r) => (
                <td key={r.rol} className="whitespace-nowrap px-4 py-3 text-right">
                  <span className="text-value-min">
                    {abrev(r.rango.minPesos)}
                  </span>
                  {!esProvisorio && (
                    <>
                      {" / "}
                      <span className="text-value-max">
                        {abrev(r.rango.maxPesos)}
                      </span>
                    </>
                  )}
                </td>
              ))}
            </tr>

            <tr className="text-[11px] text-muted-foreground/60">
              <td className="px-4 py-1.5 text-left">Mín ($)</td>
              {visibleEntries.map((r) => (
                <td key={r.rol} className="px-4 py-1.5 text-right">
                  {pesos(r.rango.minPesos)}
                </td>
              ))}
            </tr>
            {!esProvisorio && (
              <tr className="text-[11px] text-muted-foreground/60">
                <td className="border-b border-border/20 px-4 py-1.5 text-left">Máx ($)</td>
                {visibleEntries.map((r) => (
                  <td className="border-b border-border/20 px-4 py-1.5 text-right" key={r.rol}>
                    {pesos(r.rango.maxPesos)}
                  </td>
                ))}
              </tr>
            )}

            <tr>
              <td className="px-4 py-3 text-left text-muted-foreground">
                {esProvisorio ? "Mínimo (UMA)" : "Mínimo / Máximo (UMA)"}
              </td>
              {visibleEntries.map((r) => (
                <td key={r.rol} className="whitespace-nowrap px-4 py-3 text-right text-muted-foreground">
                  {umas(r.rango.minUMA)}{!esProvisorio && <> / {umas(r.rango.maxUMA)}</>}
                </td>
              ))}
            </tr>

            {visibleEntries.some((r) => r.segundaInstancia) && (
              <tr className="bg-muted/30">
                <td className="px-4 py-2.5 text-left font-medium text-foreground">
                  Segunda Instancia &mdash; Art. 30
                </td>
                {visibleEntries.map((r) => (
                  <td key={r.rol} className="whitespace-nowrap px-4 py-2.5 text-right text-muted-foreground">
                    {r.segundaInstancia
                      ? esProvisorio
                        ? pesos(r.segundaInstancia.minimo.minPesos)
                        : [pesos(r.segundaInstancia.minimo.minPesos), pesos(r.segundaInstancia.maximo.maxPesos), pesos(r.segundaInstancia.revocada.maxPesos)].join(" / ")
                      : "—"}
                  </td>
                ))}
              </tr>
            )}

            <tr>
              <td className="px-4 py-3 text-left text-muted-foreground">Etapas</td>
              {visibleEntries.map((r) => {
                const st = roleStates[r.rol] ?? { etapa: "completo" }
                return (
                  <td key={r.rol} className="px-4 py-3">
                    <div className="flex overflow-hidden rounded-md border border-border">
                      {ETAPA_ORDER.map((key) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => updateState(r.rol, { etapa: key })}
                          className={cn(
                            "flex-1 px-2 py-1 text-[10px] font-mono transition-colors",
                            st.etapa === key
                              ? "bg-accent text-accent-foreground"
                              : "bg-card text-muted-foreground hover:bg-muted/30"
                          )}
                        >
                          {ETAPA_CONFIG[key].label}
                        </button>
                      ))}
                    </div>
                  </td>
                )
              })}
            </tr>

            <tr>
              <td className="px-4 py-3 text-left text-muted-foreground">Porcentaje</td>
              {visibleEntries.map((r) => {
                const st = roleStates[r.rol] ?? { etapa: "completo", pctSlider: 100 }
                return (
                  <td key={r.rol} className="px-4 py-3">
                    {st.etapa !== "completo" ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={st.pctSlider}
                          onChange={(e) => updateState(r.rol, { pctSlider: Number(e.target.value) })}
                          className="h-1 w-14 cursor-pointer appearance-none rounded-full bg-muted accent-accent-foreground md:w-20"
                        />
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={st.pctSlider}
                          onChange={(e) => {
                            const v = Math.min(100, Math.max(0, Number(e.target.value) || 0))
                            updateState(r.rol, { pctSlider: v })
                          }}
                          className="w-10 rounded border border-border bg-card px-1 py-0.5 text-center font-mono text-[11px] text-foreground outline-none focus:border-accent-foreground"
                        />
                        <span className="text-[10px] text-muted-foreground">%</span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-muted-foreground/50">—</span>
                    )}
                  </td>
                )
              })}
            </tr>

            {visibleEntries.some(
              (r) => (roleStates[r.rol]?.etapa ?? "completo") !== "completo"
            ) && (
              <tr className="bg-muted/20">
                <td className="px-4 py-3 text-left text-muted-foreground">
                  Proporcional
                </td>
                {visibleEntries.map((r) => {
                  const st = roleStates[r.rol] ?? { etapa: "completo", pctSlider: 100 }
                  if (st.etapa === "completo") {
                    return (
                      <td key={r.rol} className="px-4 py-3 text-right text-[10px] text-muted-foreground/50">
                        —
                      </td>
                    )
                  }
                  const cfg = ETAPA_CONFIG[st.etapa]
                  const factor = cfg.factor * (st.pctSlider / 100)
                  const min = r.rango.minPesos * factor
                  const max = r.rango.maxPesos * factor
                  return (
                    <td key={r.rol} className="whitespace-nowrap px-4 py-3 text-right">
                      <span className="text-value-min">
                        {abrev(min)}
                      </span>
                      {!esProvisorio && (
                        <>
                          {" / "}
                          <span className="text-value-max">
                            {abrev(max)}
                          </span>
                        </>
                      )}
                    </td>
                  )
                })}
              </tr>
            )}

            {visibleEntries.some(
              (r) => r.transformaciones && r.transformaciones.length > 0
            ) && (
              <tr>
                <td className="px-4 py-3 text-left text-muted-foreground">Detalle</td>
                {visibleEntries.map((r) => {
                  const st = roleStates[r.rol] ?? { detalleOpen: false }
                  const hasTx = r.transformaciones && r.transformaciones.length > 0
                  return (
                    <td key={r.rol} className="px-4 py-3 text-right">
                      {hasTx ? (
                        <button
                          type="button"
                          onClick={() => updateState(r.rol, { detalleOpen: !st.detalleOpen })}
                          className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground"
                        >
                          {st.detalleOpen ? "Ocultar" : "Ver"}
                          <ChevronDown
                            className={cn(
                              "h-3 w-3 transition-transform",
                              st.detalleOpen && "rotate-180"
                            )}
                          />
                        </button>
                      ) : (
                        <span className="text-[10px] text-muted-foreground/50">—</span>
                      )}
                    </td>
                  )
                })}
              </tr>
            )}

            {visibleEntries.map((r) => {
              const st = roleStates[r.rol] ?? { detalleOpen: false }
              if (!st.detalleOpen || !r.transformaciones || r.transformaciones.length === 0)
                return null
              return (
                <tr key={`detalle-${r.rol}`}>
                  <td className="px-4 py-2 text-left text-[10px] text-muted-foreground/50">
                    {r.label}
                  </td>
                  <td
                    colSpan={visibleEntries.length}
                    className="space-y-1 px-4 py-2"
                  >
                    {r.transformaciones.map((tx) => (
                      <div
                        key={tx.id}
                        className={cn(
                          "rounded border-l-2 bg-muted/20 px-2 py-1 text-[10px]",
                          ETAPA_TX_BORDER[tx.etapa]
                        )}
                      >
                        <span className="font-medium text-foreground">
                          {tx.concepto}
                        </span>
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
    </div>
  )
}
