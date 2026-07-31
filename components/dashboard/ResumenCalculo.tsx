"use client"

import { useState } from "react"
import { TrendingDown, ChevronDown } from "lucide-react"
import { pesos, porcentaje, formatNumberImpactful, PROCESO_LABEL, TERMINACION_LABEL, SENTENCIA_LABEL, OBJETO_LABEL, EXCEPCIONES_LABEL, CADUCIDAD_CRITERIO_LABEL, APERTURA_PRUEBA_LABEL, SUCESION_LETRADO_LABEL, MEDIDA_OPOSICION_LABEL, HOMOLOGACION_VIVIENDA_LABEL, DESALOJO_TIPO_LABEL, POSESORIAS_TIPO_LABEL } from "./format"
import type { ProcesoTipo, EscalaAplicada, Transformacion } from "@/lib/legal/types"
import { ScaleBreakdownModal } from "./ScaleBreakdownModal"

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
  desalojoVivienda?: string
  posesoriasTipo?: string
  escala?: EscalaAplicada
  transformaciones?: Transformacion[]
}

function pct(v: number): string {
  return v + "%"
}

// Eje del calculo que cada decision del wizard afecta.
// Se corresponde con resolveReglas() / las etapas de Transformacion:
//   base       -> reduce la base regulatoria (art. 22, 40)
//   escala     -> modifica los porcentajes de la escala (art. 25, 35, 37, 41)
//   honorarios -> ajusta el honorario final o el reparto por etapas (art. 34, 38, 49)
// Sin eje = dato estructural o de contexto (no altera importes por si mismo).
type Axis = 'base' | 'escala' | 'honorarios' | null

const CHIP_AXIS: Record<string, Axis> = {
  tipoProceso: null,
  objetoBase: 'base',
  desalojoVivienda: 'base',
  homologacionVivienda: 'base',
  sentenciaResultado: 'base',
  caducidadCriterio: 'base',
  aperturaPrueba: 'escala',
  sucesionUnicoLetrado: 'escala',
  medidaOposicion: 'escala',
  modoTerminacion: 'honorarios',
  tuvoExcepciones: 'honorarios',
  posesoriasTipo: 'honorarios',
}

// Clases completas y estaticas (Tailwind no puede resolver nombres compuestos).
const CHIP_AXIS_CLASS: Record<Exclude<Axis, null>, string> = {
  base: 'border-transparent bg-axis-base-tint text-axis-base-tint-foreground',
  escala: 'border-transparent bg-axis-escala-tint text-axis-escala-tint-foreground',
  honorarios: 'border-transparent bg-axis-honorarios-tint text-axis-honorarios-tint-foreground',
}

const CHIP_NEUTRAL_CLASS = 'border-border bg-muted/30 text-muted-foreground'

const AXIS_TITLE: Record<Exclude<Axis, null>, string> = {
  base: 'Incide en la base regulatoria',
  escala: 'Incide en la escala aplicable',
  honorarios: 'Incide en el honorario final',
}

const AXIS_LEGEND: Record<Exclude<Axis, null>, string> = {
  base: 'Base',
  escala: 'Escala',
  honorarios: 'Honorarios',
}

const AXIS_DOT_CLASS: Record<Exclude<Axis, null>, string> = {
  base: 'bg-axis-base',
  escala: 'bg-axis-escala',
  honorarios: 'bg-axis-honorarios',
}

const AXIS_ORDER: Exclude<Axis, null>[] = ['base', 'escala', 'honorarios']

function Chip({ label, axis = null, title }: { label: string; axis?: Axis; title?: string }) {
  const tone = axis ? CHIP_AXIS_CLASS[axis] : CHIP_NEUTRAL_CLASS
  return (
    <span
      title={title}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1 font-mono text-[11px] uppercase tracking-wider ${tone}`}
    >
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
  desalojoVivienda,
  posesoriasTipo,
  escala,
  transformaciones,
}: ResumenCalculoProps) {
  const [scaleModalOpen, setScaleModalOpen] = useState(false)
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
    desalojoVivienda: desalojoVivienda ? DESALOJO_TIPO_LABEL[desalojoVivienda] : undefined,
    posesoriasTipo: posesoriasTipo ? POSESORIAS_TIPO_LABEL[posesoriasTipo] : undefined,
  }

  const ejesPresentes = AXIS_ORDER.filter((axis) =>
    Object.entries(answerValues).some(([key, v]) => Boolean(v) && CHIP_AXIS[key] === axis),
  )

  return (
    <div className="flex h-full flex-col rounded-2xl border border-border bg-card px-6 pb-6 pt-6 md:px-8 md:pb-8 md:pt-8">
      <h2 className="text-xl font-bold text-foreground">Datos del caso</h2>

      <div className="mt-4 flex flex-wrap items-start gap-2">
        {Object.entries(answerValues)
          .filter(([, v]) => Boolean(v))
          .map(([key, v]) => {
            const axis = CHIP_AXIS[key] ?? null
            return (
              <Chip
                key={key}
                label={v!}
                axis={axis}
                title={axis ? AXIS_TITLE[axis] : undefined}
              />
            )
          })}
        <Chip label={"UMA: " + pesos(valorUMA)} />
        {esProvisorio && <Chip label="Provisorio" />}
      </div>

      {ejesPresentes.length > 1 && (
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          {ejesPresentes.map((axis) => (
            <span key={axis} className="inline-flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${AXIS_DOT_CLASS[axis]}`} />
              {AXIS_LEGEND[axis]}
            </span>
          ))}
        </div>
      )}

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
            <span title={pesos(baseFinal)}>{formatNumberImpactful(baseFinal).abrev}</span>
            &nbsp;&nbsp;&nbsp;
            <span>{baseEnUMA.toFixed(0)} UMA</span>
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
        <div className="mt-6 border-t border-border pt-4">
          <button
            onClick={() => setScaleModalOpen(true)}
            className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronDown className="h-3.5 w-3.5" />
            Ver desglose de escala (art. 21)
          </button>
        </div>
      )}

      {escala && (
        <ScaleBreakdownModal
          isOpen={scaleModalOpen}
          onClose={() => setScaleModalOpen(false)}
          escala={escala}
        />
      )}
    </div>
  )
}
