"use client"

// ---------------------------------------------------------------
// Como se llega al numero. Tres bloques, uno por eje de reduccion.
// Cada bloque muestra el valor con el que entra (tachado), las reglas
// que lo modifican con su motivo declarado, y el valor con el que sale.
//
// El principio es la transparencia: el honorario casi nunca es un
// porcentaje directo del monto, y esta pantalla existe para mostrar
// exactamente donde se va la diferencia.
// ---------------------------------------------------------------

import { useState, type ReactNode } from "react"
import { Table2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { EscalaAplicada, Rango, Transformacion } from "@/lib/legal/types"
import { pesos, umaNum, pct, REGLA_LABEL } from "./format"
import { ajusteDesdeFactor, derivarCadena, quitaDesdeFactor } from "./cadena"
import {
  Articulo,
  type Axis,
  AXIS_FILL,
  AXIS_INK,
  AXIS_TINT,
  Card,
  CardHeader,
  Cifra,
  Etiqueta,
  LedgerRow,
} from "./primitives"
import { ReglaArt21 } from "./ReglaArt21"
import { ScaleBreakdownModal } from "./ScaleBreakdownModal"

interface CadenaCalculoProps {
  baseOriginal: number
  baseFinal: number
  valorUMA: number
  escala?: EscalaAplicada
  transformaciones: Transformacion[]
  /** Rango final del rol que se esta mostrando. */
  rango: Rango
  /** Rango del patrocinante: es el que sale directamente de la escala. */
  patrocinante: Rango
  rolLabel: string
  /** Como se relaciona el rol mostrado con el patrocinante (art. 20). */
  notaRol?: string
  esProvisorio: boolean
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
  return (
    <span className="font-mono text-[10px] tabular-nums text-faint">
      {umaNum(min)}
      {!esProvisorio && ` a ${umaNum(max)}`}
      <span className="ml-1 tracking-wider">UMA</span>
    </span>
  )
}

function Paso({
  n,
  titulo,
  axis,
  children,
}: {
  n: string
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
      <div className="flex items-baseline gap-2.5">
        <span
          className={cn(
            "font-mono text-[10px] tabular-nums tracking-widest",
            AXIS_INK[axis],
          )}
        >
          {n}
        </span>
        <h3 className="font-mono text-[11px] uppercase tracking-[0.16em] text-foreground">
          {titulo}
        </h3>
      </div>
      <div className="mt-2.5">{children}</div>
    </div>
  )
}

/** Regla aplicada: cuanto quita, como se llama, y por que. */
function FilaReduccion({ tx, axis }: { tx: Transformacion; axis: Axis }) {
  const info = REGLA_LABEL[tx.id]
  return (
    <div className="py-2">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span
          className={cn(
            "inline-flex shrink-0 items-baseline rounded-sm px-1.5 py-0.5 font-mono text-[10px] tabular-nums",
            AXIS_TINT[axis],
          )}
        >
          {quitaDesdeFactor(tx.factor)}
        </span>
        <span className="text-[13px] text-foreground">
          {info?.titulo ?? tx.concepto}
        </span>
        <Articulo>{tx.articulo}</Articulo>
      </div>
      {info?.motivo ? (
        <p className="mt-1 max-w-2xl text-[12px] leading-relaxed text-faint">
          {info.motivo}
        </p>
      ) : null}
    </div>
  )
}

/** Cierre de un bloque: la cifra con la que sale. */
function Total({
  etiqueta,
  children,
}: {
  etiqueta: string
  children: ReactNode
}) {
  return (
    <div className="mt-2 flex flex-wrap items-end justify-between gap-x-4 gap-y-1 border-t border-hair pt-3">
      <Etiqueta>{etiqueta}</Etiqueta>
      <span className="text-right">{children}</span>
    </div>
  )
}

export function CadenaCalculo({
  baseOriginal,
  baseFinal,
  valorUMA,
  escala,
  transformaciones,
  rango,
  patrocinante,
  rolLabel,
  notaRol,
  esProvisorio,
}: CadenaCalculoProps) {
  const [modalOpen, setModalOpen] = useState(false)

  const cadena = derivarCadena({
    transformaciones,
    final: rango,
    patrocinante,
    escala,
    baseFinal,
  })

  const baseEnUMA = valorUMA > 0 ? baseFinal / valorUMA : 0
  const huboReduccionBase =
    cadena.txBase.length > 0 && Math.abs(baseFinal - baseOriginal) > 0.01
  const ajustaPorRol = Math.abs(cadena.factorRol - 1) > 0.001
  // En provisorios solo rige el minimo: nombrar el maximo seria enunciar
  // un tope que este calculo no esta afirmando.
  const alicuota = escala
    ? esProvisorio
      ? pct(escala.porcentajeMin)
      : `${pct(escala.porcentajeMin)} a ${pct(escala.porcentajeMax)}`
    : ""

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
            Escala completa del art. 21
          </button>
        ) : null}
      </CardHeader>

      <div className="space-y-8 px-6 py-6">
        {/* ---------- 01 BASE ---------- */}
        <Paso n="01" titulo="Base regulatoria" axis="base">
          {huboReduccionBase ? (
            <>
              <LedgerRow
                concepto="Monto reclamado"
                valor={
                  <Cifra
                    value={baseOriginal}
                    size="sm"
                    tachado
                    className="text-faint"
                  />
                }
              />
              {cadena.txBase.map((tx) => (
                <FilaReduccion key={tx.id} tx={tx} axis="base" />
              ))}
            </>
          ) : (
            <p className="text-[12px] leading-relaxed text-faint">
              Ninguna regla reduce la base en este caso: se regula sobre el monto
              del proceso.
            </p>
          )}

          <Total etiqueta="Base sobre la que se regula">
            <Cifra value={baseFinal} size="lg" className="text-foreground" />
            <span className="mt-0.5 block font-mono text-[11px] tabular-nums text-faint">
              {umaNum(baseEnUMA)}
              <span className="ml-1 tracking-wider">UMA</span>
            </span>
          </Total>
        </Paso>

        {/* ---------- 02 ESCALA ---------- */}
        {escala ? (
          <Paso n="02" titulo="Escala del art. 21" axis="escala">
            <ReglaArt21 baseEnUMA={escala.baseEnUMA} />

            <div className="mt-4">
              {cadena.pisoUMA !== null && escala.escalera ? (
                <>
                  <p className="mb-1.5 max-w-2xl text-[12px] leading-relaxed text-faint">
                    La escala es progresiva: la alicuota del tramo no se aplica a
                    todo el monto. Se parte del maximo que acumula el grado
                    anterior y solo el excedente tributa la alicuota de este
                    tramo.
                  </p>
                  <LedgerRow
                    concepto={`Maximo del grado anterior, hasta ${umaNum(escala.escalera.limiteAnterior, 0)} UMA`}
                    valor={
                      <span className="font-mono text-[12px] tabular-nums text-muted-foreground">
                        {umaNum(cadena.pisoUMA)} UMA
                      </span>
                    }
                    sub={
                      <span className="font-mono text-[10px] tabular-nums text-faint">
                        {pesos(cadena.pisoUMA * valorUMA)}
                      </span>
                    }
                  />
                  <LedgerRow
                    concepto={`${alicuota} del excedente de ${umaNum(escala.escalera.excedente)} UMA`}
                    valor={
                      cadena.aporteExcedenteUMA ? (
                        <span className="font-mono text-[12px] tabular-nums text-muted-foreground">
                          + {umaNum(cadena.aporteExcedenteUMA.min)}
                          {!esProvisorio &&
                            ` a ${umaNum(cadena.aporteExcedenteUMA.max)}`}{" "}
                          UMA
                        </span>
                      ) : null
                    }
                  />
                </>
              ) : (
                <LedgerRow
                  concepto={`${alicuota} sobre ${umaNum(escala.baseEnUMA)} UMA`}
                  valor={
                    <span className="font-mono text-[12px] tabular-nums text-muted-foreground">
                      {umaNum(cadena.escalaBruta.minUMA)}
                      {!esProvisorio &&
                        ` a ${umaNum(cadena.escalaBruta.maxUMA)}`}{" "}
                      UMA
                    </span>
                  }
                />
              )}

              <Total etiqueta="Honorario de escala">
                <ParPesos
                  min={cadena.escalaBruta.minPesos}
                  max={cadena.escalaBruta.maxPesos}
                  esProvisorio={esProvisorio}
                  size="md"
                  tachado={cadena.txEscala.length > 0}
                />
                <span className="mt-0.5 block">
                  <ParUMA
                    min={cadena.escalaBruta.minUMA}
                    max={cadena.escalaBruta.maxUMA}
                    esProvisorio={esProvisorio}
                  />
                </span>
              </Total>

              {cadena.txEscala.length > 0 ? (
                <div className="mt-2">
                  {cadena.txEscala.map((tx) => (
                    <FilaReduccion key={tx.id} tx={tx} axis="escala" />
                  ))}
                  <Total etiqueta="Escala reducida">
                    <ParPesos
                      min={cadena.trasEscala.minPesos}
                      max={cadena.trasEscala.maxPesos}
                      esProvisorio={esProvisorio}
                      size="md"
                      tachado={cadena.txFinal.length > 0}
                    />
                    <span className="mt-0.5 block">
                      <ParUMA
                        min={cadena.trasEscala.minUMA}
                        max={cadena.trasEscala.maxUMA}
                        esProvisorio={esProvisorio}
                      />
                    </span>
                  </Total>
                </div>
              ) : null}
            </div>
          </Paso>
        ) : null}

        {/* ---------- 03 HONORARIO ---------- */}
        <Paso n="03" titulo="Honorario" axis="honorarios">
          {cadena.txFinal.length > 0 ? (
            cadena.txFinal.map((tx) => (
              <FilaReduccion key={tx.id} tx={tx} axis="honorarios" />
            ))
          ) : (
            <p className="text-[12px] leading-relaxed text-faint">
              Ninguna regla reduce el honorario ya calculado sobre la escala.
            </p>
          )}

          <Total etiqueta="Patrocinante">
            <ParPesos
              min={cadena.trasFinal.minPesos}
              max={cadena.trasFinal.maxPesos}
              esProvisorio={esProvisorio}
              size={ajustaPorRol ? "md" : "lg"}
              tachado={ajustaPorRol}
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
            <div className="mt-2">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 py-2">
                <span
                  className={cn(
                    "inline-flex shrink-0 items-baseline rounded-sm px-1.5 py-0.5 font-mono text-[10px] tabular-nums",
                    AXIS_TINT.honorarios,
                  )}
                >
                  {ajusteDesdeFactor(cadena.factorRol)}
                </span>
                <span className="text-[13px] text-foreground">
                  Ajuste por actuacion como {rolLabel.toLowerCase()}
                </span>
                <Articulo>art. 20</Articulo>
              </div>
              <p className="max-w-2xl text-[12px] leading-relaxed text-faint">
                {notaRol}
              </p>

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
            </div>
          ) : null}
        </Paso>

        {/* ---------- Lectura del resultado ---------- */}
        {cadena.porcentajeEfectivo && escala ? (
          <p className="max-w-3xl rounded-md border border-hair bg-secondary px-4 py-3 text-[12px] leading-relaxed text-muted-foreground">
            El honorario no es un porcentaje directo del monto. Sobre la base
            regulatoria de{" "}
            <span className="font-mono tabular-nums text-foreground">
              {pesos(baseFinal)}
            </span>
            , este resultado representa{" "}
            <span className="font-mono tabular-nums text-foreground">
              {pct(cadena.porcentajeEfectivo.min, 2)}
              {!esProvisorio && ` a ${pct(cadena.porcentajeEfectivo.max, 2)}`}
            </span>
            , y no el{" "}
            <span className="font-mono tabular-nums">{alicuota}</span> que
            enuncia el tramo de la escala.
          </p>
        ) : null}
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
