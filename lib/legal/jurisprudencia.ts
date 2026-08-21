// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 L. Javier Cuneo Libarona
// ---------------------------------------------------------------
// lib/legal/jurisprudencia.ts
// Los fallos y la doctrina que sostienen los criterios que la ley no
// resuelve.
//
// Por que existe: la app interpreta, y tiene que interpretar, porque
// el Decreto 1077/2017 observo articulos y dejo huecos sin norma que
// los reemplace. La regla del repositorio es que una interpretacion no
// se prueba, se declara. Esto es el paso siguiente: **una
// interpretacion declarada con jurisprudencia se puede discutir; una
// sin nada detras solo se puede creer o no.**
//
// Datos puros. Ninguna aritmetica, ningun componente: la presentacion
// decide como se ven.
// ---------------------------------------------------------------

export interface Fallo {
  /** Tribunal y sala, como se cita. Se omite si la fuente no lo precisa. */
  tribunal?: string
  expediente: string
  /** Caratula, transcripta como figura en el expediente. */
  caratula: string
  /** dd/mm/aaaa */
  fecha: string
  /** La sentencia publicada en el Centro de Informacion Judicial. */
  url?: string
  /**
   * Donde se publico. Para los fallos viejos, que no tienen sentencia
   * en linea y se citan por su publicacion en ED, LL o JA.
   */
  publicacion?: string
  /**
   * La doctrina del fallo, transcripta. Solo para los plenarios, que
   * se citan por lo que fijan y no por lo que decidieron en el caso.
   * **Se transcribe de la sentencia leida o no se escribe.**
   */
  transcripcion?: string
}

/**
 * Una cita de doctrina.
 *
 * **No es un fallo y la presentacion no los puede mezclar.** Un fallo
 * dice lo que un tribunal resolvio; un autor dice lo que le parece. Los
 * dos sirven para fundar, y sirven distinto: mostrarlos juntos y sin
 * distinguir haria pasar una opinion por una decision.
 *
 * De la obra llega **la cita y a lo sumo la frase que enuncia el
 * criterio**, no el desarrollo: son textos con derecho de autor vivo y
 * este repositorio se publica entero.
 */
export interface Doctrina {
  autor: string
  obra: string
  editorial: string
  ciudad?: string
  anio: number
  /** Pagina o paginas, como se citan: "p. 386", "pags. 753/754". */
  pagina?: string
  /** La frase que enuncia el criterio, si vale citarla textual. */
  transcripcion?: string
}

/**
 * La lectura contraria de un mismo texto legal.
 *
 * **Existe para que la app pueda decir que eligio.** Un criterio
 * mostrado solo se lee como si fuera el unico posible; mostrado al lado
 * del que descarta, se lee como lo que es.
 *
 * `fallos` y `doctrina` son opcionales **y su ausencia dice algo**: hay
 * lecturas alternativas que se discuten y no tienen a nadie escrito
 * detras. La presentacion lo declara en vez de disimularlo.
 */
export interface Contraria {
  sostiene: string
  fallos?: Fallo[]
  doctrina?: Doctrina[]
}

export interface Criterio {
  /** Que sostiene, en una frase. */
  sostiene: string
  /**
   * Puede quedar vacio: hay criterios que solo tienen doctrina detras.
   * **Eso no es un error y no se disimula**: la presentacion tiene que
   * decir que ahi no hay fallo, que es justamente el dato.
   */
  fallos: Fallo[]
  doctrina?: Doctrina[]
  /** La otra lectura del mismo texto, cuando la hay. */
  contraria?: Contraria
}

/**
 * De donde sale el 2 % al 20 % de los incidentes.
 *
 * El art. 47 de la Ley 27.423 —el unico que fijaba porcentaje para los
 * incidentes— quedo observado por el Decreto 1077/2017 y nunca entro
 * en vigencia. El art. 29 inc. g) divide el incidente en dos etapas
 * pero no fija alicuota. El motor aplica el 2 %-20 % del art. 33 de la
 * Ley 21.839, derogada, y estos fallos son la razon por la que ese
 * criterio es defendible y no una invencion nuestra.
 */
/**
 * De donde sale que el honorario del mediador se calcule sobre la base
 * del expediente, con las reducciones de los arts. 22 y 40 ya
 * aplicadas, y no sobre la base propia que el Decreto 696/2025 le da
 * en su art. 31 inc. d).
 *
 * Es una interpretacion, y de las que mueven el numero. Estos fallos
 * son la razon por la que es defendible y no una comodidad nuestra.
 */
