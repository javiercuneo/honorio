// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 L. Javier Cuneo Libarona
// ---------------------------------------------------------------
// lib/legal/minimos-data.ts
// Datos de referencia de los minimos arancelarios (Ley 27.423).
// Copia fiel de asistente-honorarios-clasico/js/calculations.js,
// funcion mostrarTablasMinimos() (lineas 345-484).
// Framework-agnostic: solo datos, sin React.
// ---------------------------------------------------------------

export interface MinimoItem {
  label: string
  uma: number
  /** Texto a mostrar en la columna UMA en vez de "N UMA" (ej: "1/4 de UMA") */
  umaLabel?: string
  /**
   * Palabras por las que alguien buscaria este concepto y que no estan
   * en la letra de la ley. Se agregan solo cuando el nombre legal y el
   * nombre de tribunal no coinciden: no es un diccionario de sinonimos.
   */
  alias?: string[]
}

export interface MinimoGrupo {
  titulo?: string
  items: MinimoItem[]
}

export interface MinimoCategoria {
  id: string
  titulo: string
  articulo: string
  textoLegal: string
  grupos: MinimoGrupo[]
  /** Idem MinimoItem.alias, a nivel de categoria. */
  alias?: string[]
}

export const MINIMOS_JUDICIAL: MinimoCategoria = {
  id: 'judicial',
  titulo: 'Mínimos en asuntos judiciales no susceptibles de apreciación pecuniaria (art. 19 inc. a)',
  articulo: 'Art. 19',
  textoLegal: 'ARTÍCULO 19.- Cuando no fuere posible apreciar el valor pecuniario del asunto, los jueces fijarán los honorarios teniendo en cuenta la naturaleza de las actuaciones y la gestión profesional desarrollada, con arreglo a las siguientes pautas: a) En asuntos judiciales:',
  alias: ['sin monto', 'monto indeterminado'],
  grupos: [{
    items: [
      { label: 'Divorcio', uma: 10 },
      { label: 'Acción sobre efectos del divorcio y responsabilidad parental', uma: 25 },
      { label: 'Adopción', uma: 20 },
      { label: 'Tutela', uma: 20 },
      { label: 'Restricciones a la capacidad e inhabilitación', uma: 25, alias: ['insania', 'curatela', 'salud mental'] },
      { label: 'Reclamación e impugnación de filiación', uma: 25 },
      { label: 'Acciones de estado y familia', uma: 25 },
      { label: 'Veeduría', uma: 10 },
      { label: 'Información sumaria', uma: 2 },
      { label: 'Trámite administrativo ante autoridad de aplicación', uma: 2 },
      { label: 'Trámite ante la Inspección General de Justicia', uma: 3 },
      { label: 'Presentación de denuncias penales con firma de letrado', uma: 8 },
      { label: 'Incidente de excarcelación o exención de prisión o audiencia de control de detención o medidas de coerción', uma: 10 },
      { label: 'Pedido y audiencia de suspensión de juicio a prueba', uma: 10 },
      { label: 'Acta de juicio abreviado', uma: 15 },
      { label: 'Actuación hasta la clausura de la instrucción o de control de la acusación', uma: 15 },
      { label: 'Actuación desde la clausura de la instrucción o de control de la acusación hasta la sentencia', uma: 20 },
      { label: 'Acción de incidencia colectiva, hábeas corpus, hábeas data', uma: 25 },
    ],
  }],
}

export const MINIMOS_EXTRAJUDICIAL: MinimoCategoria = {
  id: 'extrajudicial',
  titulo: 'Mínimos por labor extrajudicial (art. 19 inc. b)',
  articulo: 'Art. 19',
  textoLegal: 'ARTÍCULO 19.- Cuando no fuere posible apreciar el valor pecuniario del asunto, los jueces fijarán los honorarios teniendo en cuenta la naturaleza de las actuaciones y la gestión profesional desarrollada, con arreglo a las siguientes pautas: b) En asuntos extrajudiciales:',
  grupos: [{
    items: [
      { label: 'Consulta verbal', uma: 0.5 },
      { label: 'Consulta con informe', uma: 1 },
      { label: 'Redacción de carta documento', uma: 1 },
      { label: 'Estudio o información de actuaciones judiciales o administrativas', uma: 1.5 },
      { label: 'Asistencia y asesoramiento del cliente en la realización de actos jurídicos', uma: 1.5 },
      { label: 'Redacción de contrato de locación', uma: 2 },
      { label: 'Redacción de boleto de compraventa', uma: 3 },
      { label: 'Redacción de contrato o estatuto de sociedades comerciales, asociaciones o fundaciones y constitución de personas jurídicas en general', uma: 5 },
      { label: 'Redacción de otros contratos', uma: 2 },
      { label: 'Arreglo extrajudicial', uma: 1 },
      { label: 'Gastos administrativos de estudio para iniciación de juicios', uma: 0.5 },
      { label: 'Redacción de denuncia penal (sin firma de letrado)', uma: 3 },
      { label: 'Asistencia a una audiencia de mediación o conciliación', uma: 2 },
    ],
  }],
}

