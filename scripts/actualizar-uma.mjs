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
//   1  la planilla no se pudo leer, o lo que trajo no pasa los
//      controles. Falla fuerte y no toca el archivo: es preferible
//      publicar con el valor de ayer que con uno inventado.
//
// Que este script termine bien no significa que el sitio quedo con el
// valor nuevo: entre esto y honorio.ar estan el commit y el deploy.
// Eso lo controla `verificar-publicado.mjs`, que mira lo servido.
// ---------------------------------------------------------------

import { readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { leerPlanilla, normaDesde, parseImporte, urlDesde } from './planilla.mjs'

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..')
const DESTINO_UMA = join(RAIZ, 'data', 'uma.json')
const DESTINO_UHOM = join(RAIZ, 'data', 'uhom.json')

/**
 * Cuanto puede moverse la UMA de una actualizacion a la otra antes de
 * que el script se plante. Las subas reales son de un digito o dos
 * por vez; un salto de mas del 60 % es una celda corrida, un
 * importrange roto o un separador mal leido. Ante la duda no se
 * publica: el valor viejo esta mal por poco, uno inventado esta mal
 * por cualquier cosa.
 */
const SALTO_MAXIMO_UMA = 0.6

/**
 * El del UHOM es propio y mucho mas ajustado. Se actualiza todos los
 * meses siguiendo a la UR-SINEP, y los tres meses publicados de 2026
 * se movieron 2,2 % y 1,9 %. Con el 60 % de la UMA, leer $12.960 como
 * $1.296 —un separador de mas— pasaria sin que nadie se entere.
 */
const SALTO_MAXIMO_UHOM = 0.15

function abortar(motivo) {
  console.error('No se actualizaron los valores: ' + motivo)
  console.error('data/uma.json y data/uhom.json quedan como estaban.')
  process.exit(1)
}

const tabla = await leerPlanilla(abortar)

const hoy = new Date().toISOString().slice(0, 10)

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
function actualizar({ clave, etiqueta, destino, saltoMaximo, fuente, url, forma }) {
  if (!tabla.has(clave)) {
    abortar(
      'la planilla no tiene una fila ' + clave + '. Filas: ' + [...tabla.keys()].join(', '),
    )
  }

  const valor = parseImporte(tabla.get(clave))

  if (valor === null || valor <= 0) {
    abortar(
      'la fila ' + clave + ' no tiene un numero legible: ' + JSON.stringify(tabla.get(clave)),
    )
  }

  if (forma && !forma.control(valor)) {
    abortar('la fila ' + clave + ' trajo ' + valor + ', y ' + forma.motivo)
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

    if (fuenteNueva || urlNueva) {
      if (fuenteNueva) previo.fuente = fuente
      if (urlNueva) previo.url = url
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

  actual.historia.push({ valor, fuente, url, capturado: hoy })
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

const celdaNorma = tabla.get('ACORDADA') ?? ''

actualizar({
  clave: 'UMA',
  etiqueta: 'La UMA',
  destino: DESTINO_UMA,
  saltoMaximo: SALTO_MAXIMO_UMA,
  fuente: normaDesde(celdaNorma),
  // La celda propia gana sobre una URL suelta dentro de la frase: es la
  // que la planilla declara a proposito.
  url: tabla.get('URL') || urlDesde(celdaNorma) || null,
})

// ---- El UHOM ----

const celdaNormaUhom = tabla.get('UHOM_FUENTE') ?? ''

actualizar({
  clave: 'UHOM',
  etiqueta: 'El UHOM',
  destino: DESTINO_UHOM,
  saltoMaximo: SALTO_MAXIMO_UHOM,
  fuente: normaDesde(celdaNormaUhom),
  url: tabla.get('UHOM_URL') || urlDesde(celdaNormaUhom) || null,
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
