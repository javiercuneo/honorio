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

// ---- Output de calcularFinal (estructurado, Milestone 2) ----
// Por ahora el motor genera HTML directamente. Esto es un placeholder.
export interface ResultadoCalculo {
  html: string
}

// ============================================================
// Modelo estructurado de resultados (Milestone 2+)
// ============================================================

/// Rango simple de valores minimo/maximo
export interface Rango {
  minUMA: number
  maxUMA: number
  minPesos: number
  maxPesos: number
}

/// Transformacion aplicada a una variable durante el calculo
export interface Transformacion {
  id: string
  etapa: 'base' | 'escala' | 'honorarios'
  concepto: string
  articulo: string
  visible: boolean
  valorPrevio: number
  factor: number
  valorPosterior: number
}

/// Honorarios para un rol (patrocinante, apoderado o procurador)
export interface HonorariosRol {
  rango: Rango
}

/// Honorarios para los tres roles
export interface Honorarios {
  patrocinante: HonorariosRol
  apoderado: HonorariosRol
  procurador: HonorariosRol
}

/// Segunda instancia (art. 30) — valores por rol
export interface SegundaInstancia {
  patrocinante: SegundaInstanciaRol
  apoderado: SegundaInstanciaRol
  procurador: SegundaInstanciaRol
}

/// Valores de segunda instancia para un rol especifico
export interface SegundaInstanciaRol {
  minimo: Rango
  maximo: Rango
  revocada: Rango
}

/// Informacion de transparencia de la escala (art. 21)
export interface EscaleraInfo {
  maximoEscalaAnterior: number
  limiteAnterior: number
  excedente: number
}

/// Escala arancelaria aplicada
export interface EscalaAplicada {
  titulo: string
  baseEnUMA: number
  porcentajeMin: number
  porcentajeMax: number
  porcentajeMinAplicado: number
  porcentajeMaxAplicado: number
  escalera?: EscaleraInfo
}

/// Partidor (solo sucesion, art. 35)
export interface Partidor {
  minPorcentaje: number
  maxPorcentaje: number
  minUMA: number
  maxUMA: number
  minPesos: number
  maxPesos: number
}

/// Resultado completo y estructurado del calculo de honorarios
export interface CalculoResultado {
  tipoProceso: ProcesoTipo
  esProvisorio: boolean
  baseOriginal: number
  baseFinal: number
  valorUMA: number
  escala?: EscalaAplicada
  honorarios: Honorarios
  segundaInstancia?: SegundaInstancia
  auxiliares: Rango
  partidor?: Partidor
  exhorto?: {
    incisoA: number
    incisoB: Rango
    incisoC: Rango
  }
  incidente?: {
    porcentajeMin: number
    porcentajeMax: number
  }
  transformaciones: Transformacion[]
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

