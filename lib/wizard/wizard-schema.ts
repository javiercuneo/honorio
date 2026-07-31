// ---------------------------------------------------------------
// lib/wizard/wizard-schema.ts
// Schema declarativo del wizard legal.
// Define cada paso, sus opciones, dependencias y validaciones.
// Framework-agnostic ? solo datos, sin logica de negocio.
// Compatible con los componentes CardsField y NumericField de honorio.
//
// Milestone 1: schema completo del flujo clasico.
// Milestone 2: se enriquecera con sub-pasos y ramificaciones
//              mas complejas (contingencias anidadas).
// ---------------------------------------------------------------

import type { CardOption, Explanation, Answers } from '@/lib/legal/types'
export type { Answers }

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
  presets?: number[]
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
    description: 'Ordinario o sumarísimo',
    hint: 'Art. 21 y sig.',
  },
  {
    id: 'ejecucion_sentencia',
    label: 'Ejecución de sentencia',
    description: 'O de honorarios o acuerdos',
    hint: 'Art. 41',
  },
  {
    id: 'ejecutivo',
    label: 'Juicio ejecutivo',
    description: 'Expensas, alquileres, etc.',
    hint: 'Art. 34',
  },
  {
    id: 'sucesion',
    label: 'Sucesión',
    description: 'Proceso sucesorio',
    hint: 'Art. 35',
  },
  {
    id: 'medida_cautelar',
    label: 'Medida cautelar',
    description: 'Autónomas, incidentales o que tramitan dentro del proceso',
    hint: 'Art. 37',
  },
  {
    id: 'homologacion_desocupacion',
    label: 'Homologación de convenios de desocupación',
    description: 'Y su ejecución',
    hint: 'Art. 40',
  },
  {
    id: 'exhorto',
    label: 'Exhorto',
    description: 'Diligencias según la Ley 22.172',
    hint: 'Art. 50',
  },
  {
    id: 'incidente',
    label: 'Incidente',
    description: 'Esta opción incluye los Beneficios (BLSG)',
    hint: 'Art. 29 inc. g',
  },
]

export const MODOS_TERMINACION: CardOption[] = [
  {
    id: 'sentencia',
    label: 'Sentencia',
    description: 'Sentencia definitiva',
  },
  {
    id: 'modos_anormales',
    label: 'Modos anormales',
    description: 'Allanamiento, transaccion o desistimiento',
    hint: 'Art. 25',
  },
  {
    id: 'caducidad',
    label: 'Caducidad de instancia',
    description: 'Art. 310 CPCCN',
    hint: 'Arts. 22 / 25',
  },
  {
    id: 'provisorios',
    label: 'Honorarios provisorios',
    description: 'Retribución fijada antes del fin del proceso (no definitiva)',
    hint: 'Art. 12',
  },
]

export const SENTENCIA_RESULTADO: CardOption[] = [
  {
    id: 'admitida',
    label: 'Admitida',
    description: 'Sin reducciones',
  },
  {
    id: 'rechazada',
    label: 'Rechazada',
    description: 'La base se reduce 30 %',
    hint: 'Art. 22',
  },
]

export const APERTURA_PRUEBA: CardOption[] = [
  {
    id: 'antes',
    label: 'Antes de la apertura a prueba',
    description: ' ( 50 % de la escala )',
    hint: 'Art. 25 1ª parte',
  },
  {
    id: 'despues',
    label: 'Despues de apertura a prueba',
    description: ' ( 100 % de la escala )',
    hint: 'Art. 25 2ª parte',
  },
]

export const CADUCIDAD_CRITERIO: CardOption[] = [
  {
    id: 'art22',
    label: 'Como demanda desestimada',
    description: 'La base se reduce en un 30 %',
    hint: 'Art. 22',
  },
  {
    id: 'art25',
    label: 'Como modo anormal de terminación del proceso',
    description: 'Si ocurre antes de la apertura a prueba se reduce la escala',
    hint: 'Art. 25',
  },
]

export const EXCEPCIONES: CardOption[] = [
  {
    id: 'si',
    label: 'Con excepciones',
    description: 'Sin reducciones',
    hint: 'Arts. 34 / 41',
  },
  {
    id: 'no',
    label: 'Sin excepciones',
    description: 'El honorario se reducen en un 10 %',
    hint: 'Arts. 34 / 41',
  },
]

