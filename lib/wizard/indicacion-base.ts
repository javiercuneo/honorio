// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 L. Javier Cuneo Libarona
// ---------------------------------------------------------------
// lib/wizard/indicacion-base.ts
// Que monto hay que ingresar en el paso `base`, segun lo que ya se
// contesto.
//
// Por que existe: el error mas caro de esta herramienta no es la
// escala sino la base. La escala esta validada 300 veces; la base la
// pone una persona. El asistente clasico mostraba esta indicacion
// arriba del campo (`js/wizard.js`, `renderBase()`) y se perdio en la
// migracion.
//
// Framework-agnostico: sin React, sin DOM. Es una funcion pura de las
// respuestas al texto que se muestra, del mismo tipo que las
// `condition` del schema. No calcula nada ni conoce el motor.
//
// Cada afirmacion sobre la ley esta verificada contra
// docs/domain/00_LEY_27423.md del repositorio de herramientas, y cada
// afirmacion sobre lo que hace la app, contra lib/legal/calculate.ts.
// El texto del clasico no se copio a ciegas: no es oraculo.
// ---------------------------------------------------------------

import type { Answers, Explanation } from '@/lib/legal/types'

// ---- Lineas compartidas ----

/**
 * Las quitas de base —el 20 % de vivienda del art. 40 y el 30 % del
 * art. 22— las aplica el motor sobre lo que se ingresa. Quien las
 * descuenta a mano las aplica dos veces.
 */
const SIN_DESCONTAR =
  'Ingresá el monto sin reducir: la quita de base que corresponde por lo que contestaste la aplica la app.'

/**
 * Cuando el aviso de arriba corresponde. Aparece solo si alguna quita
 * rige de verdad: repetirlo en las veintipico de ramas lo volveria
 * invisible justo donde importa.
 *
 * Espeja las condiciones de `aplicarReduccionesBase()` en
 * lib/legal/calculate.ts —las unicas cuatro que tocan la base—. Si
 * alla se agrega una, va aca. Los cuatro pasos que mira se preguntan
 * antes que `base` en PROCESS_STEP_MAP, asi que ya estan contestados.
 */
function hayQuitaDeBase(answers: Answers): boolean {
  const tipo = answers.tipoProceso
  const conTerminacion =
    tipo === 'conocimiento' || tipo === 'ejecucion_sentencia' || tipo === 'ejecutivo'

  return (
    (tipo === 'conocimiento' &&
      answers.objeto === 'desalojo' &&
      answers.desalojoVivienda === 'vivienda') ||
    (tipo === 'homologacion_desocupacion' &&
      answers.homologacionVivienda === 'vivienda') ||
    (conTerminacion && answers.sentenciaResultado === 'rechazada') ||
    (conTerminacion &&
      answers.modoTerminacion === 'caducidad' &&
      answers.caducidadCriterio === 'art22')
  )
}

/**
 * Art. 21, tercer parrafo. Va detras del "por qué" y no en el ayuda
 * visible, por tres razones que aparecieron al revisarlo el 7/8/2026:
 *
 * 1. **Es una regla general del art. 21, no de un proceso.** El ayuda
 *    dice que monto ingresar *en este caso*; el litisconsorcio no
 *    depende del caso. Puesto ahi obligaba a repetirlo en veintipico
 *    de ramas o a dejarlo desparejo, que fue lo que paso: estaba en el
 *    conocimiento y faltaba en la cautelar, la homologacion y el
 *    incidente.
 * 2. **No es inocuo, y una linea no alcanza para decirlo.** El 5 %-10 %
 *    de los auxiliares del art. 21 se calcula sobre el monto del
 *    proceso, no sobre el interes de un litisconsorte. Quien ingresa
 *    una parte se lleva un honorario de perito corto en esa misma
 *    proporcion. Un hint que manda ingresar la parte sin decir eso es
 *    media verdad.
 * 3. **No siempre el interes es distinguible ni el objeto divisible.**
 *
 * La sucesion queda afuera: se tramita como jurisdiccion voluntaria y
 * para esos el mismo art. 21 manda considerar que hay una sola parte.
 */
