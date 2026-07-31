"use client"

// ---------------------------------------------------------------
// Las decisiones de la entrevista, como pie del ledger: un recuento
// compacto, no una tarjeta de metadatos que demore la cifra.
//
// El color de cada chip no sale de una tabla fija sino de las
// Transformaciones que el motor efectivamente aplico. Una respuesta
// que no disparo ninguna regla queda neutra, para no prometer un
// efecto que no ocurrio.
// ---------------------------------------------------------------

import { cn } from "@/lib/utils"
import {
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
import { type Axis, AXIS_TINT, Cifra, Etiqueta } from "./primitives"

export interface ChipsCasoProps {
  tipoProceso: ProcesoTipo
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

/** Que respuesta del wizard habilita cada regla del motor. */
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

export function ChipsCaso(props: ChipsCasoProps) {
  const {
    tipoProceso,
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

  const ejePorClave: Record<string, Axis> = {}
  for (const tx of transformaciones) {
    if (!tx.visible) continue
    for (const clave of REGLA_ORIGEN[tx.id] ?? []) {
      if (valores[clave]) ejePorClave[clave] = tx.etapa
    }
  }

  const presentes = ORDEN.filter((k) => valores[k])

  return (
    <div className="flex flex-wrap items-center gap-1.5 border-t border-hair pt-4">
      <Etiqueta className="mr-1">Caso</Etiqueta>
      <Chip label={PROCESO_LABEL[tipoProceso] ?? tipoProceso} axis={null} />
      {presentes.map((k) => (
        <Chip key={k} label={valores[k]!} axis={ejePorClave[k] ?? null} />
      ))}
      <span className="inline-flex items-center rounded-sm border border-border bg-secondary px-2 py-1 font-mono text-[11px] text-muted-foreground">
        <span className="mr-1.5 tracking-wider text-faint">UMA</span>
        <Cifra value={valorUMA} size="sm" className="text-muted-foreground" />
      </span>
    </div>
  )
}

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