export const MINIMOS_ART58: MinimoCategoria = {
  id: 'art58',
  titulo: 'Mínimos del art. 58 (juicios susceptibles de apreciación pecuniaria no previstos en otros artículos)',
  articulo: 'Art. 58',
  textoLegal: 'Art. 58: Mínimo establecido para regular honorarios de juicios susceptibles de apreciación pecuniaria que no estuviesen previstos en otros artículos.',
  alias: ['con monto', 'ordinario', 'daños y perjuicios'],
  grupos: [{
    items: [
      { label: 'a) Procesos de conocimiento', uma: 10 },
      { label: 'b) Ejecutivos', uma: 6 },
      { label: 'c) Mediación', uma: 2 },
      { label: 'd) Auxiliares de la Justicia', uma: 4 },
    ],
  }],
}

export const MINIMOS_RECURSOS_CSJN: MinimoCategoria = {
  id: 'recursos_csjn',
  titulo: 'Recursos ante la CSJN (art. 31)',
  articulo: 'Art. 31',
  textoLegal: 'Art. 31: La interposición ante la CSJN de los recursos extraordinarios, de inconstitucionalidad, de revisión, de casación, ordinarios, directos y otros similares o que no sean los normales de acceso, no podrá remunerarse en una cantidad inferior a 20 UMA. Las quejas por denegación de estos recursos no podrán remunerarse en una cantidad inferior a 15 UMA. Si dichos recursos fueren concedidos y se tramitaren, se estará a lo dispuesto en el artículo 21.',
  grupos: [{
    items: [
      { label: 'Queja por denegación de recurso', uma: 15 },
      { label: 'Interposición de recurso extraordinario, etc.', uma: 20 },
    ],
  }],
}

