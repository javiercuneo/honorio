"use client"

// ---------------------------------------------------------------
// Primera instancia: la cifra principal, el reparto por etapas y el
// divisor de una etapa entre dos profesionales.
//
// Las etapas son fracciones del honorario completo (2/3 y 1/3), tal
// como las calcula el motor. Aca solo se multiplican por el rango ya
// resuelto: no hay regla juridica nueva.
// ---------------------------------------------------------------

import { useState } from "react"
import type { Rango } from "@/lib/legal/types"
import { umaNum, pct } from "./format"
import {
  Card,
  CardHeader,
  Cifra,
  Etiqueta,
  LedgerRow,
  Segmented,
} from "./primitives"

type EtapaKey = "full" | "dos" | "una"

const ETAPAS: { key: EtapaKey; factor: number; label: string; corto: string }[] = [
  { key: "full", factor: 1, label: "Proceso completo", corto: "Completo" },
  { key: "dos", factor: 2 / 3, label: "Dos etapas (2/3)", corto: "2/3" },
  { key: "una", factor: 1 / 3, label: "Una etapa (1/3)", corto: "1/3" },
]

interface HonorariosBandProps {
  rango: Rango
  rolLabel: string
  esProvisorio: boolean
  /** Como se relaciona este rol con el honorario de la escala. */
  notaRol?: string
  children?: React.ReactNode
}

function escalar(r: Rango, f: number): Rango {
  return {
    minUMA: r.minUMA * f,
    maxUMA: r.maxUMA * f,
    minPesos: r.minPesos * f,
    maxPesos: r.maxPesos * f,
  }
}

function ParEnFila({
  rango,
  esProvisorio,
}: {
  rango: Rango
  esProvisorio: boolean
}) {
  return (
    <span className="inline-flex items-baseline gap-1.5 whitespace-nowrap">
      <Cifra value={rango.minPesos} size="md" className="text-value-min" />
      {!esProvisorio && (
        <>
          <span className="font-mono text-[10px] text-faint">a</span>
          <Cifra value={rango.maxPesos} size="md" className="text-value-max" />
        </>
      )}
    </span>
  )
}

export function HonorariosBand({
  rango,
  rolLabel,
  esProvisorio,
  notaRol,
  children,
}: HonorariosBandProps) {
  const [repartoEtapa, setRepartoEtapa] = useState<EtapaKey>("una")
  const [porcentajeA, setPorcentajeA] = useState(60)

  const etapaElegida = ETAPAS.find((e) => e.key === repartoEtapa) ?? ETAPAS[2]
  const baseReparto = escalar(rango, etapaElegida.factor)
  const a = porcentajeA / 100
  const b = 1 - a

  return (
    <Card>
      <CardHeader titulo="Honorarios · primera instancia">{children}</CardHeader>

      {/* Cifra principal */}
      <div className="grid gap-8 px-6 py-7 sm:grid-cols-2">
        <div>
          <Etiqueta>{esProvisorio ? "Honorario provisorio" : "Minimo"}</Etiqueta>
          <div className="mt-2">
            <Cifra
              value={rango.minPesos}
              size="hero"
              className="text-value-min"
            />
          </div>
          <div className="mt-1.5 font-mono text-[11px] tabular-nums text-faint">
            {umaNum(rango.minUMA, 4)}
            <span className="ml-1 tracking-wider">UMA</span>
          </div>
        </div>

        {!esProvisorio && (
          <div className="border-t border-hair pt-6 sm:border-l sm:border-t-0 sm:pl-8 sm:pt-0">
            <Etiqueta>Maximo</Etiqueta>
            <div className="mt-2">
              <Cifra
                value={rango.maxPesos}
                size="hero"
                className="text-value-max"
              />
            </div>
            <div className="mt-1.5 font-mono text-[11px] tabular-nums text-faint">
              {umaNum(rango.maxUMA, 4)}
              <span className="ml-1 tracking-wider">UMA</span>
            </div>
          </div>
        )}
      </div>

      <p className="max-w-3xl border-t border-hair px-6 py-3 text-[12px] leading-relaxed text-faint">
        {esProvisorio
          ? `Honorario provisorio del ${rolLabel.toLowerCase()}. No hay maximo: la regulacion definitiva se practica al concluir el proceso.`
          : `Rango de regulacion del ${rolLabel.toLowerCase()} por el proceso completo. El juez fija el honorario dentro de ese rango segun las pautas del art. 16.`}
        {notaRol ? " " + notaRol : null}
      </p>

      {/* Por etapa */}
      {!esProvisorio && (
        <div className="border-t border-border px-6 py-5">
          <Etiqueta>Por etapa</Etiqueta>
          <div className="mt-2">
            {ETAPAS.map((e) => {
              const r = escalar(rango, e.factor)
              return (
                <LedgerRow
                  key={e.key}
                  concepto={e.label}
                  destacado={e.key === "full"}
                  valor={<ParEnFila rango={r} esProvisorio={esProvisorio} />}
                  sub={
                    <span className="font-mono text-[10px] tabular-nums text-faint">
                      {umaNum(r.minUMA)} a {umaNum(r.maxUMA)}
                      <span className="ml-1 tracking-wider">UMA</span>
                    </span>
                  }
                />
              )
            })}
          </div>
        </div>
      )}

      {/* Divisor de etapa */}
      {!esProvisorio && (
        <div className="border-t border-border px-6 py-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Etiqueta>Reparto entre dos profesionales</Etiqueta>
            <Segmented
              ariaLabel="Sobre que importe se reparte"
              value={repartoEtapa}
              onChange={setRepartoEtapa}
              options={ETAPAS.map((e) => ({ value: e.key, label: e.corto }))}
            />
          </div>

          <p className="mt-2 max-w-2xl text-[12px] leading-relaxed text-faint">
            Cuando mas de un profesional intervino en la misma etapa, el importe
            se distribuye entre ellos. Ajusta la proporcion para ver cuanto le
            toca a cada uno.
          </p>

          <div className="mt-4 flex items-center gap-4">
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={porcentajeA}
              onChange={(e) => setPorcentajeA(Number(e.target.value))}
              aria-label="Proporcion del primer profesional"
              className="h-1 flex-1 cursor-pointer accent-primary"
            />
            <div className="flex shrink-0 items-center gap-1.5">
              <input
                type="number"
                min={0}
                max={100}
                value={porcentajeA}
                onChange={(e) =>
                  setPorcentajeA(
                    Math.min(100, Math.max(0, Number(e.target.value) || 0)),
                  )
                }
                aria-label="Porcentaje del primer profesional"
                className="w-16 rounded-sm border border-border bg-card px-2 py-1 text-right font-mono text-[12px] tabular-nums text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <span className="font-mono text-[11px] text-faint">
                / {100 - porcentajeA}
              </span>
            </div>
          </div>

          <div className="mt-3">
            <LedgerRow
              concepto={`Primer profesional · ${pct(porcentajeA)}`}
              valor={
                <ParEnFila
                  rango={escalar(baseReparto, a)}
                  esProvisorio={esProvisorio}
                />
              }
            />
            <LedgerRow
              concepto={`Segundo profesional · ${pct(100 - porcentajeA)}`}
              valor={
                <ParEnFila
                  rango={escalar(baseReparto, b)}
                  esProvisorio={esProvisorio}
                />
              }
            />
          </div>
        </div>
      )}
    </Card>
  )
}
