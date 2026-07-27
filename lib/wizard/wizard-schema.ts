// ---------------------------------------------------------------
// lib/wizard/wizard-schema.ts
// Schema declarativo del wizard legal.
// Define cada paso, sus opciones, dependencias y validaciones.
// Framework-agnostic � solo datos, sin logica de negocio.
// Compatible con los componentes CardsField y NumericField de honorio.
//
// Milestone 1: schema completo del flujo clasico.
// Milestone 2: se enriquecera con sub-pasos y ramificaciones
//              mas complejas (contingencias anidadas).
// ---------------------------------------------------------------

import type { CardOption, Explanation, Answers } from '@/lib/legal/types'

// ---- Tipos del schema ----

export interface BaseStepDef {
  id: string
  /** Categoria corta, se muestra en mono-espaciado */
  eyebrow: string
  pregunta: string
  /** Texto de ayuda bajo la pregunta */
  ayuda: string
  /** Explicacion legal desplegable */
  explicacion: Explanation
  /** Etiqueta para el resumen lateral */
  resumenLabel: string
  /** IDs de pasos de los que depende (para visibilidad condicional) */
  dependsOn?: string[]
  /** Condicion para mostrar este paso */
  condition?: (answers: Answers) => boolean
  /** Validador personalizado para el paso */
  validate?: (value: unknown, answers: Answers) => string | null
  /** Si es true, se saltea este paso (no se muestra al usuario) */
  skip?: (answers: Answers) => boolean
}

export interface CardsStepDef extends BaseStepDef {
  kind: 'cards'
  select: 'single' | 'multi'
  options: CardOption[]
}

export interface NumericStepDef extends BaseStepDef {
  kind: 'numeric'
  prefix?: string
  suffix?: string
  unidad: string
  min: number
  max: number
  step: number
  default: number
  presets: number[]
  format: (value: number) => string
}

export type WizardStepDef = CardsStepDef | NumericStepDef

// ---- Helpers de formato ----

const pesos = (v: number) =>
  '$' + v.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const umas = (v: number) => v.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' UMA'

// ---- Opciones reutilizables ----

export const TIPOS_PROCESO: CardOption[] = [
  {
    id: 'conocimiento',
    label: 'Juicio de conocimiento',
    description: 'Proceso ordinario mas completo. Incluye todas las etapas procesales.',
    hint: 'Art. 21 y sig.',
  },
  {
    id: 'ejecucion_sentencia',
    label: 'Ejecucion de sentencia',
    description: 'Proceso para ejecutar una sentencia firme.',
    hint: 'Art. 41',
  },
  {
    id: 'ejecutivo',
    label: 'Juicio ejecutivo',
    description: 'Ejecucion de titulos ejecutivos (pagar�s, cheques, etc.).',
    hint: 'Art. 34',
  },
  {
    id: 'sucesion',
    label: 'Sucesion',
    description: 'Proceso sucesorio. Transmision de patrimonio.',
    hint: 'Art. 35',
  },
  {
    id: 'medida_cautelar',
    label: 'Medida cautelar',
    description: 'Embargos, inhibiciones, secuestros y otras medidas cautelares.',
    hint: 'Art. 37',
  },
  {
    id: 'homologacion_desocupacion',
    label: 'Homologacion de desocupacion',
    description: 'Homologacion de convenio de desocupacion y su ejecucion.',
    hint: 'Art. 40',
  },
  {
    id: 'exhorto',
    label: 'Exhorto',
    description: 'Diligenciamiento de exhortos u oficios (Ley 22.172).',
    hint: 'Art. 50',
  },
  {
    id: 'incidente',
    label: 'Incidente',
    description: 'Incidente dentro de un proceso principal.',
    hint: 'Art. 29 inc. g',
  },
]

export const MODOS_TERMINACION: CardOption[] = [
  {
    id: 'sentencia',
    label: 'Sentencia',
    description: 'El proceso culmina con sentencia definitiva.',
  },
  {
    id: 'modos_anormales',
    label: 'Modos anormales',
    description: 'Allanamiento, transaccion o desistimiento.',
    hint: 'Art. 25',
  },
  {
    id: 'caducidad',
    label: 'Caducidad de instancia',
    description: 'El proceso caduca por inactividad.',
    hint: 'Arts. 22 / 25',
  },
  {
    id: 'provisorios',
    label: 'Honorarios provisorios',
    description: 'Regulacion provisoria antes de la conclusion normal.',
    hint: 'Art. 12',
  },
]