export const SUCESION_LETRADO: CardOption[] = [
  {
    id: 'unico',
    label: 'Un solo abogado',
    description: 'Para todos los herederos',
    hint: 'Art. 35, 1ª',
  },
  {
    id: 'varios',
    label: 'Varios abogados',
    description: 'Si uno o más herederos tienen otro letrado',
    hint: 'Art. 35: a contrario',
  },
]

export const CAUTELAR_OPOSICION: CardOption[] = [
  {
    id: 'con',
    label: 'Con oposición',
    description: '25 % de la escala del artículo 21',
    hint: 'Art. 37',
  },
  {
    id: 'sin',
    label: 'Sin oposición',
    description: '50 % de la escala del artículo 21',
    hint: 'Art. 37',
  },
]

export const HOMOLOGACION_VIVIENDA: CardOption[] = [
  {
    id: 'vivienda',
    label: 'Alquiler para vivienda',
    description: 'La base se reduce en un 20 %',
    hint: 'Art. 40, 1ª párr. 1ª',
  },
  {
    id: 'otros',
    label: 'Demás casos',
    description: 'Sin reducciones',
    hint: 'Art. 40, 1ª párr. 2ª',
  },
]

export const OBJETO_JUICIO: CardOption[] = [
  {
    id: 'sumas_dinero',
    label: 'Sumas de dinero',
    description: '$',
    hint: 'Art. 22',
  },
  {
    id: 'desalojo',
    label: 'Desalojos',
    description: 'Con o sin contrato',
    hint: 'Art. 40',
  },
  {
    id: 'inmuebles',
    label: 'Bienes muebles o inmuebles',
    description: 'Según su valuación',
    hint: 'Art. 23 inc. a',
  },
  {
    id: 'derechos_crediticios',
    label: 'Derechos crediticios',
    description: ' Valor consignado en las escrituras o documentos respectivos',
    hint: 'Art. 23 inc. d',
  },
  {
    id: 'titulos_acciones',
    label: 'Titulos de renta y acciones',
    description: 'Valor de cotización de los títulos',
    hint: 'Art. 23 inc. e',
  },
  {
    id: 'establecimientos',
    label: 'Establecimientos comerciales, industriales o mineros',
    description: 'Valor del activo',
    hint: 'Art. 23 inc. f',
  },
  {
    id: 'uso_habitacion',
    label: 'Derecho de uso o habitacion',
    description: 'Valor del bien',
    hint: 'Art. 23 inc. h',
  },
  {
    id: 'escrituracion',
    label: 'Escrituracion',
    description: 'Valor del bien o monto del boleto (el mayor)',
    hint: 'Art. 46',
  },
  {
    id: 'familia_alimentos',
    label: 'Familia: alimentos',
    description: 'Según la cuota alimentaria fijada',
    hint: 'Art. 39',
  },
  {
    id: 'familia_liquidacion',
    label: 'Liquidación de régimen patrimonial del matrimonio',
    description: 'Valor del patrimonio adjudicado',
    hint: 'Art. 45',
  },
  {
    id: 'posesorias_interdictos',
    label: 'Interdictos',
    description: 'Acciones posesorias, interdictos o división de bienes comunes',
    hint: 'Art. 38',
  },
  {
    id: 'incidencia_colectiva',
    label: 'Procesos colectivos',
    description: 'Acciones sobre derechos de incidencia colectiva con contenido patrimonial',
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
    ayuda: 'Ingrese el valor de la Unidad de Medida Arancelaria. La app carga el último valor, pero podés ajustarlo manualmente',
    resumenLabel: 'Valor UMA',
    unidad: 'Verificá en el sitio de la Corte',
    prefix: '$',
    min: 50000,
    max: 200000,
    step: 1,
    default: 0,
    format: pesos,
    explicacion: {
      brief: 'Ver más',
      expanded: 'Para comprobar el valor podes ingresar en https//www.csjn.gov.ar/decisiones/acordadas y filtrar por las que dicen "Determinar el valor de la Unidad de Medida Arancelaria (UMA)"',
      full: [
        'ARTÍCULO 19. Institúyese la Unidad de Medida Arancelaria (UMA) para los honorarios profesionales de los abogados, procuradores y auxiliares de la Justicia, la que equivaldrá al 3 %  de la remuneración básica asignada al cargo de juez federal de primera instancia. La Corte Suprema de Justicia de la Nación suministrará y publicará mensualmente, por el medio a determinar por dicho Alto Tribunal, el valor resultante, eliminando las fracciones decimales, e informará a las diferentes cámaras el valor de la UMA',
      ],
    },
  },

    // Paso 1: Tipo de proceso
  {
    id: 'tipoProceso',
    kind: 'cards',
    select: 'single',
    eyebrow: 'Clase de proceso',
    pregunta: 'Seleccione el tipo de proceso',
    ayuda: 'Define coeficientes específicos que pueden reducir o incrementar el resultado final del cálculo',
    resumenLabel: 'Tipo de proceso',
    options: TIPOS_PROCESO,
    explicacion: {
      brief: 'Ver más',
      expanded: 'Esta informacion se utiliza para el calculo arancelario.',
      full: ['Complete los datos segun corresponda.'],
    },
  },

  // Paso 2: Objeto del juicio (solo para conocimiento)
  {
    id: 'objeto',
    kind: 'cards',
    select: 'single',
    eyebrow: 'Objeto',
    pregunta: 'Objeto del juicio',
    ayuda: 'Lo reclamado es un factor determinante para establecer la base regulatoria',
    resumenLabel: 'Objeto del juicio',
    options: OBJETO_JUICIO,
    dependsOn: ['tipoProceso'],
    condition: (answers) => answers.tipoProceso === 'conocimiento',
    explicacion: {
      brief: 'Ver más',
      expanded: 'Esta informacion se utiliza para el calculo arancelario.',
      full: ['Complete los datos segun corresponda.'],
    },
  },

  // Paso 3: Base regulatoria
  {
    id: 'base',
    kind: 'numeric',
    eyebrow: 'Base',
    pregunta: 'Base regulatoria',
    ayuda: 'Es el valor económico que se toma como referencia para aplicar la escala del art. 21',
    resumenLabel: 'Base regulatoria',
    unidad: 'pesos',
    prefix: '$',
    min: 0,
    max: 999999999999,
    step: 1,
    default: 0,
    format: pesos,
    explicacion: {
      brief: 'Ver más',
      expanded: 'Esta informacion se utiliza para el calculo arancelario.',
      full: ['Complete los datos segun corresponda.'],
    },
  },
]

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
  eyebrow: 'Terminación',
  pregunta: 'Forma de terminación del proceso',
  ayuda: 'El modo en que termina el proceso tiene  impacto directo en el cálculo',
  resumenLabel: 'Terminación',
  options: MODOS_TERMINACION,
  dependsOn: ['tipoProceso'],
  condition: (answers) =>
    ['conocimiento', 'ejecucion_sentencia', 'ejecutivo'].includes(answers.tipoProceso as string),
  explicacion: {
      brief: 'Ver más',
      expanded: 'En algunas ocasiones, afecta la alícuota aplicable (por ejemplo en los modos anormales de terminación del proceso) y en otras la base regulatoria (caso de demanda desestimada en la sentencia)',
      full: [
        'ARTÍCULO 22: ( ... ) Si fuere íntegramente desestimada la demanda o la reconvención, se tendrá como valor del pleito el importe de la misma, actualizado por intereses al momento de la sentencia, si ello correspondiere, disminuido en un 30 % ( ... )',
        'ARTÍCULO 12: Si un profesional se aparta de un proceso o gestión antes de su conclusión normal, puede solicitar regulación provisoria de honorarios, los que se fijarán en el mínimo que le hubiere podido corresponder conforme a las actuaciones cumplidas ( ... )',
        'ARTÍCULO 25: En caso de allanamiento, desistimiento y transacción, antes de decretarse la apertura a prueba, los honorarios serán del 50 % de la escala del artículo 21. En los demás casos, se aplicará el 100 % de dicha escala ( ... )'
      ],
    },
}