export const MEDIACION_BASE_UNICA: Criterio = {
  sostiene:
    'A los efectos regulatorios el juicio es una unidad jurídica, de modo tal que tiene un solo monto pecuniario y no pueden existir dos bases regulatorias diferentes, según sea letrado o auxiliar de la justicia.',
  fallos: [
    // Va primero porque es el que decide el punto y no una analogia: el
    // apelante era un perito ingeniero que planteo que la reduccion del
    // 30 % del art. 22 no le alcanzaba por ser auxiliar de justicia y no
    // letrado. La Sala lo rechazo, y agrego que "la ley arancelaria no
    // contempla excepcion ni distincion alguna que altere la reduccion
    // del 30 % [...] de acuerdo al profesional de que se trate".
    {
      tribunal: 'CNCiv., Sala K',
      expediente: 'expte. 2896/2021',
      caratula:
        'MARCHAND, HUGO ALBERTO Y OTRO c/ FREYRE PENABAD, NELLY MARIA FLORINDA s/ PRESCRIPCION ADQUISITIVA',
      fecha: '22/06/2026',
    },
    // La misma Sala aplicandolo a un mediador: reduce la base un 30 %
    // por el art. 22 y regula a la mediadora sobre esa base, en la misma
    // resolucion.
    {
      tribunal: 'CNCiv., Sala K',
      expediente: 'expte. 8451/2022',
      caratula:
        'OBRA SOCIAL DE LA INDUSTRIA DEL FOSFORO ENCENDIDO Y AFINES c/ VARELA, CARLOS ALBERTO s/ DAÑOS Y PERJUICIOS - RESP. PROF. ABOGADOS',
      fecha: '09/05/2025',
    },
    // El origen de la doctrina. Los dos fallos de la Sala K remiten a
    // el; la transcripcion se leyo ademas dentro de la sentencia de la
    // Sala M en el expte. 55198/2020, del 16/09/2024.
    {
      tribunal: 'CNCiv., en pleno',
      expediente: 'plenario',
      caratula:
        'MURGUIA, ELENA JOSEFINA c/ GREEN, ERNESTO BERNARDO s/ CUMPLIMIENTO DE CONTRATO',
      fecha: '02/10/2001',
    },
    {
      tribunal: 'CNCiv., Sala A',
      expediente: 'expte. 74879/2018',
      caratula:
        'ZOLZINSKY, ESTHER c/ POCHINKI, EDUARDO JAVIER Y OTRO s/ NULIDAD DE ACTO JURIDICO',
      fecha: '08/07/2025',
    },
  ],
}

export const INCIDENTE_ESCALA: Criterio = {
  sostiene:
    'El criterio del art. 33 de la Ley 21.839 se considera, aun pese a su derogación, como una referencia análoga para regular los honorarios de los incidentes.',
  fallos: [
    {
      tribunal: 'CNCiv., Sala H',
      expediente: 'expte. 69817/2018',
      caratula:
        'RAMOS DIAZ, SABRINA ROMINA Y OTRO c/ FRIDMAN, PABLO ERNESTO s/ DAÑOS Y PERJUICIOS (ACC. TRAN. C/ LES. O MUERTE)',
      fecha: '27/10/2023',
      url: 'https://www.cij.gov.ar/d/sentencia-SGU-2b2f59bf-ca96-4860-9c92-41b6d6dcc6d1.pdf',
    },
    {
      tribunal: 'CNCiv., Sala I',
      expediente: 'expte. CIV 45030/2017',
      caratula:
        'TRIAM SRL c/ CONS DE PROP AV 3 N 568 VILLA GESELL PBA s/ ACCION DECLARATIVA (ART. 322 COD. PROCESAL)',
      fecha: '08/10/2019',
      url: 'https://scw.pjn.gov.ar/scw/viewer.seam?id=ioQ58TOKX%2BOUPhLNmhCrq7kcrVYsUBrK8HhRx9QWCRc%3D&tipoDoc=despacho'
    },
    // **La sala de este se verifico el 19/8 contra la sentencia**, y
    // hacia falta: el modelo del juzgado del que salio la cita no la
    // dice —nombra la Sala I para el anterior y a este lo lista suelto—
    // asi que estuvo un tiempo sin poder distinguirse de una completada
    // por analogia. El encabezado del PDF del CIJ dice "CAMARA CIVIL -
    // SALA I". Es correcta.
    //
    // Y el mismo fallo resuelve otra cosa: es uno de los dos que
    // sostienen CADUCIDAD_ART25, mas abajo. Una sentencia, dos
    // holdings.
    {
      tribunal: 'CNCiv., Sala I',
      expediente: 'expte. CIV 14821/2016',
      caratula:
        'FUNES, HERNAN IGNACIO c/ COSN PROP AV CALLAO 1364/70/74 Y OTRO s/ NULIDAD DE ASAMBLEA',
      fecha: '16/07/2019',
      url: 'https://www.cij.gov.ar/d/sentencia-SGU-49143e63-904a-4eae-89eb-4b3238401fa9.pdf',
    },
  ],
}