export const SENTENCIA_RESULTADO: CardOption[] = [
  {
    id: 'admitida',
    label: 'Demanda admitida',
    description: 'La sentencia hace lugar a la demanda.',
  },
  {
    id: 'rechazada',
    label: 'Demanda rechazada',
    description: 'La sentencia rechaza la demanda. La base se reduce 30%.',
    hint: 'Art. 22',
  },
]

export const APERTURA_PRUEBA: CardOption[] = [
  {
    id: 'antes',
    label: 'Antes de apertura a prueba',
    description: 'El modo anormal ocurrio antes de la apertura a prueba. Honorarios: 50% de la escala.',
    hint: 'Art. 25',
  },
  {
    id: 'despues',
    label: 'Despues de apertura a prueba',
    description: 'El modo anormal ocurrio luego de la apertura a prueba. Honorarios: 100% de la escala.',
  },
]

export const CADUCIDAD_CRITERIO: CardOption[] = [
  {
    id: 'art22',
    label: 'Aplicar Art. 22 (demanda desestimada)',
    description: 'La base se reduce en un 30% (como si fuera demanda rechazada).',
    hint: 'Art. 22',
  },
  {
    id: 'art25',
    label: 'Aplicar Art. 25 (modo anormal)',
    description: 'Se trata como modo anormal de terminacion. Si es antes de prueba: 50% de la escala.',
    hint: 'Art. 25',
  },
]

export const EXCEPCIONES: CardOption[] = [
  {
    id: 'si',
    label: 'Se dedujeron excepciones',
    description: 'Hubo oposicion con excepciones. No hay reduccion adicional.',
  },
  {
    id: 'no',
    label: 'No se dedujeron excepciones',
    description: 'Sin excepciones. Los honorarios se reducen en un 10%.',
    hint: 'Arts. 34 / 41',
  },
]

export const SUCESION_LETRADO: CardOption[] = [
  {
    id: 'unico',
    label: 'Un solo abogado',
    description: 'Un solo letrado patrocina a todos los herederos. Honorarios: 50% de la escala.',
    hint: 'Art. 35',
  },
  {
    id: 'varios',
    label: 'Varios abogados',
    description: 'Cada heredero tiene su propio letrado. Se aplica la escala completa.',
  },
]

export const CAUTELAR_OPOSICION: CardOption[] = [
  {
    id: 'con',
    label: 'Con oposicion',
    description: 'Hubo controversia u oposicion. Base: 50% de la escala.',
    hint: 'Art. 37',
  },
  {
    id: 'sin',
    label: 'Sin oposicion',
    description: 'No hubo controversia. Base: 25% de la escala.',
    hint: 'Art. 37',
  },
]

export const HOMOLOGACION_VIVIENDA: CardOption[] = [
  {
    id: 'vivienda',
    label: 'Alquiler para vivienda',
    description: 'La locacion era para vivienda. La base se reduce en un 20%.',
    hint: 'Art. 40',
  },
  {
    id: 'otros',
    label: 'Demas casos',
    description: 'Locacion para otros fines (comercial, etc.). Sin reduccion adicional.',
  },
]

