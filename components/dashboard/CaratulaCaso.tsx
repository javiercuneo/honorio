// ---------------------------------------------------------------
// Caratula del caso: las decisiones tomadas en la entrevista,
// separadas entre las que movieron el numero y las que no.
//
// El color de cada respuesta no se decide aca por tabla fija: se
// deduce de las Transformaciones que el motor efectivamente aplico.
// Si una regla no se disparo, la respuesta que la habilitaba queda
// neutra. Asi la caratula no promete un efecto que no ocurrio.
// ---------------------------------------------------------------

import { cn } from "@/lib/utils"
import {
  pesos,
  PROCESO_LABEL,
  TERMINACION_LABEL,
  SENTENCIA_LABEL,
  OBJETO_LABEL,
  EXCEPCIONES_LABEL,
  CADUCIDAD_CRITERIO_LABEL,
  APERTURA_PRUEBA_LABEL,
  SUCESION_LETRADO_LABEL,
  MEDIDA_OPOSICION_LABEL,
  HOMOLOGACION_VIVIENDA_LABEL,
  DESALOJO_TIPO_LABEL,
  POSESORIAS_TIPO_LABEL,
} from "./format"
import type { ProcesoTipo, Transformacion } from "@/lib/legal/types"
import { type Axis, AXIS_FILL, AXIS_ORDER, AXIS_TINT, Card } from "./primitives"

export interface CaratulaCasoProps {
  tipoProceso: ProcesoTipo
  esProvisorio: boolean
  valorUMA: number
  transformaciones?: Transformacion[]
  modoTerminacion?: string
  sentenciaResultado?: string
  objetoBase?: string
  tuvoExcepciones?: string
  sucesionUnicoLetrado?: string
  medidaOposicion?: string
  homologacionVivienda?: string
  caducidadCriterio?: string
  aperturaPrueba?: string
  desalojoVivienda?: string
  posesoriasTipo?: string
}

/**
 * Que respuesta del wizard habilita cada regla del motor.
 * Solo se colorea la respuesta cuando su regla figura entre las
 * transformaciones aplicadas.
 */
const REGLA_ORIGEN: Record<string, string[]> = {
  "base-desalojo-vivienda": [
    "objetoBase",
    "desalojoVivienda",
    "homologacionVivienda",
  ],
  "base-demanda-rechazada": ["sentenciaResultado"],
  "base-caducidad-art22": ["caducidadCriterio", "modoTerminacion"],
  "escala-unico-letrado": ["sucesionUnicoLetrado"],
  "escala-art25": ["modoTerminacion", "aperturaPrueba", "caducidadCriterio"],
  "escala-cautelar": ["medidaOposicion"],
  "final-ejecucion-sin-excepciones": ["tuvoExcepciones"],
  "final-posesorias-beneficio": ["objetoBase", "posesoriasTipo"],
  "final-incidencia-colectiva": ["objetoBase"],
  // escala-ejecucion-sentencia y escala-homologacion derivan del tipo de
  // proceso, no de una respuesta: no pintan ningun chip.
}

const AXIS_GRUPO: Record<Axis, string> = {
  base: "Movio la base",
  escala: "Movio la escala",
  honorarios: "Movio el honorario",
}

const ORDEN: string[] = [
  "objetoBase",
  "desalojoVivienda",
  "homologacionVivienda",
  "sentenciaResultado",
  "modoTerminacion",
  "caducidadCriterio",
  "aperturaPrueba",
  "sucesionUnicoLetrado",
  "medidaOposicion",
  "tuvoExcepciones",
  "posesoriasTipo",
]

function Chip({ label, axis }: { label: string; axis: Axis | null }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm px-2 py-1 font-mono text-[11px] tracking-tight",
        axis
          ? AXIS_TINT[axis]
          : "border border-border bg-secondary text-muted-foreground",
      )}
    >
      {label}
    </span>
  )
}

function Fila({
  etiqueta,
  axis,
  children,
}: {
  etiqueta: string
  axis: Axis | null
  children: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-[9rem_1fr] items-baseline gap-x-4 gap-y-2">
      <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
        {axis ? (
          <span
            className={cn("h-1.5 w-1.5 rounded-full", AXIS_FILL[axis])}
            aria-hidden="true"
          />
        ) : null}
        {etiqueta}
      </span>
      <span className="flex flex-wrap gap-1.5">{children}</span>
    </div>
  )
}