const LITISCONSORCIO =
  'Y una regla general del art. 21, que no depende del tipo de proceso: si hay litisconsorcio, la regulación se hace con relación al interés de cada litisconsorte, de modo que lo que corresponde ingresar es ese interés y no el total del pleito. Con dos reparos. El primero, que ese interés tiene que poder distinguirse. El segundo, que el 5 % al 10 % de los auxiliares se calcula sobre el monto del proceso y no sobre el interés de un litisconsorte: si ingresás una parte, el honorario del perito sale corto en esa misma proporción, y eso la app no lo advierte.'

// ---- Textos de la ley, verbatim ----

const ART_21_LITISCONSORCIO =
  'ARTÍCULO 21.- ( ... ) Si hubiera litisconsorcio la regulación se hará con relación al interés de cada litisconsorte. En los procesos de jurisdicción voluntaria, a los fines de la regulación, se considerará que hay una (1) sola parte.'

const ART_22 =
  'ARTÍCULO 22.- En los juicios por cobro de sumas de dinero, a los fines de la regulación de honorarios de los profesionales intervinientes, la cuantía del asunto será el monto de la demanda o reconvención; si hubiera sentencia será el de la liquidación que resulte de la misma, actualizado por intereses si correspondiere. En caso de transacción, la cuantía será el monto de la misma. Si fuere íntegramente desestimada la demanda o la reconvención, se tendrá como valor del pleito el importe de la misma, actualizado por intereses al momento de la sentencia, si ello correspondiere, disminuido en un treinta por ciento (30%), o, en los procesos de monto indeterminado, según la pericia contable, si existiere.'

const ART_23_A =
  'ARTÍCULO 23.- El monto de los procesos en caso de que existan bienes susceptibles de apreciación pecuniaria, se determinará conforme lo siguiente: a) Si se trata de bienes inmuebles o derechos sobre los mismos y no han sido tasados en autos, se tendrá como cuantía del asunto la valuación fiscal al momento en que se practique la regulación, incrementada en un cincuenta por ciento (50%). No obstante reputándose ésta, inadecuada al valor real del inmueble, el profesional podrá estimar el valor que le asigne, de lo que se dará traslado al obligado al pago. En caso de oposición, el juez designará perito tasador. De la pericia se correrá traslado por cinco (5) días al profesional y al obligado al pago ( ... ) Este procedimiento no impedirá que se dicte sentencia en el principal, difiriéndose la regulación de honorarios;'

const ART_23_B =
  'ARTÍCULO 23.- ( ... ) b) Si se trata de bienes muebles o semovientes, se tomará como cuantía del asunto el valor que surja de autos, sin perjuicio de efectuarse la determinación establecida en el inciso a);'

const ART_23_D =
  'ARTÍCULO 23.- ( ... ) d) Si se trata de derechos crediticios, se tomará como cuantía del asunto el valor consignado en las escrituras o documentos respectivos, deducidas las amortizaciones normales previstas en los mismos, o las extraordinarias que justifique el interesado;'

const ART_23_E =
  'ARTÍCULO 23.- ( ... ) e) Si se trata de títulos de renta o acciones de entidades privadas, se tomará como cuantía del asunto el valor de cotización de la Bolsa de Comercio de Buenos Aires; si no cotizara en bolsa, el valor que informe cualquier entidad bancaria oficial; si por esta vía fuere imposible lograr la determinación, se aplicará el procedimiento del inciso a);'

const ART_23_F =
  'ARTÍCULO 23.- ( ... ) f) Si se trata de establecimientos comerciales, industriales o mineros, se valuará el activo conforme las normas de los incisos de este artículo; se descontará el pasivo justificado por certificación contable u otro medio idóneo en caso de que no se lleve la contabilidad en legal forma, y al líquido que resulte se le sumará un diez por ciento (10%) que será computado como valor llave;'

