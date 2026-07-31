"use client"

// ---------------------------------------------------------------
// La banda principal contesta tres cosas sin un solo parrafo suelto:
//   cuanto es, por que no es lo que la tabla sugiere, y como se
//   reparte entre etapas y entre profesionales.
//
// Las etapas son fracciones del honorario completo (2/3 y 1/3), tal
// como las calcula el motor. Aca solo se multiplican por el rango ya
// resuelto: no hay regla juridica nueva.
// ---------------------------------------------------------------

import { useState, type ReactNode } from "react"
import type { EscalaAplicada, Rango } from "@/lib/legal/types"
import { pct } from "./format"
import { ajusteDesdeFactor, type CadenaDerivada } from "./cadena"
import {
  AXIS_TINT,
  Card,
  CardHeader,
  Cifra,
  Disclosure,
  EnUMA,
  Etiqueta,
  Insignia,
  Norma,
  ROL_TINT,
  Segmented,
  Tile,
  useUma,
} from "./primitives"
import { BarraExcedente, ReglaArt21 } from "./ReglaArt21"

type EtapaKey = "full" | "dos" | "una"

const ETAPAS: { key: EtapaKey; factor: number; corto: string }[] = [
  { key: "full", factor: 1, corto: "Completo" },
  { key: "dos", factor: 2 / 3, corto: "2/3" },
  { key: "una", factor: 1 / 3, corto: "1/3" },
]

interface HonorariosBandProps {
  rango: Rango
  rolLabel: string
  esProvisorio: boolean
  escala?: EscalaAplicada
  cadena: CadenaDerivada
  valorUMA: number
  alicuota: string
  /** Lo que arrojaria leer la alicuota del tramo como si fuera directa. */
  ingenuo: number | null
  children?: ReactNode
}

function escalar(r: Rango, f: number): Rango {
  return {
    minUMA: r.minUMA * f,
    maxUMA: r.maxUMA * f,
    minPesos: r.minPesos * f,
    maxPesos: r.maxPesos * f,
  }
}

