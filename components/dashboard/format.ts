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

export function formatNumberImpactful(value: number): { abrev: string; full: string } {
  if (!isFinite(value) || value === 0) return { abrev: "$0", full: "$0" }

  let abrev: string
  if (value >= 1_000_000_000) {
    abrev = "$" + (value / 1_000_000_000).toFixed(1).replace(".0", "") + "B"
  } else if (value >= 1_000_000) {
    abrev = "$" + (value / 1_000_000).toFixed(1).replace(".0", "") + "M"
  } else if (value >= 1_000) {
    abrev = "$" + (value / 1_000).toFixed(0) + "K"
  } else {
    abrev = pesos(value)
  }

  return { abrev, full: pesos(value) }
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