// ---------------------------------------------------------------
// La Ley 27.802 (Modernizacion Laboral, B.O. 06/03/2026) toco tres
// articulos de este bloque: sustituyo el 60 y el 61, e incorporo el
// 61 bis. **La ley separa por sujeto, no por tipo de juicio**, y esa
// es la clave para leer los cuatro pisos sin mezclarlos:
//
//   peritos y liquidadores de averias   sin monto -> art. 60 (2 UMA)
//                                       con monto -> art. 61 (2 UMA)
//   demas auxiliares de la Justicia     normas especificas; a falta
//                                       de ellas, art. 58 (4 UMA)
//
// El 60 y el 61 cierran los dos con la misma frase —"en el caso de los
// demas auxiliares de la Justicia, se aplicaran las normas
// especificas"—, que es lo que impide leer el 61 como si desplazara al
// 58: no hablan del mismo sujeto.
//
// Nada de esto distingue la banda del 5 %-10 %: esa sale del art. 21,
// antepenultimo parrafo, que dice "auxiliares de la Justicia" y los
// alcanza a todos. La distincion por sujeto es solo de los pisos.
// ---------------------------------------------------------------
export const MINIMOS_AUXILIARES_JUSTICIA: MinimoCategoria = {
  id: 'auxiliares_justicia',
  titulo: 'Auxiliares de justicia',
  articulo: 'Arts. 58, 60, 61 y 61 bis',
  textoLegal: 'ARTÍCULO 60 (B.O. 06/03/2026).- En los procesos no susceptibles de apreciación pecuniaria, los honorarios de los peritos y de los peritos liquidadores de averías serán fijados conforme a las pautas valorativas del artículo 16 y en un mínimo de dos (2) UMA, siendo suficiente para la fijación de los honorarios mínimos, la aceptación del cargo conferido. En el caso de los demás auxiliares de la Justicia, se aplicarán las normas específicas. ARTÍCULO 61 (B.O. 06/03/2026).- En los procesos susceptibles de apreciación pecuniaria, por las actuaciones de primera instancia hasta la sentencia, los honorarios del perito y del perito liquidador de averías serán fijados conforme lo establece el artículo 32. Para tales casos los honorarios mínimos a regular alcanzan a dos (2) UMA. En el caso de los demás auxiliares de la Justicia se aplicarán las normas específicas. ARTÍCULO 61 bis (B.O. 06/03/2026).- Los honorarios de los peritos que intervengan en las controversias judiciales, no estarán vinculados a la cuantía del respectivo juicio, ni al porcentaje de incapacidad que se dictamine en caso de producirse una pericia médica. Su regulación responderá exclusivamente a la apreciación judicial de la labor técnica realizada en el pleito y su relevancia; calidad y extensión en lo concreto y deberá fijarse en un monto que asegure una adecuada retribución al perito. Por cada pericia, se fijará un monto mínimo de dos (2) UMA. En caso de finalizar el proceso por transacción, avenimiento y conciliación, sin que el perito haya presentado la pericia encargada, se le regulará un cuarto (1/4) de UMA en tanto el perito haya aceptado el cargo.',
  grupos: [
    {
      titulo: 'Art. 58: juicios susceptibles de apreciación pecuniaria no previstos en otros artículos',
      items: [{ label: 'Demás auxiliares de la Justicia', uma: 4, alias: ['auxiliares de la justicia'] }],
    },
    {
      titulo: 'Art. 60: peritos, procesos no susceptibles de apreciación pecuniaria',
      items: [{ label: 'Peritos y liquidadores de averías. Basta la aceptación del cargo', uma: 2 }],
    },
    {
      titulo: 'Art. 61: peritos, procesos susceptibles de apreciación pecuniaria',
      items: [{ label: 'Peritos y liquidadores de averías, primera instancia hasta la sentencia', uma: 2 }],
    },
    {
      titulo: 'Art. 61 bis: peritos en controversias judiciales',
      items: [{ label: 'Por cada pericia', uma: 2 }],
    },
    // El 1/4 de UMA va en su propio grupo y no junto al piso del
    // 61 bis **porque no es un minimo**: el tercer parrafo dice "se le
    // regulara", no "un minimo de". Es el honorario de ese supuesto,
    // no un piso por debajo del cual no se puede bajar. Listarlo entre
    // los minimos lo hacia parecer otra cosa.
    {
      titulo: 'Art. 61 bis, tercer párrafo: no es un mínimo, es el honorario de ese supuesto',
      items: [{ label: 'El proceso terminó por transacción, avenimiento o conciliación y el perito aceptó el cargo pero no presentó la pericia', uma: 0.25, umaLabel: '1/4 de UMA' }],
    },
  ],
}

/**
 * Los pisos de los auxiliares que rigen cuando el juicio **si** es
 * susceptible de apreciacion pecuniaria, que es el unico caso en que
 * el dashboard tiene una base y un 5 %-10 % al lado del cual
 * mostrarlos.
 *
 * Queda afuera el art. 60, que es expresamente de los procesos **no**
 * susceptibles de apreciacion pecuniaria: ahi no hay base ni escala.
 *
 * Se derivan de los grupos de arriba y no se vuelven a escribir. Un
 * numero de la ley copiado en dos lugares es un numero que algun dia
 * va a discrepar consigo mismo. Que la derivacion siga encontrando los
 * dos grupos lo comprueba minimosAuxiliares.validation.ts.
 */
export interface PisoAuxiliar {
  articulo: string
  concepto: string
  uma: number
  /**
   * Si el piso presupone que hubo una pericia producida.
   *
   * Solo el del art. 61 bis lo hace: es "por cada pericia". Mostrarlo
   * en un caso que termino antes de la apertura a prueba afirma algo
   * que no paso, y la propia ley resuelve ese supuesto en su tercer
   * parrafo con un numero distinto.
   */
  suponePericia?: boolean
}

function pisoDe(prefijoTitulo: string, articulo: string, suponePericia = false): PisoAuxiliar[] {
  const grupo = MINIMOS_AUXILIARES_JUSTICIA.grupos.find((g) =>
    g.titulo?.startsWith(prefijoTitulo),
  )
  const item = grupo?.items[0]
  return item
    ? [{ articulo, concepto: item.label, uma: item.uma, suponePericia }]
    : []
}