export const STEP_SENTENCIA_RESULTADO: CardsStepDef = {
  id: 'sentenciaResultado',
  kind: 'cards',
  select: 'single',
  eyebrow: 'Sentencia',
  pregunta: 'Resultado de la sentencia',
  ayuda: 'Si la demanda es admitida o rechazada se modifica la base',
  resumenLabel: 'Contingencias',
  options: SENTENCIA_RESULTADO,
  dependsOn: ['modoTerminacion'],
  condition: (answers) => answers.modoTerminacion === 'sentencia',
  explicacion: {
      brief: 'Ver más',
      expanded: '( a ) Si se admite la demanda, no se aplica reducción sobre la base. El cálculo se realiza sobre el monto total del pleito conforme a la escala del art. 21; ( b ) En cambio, cuando la demanda es rechazada, para establecer la base el monto se disminuye en un 30%. Al elegir esta opción, el monto de la base que ingreses en los pasos siguientes, se reducirá en ese porcentaje',
      full: [
        'ARTÍCULO 22: ( ... ) Si fuere íntegramente desestimada la demanda o la reconvención, se tendrá como valor del pleito el importe de la misma, actualizado por intereses al momento de la sentencia, si ello correspondiere, disminuido en un 30 % ( ... )',
      ],
    },
}