export const OBJETO_JUICIO: CardOption[] = [
  {
    id: 'sumas_dinero',
    label: 'Cobro de sumas de dinero',
    description: 'Reclamo de cantidad liquida o liquidada.',
    hint: 'Art. 22',
  },
  {
    id: 'desalojo',
    label: 'Desalojo',
    description: 'Restitucion de inmueble. Base: total de alquileres del contrato.',
    hint: 'Art. 40',
  },
  {
    id: 'inmuebles',
    label: 'Bienes inmuebles',
    description: 'Bienes susceptibles de apreciacion pecuniaria.',
    hint: 'Art. 23 inc. a',
  },
  {
    id: 'derechos_crediticios',
    label: 'Derechos crediticios',
    description: 'Valor consignado en escrituras o documentos.',
    hint: 'Art. 23 inc. d',
  },
  {
    id: 'titulos_acciones',
    label: 'Titulos y acciones',
    description: 'Valor de cotizacion en Bolsa o informe bancario.',
    hint: 'Art. 23 inc. e',
  },
  {
    id: 'establecimientos',
    label: 'Establecimientos comerciales',
    description: 'Activo menos pasivo, mas 10% de valor llave.',
    hint: 'Art. 23 inc. f',
  },
  {
    id: 'uso_habitacion',
    label: 'Uso y habitacion',
    description: '10% anual del valor del bien por los anos del derecho.',
    hint: 'Art. 23 inc. h',
  },
  {
    id: 'escrituracion',
    label: 'Escrituracion',
    description: 'Valor del bien o monto del boleto (el mayor).',
    hint: 'Art. 46',
  },
  {
    id: 'familia_alimentos',
    label: 'Alimentos',
    description: '2 anos de la cuota fijada judicialmente.',
    hint: 'Art. 39',
  },
  {
    id: 'familia_liquidacion',
    label: 'Liquidacion de sociedad conyugal',
    description: 'Valor del patrimonio adjudicado.',
    hint: 'Art. 45',
  },
  {
    id: 'posesorias_interdictos',
    label: 'Acciones posesorias e interdictos',
    description: 'Acciones posesorias, interdictos o division de bienes comunes.',
    hint: 'Art. 38',
  },
  {
    id: 'incidencia_colectiva',
    label: 'Incidencia colectiva',
    description: 'Acciones sobre derechos de incidencia colectiva con contenido patrimonial.',
    hint: 'Art. 49',
  },
]

export const DESALOJO_TIPO: CardOption[] = [
  {
    id: 'vivienda',
    label: 'Alquiler para vivienda',
    description: 'La base se reduce en un 20%.',
    hint: 'Art. 40',
  },
  {
    id: 'civil',
    label: 'Demas casos civiles',
    description: 'Sin reduccion adicional sobre la base.',
  },
  {
    id: 'laboral',
    label: 'Desalojo laboral',
    description: 'Base: 50% de la ultima remuneracion mensual por 2 anos.',
    hint: 'Art. 43',
  },
]

export const POSESORIAS_TIPO: CardOption[] = [
  {
    id: 'beneficio',
    label: 'Beneficio exclusivo del patrocinado',
    description: 'Honorarios reducidos en un 20% sobre la escala.',
    hint: 'Art. 38',
  },
  {
    id: 'demas',
    label: 'Demas casos',
    description: 'Se aplica la escala completa.',
  },
]

// ---- Definicion de pasos del wizard ----

