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
}

export const MINIMOS_JUDICIAL: MinimoCategoria = {
  id: 'judicial',
  titulo: 'Mínimos en asuntos judiciales no susceptibles de apreciación pecuniaria (art. 19 inc. a)',
  articulo: 'Art. 19',
  textoLegal: 'ARTÍCULO 19.- Cuando no fuere posible apreciar el valor pecuniario del asunto, los jueces fijarán los honorarios teniendo en cuenta la naturaleza de las actuaciones y la gestión profesional desarrollada, con arreglo a las siguientes pautas: a) En asuntos judiciales:',
  grupos: [{
    items: [
      { label: 'Divorcio', uma: 10 },
      { label: 'Acción sobre efectos del divorcio y responsabilidad parental', uma: 25 },
      { label: 'Adopción', uma: 20 },
      { label: 'Tutela', uma: 20 },
      { label: 'Restricciones a la capacidad e inhabilitación', uma: 25 },
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

export const MINIMOS_AUXILIARES_JUSTICIA: MinimoCategoria = {
  id: 'auxiliares_justicia',
  titulo: 'Auxiliares de justicia',
  articulo: 'Arts. 58, 60 y 61 bis',
  textoLegal: 'ARTÍCULO 60 (B.O. 06/03/2026).- En los procesos no susceptibles de apreciación pecuniaria, los honorarios de los peritos y de los peritos liquidadores de averías serán fijados conforme a las pautas valorativas del artículo 16 y en un mínimo de 2 UMA, siendo suficiente para la fijación de los honorarios mínimos, la aceptación del cargo conferido. En el caso de los demás auxiliares de la Justicia, se aplicarán las normas específicas. Artículo 61 bis (B.O. 06/03/2026): Los honorarios de los peritos que intervengan en las controversias judiciales, no estarán vinculados a la cuantía del respectivo juicio, ni al porcentaje de incapacidad que se dictamine en caso de producirse una pericia médica. Su regulación responderá exclusivamente a la apreciación judicial de la labor técnica realizada en el pleito y su relevancia, calidad y extensión en lo concreto y deberá fijarse en un monto que asegure una adecuada retribución al perito. Por cada pericia, se fijará un monto mínimo de 2 UMA. En caso de finalizar el proceso por transacción, avenimiento y conciliación, sin que el perito haya presentado la pericia encargada, se le regulará 1/4 de UMA en tanto el perito haya aceptado el cargo.',
  grupos: [
    {
      titulo: 'Art. 58: juicios susceptibles de apreciación pecuniaria no previstos en otros artículos',
      items: [{ label: 'Auxiliares de la Justicia', uma: 4 }],
    },
    {
      titulo: 'Art. 60: procesos no susceptibles de apreciación pecuniaria',
      items: [{ label: 'Peritos y liquidadores de averías', uma: 2 }],
    },
    {
      titulo: 'Art. 61 bis: controversias judiciales',
      items: [
        { label: 'Peritos, por cada pericia', uma: 2 },
        { label: 'Peritos que aceptaron el cargo y no presentaron dictamen por transacción, avenimiento o conciliación', uma: 0.25, umaLabel: '1/4 de UMA' },
      ],
    },
  ],
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
