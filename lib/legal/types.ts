// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 L. Javier Cuneo Libarona
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
  alimentosTipo: AlimentosTipo
  baseValor: number
  /** Cual de los tres incisos del art. 50 rige. Solo en el exhorto. */
  exhortoInciso: ExhortoInciso
  /**
   * Si el oficio trae el valor pecuniario del principal.
   *
   * La ley 22.172 lo exige entre los recaudos del oficio (art. 3 inc.
   * 2, "el valor pecuniario, si existiera"), asi que en la practica
   * consta casi siempre. El caso que resta es el asunto no susceptible
   * de apreciacion pecuniaria, y ahi no hay nada que preguntar.
   */
  exhortoMontoTipo: ExhortoMontoTipo
  /**
   * El monto reclamado en el juicio exhortante.
   *
   * **Vive aparte de `baseValor` y no es un capricho de nombres.** Si
   * entrara por ahi, cualquier regla que mire la base lo tomaria por
   * una base regulatoria, que es exactamente lo que no es.
   */
  exhortoMonto: number
  /** Cuantos actos comprende el exhorto del inciso a). No multiplica. */
  exhortoActos: number
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

export type ExhortoMontoTipo = 'consta' | 'sin_monto' | ''

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

/**
 * Los dos supuestos del art. 39.
 *
 * 'fijacion'     — primer parrafo: se fija la cuota. Base = 2 años de
 *                  la cuota, escala del art. 21.
 * 'modificacion' — segundo parrafo: aumento, disminucion, cesacion o
 *                  coparticipacion. Base = 2 años de **la diferencia**,
 *                  y se aplica la escala de los incidentes.
 */
export type AlimentosTipo = string | null    // 'fijacion' | 'modificacion' | null

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
/** Cual de los tres incisos del art. 50 rige el exhorto. */
export type ExhortoInciso = 'a' | 'b' | 'c' | ''

/**
 * El monto del juicio exhortante y lo que se deriva de el.
 *
 * **Se llama `referencia` y no `base` a proposito.** El proceso
 * principal sigue en tramite: el monto es una pauta indiciaria y el
 * honorario del exhorto es a cuenta del definitivo. Ver
 * EXHORTO_MONTO_PAUTA en jurisprudencia.ts. Ningun campo de este
 * objeto multiplica a la banda del inciso.
 */
export interface ExhortoReferencia {
  /** El monto reclamado en el principal, tal como se ingreso. */
  montoPesos: number
  /** El mismo monto en UMA. Es la referencia principal y no se discute. */
  montoUMA: number
  /**
   * Lo que daria la escala del art. 21 si esto fuera el juicio
   * principal.
   *
   * **Es la referencia discutida**, y para los auxiliares es ademas la
   * regla operativa segun EXHORTO_AUXILIARES. Viene ausente cuando no
   * hay monto. **Nunca se topea**: recortarla a la banda del inciso
   * borraria justamente lo que informa, que es la magnitud del pleito.
   */
  art21?: {
    tituloEscala: string
    /** Honorario completo del patrocinante, tres etapas. */
    patrocinante: Rango
    /** La banda del 5 % al 10 % del art. 21. */
    auxiliares: Rango
  }
}

/**
 * El resultado de un exhorto, ya resuelto a un solo inciso.
 *
 * `piso` y `banda` son excluyentes y es la diferencia entre los
 * incisos: el a) dice "no podran ser inferiores a 3 UMA" y calla el
 * maximo, los otros dos fijan "una escala entre" con los dos extremos.
 * Por eso el a) no es un Rango con el techo en infinito sino otra
 * cosa, y quien lo presenta no puede confundirlos.
 */
export interface ExhortoResultado {
  inciso: ExhortoInciso
  /** Como se nombra el inciso en pantalla y en la prosa. */
  etiqueta: string
  /** Inciso a): piso duro, techo abierto. */
  piso?: { uma: number; pesos: number }
  /** Incisos b) y c): banda cerrada de abogados y procuradores. */
  banda?: Rango
  /**
   * Cuantos actos comprende el exhorto, en el inciso a).
   *
   * **No multiplica nada.** Entra a la prosa como hecho declarado, para
   * que la resolucion pueda decir por que el numero esta arriba del
   * piso. Ver la contraria de EXHORTO_INCISO_A_TECHO.
   */
  cantidadActos?: number
  referencia?: ExhortoReferencia
}

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
  /**
   * Que escala se aplico. Casi siempre la progresiva del art. 21; la
   * de los incidentes solo cuando el art. 39 segundo parrafo la manda
   * (aumento, disminucion, cesacion o coparticipacion de alimentos).
   *
   * La presentacion lo necesita: la tabla de tramos y la barra del
   * excedente son del art. 21 y no significan nada para un rango plano.
   * Ausente equivale a 'art21', para no romper lo ya construido.
   */
  regimen?: 'art21' | 'incidentes'
}

/// Actuaciones posteriores a la ejecucion propiamente dicha
/// (art. 41, ultima oracion) — solo ejecucion_sentencia
export interface ActuacionesPosteriores {
  patrocinante: Rango
  apoderado: Rango
  procurador: Rango
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
  actuacionesPosteriores?: ActuacionesPosteriores
  partidor?: Partidor
  exhorto?: ExhortoResultado
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
  /**
   * Un enlace al final de la explicacion, cuando el texto manda a
   * mirar algo afuera. `expanded` es una cadena plana y se renderiza
   * como tal a proposito —no se interpreta HTML de este schema—, asi
   * que el enlace va aparte y no incrustado en la frase.
   */
  enlace?: { texto: string; href: string }
}

// ---- Respuestas del wizard (formato generico) ----
export type Answers = Record<string, string | string[] | number | boolean | null>