export const LEGAL_STEPS: WizardStepDef[] = [
  // Paso 0: UMA
  {
    id: 'umaInicio',
    kind: 'numeric',
    eyebrow: 'Inicio',
    pregunta: 'Valor de la UMA',
    ayuda: 'Ingrese el valor actual de la Unidad de Medida Arancelaria (UMA). Se carga automaticamente desde la base oficial, pero puede ajustarlo manualmente.',
    resumenLabel: 'Valor UMA',
    unidad: 'por UMA',
    prefix: '$',
    min: 50000,
    max: 200000,
    step: 100,
    default: 92482,
    presets: [70000, 92482, 100000, 120000],
    format: pesos,
    explicacion: {
      brief: 'La UMA es la unidad de medida base para todos los calculos arancelarios.',
      expanded: 'La Ley 27.423 establece que los honorarios se calculan en UMA (Unidad de Medida Arancelaria), cuyo valor es fijado periodicamente por el Consejo de la Magistratura. Este valor se multiplica por la cantidad de UMA que resulte de aplicar la escala del art. 21.',
      full: [
        'El valor de la UMA se actualiza trimestralmente.',
        'Se carga automaticamente desde la planilla oficial del Consejo de la Magistratura.',
        'Puede modificarse manualmente si el valor automatico no es el correcto.',
      ],
    },
  },

  // Paso 1: Tipo de proceso
  {
    id: 'tipoProceso',
    kind: 'cards',
    select: 'single',
    eyebrow: 'Proceso',
    pregunta: 'Seleccione el tipo de proceso',
    ayuda: 'El tipo de proceso determina que reglas legales se aplican al calculo de honorarios.',
    resumenLabel: 'Tipo de proceso',
    options: TIPOS_PROCESO,
    explicacion: {
      brief: 'Cada tipo de proceso tiene reglas arancelarias especificas en la Ley 27.423.',
      expanded: 'La ley distingue entre procesos de conocimiento, ejecutivos, sucesorios, medidas cautelares, entre otros. Cada uno tiene su propio tratamiento en cuanto a base regulatoria, escala aplicable y reducciones.',
      full: [
        'Los procesos de conocimiento tienen la escala mas completa (Art. 21).',
        'Los ejecutivos y ejecucion de sentencia tienen reducciones especificas.',
        'Las sucesiones tienen reglas particulares para unico letrado y partidor.',
      ],
    },
  },

  // Paso 2: Contingencias
  // NOTA: Este paso es dinamico segun tipoProceso.
  // Las opciones cambian segun el valor de tipoProceso.
  // El hook useWizard determina que opciones mostrar.
  {
    id: 'contingencias',
    kind: 'cards',
    select: 'single',
    eyebrow: 'Contingencias',
    pregunta: 'Contingencias procesales',
    ayuda: 'Seleccione las circunstancias especificas del proceso que afectan el calculo.',
    resumenLabel: 'Contingencias',
    options: [], // Se completa dinamicamente segun tipoProceso
    dependsOn: ['tipoProceso'],
    explicacion: {
      brief: 'Las contingencias procesales modifican la base y/o la escala aplicable.',
      expanded: 'Dependiendo del tipo de proceso y su forma de terminacion, la ley establece reducciones en la base regulatoria (Art. 22, 40) o en la escala de honorarios (Art. 25, 35, 41).',
      full: [
        'Sentencia: puede ser admitida o rechazada (Art. 22).',
        'Modos anormales: allanamiento, transaccion o desistimiento (Art. 25).',
        'Caducidad: puede tratarse como Art. 22 o Art. 25.',
        'Provisorios: solo se muestra el minimo (Art. 12).',
      ],
    },
  },

  // Paso 3: Objeto del juicio (solo para conocimiento)
  {
    id: 'objeto',
    kind: 'cards',
    select: 'single',
    eyebrow: 'Objeto',
    pregunta: 'Objeto del juicio',
    ayuda: 'Seleccione la naturaleza del objeto del proceso. Define como se calcula la base regulatoria.',
    resumenLabel: 'Objeto del juicio',
    options: OBJETO_JUICIO,
    dependsOn: ['tipoProceso'],
    condition: (answers) => answers.tipoProceso === 'conocimiento',
    explicacion: {
      brief: 'El objeto del juicio determina la base regulatoria segun distintos articulos de la ley.',
      expanded: 'Cada tipo de objeto tiene reglas especificas para determinar la base: sumas de dinero (Art. 22), inmuebles (Art. 23), desalojo (Art. 40), alimentos (Art. 39), etc.',
      full: [
        'Para sumas de dinero: la cuantia es el monto de demanda o liquidacion (Art. 22).',
        'Para inmuebles: valuacion fiscal + 50% o tasacion (Art. 23).',
        'Para desalojo: total de alquileres del contrato (Art. 40).',
        'Cada objeto tiene su propio metodo de calculo de la base.',
      ],
    },
  },

  // Paso 4: Base regulatoria
  {
    id: 'base',
    kind: 'numeric',
    eyebrow: 'Base',
    pregunta: 'Base regulatoria',
    ayuda: 'Ingrese el monto de la base regulatoria en pesos. Refleja el valor economico del asunto.',
    resumenLabel: 'Base regulatoria',
    unidad: 'pesos',
    prefix: '$',
    min: 0,
    max: 999999999999,
    step: 1000,
    default: 0,
    presets: [500000, 1000000, 5000000, 10000000],
    format: pesos,
    explicacion: {
      brief: 'La base regulatoria es el valor economico sobre el que se aplica la escala de honorarios.',
      expanded: 'La base se determina segun las reglas de los articulos 22, 23, 24 de la Ley 27.423, dependiendo del tipo de proceso y objeto del juicio. Sobre esta base se aplica la escala porcentual del Art. 21.',
      full: [
        'La base debe incluir los intereses (Art. 24).',
        'Puede reducirse por aplicacion de los articulos 22 (demanda rechazada) y 40 (vivienda).',
        'No ingrese montos ya reducidos: el sistema aplica las reducciones automaticamente.',
      ],
    },
  },
]

