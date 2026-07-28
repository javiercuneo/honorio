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
  rechazada: "Demanda rechazada",
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