/**
 * La caducidad de instancia, que la Ley 27.423 no previo.
 *
 * **Es el unico punto donde Honorio no elige: pregunta.** Hay dos
 * corrientes vivas en la Camara Civil y las dos estan fundadas, asi que
 * son dos `Criterio` y no uno con una alternativa adentro. La
 * entrevista muestra cada uno debajo de su tarjeta.
 *
 * **Que tan vivas estan lo prueba la Sala I sola:** en 2019, en FUNES,
 * aplico el art. 25; en 2026, en MONOPOLI, aplico el art. 22. El mismo
 * tribunal fue para los dos lados en siete años. Por eso las dos listas
 * son de fallos y no de salas: una lista de salas envejece y da la
 * impresion de un reparto estable que no existe.
 */
export const CADUCIDAD_ART22: Criterio = {
  sostiene:
    'Al no surgir del articulado de la Ley 27.423 la base regulatoria que correspondería a la caducidad de la instancia, se aplican por analogía las disposiciones del art. 22, con la reducción del treinta por ciento allí prevista.',
  fallos: [
    // Va primero porque decide el punto bajo la ley vigente. La misma
    // Sala calcula ademas los intereses por "Barrientos" (CSJN,
    // 15/10/2024) al 8 % anual, que es la razon por la que "Samudio"
    // quedo afuera de este archivo.
    {
      tribunal: 'CNCiv., Sala I',
      expediente: 'expte. 59257/2021',
      caratula:
        'MONOPOLI, JULIO CESAR Y OTRO c/ GARCIA, GISELLE ALEJANDRA s/ DAÑOS Y PERJUICIOS (ACC. TRAN. C/ LES. O MUERTE)',
      fecha: '14/08/2026',
    },
    // El origen, y por eso va sin enlace: el unico disponible abre el
    // indice entero de plenarios y no este. Es de la Ley 21.839 y no
    // habla de caducidad —habla de la demanda rechazada— pero es de
    // donde viene la asimilacion, que es lo que esta corriente hace.
    {
      tribunal: 'CNCiv., en pleno',
      expediente: 'plenario',
      caratula:
        'MULTIFLEX S.A. c/ CONSORCIO DE PROPIETARIOS BARTOLOMÉ MITRE 2257/59',
      fecha: '30/09/1975',
      publicacion:
        'El Derecho, t. 64, p. 250; La Ley, t. 1975-D, p. 297; Jurisprudencia Argentina, t. 1976-I, p. 535',
      transcripcion:
        'Cuando se trata de una demanda rechazada totalmente, los honorarios de los abogados y procuradores se fijarán sobre el monto reclamado en ella, y de acuerdo con la escala del art. 6 para los de la parte vencedora y la proporción del art. 7 para los de la parte perdedora; y, cuando se trata de desistimiento del proceso y del derecho después de trabada la litis, se tomará como monto del juicio el importe reclamado, teniendo en cuenta para graduar el honorario la etapa en que el desistimiento se produjo, conforme a lo dispuesto en el art. 10 del arancel.',
    },
  ],
}

