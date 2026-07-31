export function pesos(value: number): string {
  if (!isFinite(value)) return 'N/A'
  return "$" + value.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function umas(value: number): string {
  if (!isFinite(value)) return "N/A"
  return value.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " UMA"
}

export function porcentaje(value: number): string {
  if (!isFinite(value)) return "N/A"
  return (value * 100).toFixed(1) + "%"
}

/**
 * Parte entera y decimal de un importe, por separado.
 * Las cifras se muestran siempre completas: los centavos se componen
 * mas chicos, pero no se ocultan ni se redondean.
 */
export function splitPesos(value: number): { entero: string; decimal: string } {
  if (!isFinite(value)) return { entero: "N/A", decimal: "" }
  const abs = Math.abs(value).toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  const [entero, decimal] = abs.split(",")
  return { entero: (value < 0 ? "-$" : "$") + entero, decimal: decimal ?? "00" }
}

/** UMA sin sufijo, para componer con una etiqueta aparte. */
export function umaNum(value: number, digits = 2): string {
  if (!isFinite(value)) return "N/A"
  return value.toLocaleString("es-AR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
}

/** Recibe un valor ya expresado en unidades de porcentaje (17 -> "17%"). */
export function pct(value: number, digits = 0): string {
  if (!isFinite(value)) return "N/A"
  const s = value.toLocaleString("es-AR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
  return s + "%"
}

export const PROCESO_LABEL: Record<string, string> = {
  conocimiento: "Juicio de conocimiento",
  ejecucion_sentencia: "Ejecucion de sentencia",
  ejecutivo: "Juicio ejecutivo",
  sucesion: "Sucesion",
  medida_cautelar: "Medida cautelar",
  homologacion_desocupacion: "Homologacion de desocupacion",
  exhorto: "Exhorto",
  incidente: "Incidente",
}

export const TERMINACION_LABEL: Record<string, string> = {
  sentencia: "Sentencia",
  modos_anormales: "Modo anormal de terminacion",
  caducidad: "Caducidad de instancia",
  provisorios: "Honorarios provisorios",
}

export const SENTENCIA_LABEL: Record<string, string> = {
  admitida: "Demanda admitida",
  rechazada: "Demanda desestimada",
}

export const OBJETO_LABEL: Record<string, string> = {
  sumas_dinero: "Reclamo de sumas de dinero",
  desalojo: "Desalojo",
  inmuebles: "Reclamo de inmuebles",
  derechos_crediticios: "Derechos crediticios",
  titulos_acciones: "Titulos y acciones",
  establecimientos: "Establecimientos",
  uso_habitacion: "Uso y habitacion",
  escrituracion: "Escrituracion",
  familia_alimentos: "Alimentos",
  familia_liquidacion: "Liquidacion de sociedad conyugal",
  posesorias_interdictos: "Posesorias e interdictos",
  incidencia_colectiva: "Incidencia colectiva",
}

export const EXCEPCIONES_LABEL: Record<string, string> = {
  si: "Con excepciones",
  no: "Sin excepciones",
}

export const CADUCIDAD_CRITERIO_LABEL: Record<string, string> = {
  art22: "Caducidad como demanda desestimada",
  art25: "Caducidad como modo anormal",
}

export const APERTURA_PRUEBA_LABEL: Record<string, string> = {
  antes: "Antes de apertura a prueba",
  despues: "Despues de apertura a prueba",
}

export const SUCESION_LETRADO_LABEL: Record<string, string> = {
  unico: "Unico letrado",
  varios: "Varios letrados",
}

export const MEDIDA_OPOSICION_LABEL: Record<string, string> = {
  con: "Con oposicion",
  sin: "Sin oposicion",
}

export const HOMOLOGACION_VIVIENDA_LABEL: Record<string, string> = {
  vivienda: "Alquiler vivienda",
  otros: "Demas casos",
}

export const DESALOJO_TIPO_LABEL: Record<string, string> = {
  vivienda: "Alquiler vivienda",
  civil: "Desalojo civil",
  laboral: "Desalojo laboral",
}

export const POSESORIAS_TIPO_LABEL: Record<string, string> = {
  beneficio: "Beneficio exclusivo",
  demas: "Demas casos",
}

/**
 * Nombre corto y motivo de cada regla, por id de Transformacion.
 * Es capa de presentacion: el motor emite `concepto` en forma tecnica
 * y aca se traduce a algo legible sin tocar el calculo. Si un id no
 * figura, se muestra el `concepto` del motor tal cual.
 */
export const REGLA_LABEL: Record<string, { titulo: string; motivo: string }> = {
  "base-desalojo-vivienda": {
    titulo: "Inmueble destinado a vivienda",
    motivo:
      "El art. 40 manda reducir un 20% la base cuando el desalojo recae sobre un inmueble destinado a vivienda.",
  },
  "base-demanda-rechazada": {
    titulo: "Demanda rechazada",
    motivo:
      "El art. 22 toma como base el monto reclamado reducido en un 30% cuando la demanda se desestima.",
  },
  "base-caducidad-art22": {
    titulo: "Caducidad tratada como demanda desestimada",
    motivo:
      "La ley no previo la caducidad de instancia. Este calculo adopta el criterio de asimilarla a una demanda desestimada (art. 22).",
  },
  "escala-unico-letrado": {
    titulo: "Unico letrado en la sucesion",
    motivo:
      "El art. 35 reduce a la mitad la escala cuando un solo letrado interviene por todos los herederos.",
  },
  "escala-ejecucion-sentencia": {
    titulo: "Ejecucion de sentencia",
    motivo:
      "El art. 41 fija los honorarios de la ejecucion en el 50% de la escala del art. 21.",
  },
  "escala-art25": {
    titulo: "Termino antes de la apertura a prueba",
    motivo:
      "El art. 25 reduce la escala a la mitad cuando el proceso concluyo por un modo anormal —o por caducidad, si se adopta ese criterio— antes de abrirse la causa a prueba.",
  },
  "escala-cautelar": {
    titulo: "Medida cautelar",
    motivo:
      "El art. 29 inc. e regula la cautelar en un porcentaje de la escala, segun haya mediado o no oposicion.",
  },
  "escala-homologacion": {
    titulo: "Homologacion de desocupacion",
    motivo:
      "El art. 40 regula el acuerdo de desocupacion en el 50% de la escala.",
  },
  "final-ejecucion-sin-excepciones": {
    titulo: "No se opusieron excepciones",
    motivo:
      "El art. 34 reduce un 10% adicional el honorario cuando no hubo excepciones que tramitar.",
  },
  "final-posesorias-beneficio": {
    titulo: "Posesorio en beneficio exclusivo",
    motivo:
      "El art. 38 reduce un 20% el honorario en las acciones posesorias e interdictos promovidos en beneficio exclusivo del actor.",
  },
  "final-incidencia-colectiva": {
    titulo: "Proceso de incidencia colectiva",
    motivo:
      "El art. 49 reduce un 25% el honorario en los procesos de incidencia colectiva.",
  },
}