export function CaratulaCaso(props: CaratulaCasoProps) {
  const {
    tipoProceso,
    esProvisorio,
    valorUMA,
    transformaciones = [],
    modoTerminacion,
    sentenciaResultado,
    objetoBase,
    tuvoExcepciones,
    sucesionUnicoLetrado,
    medidaOposicion,
    homologacionVivienda,
    caducidadCriterio,
    aperturaPrueba,
    desalojoVivienda,
    posesoriasTipo,
  } = props

  const valores: Record<string, string | undefined> = {
    objetoBase: objetoBase ? OBJETO_LABEL[objetoBase] ?? objetoBase : undefined,
    desalojoVivienda: desalojoVivienda
      ? DESALOJO_TIPO_LABEL[desalojoVivienda]
      : undefined,
    homologacionVivienda: homologacionVivienda
      ? HOMOLOGACION_VIVIENDA_LABEL[homologacionVivienda]
      : undefined,
    sentenciaResultado: sentenciaResultado
      ? SENTENCIA_LABEL[sentenciaResultado]
      : undefined,
    modoTerminacion: modoTerminacion
      ? TERMINACION_LABEL[modoTerminacion]
      : undefined,
    caducidadCriterio: caducidadCriterio
      ? CADUCIDAD_CRITERIO_LABEL[caducidadCriterio]
      : undefined,
    aperturaPrueba: aperturaPrueba
      ? APERTURA_PRUEBA_LABEL[aperturaPrueba]
      : undefined,
    sucesionUnicoLetrado: sucesionUnicoLetrado
      ? SUCESION_LETRADO_LABEL[sucesionUnicoLetrado]
      : undefined,
    medidaOposicion: medidaOposicion
      ? MEDIDA_OPOSICION_LABEL[medidaOposicion]
      : undefined,
    tuvoExcepciones: tuvoExcepciones
      ? EXCEPCIONES_LABEL[tuvoExcepciones]
      : undefined,
    posesoriasTipo: posesoriasTipo
      ? POSESORIAS_TIPO_LABEL[posesoriasTipo]
      : undefined,
  }

  // Eje de cada respuesta, deducido de las reglas realmente aplicadas.
  const ejePorClave: Record<string, Axis> = {}
  for (const tx of transformaciones) {
    if (!tx.visible) continue
    for (const clave of REGLA_ORIGEN[tx.id] ?? []) {
      if (valores[clave]) ejePorClave[clave] = tx.etapa
    }
  }

  const presentes = ORDEN.filter((k) => valores[k])
  const grupos = AXIS_ORDER.map((axis) => ({
    axis,
    items: presentes.filter((k) => ejePorClave[k] === axis),
  })).filter((g) => g.items.length > 0)
  const neutros = presentes.filter((k) => !ejePorClave[k])

  return (
    <Card>
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-hair px-6 py-5">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-faint">
            Caso
          </span>
          <h1 className="mt-1 font-meter text-[26px] leading-tight tracking-tight text-foreground">
            {PROCESO_LABEL[tipoProceso] ?? tipoProceso}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {esProvisorio ? (
            <span className="rounded-sm bg-accent px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-accent-foreground">
              Provisorio
            </span>
          ) : null}
          <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
            <span className="tracking-wider text-faint">UMA</span>{" "}
            {pesos(valorUMA)}
          </span>
        </div>
      </div>

      <div className="space-y-3 px-6 py-5">
        {grupos.map(({ axis, items }) => (
          <Fila key={axis} etiqueta={AXIS_GRUPO[axis]} axis={axis}>
            {items.map((k) => (
              <Chip key={k} label={valores[k]!} axis={axis} />
            ))}
          </Fila>
        ))}

        {neutros.length > 0 ? (
          <Fila etiqueta="Sin impacto" axis={null}>
            {neutros.map((k) => (
              <Chip key={k} label={valores[k]!} axis={null} />
            ))}
          </Fila>
        ) : null}

        {grupos.length > 0 ? (
          <p className="max-w-3xl pt-1 text-[12px] leading-relaxed text-faint">
            Las respuestas de arriba estan pintadas con el color del eje que
            modificaron. El mismo color reaparece mas abajo, en el paso donde se
            aplica la regla. Las de &ldquo;sin impacto&rdquo; describen el caso
            pero no modifican el importe.
          </p>
        ) : null}
      </div>
    </Card>
  )
}