export const CADUCIDAD_ART25: Criterio = {
  sostiene:
    'La caducidad es también un modo anormal de terminación del proceso, como los que prevé el art. 25, de modo que corresponde la aplicación analógica de esa norma: si se produjo antes de decretarse la apertura a prueba, los honorarios son del cincuenta por ciento de la escala del art. 21.',
  fallos: [
    {
      tribunal: 'CNCiv., Sala A',
      expediente: 'expte. 17092/2022',
      caratula:
        'SOLIS, MARIA RITA c/ TRIUNVIRATO Y JURAMENTO SRL s/ ESCRITURACION',
      fecha: '14/08/2026',
    },
    // El mismo fallo que sostiene INCIDENTE_ESCALA, por otro holding.
    {
      tribunal: 'CNCiv., Sala I',
      expediente: 'expte. CIV 14821/2016',
      caratula:
        'FUNES, HERNAN IGNACIO c/ COSN PROP AV CALLAO 1364/70/74 Y OTRO s/ NULIDAD DE ASAMBLEA',
      fecha: '16/07/2019',
      url: 'https://www.cij.gov.ar/d/sentencia-SGU-49143e63-904a-4eae-89eb-4b3238401fa9.pdf',
    },
  ],
  doctrina: [
    {
      autor: 'Pesaresi, Guillermo M.',
      obra: 'Honorarios en la Justicia Nacional y Federal: Ley 27.423 anotada, comentada y concordada',
      editorial: 'Cathedra Jurídica',
      ciudad: 'Buenos Aires',
      anio: 2018,
      pagina: 'p. 388',
    },
  ],
}

/**
 * El "factor de correlacion" del art. 21, segundo parrafo: el minimo y
 * el maximo de cada escala arrancan en el **maximo del grado inmediato
 * anterior** y los porcentajes corren solo sobre el excedente.
 *
 * Es lo que `calcularEscala()` implementa, y de donde salen sus seis
 * constantes: 4,95 / 11,70 / 21,60 / 33 / 90 / 127,50 UMA.
 *
 * **La lectura alternativa es acumular todos los maximos previos**, que
 * para la 3a escala daria 12,75 en vez de 11,70. Esta app no la sigue,
 * por contraria al texto expreso, y **no se le encontro respaldo**: ni
 * en la doctrina consultada, ni en el fallo, ni en la nota de autor.
 * Eso se dice tal cual y no se disimula: el dato es que la alternativa
 * existe y que no se encontro quien la defienda, no que no exista.
 *
 * Una pista sin verificar, para el dia que haga falta otro fallo: la
 * nota de Careaga Quiroga (Diario Judicial, 5/6/2025) cita a la CFed.
 * Mendoza, Sala B, "Castañeda", 12/03/2021. **No se cargo porque no se
 * leyo la sentencia.**
 */
export const ESCALA_CORRELACION: Criterio = {
  sostiene:
    'La ley parte de un honorario básico, que es el máximo de la escala anterior y se calcula aplicando el máximo de esa escala por su porcentaje mayor. Luego, solamente sobre el excedente se aplican los porcentajes —menor o mayor— del grado en el que está la base regulatoria del proceso.',
  fallos: [
    {
      tribunal: 'CFed. Resistencia',
      expediente: 'expte. FRE 3154/2021/CA1',
      caratula:
        'RINDEL, JUAN ANGEL c/ ESTADO NACIONAL - MINISTERIO DE DEFENSA - FUERZA AEREA ARGENTINA s/ CONTENCIOSO ADMINISTRATIVO - VARIOS',
      fecha: '14/11/2024',
    },
  ],
  doctrina: [
    {
      autor: 'Díaz, Andrea y Musich, Máximo',
      obra: 'Ley 27.423: honorarios de los profesionales del Derecho y auxiliares de Justicia',
      editorial: 'Llanes Ediciones',
      ciudad: 'Ciudad Autónoma de Buenos Aires',
      anio: 2026,
    },
  ],
  // Sin fallos ni doctrina, y eso es el dato: la alternativa se discute
  // y no se le encontro respaldo escrito.
  contraria: {
    sostiene:
      'El piso de cada escala sería la acumulación de todos los máximos previos, y no el del grado inmediato anterior: para la 3ª escala, 12,75 UMA en lugar de 11,70.',
  },
}

