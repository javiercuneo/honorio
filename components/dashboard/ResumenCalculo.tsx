import { TrendingDown, ChevronDown } from "lucide-react"
import { pesos, porcentaje, PROCESO_LABEL, TERMINACION_LABEL, SENTENCIA_LABEL, OBJETO_LABEL, EXCEPCIONES_LABEL, CADUCIDAD_CRITERIO_LABEL, APERTURA_PRUEBA_LABEL, SUCESION_LETRADO_LABEL, MEDIDA_OPOSICION_LABEL, HOMOLOGACION_VIVIENDA_LABEL } from "./format"
import type { ProcesoTipo, EscalaAplicada, Transformacion } from "@/lib/legal/types"

interface ResumenCalculoProps {
  tipoProceso: ProcesoTipo
  modoTerminacion?: string
  sentenciaResultado?: string
  esProvisorio: boolean
  objetoBase?: string
  baseOriginal: number
  baseFinal: number
  valorUMA: number
  tuvoExcepciones?: string
  sucesionUnicoLetrado?: string
  medidaOposicion?: string
  homologacionVivienda?: string
  caducidadCriterio?: string
  aperturaPrueba?: string
  escala?: EscalaAplicada
  transformaciones?: Transformacion[]
}

function abrev(value: number): string {
  if (!isFinite(value) || value === 0) return "$0"
  if (value >= 1_000_000_000) return "$" + (value / 1_000_000_000).toFixed(1).replace(".0", "") + "B"
  if (value >= 1_000_000) return "$" + (value / 1_000_000).toFixed(1).replace(".0", "") + "M"
  return "$" + value.toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function pct(v: number): string {
  return v + "%"
}

const ESCALAS_ART21 = [
  { num: 1, rango: "Hasta 15", minPct: 22, maxPct: 33 },
  { num: 2, rango: "16 a 45", minPct: 20, maxPct: 26 },
  { num: 3, rango: "46 a 90", minPct: 18, maxPct: 24 },
  { num: 4, rango: "91 a 150", minPct: 17, maxPct: 22 },
  { num: 5, rango: "151 a 450", minPct: 15, maxPct: 20 },
  { num: 6, rango: "451 a 750", minPct: 13, maxPct: 17 },
  { num: 7, rango: "+751", minPct: 12, maxPct: 15 },
]

function Chip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/30 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
      {label}
    </span>
  )
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
  tuvoExcepciones,
  sucesionUnicoLetrado,
  medidaOposicion,
  homologacionVivienda,
  caducidadCriterio,
  aperturaPrueba,
  escala,
  transformaciones,
}: ResumenCalculoProps) {
  const label = PROCESO_LABEL[tipoProceso] ?? tipoProceso
  const sentenciaLabel = sentenciaResultado ? SENTENCIA_LABEL[sentenciaResultado] : null
  const baseEnUMA = valorUMA > 0 ? baseFinal / valorUMA : 0
  const tieneReduccion = baseOriginal > 0 && Math.abs(baseFinal - baseOriginal) / baseOriginal > 0.001
  const pctReduccion = baseOriginal > 0 ? (1 - baseFinal / baseOriginal) : 0

  const reduccionTx = tieneReduccion && transformaciones
    ? transformaciones.find((t) => t.etapa === "base" && t.visible)
    : undefined

  const baseChipLabel = sentenciaLabel ?? reduccionTx?.concepto ?? null

  const escalaModTx = escala && transformaciones
    ? transformaciones.find((t) => t.etapa === "escala" && t.visible)
    : undefined

  const escalaFactor = escalaModTx?.factor ?? 1
  const escalaModificada = escala && Math.abs(escalaFactor - 1) > 0.001
  const escalaAppliedMin = escala ? escala.porcentajeMin * escalaFactor : 0
  const escalaAppliedMax = escala ? escala.porcentajeMax * escalaFactor : 0

  const answerValues: Record<string, string | undefined> = {
    tipoProceso: label,
    objetoBase: objetoBase ? OBJETO_LABEL[objetoBase] ?? objetoBase : undefined,
    modoTerminacion: modoTerminacion ? TERMINACION_LABEL[modoTerminacion] : undefined,
    sentenciaResultado: sentenciaLabel ?? undefined,
    tuvoExcepciones: tuvoExcepciones ? EXCEPCIONES_LABEL[tuvoExcepciones] : undefined,
    caducidadCriterio: caducidadCriterio ? CADUCIDAD_CRITERIO_LABEL[caducidadCriterio] : undefined,
    aperturaPrueba: aperturaPrueba ? APERTURA_PRUEBA_LABEL[aperturaPrueba] : undefined,
    sucesionUnicoLetrado: sucesionUnicoLetrado ? SUCESION_LETRADO_LABEL[sucesionUnicoLetrado] : undefined,
    medidaOposicion: medidaOposicion ? MEDIDA_OPOSICION_LABEL[medidaOposicion] : undefined,
    homologacionVivienda: homologacionVivienda ? HOMOLOGACION_VIVIENDA_LABEL[homologacionVivienda] : undefined,
  }

  const escalera = escala?.escalera
  const scaleMatch = escala?.titulo.match(/\d+/)
  const currentScale = scaleMatch ? parseInt(scaleMatch[0], 10) : null

  return (
    <div className="flex h-full flex-col rounded-2xl border border-border bg-card px-6 pb-6 pt-6 md:px-8 md:pb-8 md:pt-8">
      <h2 className="text-xl font-bold text-foreground">Datos del caso</h2>

      <div className="mt-4 flex flex-wrap items-start gap-2">
        {Object.values(answerValues).filter(Boolean).map((v, i) => (
          <Chip key={i} label={v!} />
        ))}
        <Chip label={"UMA: " + pesos(valorUMA)} />
        {esProvisorio && <Chip label="Provisorio" />}
      </div>

      <div className="mt-6 grid grid-cols-[auto_1fr] gap-x-10 gap-y-8 items-center">
        <div className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
          Base Regulatoria
        </div>
        <div className={tieneReduccion ? "space-y-1" : ""}>
          {tieneReduccion && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[13px] text-muted-foreground line-through">{pesos(baseOriginal)}</span>
              <span className="inline-flex items-center gap-1 font-mono text-[12px] text-axis-base">
                <TrendingDown className="h-3.5 w-3.5" />
                {porcentaje(pctReduccion)}
              </span>
              {baseChipLabel && (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-transparent bg-axis-base-tint px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-axis-base-tint-foreground">
                  {baseChipLabel}
                </span>
              )}
            </div>
          )}
          <div className="text-2xl font-bold tracking-tight text-foreground">
            {abrev(baseFinal)}&nbsp;&nbsp;&nbsp;{baseEnUMA.toFixed(0)} UMA
          </div>
          <div className="text-[13px] text-muted-foreground">
            ({pesos(baseFinal)})&nbsp;&nbsp;&nbsp;({baseEnUMA.toFixed(2)} UMA)
          </div>
        </div>

        {escala && (
          <>
            <div className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              Escala y Alícuota Aplicable
            </div>
            <div className={escalaModificada ? "space-y-1" : ""}>
              <div className="font-medium text-foreground">{escala.titulo.split(":")[0]}</div>
              {escalaModificada && escalaModTx ? (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[13px] text-muted-foreground line-through">
                      {pct(escala.porcentajeMin)} a {pct(escala.porcentajeMax)}
                    </span>
                    <span className="inline-flex items-center gap-1 font-mono text-[12px] text-axis-escala">
                      <TrendingDown className="h-3.5 w-3.5" />
                      {pct(Math.round((1 - escalaFactor) * 1000) / 10)}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-transparent bg-axis-escala-tint px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-axis-escala-tint-foreground">
                      {escalaModTx.concepto}
                    </span>
                  </div>
                  <div className="text-lg font-bold text-foreground">
                    {pct(escalaAppliedMin)} a {pct(escalaAppliedMax)}
                  </div>
                </>
              ) : (
                <div className="text-lg font-bold text-foreground">
                  {pct(escala.porcentajeMinAplicado)} a {pct(escala.porcentajeMaxAplicado)}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {escala && (
        <details className="group mt-6 border-t border-border pt-4">
          <summary className="flex cursor-pointer list-none items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground">
            <ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" />
            ¿Cómo se calcula el mínimo? (art. 21)
          </summary>
          <div className="mt-3 space-y-2 pl-5 text-[13px] leading-relaxed text-muted-foreground">
            <p>
              La escala del art. 21 se aplica por tramos: cada grado toma el máximo
              acumulado del grado anterior y le suma la alícuota del tramo actual
              sobre el excedente.
            </p>
            {escalera && escalera.maximoEscalaAnterior > 0 ? (
              <p>
                En este caso, el grado inmediato anterior acumula{" "}
                <span className="font-medium text-foreground">
                  {escalera.maximoEscalaAnterior.toFixed(2)} UMA
                </span>{" "}
                hasta{" "}
                <span className="font-medium text-foreground">
                  {escalera.limiteAnterior.toFixed(0)} UMA
                </span>
                . La base de este cálculo excede ese límite en{" "}
                <span className="font-medium text-foreground">
                  {escalera.excedente.toFixed(2)} UMA
                </span>
                , que es lo que se regula a la alícuota del tramo{" "}
                {escala.titulo.split(":")[0]}.
              </p>
            ) : (
              <p>
                Esta base cae dentro del primer tramo de la escala, por lo que
                no hay excedente de un grado anterior que sumar.
              </p>
            )}

            <div className="mt-4 overflow-x-auto rounded-xl border border-border/60">
              <table className="w-full border-collapse font-mono text-[11px]">
                <thead>
                  <tr className="border-b border-border/50 text-[10px] uppercase tracking-wider text-muted-foreground/50">
                    <th className="px-3 py-2 text-left font-medium">Escala</th>
                    <th className="px-3 py-2 text-right font-medium">UMA</th>
                    <th className="px-3 py-2 text-right font-medium">Alícuotas</th>
                  </tr>
                </thead>
                <tbody>
                  {ESCALAS_ART21.map((row) => {
                    const isActive = row.num === currentScale
                    return (
                      <tr
                        key={row.num}
                        className={
                          isActive
                            ? "border-l-2 border-axis-escala bg-axis-escala-tint font-semibold text-axis-escala-tint-foreground"
                            : "text-muted-foreground/50"
                        }
                      >
                        <td className="whitespace-nowrap px-3 py-1.5 text-left">
                          {row.num}
                        </td>
                        <td className="px-3 py-1.5 text-right">
                          {isActive && escala?.baseEnUMA != null
                            ? escala.baseEnUMA.toFixed(0)
                            : row.rango}
                        </td>
                        <td className="whitespace-nowrap px-3 py-1.5 text-right">
                          {isActive
                            ? `${pct(escala!.porcentajeMinAplicado)} a ${pct(escala!.porcentajeMaxAplicado)}`
                            : `${row.minPct}% a ${row.maxPct}%`}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </details>
      )}
    </div>
  )
}