const ART_23_H =
  'ARTÍCULO 23.- ( ... ) h) Si se trata de uso y habitación, será valuado en el diez por ciento (10%) anual del valor del bien respectivo, justipreciado según las reglas del inciso a) y el resultado se multiplicará por el número de años por el que se transmite el derecho, no pudiendo exceder en ningún caso del ciento por ciento (100%) de aquél;'

const ART_24 =
  'ARTÍCULO 24.- A los efectos de la regulación de honorarios, se tendrán en cuenta los intereses que deban calcularse sobre el monto de condena. Los intereses fijados en la sentencia deberán siempre integrar la base regulatoria, bajo pena de nulidad.'

const ART_29_G =
  'ARTÍCULO 29.- ( ... ) g) Los incidentes se dividirán en dos (2) etapas; la primera se compone del planteo que lo origine, sea verbal o escrito, y la segunda, del desarrollo hasta su conclusión.'

const ART_34 =
  'ARTÍCULO 34.- En los juicios ejecutivos y ejecuciones especiales, por lo actuado desde su iniciación hasta la sentencia, los honorarios del abogado o procurador serán calculados de acuerdo a la escala del artículo 21. No habiendo excepciones, los honorarios se reducirán en un diez por ciento (10%) del que correspondiere regular.'

const ART_35 =
  'ARTÍCULO 35.- En el proceso sucesorio, si un (1) solo abogado patrocina o representa a todos los herederos o interesados, sus honorarios se regularán sobre el valor del patrimonio que se transmite, inclusive los gananciales, en la mitad del mínimo y del máximo de la escala establecida en el artículo 21. También integrarán la base regulatoria los bienes existentes en otras jurisdicciones, dentro del país. En el caso de tramitarse más de una (1) sucesión en un mismo proceso, el monto será el del patrimonio transmitido en cada una de ellas. Para establecer el valor de los bienes se tendrá en cuenta lo dispuesto en el artículo 23. Si constare en el expediente un valor por tasación, estimación o venta superior a la valuación fiscal, o la manifestación establecida en el inciso a) del artículo 23 de la presente ley, dicho valor será el considerado a los efectos de la regulación ( ... )'

const ART_37 =
  'ARTÍCULO 37.- En las medidas cautelares, ya sea que éstas tramiten autónomamente, en forma incidental o dentro del proceso, los honorarios se regularán sobre el monto que se pretende a asegurar, aplicándose como base el veinticinco por ciento (25%) de la escala del artículo 21; salvo casos de controversia u oposición, en que la base se elevará al cincuenta por ciento (50%).'

const ART_38 =
  'ARTÍCULO 38.- Tratándose de acciones posesorias, interdictos o de división de bienes comunes, se aplicará la escala del artículo 21. El monto de los honorarios se reducirá en un veinte por ciento (20%) atendiendo al valor de los bienes conforme a lo dispuesto en el artículo 23 si fuere exclusivamente en beneficio del patrocinado, con relación a la cuota o parte defendida.'

const ART_39 =
  'ARTÍCULO 39.- En los juicios de alimentos la base del cálculo de los honorarios será el importe correspondiente a dos (2) años de la cuota que se fijare judicialmente. En los casos de aumento, disminución, cesación o coparticipación en los alimentos, se tomará como base la diferencia que resulte del monto de la sentencia por el término de dos (2) años, aplicándose la escala de los incidentes.'

const ART_40 =
  'ARTÍCULO 40.- En los procesos de desalojo se fijarán los honorarios de acuerdo con la escala del artículo 21, tomando como base el total de los alquileres del contrato. En el caso de que la locación sea para vivienda y/o habitación, tal monto se reducirá en un veinte por ciento (20%). Si el profesional estimare inadecuado el alquiler fijado en el contrato o en caso de que éste no pudiera determinarse exactamente o se tratase de juicios por intrusión o tenencia precaria, deberá fijarse el valor locativo actualizado del inmueble, para lo cual el profesional podrá acompañar tasaciones al respecto o designar perito para que lo determine, abonando los gastos de este último quien estuviere más alejado del monto de la tasación del valor locativo establecido. Tratándose de una homologación de convenio de desocupación y su ejecución, los honorarios se regularán en un cincuenta por ciento (50%) del establecido en el párrafo primero.'