export const PISOS_AUXILIARES_CON_BASE: PisoAuxiliar[] = [
  ...pisoDe('Art. 58', 'art. 58'),
  ...pisoDe('Art. 61:', 'art. 61'),
  ...pisoDe('Art. 61 bis:', 'art. 61 bis', true),
]

/**
 * El honorario del perito que acepto el cargo y no dictamino porque el
 * proceso termino antes (art. 61 bis, tercer parrafo).
 *
 * **No es un piso y por eso no esta en la lista de arriba.** Se expone
 * aparte para poder mostrarlo cuando el caso encaja, que es justamente
 * cuando el piso "por cada pericia" no encaja.
 */
export const SIN_PERICIA_ART61BIS: PisoAuxiliar = {
  articulo: 'art. 61 bis',
  concepto: 'El perito aceptó el cargo y no presentó la pericia',
  uma: 0.25,
}

/**
 * Debajo de que base, en UMA, cada piso deja de ser teorico.
 *
 * El 5 % del art. 21 crece con la base y los pisos no: hay un punto a
 * partir del cual el porcentaje ya los supera y el piso no muerde
 * nunca. Con 2 UMA de piso son 40 UMA de base; con 4, son 80.
 */
export function baseDondeElPisoDejaDeMorder(pisoEnUMA: number): number {
  return pisoEnUMA / 0.05
}

export const MINIMOS_ACCIONES_48: MinimoCategoria = {
  id: 'acciones_48',
  titulo: 'Mínimos del art. 48',
  articulo: 'Art. 48',
  textoLegal: 'ARTÍCULO 48.- Por la interposición de acciones de inconstitucionalidad, de amparo, de hábeas data, de hábeas corpus, en caso de que no puedan regularse de conformidad con la escala del artículo 21, se aplicarán las normas del artículo 16, con un mínimo de 20 UMA.',
  grupos: [{
    items: [{ label: 'Acciones de inconstitucionalidad, amparo, hábeas data, hábeas corpus', uma: 20 }],
  }],
}

export const MINIMOS_CONTENCIOSO_44: MinimoCategoria = {
  id: 'contencioso_44',
  titulo: 'Mínimos del art. 44',
  articulo: 'Art. 44',
  textoLegal: 'ARTÍCULO 44.- La interposición de acciones y peticiones de naturaleza administrativa seguirá las siguientes reglas… En los casos en que los asuntos no sean susceptibles de apreciación pecuniaria, la regulación no será inferior a 7 o 5 UMA, según se trate del ejercicio de acciones contencioso administrativas o actuaciones administrativas, respectivamente.',
  grupos: [{
    items: [
      { label: 'Acciones contencioso administrativas', uma: 7 },
      { label: 'Actuaciones administrativas', uma: 5 },
    ],
  }],
}

export const MINIMOS_CATEGORIAS: Record<string, MinimoCategoria> = {
  judicial: MINIMOS_JUDICIAL,
  extrajudicial: MINIMOS_EXTRAJUDICIAL,
  art58: MINIMOS_ART58,
  recursos_csjn: MINIMOS_RECURSOS_CSJN,
  auxiliares_justicia: MINIMOS_AUXILIARES_JUSTICIA,
  acciones_48: MINIMOS_ACCIONES_48,
  contencioso_44: MINIMOS_CONTENCIOSO_44,
}

/**
 * Orden de lectura: el del articulado. El inciso a) del art. 19 antes
 * que el b), y los articulos de menor a mayor. El orden anterior venia
 * del `<select>` del asistente clasico, donde era el orden en que se
 * fueron agregando las opciones.
 *
 * Las tres primeras categorias son las que no tienen monto, que es el
 * caso por el que se consulta esta pantalla: cuando la escala del
 * art. 21 no se puede aplicar.
 */
export const MINIMOS_ORDENADOS: MinimoCategoria[] = [
  MINIMOS_JUDICIAL,          // art. 19 inc. a
  MINIMOS_EXTRAJUDICIAL,     // art. 19 inc. b
  MINIMOS_RECURSOS_CSJN,     // art. 31
  MINIMOS_CONTENCIOSO_44,    // art. 44
  MINIMOS_ACCIONES_48,       // art. 48
  MINIMOS_ART58,             // art. 58
  MINIMOS_AUXILIARES_JUSTICIA, // arts. 58, 60 y 61 bis
]