// ---- Mapa de opciones dinamicas para contingencias ----
// El hook usa esto para determinar que opciones mostrar segun tipoProceso.

export const CONTINGENCIAS_POR_PROCESO: Record<
  string,
  { paso: string; opciones: CardOption[]; opcionesSecundarias?: Record<string, CardOption[]> }
> = {
  conocimiento: {
    paso: 'modoTerminacion',
    opciones: MODOS_TERMINACION,
    opcionesSecundarias: {
      sentencia: SENTENCIA_RESULTADO,
      modos_anormales: APERTURA_PRUEBA,
      caducidad: CADUCIDAD_CRITERIO,
    },
  },
  ejecucion_sentencia: {
    paso: 'modoTerminacion',
    opciones: [...MODOS_TERMINACION, ...EXCEPCIONES],
    opcionesSecundarias: {
      sentencia: SENTENCIA_RESULTADO,
      modos_anormales: APERTURA_PRUEBA,
      caducidad: CADUCIDAD_CRITERIO,
    },
  },
  ejecutivo: {
    paso: 'modoTerminacion',
    opciones: [...MODOS_TERMINACION, ...EXCEPCIONES],
    opcionesSecundarias: {
      sentencia: SENTENCIA_RESULTADO,
      modos_anormales: APERTURA_PRUEBA,
      caducidad: CADUCIDAD_CRITERIO,
    },
  },
  sucesion: {
    paso: 'sucesionLetrado',
    opciones: SUCESION_LETRADO,
  },
  medida_cautelar: {
    paso: 'cautelarOposicion',
    opciones: CAUTELAR_OPOSICION,
  },
  homologacion_desocupacion: {
    paso: 'homologacionVivienda',
    opciones: HOMOLOGACION_VIVIENDA,
  },
}

// ---- Metadatos de pasos ----
// Sub-opciones que aparecen cuando se selecciona una opcion particular.

export const SUB_OPCIONES: Record<
  string,
  Record<string, CardOption[]>
> = {
  objeto: {
    desalojo: DESALOJO_TIPO,
    posesorias_interdictos: POSESORIAS_TIPO,
  },
}

// ---- Nombres legibles para valores ----
export function labelDelValor(pasoId: string, valor: string): string {
  if (pasoId === 'tipoProceso') {
    return TIPOS_PROCESO.find(o => o.id === valor)?.label ?? valor
  }
  // ... se completa segun necesidad
  return valor
}

// ---- Resumen de pasos para el panel lateral ----
export function resumenPaso(paso: WizardStepDef, answers: Answers): string | null {
  const value = answers[paso.id]
  if (value === undefined || value === null || value === '') return null

  if (paso.kind === 'numeric') {
    return typeof value === 'number' ? paso.format(value) : null
  }

  if (paso.kind === 'cards') {
    if (paso.select === 'multi') {
      const ids = Array.isArray(value) ? value : []
      if (ids.length === 0) return null
      if (ids.length === 1) {
        return paso.options.find(o => o.id === ids[0])?.label ?? null
      }
      return ids.length + ' seleccionados'
    }
    return paso.options.find(o => o.id === value)?.label ?? String(value)
  }

  return String(value)
}


// ---- Pasos de contingencia (insertados dinamicamente) ----