const ART_41 =
  'ARTÍCULO 41.- En el procedimiento de ejecución de sentencias recaídas en procesos de conocimiento, las regulaciones de honorarios se practicarán aplicando la mitad de la escala del artículo 21. No habiendo excepciones, los honorarios se reducirán en un diez por ciento (10%) del que correspondiere regular. Las actuaciones posteriores a la ejecución propiamente dicha se regularán en un cuarenta por ciento (40%) de la escala del citado artículo.'

const ART_43 =
  'ARTÍCULO 43.- ( ... ) En las demandas de desalojo por restitución de inmuebles o parte de ellos, concedidos a los trabajadores en virtud de la relación de trabajo, se considerará como valor del juicio el cincuenta por ciento (50%) de la última remuneración mensual normal y habitual que deba percibir según su categoría profesional por el término de dos (2) años.'

const ART_45 =
  'ARTÍCULO 45.- En la liquidación y disolución del régimen patrimonial del matrimonio se regularán honorarios al patrocinante o apoderado de cada parte conforme la escala del artículo 21 calculado sobre el patrimonio que se le adjudique a su patrocinado o representado.'

const ART_46 =
  'ARTÍCULO 46.- En los juicios de escrituración y, en general, en los procesos derivados del contrato de compraventa de inmuebles, a los efectos de la regulación, se aplicará la norma del artículo 23, inciso a), salvo que resulte un monto mayor del boleto de compraventa, en cuyo caso se aplicará este último.'

const ART_49 =
  'ARTÍCULO 49.- En las acciones sobre derechos de incidencia colectiva con contenido patrimonial, los honorarios serán los que resulten de la aplicación del artículo 21, reducidos en un veinticinco por ciento (25%).'

const ART_52 =
  'ARTÍCULO 52.- ( ... ) A los efectos de la regulación se tendrán en cuenta los intereses, los frutos y los accesorios, que integrarán la base regulatoria según lo establecido en los artículos 22, 23 y 24.'

// ---- La indicacion de una rama ----

interface Indicacion {
  /** Que monto hay que ingresar. Se ve siempre, bajo la pregunta. */
  ayuda: string
  /** Rotulo del "por qué". Describe el contenido, no dice "Ver más". */
  brief: string
  /** El criterio y las reglas de detalle, detras del "por qué". */
  expanded: string
  /** El texto de la ley, verbatim. */
  full: string[]
}

const GENERICA: Indicacion = {
  ayuda: 'Es el valor económico que se toma como referencia para aplicar la escala del art. 21.',
  brief: 'Qué es la base regulatoria',
  expanded:
    'La base regulatoria —también llamada cuantía o monto del asunto— es el valor económico sobre el que se aplica la escala del art. 21 en los procesos susceptibles de apreciación pecuniaria. De ella dependen el tramo de la escala, la alícuota aplicable y los mínimos y máximos que resultan.',
  full: [],
}

// ---- Ramas de `conocimiento`, por objeto del juicio ----

