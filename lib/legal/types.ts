// ---------------------------------------------------------------
// lib/legal/types.ts
// Interfaces del motor juridico — Framework-agnostic
// Refleja el contrato publico de core.js + state.js + calculations.js
// Milestone 1: copia fiel del contrato JS. Milestone 2: tipado estricto.
// ---------------------------------------------------------------

// ---- Estado global del wizard (wizardState) ----
export interface WizardState {
  step: number | 'minimos'
  valorUMA: number
  tipoProceso: ProcesoTipo
  modoTerminacion: ModoTerminacion
  sentenciaResultado: SentenciaResultado
  aperturaPrueba: boolean | null
  caducidadCriterio: CaducidadCriterio
  tuvoExcepciones: boolean | null
  sucesionUnicoLetrado: boolean | null
  medidaOposicion: boolean | null
  homologacionVivienda: boolean | null
  objetoBase: ObjetoBase
  desalojoVivienda: DesalojoVivienda
  posesoriasTipo: PosesoriasTipo
  baseValor: number
  esProvisorio: boolean
  desdeMinimos: boolean
  desdeResultado: boolean
}

// ---- Enums / unions de dominio legal ----
export type ProcesoTipo =
  | 'conocimiento'
  | 'ejecucion_sentencia'
  | 'ejecutivo'
  | 'sucesion'
  | 'medida_cautelar'
  | 'homologacion_desocupacion'
  | 'exhorto'
  | 'incidente'
  | 'minimos_judicial'
  | 'minimos_extrajudicial'
  | 'minimos_judiciales'
  | 'minimos_art58'
  | 'minimos_recursos_csjn'
  | 'minimos_auxiliares'
  | ''

export type ModoTerminacion =
  | ''
  | 'sentencia'
  | 'modos_anormales'
  | 'caducidad'
  | 'provisorios'

export type SentenciaResultado = string | null // 'admitida' | 'rechazada' | null

export type CaducidadCriterio = '' | 'art22' | 'art25'

export type ObjetoBase =
  | ''
  | 'desalojo'
  | 'sumas_dinero'
  | 'inmuebles'
  | 'derechos_crediticios'
  | 'titulos_acciones'
  | 'establecimientos'
  | 'uso_habitacion'
  | 'escrituracion'
  | 'familia_alimentos'
  | 'familia_liquidacion'
  | 'posesorias_interdictos'
  | 'incidencia_colectiva'

export type DesalojoVivienda = string | null // 'vivienda' | 'civil' | 'laboral' | null
export type PosesoriasTipo = string | null   // 'beneficio' | 'demas' | null

// ---- Resultados de calculo ----
export interface Etapa {
  min: number
  max: number
}

export interface RolResult {
  full: Etapa
  uno: Etapa
  dos: Etapa
}

export interface EscalaResult {
  tituloEscala: string
  baseEnUMA: number
  minPorc: number
  maxPorc: number
  maximoEscalaAnterior: number
  limiteAnterior: number
  patrocinante: RolResult
  apoderado: RolResult
  auxMin: number
  auxMax: number
}

export interface GrupoResult {
  min: number
  max: number
}

// ---- Output de calcularFinal (estructurado, para Milestone 2) ----
// Por ahora el motor genera HTML directamente. Esto es un placeholder
// para cuando extraigamos la logica a TS puro.
export interface ResultadoCalculo {
  html: string
  // En Milestone 2 se agregaran campos estructurados:
  // escala: EscalaResult
  // honorarios: { patrocinante, apoderado, procurador }
  // segundaInstancia: ...
  // auxiliares: ...
  // minimos: ...
}

// ---- Minimos ----
export type MinimosModo =
  | 'judicial'
  | 'extrajudicial'
  | 'judiciales'
  | 'art58'
  | 'recursos_csjn'
  | 'auxiliares_justicia'

// ---- Componentes de UI compartidos ----
export interface CardOption {
  id: string
  label: string
  description: string
  hint?: string
}

export interface Explanation {
  brief: string
  expanded: string
  full: string[]
}

// ---- Respuestas del wizard (formato generico) ----
export type Answers = Record<string, string | string[] | number | boolean | null>