export const STEP_MODO_TERMINACION: CardsStepDef = {
  id: 'modoTerminacion',
  kind: 'cards',
  select: 'single',
  eyebrow: 'Terminacion',
  pregunta: 'Forma de terminacion del proceso',
  ayuda: 'El modo en que termina el proceso afecta directamente el calculo de honorarios.',
  resumenLabel: 'Terminacion',
  options: MODOS_TERMINACION,
  dependsOn: ['tipoProceso'],
  condition: (answers) =>
    ['conocimiento', 'ejecucion_sentencia', 'ejecutivo'].includes(answers.tipoProceso as string),
  explicacion: {
    brief: 'La forma de terminacion determina que reducciones se aplican.',
    expanded: 'Sentencia (Art. 22), modos anormales (Art. 25), caducidad (Art. 22 o 25) y provisorios (Art. 12) tienen distintos tratamientos arancelarios.',
    full: [
      'Sentencia admitida: sin reduccion adicional.',
      'Sentencia rechazada: base reducida 30% (Art. 22).',
      'Modos anormales antes de prueba: 50% de escala (Art. 25).',
      'Provisorios: solo minimo (Art. 12).',
    ],
  },
}

export const STEP_SENTENCIA_RESULTADO: CardsStepDef = {
  id: 'sentenciaResultado',
  kind: 'cards',
  select: 'single',
  eyebrow: 'Sentencia',
  pregunta: 'Resultado de la sentencia',
  ayuda: 'Indique si la demanda fue admitida o rechazada.',
  resumenLabel: 'Resultado',
  options: SENTENCIA_RESULTADO,
  dependsOn: ['modoTerminacion'],
  condition: (answers) => answers.modoTerminacion === 'sentencia',
  explicacion: {
    brief: 'Si la demanda es rechazada, la base se reduce un 30% (Art. 22).',
    expanded: 'El Art. 22 establece que si la demanda es desestimada, se toma como valor del pleito el importe de la misma disminuido en un 30%.',
    full: ['Demanda admitida: sin reduccion.', 'Demanda rechazada: base -30% (Art. 22).'],
  },
}

export const STEP_APERTURA_PRUEBA: CardsStepDef = {
  id: 'aperturaPrueba',
  kind: 'cards',
  select: 'single',
  eyebrow: 'Prueba',
  pregunta: 'Momento de la terminacion',
  ayuda: 'Indique si ocurrio antes o despues de la apertura a prueba.',
  resumenLabel: 'Apertura a prueba',
  options: APERTURA_PRUEBA,
  dependsOn: ['modoTerminacion', 'caducidadCriterio'],
  condition: (answers) =>
    answers.modoTerminacion === 'modos_anormales' ||
    (answers.modoTerminacion === 'caducidad' && answers.caducidadCriterio === 'art25'),
  explicacion: {
    brief: 'Si ocurre antes de la apertura a prueba, los honorarios se reducen al 50%.',
    expanded: 'Art. 25: allanamiento, desistimiento y transaccion antes de la apertura a prueba = 50% de la escala.',
    full: ['Antes de prueba: 50% de la escala.', 'Despues de prueba: 100% de la escala.'],
  },
}

export const STEP_CADUCIDAD_CRITERIO: CardsStepDef = {
  id: 'caducidadCriterio',
  kind: 'cards',
  select: 'single',
  eyebrow: 'Caducidad',
  pregunta: 'Criterio para la caducidad',
  ayuda: 'Elija como tratar la caducidad de instancia.',
  resumenLabel: 'Caducidad',
  options: CADUCIDAD_CRITERIO,
  dependsOn: ['modoTerminacion'],
  condition: (answers) => answers.modoTerminacion === 'caducidad',
  explicacion: {
    brief: 'La caducidad puede tratarse como demanda desestimada (Art. 22) o como modo anormal (Art. 25).',
    expanded: 'Art. 22: base reducida 30%. Art. 25: 50% de la escala si es antes de apertura a prueba.',
    full: [
      'Art. 22: reduccion de base del 30%.',
      'Art. 25: reduccion de escala al 50% si es antes de prueba.',
    ],
  },
}