function porObjeto(answers: Answers): Indicacion {
  switch (answers.objeto) {
    case 'sumas_dinero':
      return {
        ayuda: montoSegunTerminacion(answers),
        brief: 'Cómo se determina la cuantía en el cobro de sumas de dinero',
        expanded:
          'El art. 22 da tres momentos: antes de la sentencia, el monto de la demanda o de la reconvención; habiendo sentencia, el de la liquidación que resulte de ella, actualizado por intereses; y en caso de transacción, el monto de la transacción. Los intereses no son un accesorio que se pueda dejar afuera: el art. 24 los manda integrar la base bajo pena de nulidad, y el art. 52 agrega los frutos y los accesorios. La caducidad de la instancia no está prevista en el art. 22, así que tomar la liquidación practicada al solo efecto regulatorio es un criterio y no una transcripción de la ley.',
        full: [ART_22, ART_24, ART_52],
      }

    case 'desalojo':
      return answers.desalojoVivienda === 'laboral'
        ? {
            ayuda:
              'Ingresá el 50 % de la última remuneración mensual normal y habitual del trabajador, según su categoría profesional, por el término de 2 años.',
            brief: 'Por qué acá la base es la remuneración y no el alquiler',
            expanded:
              'El desalojo por restitución de un inmueble concedido al trabajador en virtud de la relación de trabajo no se mide por alquileres, porque no los hay: el art. 43 fija como valor del juicio el 50 % de la última remuneración mensual normal y habitual por dos años. La reducción del 20 % del art. 40 para la locación de vivienda no juega en esta rama, y la app no la aplica.',
            full: [ART_43],
          }
        : {
            ayuda:
              'Ingresá el total de los alquileres del contrato. Si no hay contrato, si el alquiler fijado es inadecuado o si se trata de intrusión o tenencia precaria, el valor locativo actualizado del inmueble.',
            brief: 'Cómo se determina la base en los desalojos',
            expanded:
              'El art. 40 toma como base el total de los alquileres del contrato. Si la locación es para vivienda o habitación, ese monto se reduce en un 20 %, y esa quita la aplica la app sobre lo que ingreses. Cuando el profesional estima inadecuado el alquiler del contrato, cuando éste no puede determinarse con exactitud o cuando se trata de juicios por intrusión o tenencia precaria, la base es el valor locativo actualizado del inmueble, que se acredita con tasaciones o con perito designado al efecto.',
            full: [ART_40],
          }

    case 'inmuebles':
      return {
        ayuda:
          'Ingresá el valor del bien: si fue tasado en autos, el de la tasación; si no, la valuación fiscal al momento de la regulación incrementada en un 50 %.',
        brief: 'El orden de prelación del art. 23 para valuar los bienes',
        expanded:
          'El art. 23 inc. a) da un orden. Si los inmuebles no fueron tasados en autos, la cuantía es la valuación fiscal al momento en que se practique la regulación, incrementada en un 50 %. Si esa valuación se reputa inadecuada al valor real, el profesional puede estimar el valor que le asigne, se corre traslado al obligado al pago y, si hay oposición, el juez designa perito tasador: terminado ese procedimiento, la base es el valor estimado. Para los bienes muebles o semovientes rige el inc. b), que toma el valor que surja de autos sin perjuicio de aplicar el procedimiento del inc. a). Una advertencia que no está en ninguna ley y sale de liquidar expedientes: si hay montos en dólares, definí con qué tipo de cambio los convertís —oficial vendedor, MEP, el del día de la regulación— y dejalo dicho, porque la base cambia con esa elección.',
        full: [ART_23_A, ART_23_B],
      }

    case 'derechos_crediticios':
      return {
        ayuda:
          'Ingresá el valor consignado en las escrituras o documentos respectivos, deducidas las amortizaciones.',
        brief: 'Qué toma el art. 23 inc. d) como cuantía',
        expanded:
          'Se deducen las amortizaciones normales previstas en los propios documentos y también las extraordinarias, si el interesado las justifica. No es capital más intereses: es el valor del documento neto de amortizaciones.',
        full: [ART_23_D],
      }

    case 'titulos_acciones':
      return {
        ayuda:
          'Ingresá el valor de cotización de los títulos en la Bolsa de Comercio de Buenos Aires.',
        brief: 'Qué hacer si los títulos no cotizan',
        expanded:
          'Si no cotizan en bolsa, el valor que informe cualquier entidad bancaria oficial. Si por esa vía tampoco puede lograrse la determinación, el art. 23 inc. e) remite al procedimiento del inc. a): valuación y, si se la reputa inadecuada, estimación del profesional con eventual perito tasador.',
        full: [ART_23_E],
      }

    case 'establecimientos':
      return {
        ayuda:
          'Ingresá el activo valuado según los incisos del art. 23, menos el pasivo justificado, y al líquido sumale un 10 % en concepto de valor llave.',
        brief: 'Cómo se arma el valor de un establecimiento',
        expanded:
          'El pasivo se justifica con certificación contable u otro medio idóneo cuando no se lleva la contabilidad en legal forma. El 10 % de valor llave se suma al líquido que resulta después de descontar el pasivo, no al activo.',
        full: [ART_23_F],
      }

    case 'uso_habitacion':
      return {
        ayuda:
          'Ingresá el 10 % anual del valor del bien multiplicado por la cantidad de años por los que se transmite el derecho, sin que el resultado supere el 100 % del valor del bien.',
        brief: 'Cómo se valúa el uso y la habitación',
        expanded:
          'El valor del bien se justiprecia según las reglas del inc. a): tasación en autos, o valuación fiscal incrementada en un 50 %, o la estimación del profesional si aquélla se reputó inadecuada. El tope del 100 % es del propio inc. h) y la app no lo verifica —la base es un dato que ingresás vos—, así que ese control queda de tu lado.',
        full: [ART_23_H],
      }

    case 'escrituracion':
      return {
        ayuda:
          'Ingresá el valor del inmueble según el art. 23 inc. a), salvo que el boleto de compraventa arroje un monto mayor: en ese caso, el del boleto.',
        brief: 'Cuándo manda el boleto y cuándo la valuación',
        expanded:
          'El art. 46 alcanza los juicios de escrituración y, en general, los procesos derivados del contrato de compraventa de inmuebles. La regla es la del art. 23 inc. a) —tasación en autos, o valuación fiscal incrementada en un 50 %, o estimación del profesional—, con el boleto como piso cuando resulta mayor. La comparación la hacés vos: la app toma el número que ingreses.',
        full: [ART_46, ART_23_A],
      }

    case 'familia_alimentos':
      return {
        ayuda:
          'Ingresá el importe correspondiente a 2 años de la cuota que se fijó judicialmente.',
        brief: 'Los dos supuestos del art. 39, y cuál de ellos calcula la app',
        expanded:
          'El primer párrafo del art. 39 fija la base en dos años de la cuota, y es el supuesto que la app calcula. El segundo párrafo trata otro caso: en el aumento, la disminución, la cesación o la coparticipación, la base es la diferencia que resulta del monto de la sentencia por dos años, y se aplica la escala de los incidentes en lugar de la del art. 21. Ese segundo supuesto la app todavía no lo distingue: manda todos los alimentos por la escala del art. 21, así que para un aumento o una cesación el resultado no es el del segundo párrafo.',
        full: [ART_39],
      }

    case 'familia_liquidacion':
      return {
        ayuda:
          'Ingresá el valor del patrimonio que se le adjudica a tu patrocinado o representado, no el de la masa entera.',
        brief: 'Por qué la base es lo adjudicado y no el total',
        expanded:
          'El art. 45 regula honorarios al patrocinante o apoderado de cada parte sobre el patrimonio que se le adjudica a esa parte. Es la misma idea que el litisconsorcio del art. 21: la base es el interés de la parte defendida y no el total en discusión. Los bienes se valúan con las reglas generales del art. 23.',
        full: [ART_45, ART_23_A],
      }

    case 'posesorias_interdictos':
      return {
        ayuda:
          'Ingresá el valor de los bienes según el art. 23, con relación a la cuota o parte defendida.',
        brief: 'Sobre qué se aplica el 20 % del art. 38',
        expanded:
          'El art. 38 aplica la escala del art. 21 y reduce el monto de los honorarios en un 20 % cuando la acción es exclusivamente en beneficio del patrocinado, con relación a la cuota o parte defendida. Esa quita la aplica la app sobre el honorario ya calculado, no sobre la base, y solo si elegiste el beneficio exclusivo en el paso anterior.',
        full: [ART_38, ART_23_A],
      }

    case 'incidencia_colectiva':
      return {
        ayuda: 'Ingresá el contenido patrimonial de la acción.',
        brief: 'Sobre qué se aplica el 25 % del art. 49',
        expanded:
          'El art. 49 aplica el art. 21 y reduce los honorarios en un 25 %. La quita es sobre el honorario ya calculado y no sobre la base, así que el monto que ingreses va sin reducir.',
        full: [ART_49],
      }

    default:
      return { ...GENERICA }
  }
}