export const STEP_APERTURA_PRUEBA: CardsStepDef = {
  id: 'aperturaPrueba',
  kind: 'cards',
  select: 'single',
  eyebrow: 'Prueba',
  pregunta: 'Modos anormales',
  ayuda: 'El momento en que se produce modifica sustancialmente el honorario',
  resumenLabel: 'Apertura a prueba',
  options: APERTURA_PRUEBA,
  dependsOn: ['modoTerminacion', 'caducidadCriterio'],
  condition: (answers) =>
    answers.modoTerminacion === 'modos_anormales' ||
    (answers.modoTerminacion === 'caducidad' && answers.caducidadCriterio === 'art25'),
  explicacion: {
      brief: 'Ver más',
      expanded: 'En los modos anormales de terminación del proceso (allanamiento, desistimiento, transacción; como también si usas este criterio para la caducidad de la instancia), la escala se reduce en un 50 % si se produce antes de la apertura a prueba',
      full: [
        'ARTÍCULO 25.- En caso de allanamiento, desistimiento y transacción, antes de decretarse la apertura a prueba, los honorarios serán del cincuenta por ciento (50%) de la escala del artículo 21. En los demás casos, se aplicará el ciento por ciento (100%) de dicha escala.',
      ],
    },
}

export const STEP_CADUCIDAD_CRITERIO: CardsStepDef = {
  id: 'caducidadCriterio',
  kind: 'cards',
  select: 'single',
  eyebrow: 'Caducidad',
  pregunta: 'Caducidad de la instancia',
  ayuda: 'Como no tiene mención explícita en la ley, podes elegir tratarla según dos criterios diferentes',
  resumenLabel: 'Caducidad',
  options: CADUCIDAD_CRITERIO,
  dependsOn: ['modoTerminacion'],
  condition: (answers) => answers.modoTerminacion === 'caducidad',
  explicacion: {
      brief: 'Ver más',
      expanded: 'La caducidad de la instancia (arts. 310 y ss. CPCCN) no se menciona explícitamente como una categoría separada en la ley. Por eso, podes elegir tratarla: i) como “demanda desestimada” (art.22), en cuyo caso la base se reduceen un 30 %; ii) o bien como los demás modos anormales de terminación del proceso (allanamiento, desistimiento y transacción) que regula la ley en el art. 25. En este último caso, si el juicio no se abrió a prueba, los honorarios son el 50 % de la escala del art. 21.',
      full: [
        'ARTÍCULO 22: ( ... ) Si fuere íntegramente desestimada la demanda o la reconvención, se tendrá como valor del pleito el importe de la misma, actualizado por intereses al momento de la sentencia, si ello correspondiere, disminuido en un 30 % ( ... )',
        'ARTÍCULO 25: En caso de allanamiento, desistimiento y transacción, antes de decretarse la apertura a prueba, los honorarios serán del 50 % de la escala del artículo 21. En los demás casos, se aplicará el 100 % de dicha escala ( ... )',
      ],
    },
}