export const STEP_EXCEPCIONES: CardsStepDef = {
  id: 'tuvoExcepciones',
  kind: 'cards',
  select: 'single',
  eyebrow: 'Excepciones',
  pregunta: 'Se dedujeron excepciones?',
  ayuda: 'En ejecuciones, la ausencia de excepciones reduce los honorarios en un 10%.',
  resumenLabel: 'Excepciones',
  options: EXCEPCIONES,
  dependsOn: ['tipoProceso'],
  condition: (answers) =>
    ['ejecucion_sentencia', 'ejecutivo'].includes(answers.tipoProceso as string),
  explicacion: {
    brief: 'Sin excepciones: reduccion del 10% (Arts. 34 y 41).',
    expanded: 'Art. 34 (ejecutivo) y Art. 41 (ejecucion de sentencia): no habiendo excepciones, los honorarios se reducen en un 10%.',
    full: ['Con excepciones: sin reduccion.', 'Sin excepciones: -10% sobre honorarios.'],
  },
}

export const STEP_SUCESION_LETRADO: CardsStepDef = {
  id: 'sucesionUnicoLetrado',
  kind: 'cards',
  select: 'single',
  eyebrow: 'Letrado',
  pregunta: 'Cuantos abogados intervienen?',
  ayuda: 'Si un solo letrado patrocina a todos los herederos, los honorarios se reducen al 50%.',
  resumenLabel: 'Unico letrado',
  options: SUCESION_LETRADO,
  dependsOn: ['tipoProceso'],
  condition: (answers) => answers.tipoProceso === 'sucesion',
  explicacion: {
    brief: 'Unico letrado en sucesion: 50% de la escala (Art. 35).',
    expanded: 'Art. 35: si un solo abogado patrocina a todos los herederos, sus honorarios se regulan en la mitad del minimo y del maximo de la escala del Art. 21.',
    full: ['Unico letrado: 50% de la escala.', 'Varios letrados: escala completa.'],
  },
}

export const STEP_CAUTELAR_OPOSICION: CardsStepDef = {
  id: 'medidaOposicion',
  kind: 'cards',
  select: 'single',
  eyebrow: 'Oposicion',
  pregunta: 'Hubo oposicion en la cautelar?',
  ayuda: 'La existencia de controversia modifica el porcentaje de la escala aplicable.',
  resumenLabel: 'Oposicion',
  options: CAUTELAR_OPOSICION,
  dependsOn: ['tipoProceso'],
  condition: (answers) => answers.tipoProceso === 'medida_cautelar',
  explicacion: {
    brief: 'Con oposicion: 50% de la escala. Sin oposicion: 25% (Art. 37).',
    expanded: 'Art. 37: las medidas cautelares se regulan sobre el 25% de la escala; si hay oposicion, sobre el 50%.',
    full: ['Sin oposicion: 25% de la escala.', 'Con oposicion: 50% de la escala.'],
  },
}

export const STEP_HOMOLOGACION_VIVIENDA: CardsStepDef = {
  id: 'homologacionVivienda',
  kind: 'cards',
  select: 'single',
  eyebrow: 'Vivienda',
  pregunta: 'La locacion era para vivienda?',
  ayuda: 'Si era para vivienda, la base se reduce en un 20% adicional.',
  resumenLabel: 'Tipo vivienda',
  options: HOMOLOGACION_VIVIENDA,
  dependsOn: ['tipoProceso'],
  condition: (answers) => answers.tipoProceso === 'homologacion_desocupacion',
  explicacion: {
    brief: 'Vivienda: base -20% (Art. 40).',
    expanded: 'Art. 40: en desalojos para vivienda, la base se reduce en un 20%. Ademas, la homologacion reduce los honorarios al 50%.',
    full: ['Vivienda: base -20% + 50% por homologacion.', 'Otros: solo 50% por homologacion.'],
  },
}

// ---- Lista completa de pasos (ordenada) ----
// El hook filtra los pasos segun su condicion para construir el wizard visible.

export const ALL_STEPS: WizardStepDef[] = [
  ...LEGAL_STEPS.slice(0, 2), // umaInicio, tipoProceso
  STEP_MODO_TERMINACION,
  STEP_SENTENCIA_RESULTADO,
  STEP_CADUCIDAD_CRITERIO,
  STEP_APERTURA_PRUEBA,
  STEP_EXCEPCIONES,
  STEP_SUCESION_LETRADO,
  STEP_CAUTELAR_OPOSICION,
  STEP_HOMOLOGACION_VIVIENDA,
  LEGAL_STEPS[3], // objeto
  LEGAL_STEPS[4], // base
]