/**
 * En el cobro de sumas de dinero el art. 22 no da un monto sino tres,
 * segun el momento en que termino el proceso. Es el unico caso en que
 * la indicacion depende de la terminacion y no solo del objeto.
 */
function montoSegunTerminacion(answers: Answers): string {
  if (answers.modoTerminacion === 'sentencia') {
    return answers.sentenciaResultado === 'rechazada'
      ? 'Ingresá el importe de la demanda actualizado por intereses al momento de la sentencia.'
      : 'Ingresá el monto de la liquidación que resulta de la sentencia, actualizado por intereses.'
  }
  if (answers.modoTerminacion === 'modos_anormales') {
    return 'Ingresá el monto de la transacción.'
  }
  if (answers.modoTerminacion === 'caducidad') {
    return 'Ingresá el monto de la liquidación practicada al solo efecto regulatorio.'
  }
  return 'Ingresá el monto de la demanda o de la reconvención, con sus intereses.'
}

// ---- Ramas por tipo de proceso ----

function porTipoDeProceso(answers: Answers): Indicacion {
  switch (answers.tipoProceso) {
    case 'conocimiento':
      return porObjeto(answers)

    case 'sucesion':
      return {
        ayuda:
          'Ingresá el valor del patrimonio que se transmite, incluidos los gananciales y los bienes que existan en otras jurisdicciones del país.',
        brief: 'Cómo se valúa el patrimonio que se transmite',
        expanded:
          'Para establecer el valor de los bienes rige el art. 23: la tasación que conste en autos; si no la hay, la valuación fiscal al momento de la regulación incrementada en un 50 %; y si esa valuación se reputó inadecuada y terminó el procedimiento del inc. a), el valor estimado. El art. 35 agrega una regla propia: si en el expediente consta un valor por tasación, estimación o venta superior a la valuación fiscal, ese valor es el que se considera. Si tramita más de una sucesión en el mismo proceso, el monto es el del patrimonio transmitido en cada una. Si hay montos en dólares, definí con qué tipo de cambio los convertís y dejalo dicho, porque la base cambia con esa elección. Y acá no juega el litisconsorcio del art. 21, que en los demás procesos manda regular por el interés de cada litisconsorte: el sucesorio tramita como jurisdicción voluntaria, y para esos el mismo artículo manda considerar que hay una sola parte.',
        full: [ART_35, ART_23_A],
      }

    case 'ejecucion_sentencia':
      return {
        ayuda:
          'Ingresá la misma base sobre la que se reguló en el proceso de conocimiento: la base de la ejecución es la de la sentencia que se ejecuta.',
        brief: 'Por qué sin base propia',
        expanded:
          'El artículo que la determina es el que gobernó el proceso que se ejecuta —el 22 si era  cobro de sumas de dinero, el 23 si son bienes, el 46 si es condena a escriturar—. Esa identidad de base explica la mitad de la escala del art. 41: con la misma base y la escala entera, ejecutar una sentencia se pagaría igual que todo el juicio. Eso último es una lectura y no un texto del artículo, pero es la que da cuenta de la reducción. Los intereses van adentro, que el art. 24 los manda integrar bajo pena de nulidad. La mitad de la escala y el 10 % por no haber excepciones los aplica la app.',
        full: [ART_41, ART_24],
      }

    case 'ejecutivo':
      return {
        ayuda:
          'Ingresá el monto reclamado en la ejecución, con los intereses que integran la base.',
        brief: 'El art. 34 no define una base propia',
        expanded:
          'Los juicios ejectivos caen por su propia naturaleza dentro del art. 22 para el cobro de sumas de dinero (en la medida en que necesariamente se trata de obligación exigible y de cantidad líquida o fácilmente liquidable —art. 520 CPCCN—). Las reglas generales completan el resto: el art. 24 para los intereses. La reducción del 10 % cuando no hubo excepciones la aplica la app sobre el honorario, no sobre la base.',
        full: [ART_34, ART_22, ART_24],
      }

    case 'medida_cautelar':
      return {
        ayuda:
          'Ingresá el monto que se pretende asegurar. No es necesariamente el del juicio principal, aunque puede coincidir exactamente con él.',
        brief: 'Sobre qué monto se regula la cautelar',
        expanded:
          'El art. 37 regula sobre el monto que se pretende asegurar, sea que la medida tramite autónomamente, en forma incidental o dentro del proceso. Sobre la escala del art. 21 se aplica el 25 %, que se eleva al 50 % en casos de controversia u oposición; ese porcentaje lo aplica la app con lo que contestaste en el paso anterior.',
        full: [ART_37],
      }

    case 'homologacion_desocupacion':
      return {
        ayuda:
          'Ingresá el total de los alquileres del contrato. Si no hay contrato o el alquiler fijado es inadecuado, el valor locativo actualizado del inmueble.',
        brief: 'Qué base toma la homologación del convenio',
        expanded:
          'La base es la del primer párrafo del art. 40, el total de los alquileres del contrato, y sobre ella juegan dos porcentajes que aplica la app: la reducción del 20 % si la locación es para vivienda o habitación, y el 50 % del último párrafo, que es propio de la homologación del convenio de desocupación y su ejecución.',
        full: [ART_40],
      }

    case 'incidente':
      return {
        ayuda:
          'Ingresá el valor de lo que se discute en el incidente. Si el incidente no tiene valor autónomo, el del juicio principal.',
        brief: 'Qué se toma como valor del incidente',
        // El 2 %-20 % vivia aca hasta el 7/8/2026 y estaba fuera de
        // lugar: es el analogo de la escala del art. 21, no una regla
        // de base. Se mudo a la pantalla del resultado, que es donde
        // se aplica, con la jurisprudencia que lo sostiene.
        expanded:
          'Algunos incidentes se consideran de valor autónomo —lo efectivamente discutido en ellos— y en otros la base es la del juicio principal. La ley no lo resuelve: depende del incidente de que se trate. El porcentaje que se aplica sobre este monto no es una cuestión de base, y de dónde sale está explicado en la pantalla del resultado.',
        full: [],
      }

    default:
      return GENERICA
  }
}