export const STEP_EXCEPCIONES: CardsStepDef = {
  id: 'tuvoExcepciones',
  kind: 'cards',
  select: 'single',
  eyebrow: 'Excepciones',
  pregunta: '¿Se dedujeron excepciones?',
  ayuda: 'Este factor modifica el resultado final del honorario',
  resumenLabel: 'Excepciones',
  options: EXCEPCIONES,
  dependsOn: ['tipoProceso'],
  condition: (answers) =>
    ['ejecucion_sentencia', 'ejecutivo'].includes(answers.tipoProceso as string),
  explicacion: {
      brief: 'Ver más',
      expanded: 'La oposición de excepciones es un factor determinante en el proceso de ejecución ya que su ausencia genera una reducción directa del 10% sobre el monto que correspondería regular',
      full: [
        'ARTÍCULO 34: En los juicios ejecutivos y ejecuciones especiales (...)  no habiendo excepciones, los honorarios se reduciran en un 10 % del que correspondiere regular',
        'ARTÍCULO 41: En el procedimiento de ejecucion de sentencias (...) no habiendo excepciones, los honorarios se reduciran en un 10 % del que correspondiere regular (...)',
      ],
    },
}

export const STEP_SUCESION_LETRADO: CardsStepDef = {
  id: 'sucesionUnicoLetrado',
  kind: 'cards',
  select: 'single',
  eyebrow: 'Letrados',
  pregunta: 'Intervención de letrados',
  ayuda: 'En las sucesiones la cantidad de abogados modifica la escala',
  resumenLabel: 'Unico letrado',
  options: SUCESION_LETRADO,
  dependsOn: ['tipoProceso'],
  condition: (answers) => answers.tipoProceso === 'sucesion',
  explicacion: {
      brief: 'Ver más',
      expanded: 'En los procesos sucesorios, la existencia de un abogado único para todos los herederos es un factor determinante ya que segun el art. 35, los honorarios deben regularse en la mitad de la escala del art. 21',
      full: [
        'ARTÍCULO 35: En el proceso sucesorio, si un solo abogado patrocina o representa a todos los herederos o interesados, sus honorarios se regularán sobre el valor del patrimonio que se transmite, inclusive los gananciales, en la mitad del mínimo y del máximo de la escala establecida en el artículo 21 (...)',
      ],
    },
}

export const STEP_CAUTELAR_OPOSICION: CardsStepDef = {
  id: 'medidaOposicion',
  kind: 'cards',
  select: 'single',
  eyebrow: 'Oposición',
  pregunta: '¿Existió oposición?',
  ayuda: 'Definí si se controvirtió la medida',
  resumenLabel: 'Oposición',
  options: CAUTELAR_OPOSICION,
  dependsOn: ['tipoProceso'],
  condition: (answers) => answers.tipoProceso === 'medida_cautelar',
  explicacion: {
      brief: 'Ver más',
      expanded: 'En las medidas cautelares, la existencia de oposición o controversia tiene un impacto directo en el cálculo de los honorarios, ya que modifica el porcentaje de la escala aplicable',
      full: [
        'ARTÍCULO 37.- En las medidas cautelares, ya sea que éstas tramiten autónomamente, en forma incidental o dentro del proceso, los honorarios se regularán sobre el monto que se pretende a asegurar, aplicándose como base el 25% de la escala del artículo 21; salvo casos de controversia u oposición, en que la base se elevará al  50 %',
      ],
    },
}

export const STEP_HOMOLOGACION_VIVIENDA: CardsStepDef = {
  id: 'homologacionVivienda',
  kind: 'cards',
  select: 'single',
  eyebrow: 'Convenio',
  pregunta: 'Tipo de convenio',
  ayuda: 'El cálculo se modifica según el destino del inmueble que es objeto del convenio de desocupación',
  resumenLabel: 'Tipo de convenio',
  options: HOMOLOGACION_VIVIENDA,
  dependsOn: ['tipoProceso'],
  condition: (answers) => answers.tipoProceso === 'homologacion_desocupacion',
  explicacion: {
      brief: 'Ver más',
      expanded: 'En el caso de que el destino del contrato sea para vivienda, el monto de la base se reduce en un 20 %. Cuando llegues al cálculo final, la base que ingreses se encontrará reducida en ese porcentaje',
      full: [
        'ARTÍCULO 40: En los procesos de desalojo se fijarán los honorarios de acuerdo con la escala del artículo 21, tomando como base el total de los alquileres del contrato. En el caso de que la locación sea para vivienda y/o habitación, tal monto se reducirá en un veinte por ciento (20%). Si el profesional estimare inadecuado el alquiler fijado en el contrato o en caso de que éste no pudiera determinarse exactamente o se tratase de juicios por intrusión o tenencia precaria, deberá fijarse el valor locativo actualizado del inmueble, para lo cual el profesional podrá acompañar tasaciones al respecto o designar perito para que lo determine, abonando los gastos de este último quien estuviere más alejado del monto de la tasación del valor locativo establecido. Tratándose de una homologación de convenio de desocupación y su ejecución, los honorarios se regularán en un cincuenta por ciento (50%) del establecido en el párrafo primero',
      ],
    },
}