/**
 * Los minimos del art. 58 se leen contra el proceso entero, no contra
 * la etapa.
 *
 * Importa donde la app parte el honorario en 1/3 y 2/3 por el art. 29:
 * comparar un tercio contra los 10 UMA del proceso de conocimiento es
 * comparar dos cosas distintas.
 *
 * **Es un criterio de abogados y no alcanza a los auxiliares.** Estuvo
 * un rato colgado de la seccion de auxiliares y estaba mal: **el perito
 * no divide su labor en etapas**. O la completa —la pericia y lo que el
 * juez le pida sobre ella— o su honorario sale por otra puerta: la
 * "regulacion compensatoria adecuada" del art. 25, segundo parrafo,
 * inc. b), o el 1/4 de UMA del art. 61 bis. No existe un "2/3 de
 * perito" contra el cual comparar un piso. El unico que puede partir su
 * actuacion es el letrado, que puede no haber alegado.
 *
 * El fallo lo confirma en los hechos y conviene tenerlo escrito, porque
 * es lo que hizo pensar lo contrario: el beneficiario era **un letrado**
 * —el Dr. Krischkautzky— en una ejecucion de honorarios, que es
 * justamente un tramite divisible en etapas. La Sala le elevo el
 * honorario a 6 UMA, el minimo entero del art. 58 inc. b).
 *
 * El `sostiene` junta dos pasajes del mismo fallo —el alcance de los
 * minimos y que estan previstos para el proceso completo—, que ahi van
 * seguidos.
 *
 * Burgueño remite ademas a un fallo anterior de la misma Sala,
 * "Lifchitz c/ Suarez s/ ejecucion", del 03/12/2018. **No se cargo: la
 * cita interna no trae numero de expediente y la sentencia no se
 * leyo.**
 */
export const MINIMOS_PROCESO_COMPLETO: Criterio = {
  sostiene:
    'El art. 58 del arancel establece mínimos para todos aquellos supuestos en los que, por aplicación del resto del articulado de la ley, los cálculos arrojen cifras inferiores a las que determina; y esos mínimos se encuentran previstos para el proceso completo.',
  fallos: [
    {
      tribunal: 'CNCiv., Sala H',
      expediente: 'expte. 92016/2013',
      caratula:
        'BURGUEÑO, RUBEN DANIEL Y OTRO c/ AGUAYO, JUAN VICENTE Y OTRO s/ DAÑOS Y PERJUICIOS (ACC. TRAN. C/ LES. O MUERTE)',
      fecha: '07/09/2021',
    },
  ],
  doctrina: [
    {
      autor: 'Pesaresi, Guillermo M.',
      obra: 'Honorarios en la Justicia Nacional y Federal: Ley 27.423 anotada, comentada y concordada',
      editorial: 'Cathedra Jurídica',
      ciudad: 'Buenos Aires',
      anio: 2018,
      pagina: 'p. 753',
    },
  ],
}

/**
 * Que escrito constituye la primera etapa del sucesorio.
 *
 * **Es el primer criterio del archivo sin ningun fallo**, y por eso
 * conviene mirarlo: la presentacion tiene que decir "doctrina" y no
 * "jurisprudencia". Si algun dia los muestra iguales, este es el que
 * queda mintiendo.
 */
export const SUCESION_PRIMERA_ETAPA: Criterio = {
  sostiene:
    'Constituye la primera etapa aquel escrito que se basta a sí mismo, de modo de haber permitido declarar abierta la sucesión; o sea, que el auto de apertura haya sido consecuencia de dicho escrito.',
  fallos: [],
  doctrina: [
    {
      autor: 'Pesaresi, Guillermo M.',
      obra: 'Honorarios en la Justicia Nacional y Federal: Ley 27.423 anotada, comentada y concordada',
      editorial: 'Cathedra Jurídica',
      ciudad: 'Buenos Aires',
      anio: 2018,
      pagina: 'p. 386',
    },
  ],
}

/**
 * El IVA no esta dentro del honorario regulado: lo adiciona el
 * condenado en costas.
 *
 * **Estaba escrita a mano adentro de una cadena de
 * `regulacion-prosa.ts`**, abreviada y sin el tomo de Fallos. Era la
 * unica cita que el generador de prosa emite y no salia de aca, que es
 * exactamente lo que este archivo existe para evitar.
 *
 * El `sostiene` es **el sumario de la propia Corte**, no una frase del
 * fallo: en el texto de la sentencia esa oracion no aparece asi. Se usa
 * el sumario a proposito, porque el considerando que si dice lo mismo
 * —el 8°, sobre desnaturalizar el tributo haciendolo incidir en la
 * renta del profesional— no se sostiene solo fuera de su contexto.
 */
export const IVA_NO_INCLUIDO: Criterio = {
  sostiene:
    'Corresponde obligar a la parte condenada en costas a que adicione al pago de los honorarios regulados al profesional que actuó en juicio por su contraria, el importe correspondiente al impuesto al valor agregado que recae sobre tales emolumentos.',
  fallos: [
    {
      tribunal: 'CSJN',
      expediente: 'Fallos 316:1533',
      caratula:
        'Recurso de hecho deducido por Arístides Horacio M. Corti en la causa Compañía General de Combustibles S.A. s/ recurso de apelación',
      fecha: '16/06/1993',
      url: 'https://sjconsulta.csjn.gov.ar/sjconsulta/documentos/verDocumentoSumario.html?idDocumentoSumario=4059',
    },
  ],
}