function Par({ rango, esProvisorio }: { rango: Rango; esProvisorio: boolean }) {
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

/** Un extremo del rango: rotulo, cifra grande, UMA y % efectivo. */
function Extremo({
  etiqueta,
  pesos,
  uma,
  efectivo,
  tono,
  ajuste,
}: {
  etiqueta: string
  pesos: number
  uma: number
  efectivo?: number
  tono: string
  ajuste?: string
}) {
  return (
    <div>
      <div className="flex items-baseline gap-2.5">
        <Etiqueta>{etiqueta}</Etiqueta>
        {ajuste ? <Insignia tono={ROL_TINT}>{ajuste}</Insignia> : null}
      </div>
      <div className="mt-2.5">
        <Cifra value={pesos} size="hero" className={tono} />
      </div>
      <div className="mt-2 font-mono text-[12px] text-faint">
        <EnUMA value={uma} />
        {efectivo !== undefined ? (
          <>
            <span className="mx-2">·</span>
            <span className="tabular-nums">{pct(efectivo, 1)} efectivo</span>
          </>
        ) : null}
      </div>
    </div>
  )
}

export function HonorariosBand({
  rango,
  esProvisorio,
  escala,
  cadena,
  valorUMA,
  alicuota,
  ingenuo,
  children,
}: HonorariosBandProps) {
  const [repartoEtapa, setRepartoEtapa] = useState<EtapaKey>("una")
  const [porcentajeA, setPorcentajeA] = useState(60)
  const uma = useUma()

  const etapaElegida = ETAPAS.find((e) => e.key === repartoEtapa) ?? ETAPAS[2]
  const baseReparto = escalar(rango, etapaElegida.factor)
  const a = porcentajeA / 100

  const ajustaPorRol = Math.abs(cadena.factorRol - 1) > 0.001
  const ajuste = ajustaPorRol ? ajusteDesdeFactor(cadena.factorRol) : undefined
  const efectivo = cadena.porcentajeEfectivo

  return (
    <Card>
      <CardHeader titulo="Honorarios · primera instancia">{children}</CardHeader>

      {/* Cifra principal */}
      <div
        className={
          esProvisorio ? "px-7 py-8" : "grid gap-8 px-7 py-8 sm:grid-cols-2"
        }
      >
        <Extremo
          etiqueta={esProvisorio ? "Honorario provisorio" : "Mínimo"}
          pesos={rango.minPesos}
          uma={rango.minUMA}
          efectivo={efectivo?.min}
          tono="text-value-min"
          ajuste={ajuste}
        />

        {!esProvisorio && (
          <div className="border-t border-hair pt-6 sm:border-l sm:border-t-0 sm:pl-8 sm:pt-0">
            <Extremo
              etiqueta="Máximo"
              pesos={rango.maxPesos}
              uma={rango.maxUMA}
              efectivo={efectivo?.max}
              tono="text-value-max"
              ajuste={ajuste}
            />
          </div>
        )}
      </div>

      {/* Provisorio: por que no hay maximo */}
      {esProvisorio ? (
        <div className="border-t border-hair px-7">
          <Disclosure
            concepto={
              <span className="flex items-baseline gap-2 text-foreground">
                <Insignia tono={AXIS_TINT.honorarios}>Sin máximo</Insignia>
                Esta regulación se practica en el mínimo
              </span>
            }
            articulo="art. 12"
          >
            <div className="space-y-2.5">
              <Norma>
                &ldquo;Si un profesional se aparta de un proceso o gestión antes
                de su conclusión normal, puede solicitar regulación provisoria de
                honorarios, los que se fijarán en el mínimo que le hubiere podido
                corresponder conforme a las actuaciones cumplidas.&rdquo;
              </Norma>
              <p>
                Por eso acá no hay un rango sino un solo valor, y tampoco hay
                reparto por etapas: la regulación definitiva se practica al
                concluir el proceso, sobre la labor efectivamente cumplida, y
                puede resultar mayor. El importe de arriba es un piso, no una
                estimación de lo que finalmente se regule.
              </p>
            </div>
          </Disclosure>
        </div>
      ) : null}

      {/* El contrafactico: el numero que espera quien lee solo la tabla */}
      {ingenuo !== null && escala ? (
        <div className="border-t border-hair px-7">
          <Disclosure
            concepto={
              <span className="text-foreground">
                La tabla del tramo sugiere{" "}
                <Cifra value={ingenuo} size="sm" className="text-foreground" />
              </span>
            }
          >
            <div className="space-y-2.5">
              <Norma>
                &ldquo;En ningún caso los honorarios podrán ser inferiores al
                máximo del grado inmediato anterior de la escala, con más el
                incremento por aplicación al excedente de la alícuota que
                corresponde al grado siguiente.&rdquo;
              </Norma>
              <p>
                Multiplicar la alícuota del tramo ({alicuota}) por la base da ese
                número, y es lo que casi todo el mundo calcula. Pero la escala no
                funciona así: arranca en el máximo del grado anterior y la
                alícuota solo toca el excedente. Sobre ese resultado recién
                después actúan las reducciones. Por eso el número final no guarda
                relación directa con el porcentaje del tramo.
              </p>
            </div>
          </Disclosure>
        </div>
      ) : null}

      {/* Donde cae la base y de donde sale el honorario */}
      {escala ? (
        <div className="space-y-3 border-t border-hair px-7 py-5">
          <ReglaArt21 baseEnUMA={escala.baseEnUMA} />
          {escala.escalera && cadena.pisoUMA !== null && cadena.aporteExcedenteUMA ? (
            <BarraExcedente
              pisoUMA={cadena.pisoUMA}
              aporteUMA={cadena.aporteExcedenteUMA.min}
              limiteAnterior={escala.escalera.limiteAnterior}
              alicuota={pct(escala.porcentajeMin)}
              excedenteUMA={escala.escalera.excedente}
              valorUMA={valorUMA}
            />
          ) : (
            <p className="font-mono text-[11px] text-faint">
              Base de {uma(escala.baseEnUMA)} UMA en el primer tramo: la alícuota
              se aplica sobre el total, sin grado anterior que acumular.
            </p>
          )}
        </div>
      ) : null}

      {/* Etapas: el completo ya esta arriba, no se repite */}
      {!esProvisorio && (
        <div className="border-t border-border px-7 py-5">
          <Etiqueta>Por etapas</Etiqueta>
          <div className="mt-2.5 grid gap-3 sm:grid-cols-2">
            {ETAPAS.filter((e) => e.key !== "full").map((e) => {
              const r = escalar(rango, e.factor)
              return (
                <Tile
                  key={e.key}
                  etiqueta={e.corto}
                  valor={
                    <span className="inline-flex flex-wrap items-baseline gap-1.5">
                      <Cifra value={r.minPesos} size="lg" className="text-value-min" />
                      <span className="font-mono text-[10px] text-faint">a</span>
                      <Cifra value={r.maxPesos} size="lg" className="text-value-max" />
                    </span>
                  }
                  sub={
                    <span>
                      {uma(r.minUMA)} a <EnUMA value={r.maxUMA} />
                    </span>
                  }
                />
              )
            })}
          </div>
        </div>
      )}

      {/* Reparto entre profesionales */}
      {!esProvisorio && (
        <div className="border-t border-border px-7 py-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Etiqueta>Reparto entre dos profesionales</Etiqueta>
            <Segmented
              ariaLabel="Importe a repartir"
              value={repartoEtapa}
              onChange={setRepartoEtapa}
              options={ETAPAS.map((e) => ({ value: e.key, label: e.corto }))}
            />
          </div>

          <div className="mt-4 flex items-center gap-5">
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={porcentajeA}
              onChange={(e) => setPorcentajeA(Number(e.target.value))}
              aria-label="Proporción del primer profesional"
              className="h-1 flex-1 cursor-pointer accent-primary"
            />
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
              className="w-14 shrink-0 rounded-sm border border-border bg-card px-2 py-1 text-right font-mono text-[12px] tabular-nums text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="mt-3 grid gap-x-8 sm:grid-cols-2">
            <div>
              <Etiqueta>Primero · {pct(porcentajeA)}</Etiqueta>
              <div className="mt-1.5">
                <Par rango={escalar(baseReparto, a)} esProvisorio={esProvisorio} />
              </div>
            </div>
            <div className="mt-3 sm:mt-0 sm:text-right">
              <Etiqueta>Segundo · {pct(100 - porcentajeA)}</Etiqueta>
              <div className="mt-1.5">
                <Par rango={escalar(baseReparto, 1 - a)} esProvisorio={esProvisorio} />
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