export const STEP_DESALOJO_TIPO: CardsStepDef = {
  id: 'desalojoVivienda',
  kind: 'cards',
  select: 'single',
  eyebrow: 'Tipo de desalojo',
  pregunta: 'Especifique el tipo de desalojo',
  ayuda: 'El cálculo se modifica según el tipo de desalojo (vivienda, civil o laboral)',
  resumenLabel: 'Tipo de desalojo',
  options: DESALOJO_TIPO,
  dependsOn: ['objeto'],
  condition: (answers) => answers.objeto === 'desalojo',
  explicacion: {
      brief: 'Ver más',
      expanded: 'Los desalojos de vivienda tienen una reducción del 20% en la base regulatoria',
      full: ['Complete el tipo de desalojo para continuar.'],
    },
}

export const STEP_POSESORIAS_TIPO: CardsStepDef = {
  id: 'posesoriasTipo',
  kind: 'cards',
  select: 'single',
  eyebrow: 'Tipo de posesoria',
  pregunta: 'Especifique el tipo de posesoria',
  ayuda: 'Distingue entre beneficio exclusivo y demás casos',
  resumenLabel: 'Tipo de posesoria',
  options: POSESORIAS_TIPO,
  dependsOn: ['objeto'],
  condition: (answers) => answers.objeto === 'posesorias_interdictos',
  explicacion: {
      brief: 'Ver más',
      expanded: 'Las posesorías tienen diferentes regulaciones según el tipo',
      full: ['Complete el tipo de posesoria para continuar.'],
    },
}

// ---- Mapa de pasos por tipo de proceso ----
// Declara explicitamente que pasos necesita cada proceso.
// Reemplaza gradualmente las conditions en cada step.
export const PROCESS_STEP_MAP: Record<string, string[]> = {
  exhorto: ['umaInicio', 'tipoProceso'],
  incidente: ['umaInicio', 'tipoProceso', 'base'],
  // desalojoVivienda y posesoriasTipo son sub-pasos mutuamente excluyentes de 'objeto':
  // ambos se declaran aca y su `condition` decide cual se muestra.
  conocimiento: ['umaInicio', 'tipoProceso', 'modoTerminacion', 'sentenciaResultado', 'caducidadCriterio', 'aperturaPrueba', 'objeto', 'desalojoVivienda', 'posesoriasTipo', 'base'],
  ejecucion_sentencia: ['umaInicio', 'tipoProceso', 'modoTerminacion', 'sentenciaResultado', 'caducidadCriterio', 'aperturaPrueba', 'tuvoExcepciones', 'base'],
  ejecutivo: ['umaInicio', 'tipoProceso', 'modoTerminacion', 'sentenciaResultado', 'caducidadCriterio', 'aperturaPrueba', 'tuvoExcepciones', 'base'],
  sucesion: ['umaInicio', 'tipoProceso', 'sucesionUnicoLetrado', 'base'],
  medida_cautelar: ['umaInicio', 'tipoProceso', 'medidaOposicion', 'base'],
  homologacion_desocupacion: ['umaInicio', 'tipoProceso', 'homologacionVivienda', 'base'],
}
// ---- Lista completa de pasos (ordenada) ----
// El hook filtra los pasos segun su condicion para construir el wizard visible.

export const ALL_STEPS: WizardStepDef[] = [
  LEGAL_STEPS[0], // umaInicio
  LEGAL_STEPS[1], // tipoProceso
  STEP_MODO_TERMINACION,
  STEP_SENTENCIA_RESULTADO,
  STEP_CADUCIDAD_CRITERIO,
  STEP_APERTURA_PRUEBA,
  STEP_EXCEPCIONES,
  STEP_SUCESION_LETRADO,
  STEP_CAUTELAR_OPOSICION,
  STEP_HOMOLOGACION_VIVIENDA,
  LEGAL_STEPS[2], // objeto
  STEP_DESALOJO_TIPO,
  STEP_POSESORIAS_TIPO,
  LEGAL_STEPS[3], // base
]