/**
 * El 40 % de las actuaciones posteriores a la ejecucion propiamente
 * dicha (art. 41, ultima oracion): sobre que se calcula.
 *
 * **Este criterio se declara abierto a proposito.** No hay ninguno
 * asentado: se consultaron cuatro obras y el resultado fue que dos
 * callan y las otras dos se contradicen entre si, y cada una le da la
 * razon a esta app en un punto y se la quita en el otro.
 *
 *   Rodriguez Saiach, Kunzmann y Nigro   40 % sobre la escala: coincide
 *   Beade                                40 % sobre lo anterior: no
 *   Pesaresi                             no lo trata
 *   Diaz y Musich                        no lo trata
 *
 * **Por que la app sigue esta lectura y no la otra**, aunque el punto
 * este abierto: el art. 41 dice "en un cuarenta por ciento (40%) **de
 * la escala del citado articulo**", y el citado es el 21. "De lo
 * anterior" es otra cosa que el texto no dice. Y la cuenta cierra: la
 * mitad de la primera etapa mas el 40 % de la segunda dan el 90 %, que
 * es el 100 % menos el 10 % del propio articulo.
 *
 * **Un dato para pesar a Beade, y no es un ataque al autor:** en el
 * mismo ejemplo calcula el maximo de la escala como el 15 % del total
 * de la base —$150.000 sobre $1.000.000— e ignora el factor de
 * correlacion del art. 21, que es el criterio que ESCALA_CORRELACION
 * funda mas arriba con RINDEL y con Diaz & Musich. Por esa regla el
 * maximo es 292,78 UMA y no 277,78: su punto de partida ya esta corrido
 * un 5,4 % antes de llegar a la discusion del 40 %.
 *
 * **Y un punto donde pasa lo contrario, que conviene tener escrito.**
 * Sobre el -10 % por no haber excepciones, Beade **coincide** con esta
 * app y Rodriguez Saiach **no**: Beade lo calcula sobre la mitad
 * ($75.000 a $67.500, o sea 0,5 x 0,9 = 45 % de la escala, que es lo
 * que hace `aplicarReduccionesFinales()`), mientras que Rodriguez
 * Saiach dice que la escala queda en "solo el 40 %", restando puntos
 * porcentuales. La app se queda en el 45 % porque el art. 41 manda
 * reducir un 10 % "del que correspondiere regular", y lo que
 * correspondia regular ya era la mitad. El art. 34 tiene la formula
 * identica y se trata igual.
 */
export const ART41_POSTERIORES: Criterio = {
  sostiene:
    'Las actuaciones posteriores a la ejecución propiamente dicha se regulan en el cuarenta por ciento de la escala del art. 21, y no sobre el honorario ya reducido de la ejecución: la mitad de la primera etapa más el cuarenta por ciento de la segunda dan el noventa por ciento de la escala, que es el ciento por ciento menos el diez por ciento del propio artículo.',
  fallos: [],
  doctrina: [
    {
      autor: 'Rodríguez Saiach, Luis A. y Kunzmann, Walter L., con contribuciones de Nigro, Marcela',
      obra: 'Ley de honorarios profesionales de abogados, procuradores y auxiliares de la Justicia nacional y federal comentada: Ley 27.423',
      editorial: 'Albremática',
      ciudad: 'Ciudad Autónoma de Buenos Aires',
      anio: 2023,
      pagina: 'p. 347',
      transcripcion:
        '50 % hasta la sentencia de venta + 40 % posterior es un 90 % que equivale a 100 % − 10 % = 90 %.',
    },
  ],
  contraria: {
    sostiene:
      'Los trámites posteriores se regularían en un cuarenta por ciento sobre lo anterior, es decir, sobre el honorario de la ejecución ya reducido a la mitad y con el diez por ciento descontado.',
    doctrina: [
      {
        autor: 'Beade, Jorge Enrique',
        obra: 'Honorarios profesionales de abogados, procuradores y auxiliares de la Justicia nacional y federal. Ley 27.423 comentada',
        editorial: 'Rubinzal-Culzoni',
        anio: 2018,
        transcripcion:
          'Los trámites posteriores a la notificación de la resolución dictada conforme artículo 508 del Código Procesal, se regularán en un 40 % sobre lo anterior.',
      },
    ],
  },
}
