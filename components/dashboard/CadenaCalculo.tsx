"use client"

// ---------------------------------------------------------------
// Como se llega al numero. Tres bloques, uno por eje de reduccion,
// ordenados por la barra de color de su eje. No van numerados: la
// ley no numera nada de esto, y "eje 1" seria una convencion nuestra
// disfrazada de norma.
//
// Cada bloque muestra el valor con el que entra, las reglas que lo
// modifican, y el valor con el que sale. El fundamento de cada regla
// vive detras del unico "por que" de la app.
// ---------------------------------------------------------------

import { useState, type ReactNode } from "react"
import { Table2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { EscalaAplicada, Rango, Transformacion } from "@/lib/legal/types"
import { REGLA_LABEL } from "./format"
import { ajusteDesdeFactor, quitaDesdeFactor, type CadenaDerivada } from "./cadena"
import {
  type Axis,
  AXIS_FILL,
  AXIS_TINT,
  Card,
  CardHeader,
  Cifra,
  Disclosure,
  EnUMA,
  LedgerRow,
  Total,
  useUma,
} from "./primitives"
import { ScaleBreakdownModal } from "./ScaleBreakdownModal"

interface CadenaCalculoProps {
  baseOriginal: number
  baseFinal: number
  valorUMA: number
  escala?: EscalaAplicada
  cadena: CadenaDerivada
  rango: Rango
  rolLabel: string
  notaRol?: string
  alicuota: string
  esProvisorio: boolean
  children?: ReactNode
}

function ParPesos({
  min,
  max,
  esProvisorio,
  size = "sm",
  tachado,
}: {
  min: number
  max: number
  esProvisorio: boolean
  size?: "sm" | "md" | "lg"
  tachado?: boolean
}) {
  return (
    <span className="inline-flex items-baseline gap-1.5 whitespace-nowrap">
      <Cifra
        value={min}
        size={size}
        tachado={tachado}
        className={tachado ? "text-faint" : "text-value-min"}
      />
      {!esProvisorio && (
        <>
          <span className="font-mono text-[10px] text-faint">a</span>
          <Cifra
            value={max}
            size={size}
            tachado={tachado}
            className={tachado ? "text-faint" : "text-value-max"}
          />
        </>
      )}
    </span>
  )
}

function ParUMA({
  min,
  max,
  esProvisorio,
}: {
  min: number
  max: number
  esProvisorio: boolean
}) {
  const uma = useUma()
  return (
    <span className="font-mono text-[10px] text-faint">
      {esProvisorio ? <EnUMA value={min} /> : <>{uma(min)} a <EnUMA value={max} /></>}
    </span>
  )
}

function Bloque({
  titulo,
  axis,
  children,
}: {
  titulo: string
  axis: Axis
  children: ReactNode
}) {
  return (
    <div className="relative pl-5">
      <span
        className={cn(
          "absolute bottom-1 left-0 top-1.5 w-[2px] rounded-full opacity-70",
          AXIS_FILL[axis],
        )}
        aria-hidden="true"
      />
      <h3 className="font-mono text-[11px] uppercase tracking-[0.16em] text-foreground">
        {titulo}
      </h3>
      <div className="mt-1.5">{children}</div>
    </div>
  )
}

/** Regla aplicada: cuanto quita, como se llama, y el fundamento oculto. */
function Regla({
  tx,
  axis,
  quita,
}: {
  tx: Transformacion
  axis: Axis
  quita?: string
}) {
  const info = REGLA_LABEL[tx.id]
  return (
    <Disclosure
      concepto={
        <span className="text-foreground">{info?.titulo ?? tx.concepto}</span>
      }
      articulo={tx.articulo}
      valor={
        <span
          className={cn(
            "inline-flex items-baseline rounded-sm px-1.5 py-0.5 font-mono text-[11px] tabular-nums",
            AXIS_TINT[axis],
          )}
        >
          {quita ?? quitaDesdeFactor(tx.factor)}
        </span>
      }
    >
      <p>{info?.motivo ?? tx.concepto}</p>
    </Disclosure>
  )
}

export function CadenaCalculo({
  baseOriginal,
  baseFinal,
  valorUMA,
  escala,
  cadena,
  rango,
  rolLabel,
  notaRol,
  alicuota,
  esProvisorio,
  children,
}: CadenaCalculoProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const uma = useUma()

  const baseEnUMA = valorUMA > 0 ? baseFinal / valorUMA : 0
  const huboReduccionBase =
    cadena.txBase.length > 0 && Math.abs(baseFinal - baseOriginal) > 0.01
  const ajustaPorRol = Math.abs(cadena.factorRol - 1) > 0.001

  return (
    <Card>
      <CardHeader titulo="Como se llega a ese numero">
        {escala ? (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground transition-colors hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Table2 className="h-3.5 w-3.5" />
            Escala completa
          </button>
        ) : null}
      </CardHeader>

      <div className="space-y-7 px-7 py-6">
        {/* ---------- BASE ---------- */}
        <Bloque titulo="Base regulatoria" axis="base">
          {huboReduccionBase ? (
            <>
              <LedgerRow
                concepto="Monto reclamado"
                valor={
                  <Cifra value={baseOriginal} size="sm" className="text-faint" />
                }
              />
              {cadena.txBase.map((tx) => (
                <Regla key={tx.id} tx={tx} axis="base" />
              ))}
            </>
          ) : (
            <p className="py-1 text-[13px] text-faint">
              Ninguna regla reduce la base: se regula sobre el monto del proceso.
            </p>
          )}

          <Total etiqueta="Base sobre la que se regula">
            <Cifra value={baseFinal} size="lg" className="text-foreground" />
            <span className="mt-0.5 block font-mono text-[10px] text-faint">
              <EnUMA value={baseEnUMA} />
            </span>
          </Total>
        </Bloque>

        {/* ---------- ESCALA ---------- */}
        {escala ? (
          <Bloque titulo="Escala del art. 21" axis="escala">
            <Disclosure
              concepto={
                <span className="text-foreground">
                  Tramo de {tramoTexto(escala)} · {alicuota} del excedente
                </span>
              }
              articulo="art. 21"
              valor={
                <ParPesos
                  min={cadena.escalaBruta.minPesos}
                  max={cadena.escalaBruta.maxPesos}
                  esProvisorio={esProvisorio}
                  size="sm"
                />
              }
            >
              {escala.escalera && cadena.pisoUMA !== null ? (
                <p>
                  Se parte del maximo que acumula el grado anterior —
                  {" "}{uma(cadena.pisoUMA)} UMA hasta{" "}
                  {uma(escala.escalera.limiteAnterior)} UMA— y solo el excedente
                  de {uma(escala.escalera.excedente)} UMA tributa la alicuota de
                  este tramo. Es la regla del excedente del art. 21.
                </p>
              ) : (
                <p>
                  La base cae en el primer tramo de la escala: no hay grado
                  anterior que acumular, asi que la alicuota se aplica sobre el
                  total.
                </p>
              )}
            </Disclosure>

            {cadena.txEscala.map((tx) => (
              <Regla key={tx.id} tx={tx} axis="escala" />
            ))}

            {cadena.txEscala.length > 0 ? (
              <Total etiqueta="Escala reducida">
                <ParPesos
                  min={cadena.trasEscala.minPesos}
                  max={cadena.trasEscala.maxPesos}
                  esProvisorio={esProvisorio}
                  size="md"
                />
                <span className="mt-0.5 block">
                  <ParUMA
                    min={cadena.trasEscala.minUMA}
                    max={cadena.trasEscala.maxUMA}
                    esProvisorio={esProvisorio}
                  />
                </span>
              </Total>
            ) : null}
          </Bloque>
        ) : null}

        {/* ---------- HONORARIO ---------- */}
        <Bloque titulo="Honorario" axis="honorarios">
          {cadena.txFinal.length > 0 ? (
            cadena.txFinal.map((tx) => (
              <Regla key={tx.id} tx={tx} axis="honorarios" />
            ))
          ) : (
            <p className="py-1 text-[13px] text-faint">
              Ninguna regla reduce el honorario calculado sobre la escala.
            </p>
          )}

          <Total etiqueta="Patrocinante">
            <ParPesos
              min={cadena.trasFinal.minPesos}
              max={cadena.trasFinal.maxPesos}
              esProvisorio={esProvisorio}
              size={ajustaPorRol ? "md" : "lg"}
            />
            <span className="mt-0.5 block">
              <ParUMA
                min={cadena.trasFinal.minUMA}
                max={cadena.trasFinal.maxUMA}
                esProvisorio={esProvisorio}
              />
            </span>
          </Total>

          {ajustaPorRol ? (
            <>
              <Disclosure
                concepto={
                  <span className="text-foreground">
                    Actuacion como {rolLabel.toLowerCase()}
                  </span>
                }
                articulo="art. 20"
                valor={
                  <span
                    className={cn(
                      "inline-flex items-baseline rounded-sm px-1.5 py-0.5 font-mono text-[11px] tabular-nums",
                      AXIS_TINT.honorarios,
                    )}
                  >
                    {ajusteDesdeFactor(cadena.factorRol)}
                  </span>
                }
              >
                <p>{notaRol}</p>
              </Disclosure>

              <Total etiqueta={rolLabel}>
                <ParPesos
                  min={rango.minPesos}
                  max={rango.maxPesos}
                  esProvisorio={esProvisorio}
                  size="lg"
                />
                <span className="mt-0.5 block">
                  <ParUMA
                    min={rango.minUMA}
                    max={rango.maxUMA}
                    esProvisorio={esProvisorio}
                  />
                </span>
              </Total>
            </>
          ) : null}
        </Bloque>

        {children}
      </div>

      {escala ? (
        <ScaleBreakdownModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          escala={escala}
        />
      ) : null}
    </Card>
  )
}

/** "91 a 150 UMA" a partir del titulo que emite el motor. */
function tramoTexto(escala: EscalaAplicada): string {
  const m = escala.titulo.match(/\(([^)]+)\)/)
  return m ? m[1] : escala.titulo
}