// ---- Composicion ----

function indicacion(answers: Answers): Indicacion {
  return porTipoDeProceso(answers)
}

/**
 * El litisconsorcio del art. 21 rige en todo proceso salvo el
 * sucesorio, asi que no es de ninguna rama en particular: se agrega
 * uniformemente. La condicion mira que haya un tipo de proceso elegido
 * para no aparecer en el texto generico, que es un estado inalcanzable.
 */
function aplicaLitisconsorcio(answers: Answers): boolean {
  const tipo = answers.tipoProceso
  return typeof tipo === 'string' && tipo !== '' && tipo !== 'sucesion'
}

/** Qué monto hay que ingresar. Se ve siempre, bajo la pregunta. */
export function ayudaBase(answers: Answers): string {
  const ind = indicacion(answers)
  return [ind.ayuda, hayQuitaDeBase(answers) ? SIN_DESCONTAR : null]
    .filter(Boolean)
    .join(' ')
}

/** El fundamento, detrás del mismo "por qué" que usa el resto de la app. */
export function explicacionBase(answers: Answers): Explanation {
  const ind = indicacion(answers)
  const litis = aplicaLitisconsorcio(answers)
  return {
    brief: ind.brief,
    expanded: litis ? `${ind.expanded} ${LITISCONSORCIO}` : ind.expanded,
    full: litis ? [...ind.full, ART_21_LITISCONSORCIO] : ind.full,
  }
}
