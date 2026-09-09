// ---------------------------------------------------------------
// Baja de la planilla publicada los valores de la UMA y del UHOM y los
// escribe en data/uma.json y data/uhom.json si cambiaron.
//
//   npm run uma
//
// Lo corre un cron diario, nunca el navegador del visitante. El porque
// esta en lib/legal/uma.ts y en lib/legal/uhom.ts.
//
// **No corre en el build.** Lo decia este comentario y era falso:
// `npm run build` es `next build` pelado. Un deploy no trae valores
// nuevos; los trae el cron, o el disparo manual del workflow.
//
// La planilla es una tabla de dos columnas, clave y valor:
//
//   UMA,104.220
//   UHOM,12.960
//   Acordada,Expresado en UMAs: (valor = $ 104.220 segun Res. SGA n° 1930/26)
//   URL,https://www.csjn.gov.ar/documentos/descargar?ID=160993
//
// Leerla es de `scripts/planilla.mjs`, que comparte con el control de
// `verificar-publicado.mjs`. Ahi esta el porque de cada decision de
// lectura —el diccionario, las comillas, la celda de URL aparte—.
//
// **Desde el 9/9/2026 hay una segunda fuente y este script las compara
// antes de escribir nada.** El proyecto `valores` sirve el mismo
// diccionario que la planilla y va a reemplazarla; mientras tanto las
// dos tienen que decir el mismo numero, y si no lo dicen no se publica.
// El detalle esta abajo, en «El solapamiento».
//
// **Las dos unidades no se comportan igual y por eso cada una trae su
// umbral y su control.** La UMA se mueve dos veces por anio y en
// saltos grandes; el UHOM cambia todos los meses en saltos de ~2 %,
// asi que el 60 % de la UMA no cazaria nada. A cambio el UHOM es
// derivado —UR-SINEP x 12, redondeado a la decena proxima superior— y
// eso deja un control de forma que la UMA no puede tener: termina en
// cero siempre.
//
// La planilla todavia no trae la norma del UHOM: la fila `Acordada`
// describe la UMA. Mientras no existan las filas `UHOM_FUENTE` y
// `UHOM_URL`, el valor entra sin procedencia y el script avisa. No
// aborta, porque el numero es el correcto; lo que falta es la cita.
//
// Salidas:
//   0  con o sin cambios (el workflow mira el diff de git, no el
//      codigo de salida: "no cambio nada" es el caso normal)
//   1  la planilla no se pudo leer, lo que trajo no pasa los
//      controles, o las dos fuentes no dicen el mismo numero. Falla
//      fuerte y no toca el archivo: es preferible publicar con el
//      valor de ayer que con uno inventado.
//
// Que este script termine bien no significa que el sitio quedo con el
// valor nuevo: entre esto y honorio.ar estan el commit y el deploy.
// Eso lo controla `verificar-publicado.mjs`, que mira lo servido.
// ---------------------------------------------------------------

import { readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  VALORES,
  diferencias,
  leerPlanilla,
  leerUnidad,
  leerValores,
} from './planilla.mjs'

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..')
const DESTINO_UMA = join(RAIZ, 'data', 'uma.json')
const DESTINO_UHOM = join(RAIZ, 'data', 'uhom.json')

/**
 * Cuanto puede moverse cada unidad de una actualizacion a la otra
 * antes de que el script se plante.
 *
 * **Los dos salian de una estimacion y los dos estaban mal, cada uno
 * para su lado.** El 9/9/2026 se calibraron contra las series
 * reconstruidas de los actos —`data/serie-uma.json` y
 * `data/serie-uhom.json` de `herramientas-judiciales`, 67 y 71
 * valores—, que es la primera vez que hubo con que medirlos:
 *
 *   UMA    salto real mas grande  20,0 %  (dic. 2022)   umbral viejo 60 %
 *   UHOM   salto real mas grande  30,8 %  (jun. 2017)   umbral viejo 15 %
 *
 * El de la UMA estaba tres veces mas flojo que el movimiento maximo
 * observado: **un valor leido a la mitad —un −50 %— pasaba sin que
 * nada chillara**, que es justo el error que el umbral existe para
 * cazar. El del UHOM estaba al reves y era peor de lo anotado:
 * **habria frenado 5 de los 70 saltos de la serie** —+30,8 %, +24 %,
 * +20 %, +18,4 % y +16 %—, o sea que abortaba la sincronizacion ante
 * valores oficiales buenos.
 *
 * La regla que los fija ahora, y que es la que hay que sostener si
 * alguna vez se vuelven a tocar: **el doble del salto maximo
 * observado en la serie de esa unidad.** Deja margen para un mes
 * excepcional y sigue cazando el orden de magnitud, que es lo unico
 * que un umbral puede cazar. Si un dia frena un valor bueno, la
 * respuesta no es aflojarlo a ojo: es mirar la serie y recalibrar.
 */
const SALTO_MAXIMO_UMA = 0.4

/** Idem, sobre la serie del UHOM: 2 x 30,8 % redondeado. */
const SALTO_MAXIMO_UHOM = 0.6

function abortar(motivo) {
  console.error('No se actualizaron los valores: ' + motivo)
  console.error('data/uma.json y data/uhom.json quedan como estaban.')
  process.exit(1)
}

const tabla = await leerPlanilla(abortar)

const hoy = new Date().toISOString().slice(0, 10)

// ---- El solapamiento ----
//
// Las dos fuentes tienen que decir lo mismo, y si no lo dicen no se
// publica. Es la red que ya uso el ledger para cambiar de fuente sin
// que el cambio se estrene sobre un numero de verdad: una de las dos
// esta mal y desde afuera no hay forma de saber cual, asi que publicar
// cualquiera de las dos es publicar a cara o cruz. El valor de ayer,
// que es lo que queda, por lo menos se sabe de donde salio.
//
// **Que hace y que no hace la diferencia, segun el campo.** El numero
// aborta; la cita, el link y la vigencia avisan. Es la linea que ya
// estaba trazada en `verificar-publicado.mjs` y el motivo es el mismo:
// un valor equivocado le arruina la regulacion a alguien, una cita
// vieja se corrige sola en la corrida siguiente y mientras tanto el
// calculo es correcto. Si el aborto significara las dos cosas dejaria
// de significar la primera.
//
// **La segunda fuente que no contesta no frena nada** —el porque esta
// en `leerValores`—: la planilla sigue siendo la que manda hasta que
// esto haya andado un ciclo entero.
const segunda = await leerValores()

if (!segunda.tabla) {
  console.warn(
    '  Aviso: no se pudo comparar contra la segunda fuente: ' +
      segunda.motivo +
      '. Se sigue con la planilla, que es la que manda mientras dure el ' +
      'solapamiento.',
  )
} else {
  const distintas = diferencias(tabla, segunda.tabla)

  for (const d of distintas.filter((x) => x.campo !== 'valor')) {
    console.warn(
      '  Aviso: ' +
        d.unidad +
        ' — las dos fuentes traen distinta ' +
        d.campo +
        '. La planilla: ' +
        JSON.stringify(d.planilla) +
        '. valores: ' +
        JSON.stringify(d.valores) +
        '. No frena la publicación, pero conviene emparejarlas.',
    )
  }

  const enElNumero = distintas.filter((x) => x.campo === 'valor')

  if (enElNumero.length) {
    abortar(
      'las dos fuentes no dicen el mismo número.\n' +
        enElNumero
          .map(
            (d) =>
              '  ' +
              d.unidad +
              ': la planilla dice ' +
              (d.planilla === null ? 'nada legible' : '$' + d.planilla.toLocaleString('es-AR')) +
              ' y valores dice ' +
              (d.valores === null ? 'nada legible' : '$' + d.valores.toLocaleString('es-AR')),
          )
          .join('\n') +
        '\nQué hacer: corregir la que esté mal —la planilla, o ' +
        VALORES.replace('/valores.csv', '') +
        '— y volver a correr «UMA y UHOM». Las dos tienen que decir lo mismo ' +
        'hasta que se jubile la planilla.',
    )
  }
}

/**
 * Lee una clave de la planilla, la controla contra lo que ya hay y la
 * agrega al archivo si cambio.
 *
 * Es una sola funcion para las dos unidades a proposito: duplicarla
 * seria garantizar que dentro de seis meses una tenga un arreglo que
 * la otra no. Lo que cambia entre una y otra —el umbral de salto, el
 * control de forma, de donde sale la procedencia— entra por parametro
 * porque **si es distinto tiene que verse**.
 *
 * No sale del proceso al terminar: la UMA no puede quedar sin
 * actualizar porque el UHOM haya cambiado o al reves.
 */
function actualizar({ clave, etiqueta, destino, saltoMaximo, valor, fuente, url, vigencia, forma }) {
  if (!tabla.has(clave)) {
    abortar(
      'la planilla no tiene una fila ' + clave + '. Filas: ' + [...tabla.keys()].join(', '),
    )
  }

  // El numero ya viene interpretado por `leerUnidad`, que es el mismo
  // que interpreta las dos fuentes para compararlas. Volver a parsear
  // la celda aca abriria la puerta a que el valor que se compara y el
  // que se publica no sean el mismo.
  if (valor === null || valor <= 0) {
    abortar(
      'la fila ' + clave + ' no tiene un numero legible: ' + JSON.stringify(tabla.get(clave)),
    )
  }

  // **El control de forma avisa, no aborta, y la diferencia importa.**
  // Hasta el 9/9/2026 abortaba, y eso lo volvia capaz de frenar un
  // valor oficial: noviembre de 2022 salio en 2003 —contra la propia
  // regla de redondeo del decreto 2536/15— y la tabla oficial lo
  // declara asi y construye toda su escala sobre el. Es el unico de
  // los 71 valores de la serie que no termina en cero, y con el
  // control como aborto la sincronizacion de ese mes se habria
  // plantado ante el numero correcto.
  //
  // Un umbral de salto si puede abortar, porque un salto imposible es
  // casi siempre un error de lectura. Una regla de forma no: la
  // autoridad que fija el valor puede apartarse de ella, y cuando lo
  // hace el valor sigue siendo el valor.
  if (forma && !forma.control(valor)) {
    console.warn(
      '  Aviso: la fila ' + clave + ' trajo ' + valor + ', y ' + forma.motivo +
        ' Se toma igual —ya pasó con un valor oficial— pero conviene mirarlo.',
    )
  }

  const actual = JSON.parse(readFileSync(destino, 'utf8'))
  const previo = actual.historia[actual.historia.length - 1]

  if (previo) {
    const salto = Math.abs(valor - previo.valor) / previo.valor
    if (salto > saltoMaximo) {
      abortar(
        etiqueta +
          ' salto de ' +
          previo.valor +
          ' a ' +
          valor +
          ' (' +
          Math.round(salto * 100) +
          ' %, el maximo admitido es ' +
          Math.round(saltoMaximo * 100) +
          ' %). Revisá la planilla a mano.',
      )
    }
  }

  if (previo && previo.valor === valor) {
    // El valor no cambio, pero la procedencia puede haber llegado
    // despues —la celda de la URL se agrego cuando el valor ya estaba
    // cargado—. Completarla no es reescribir historia: el numero no se
    // toca, y sin esto la fuente entraria recien dentro de varios meses,
    // cuando el valor se mueva.
    //
    // **Solo se completa, nunca se borra.** La primera version de esto
    // asignaba `previo.fuente = fuente` a secas, y en la primera
    // corrida real le borro al UHOM la norma que estaba cargada a mano,
    // porque la planilla todavia no trae su procedencia y `fuente`
    // llegaba en null. Un dato verificado vale mas que la ausencia de
    // dato: si la planilla no dice nada, no esta diciendo que no haya
    // norma.
    const fuenteNueva = fuente !== null && fuente !== previo.fuente
    const urlNueva = url !== null && url !== previo.url
    const vigenciaNueva = vigencia !== null && vigencia !== previo.vigencia

    if (fuenteNueva || urlNueva || vigenciaNueva) {
      if (fuenteNueva) previo.fuente = fuente
      if (urlNueva) previo.url = url
      if (vigenciaNueva) previo.vigencia = vigencia
      actual.actualizado = hoy
      writeFileSync(destino, JSON.stringify(actual, null, 2) + '\n', 'utf8')
      console.log(
        etiqueta +
          ' no cambió ($' +
          valor.toLocaleString('es-AR') +
          '), pero se actualizó su procedencia: ' +
          (fuente ?? 'sin norma') +
          (url ? ' — ' + url : ''),
      )
      return
    }

    console.log(etiqueta + ' no cambió: $' + valor.toLocaleString('es-AR') + '.')
    return
  }

  // `vigencia` y `capturado` **no son lo mismo y confundirlos ya costo
  // caro**: el segundo es el dia en que el cron vio el valor y el
  // primero es desde cuando rige. Hoy la UMA vigente se capturo el 20
  // de agosto y rige desde el 1 de julio; decir "rige desde el 20 de
  // agosto" es afirmar algo falso sobre una norma.
  actual.historia.push({ valor, fuente, url, vigencia, capturado: hoy })
  actual.actualizado = hoy

  writeFileSync(destino, JSON.stringify(actual, null, 2) + '\n', 'utf8')

  console.log(
    etiqueta +
      ' actualizada: $' +
      (previo ? previo.valor.toLocaleString('es-AR') + ' -> $' : '') +
      valor.toLocaleString('es-AR') +
      (fuente ? ' (' + fuente + ')' : ''),
  )

  if (!fuente) {
    console.warn(
      '  Aviso: entró sin norma. El informe no la va a poder citar hasta que ' +
        'la planilla traiga la fila con su procedencia.',
    )
  }
}

// ---- La UMA ----

// Que fila dice el numero, cual la norma, cual el link y cual la
// vigencia esta en `CLAVES`, del lector compartido, y se interpreta con
// `leerUnidad`. Estaba escrito aca y funcionaba; se mudo cuando aparecio
// la segunda fuente, porque comparar dos fuentes exige interpretarlas
// igual y esta era la unica copia que sabia como.
actualizar({
  clave: 'UMA',
  etiqueta: 'La UMA',
  destino: DESTINO_UMA,
  saltoMaximo: SALTO_MAXIMO_UMA,
  ...leerUnidad(tabla, 'UMA'),
})

// ---- El UHOM ----

actualizar({
  clave: 'UHOM',
  etiqueta: 'El UHOM',
  destino: DESTINO_UHOM,
  saltoMaximo: SALTO_MAXIMO_UHOM,
  ...leerUnidad(tabla, 'UHOM'),
  forma: {
    // UR-SINEP x 12, redondeado a la decena proxima superior: siempre
    // termina en cero. Es lo unico comprobable sin tener la UR-SINEP
    // al lado, y alcanza para cazar el separador mal leido, que es el
    // error que da un numero plausible.
    control: (v) => v % 10 === 0,
    motivo:
      'el UHOM es la UR-SINEP por doce redondeada a la decena próxima superior, ' +
      'asi que tiene que terminar en cero. ¿Se leyó mal el separador?',
  },
})
