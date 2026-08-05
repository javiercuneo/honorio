// ---------------------------------------------------------------
// Baja el valor de la UMA de la planilla publicada y lo escribe en
// data/uma.json si cambio.
//
//   npm run uma
//
// Corre en el build y en un cron mensual, nunca en el navegador del
// visitante. El porque esta en lib/legal/uma.ts.
//
// La planilla es una tabla de dos columnas, clave y valor:
//
//   UMA,102.076
//   UHOM,12.960
//   Acordada,Expresado en UMAs: (valor = $ 102.076 segun Res. SGA n° 1785/26)
//
// Se lee como un diccionario y no por posicion: agregar una fila o
// cambiarlas de orden no puede romper el numero. La fila UHOM la usa
// otra calculadora y aca se ignora.
//
// Salidas:
//   0  con o sin cambios (el workflow mira el diff de git, no el
//      codigo de salida: "no cambio nada" es el caso normal)
//   1  la planilla no se pudo leer, o lo que trajo no pasa los
//      controles. Falla fuerte y no toca el archivo: es preferible
//      publicar con el valor de ayer que con uno inventado.
// ---------------------------------------------------------------

import { readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..')
const DESTINO = join(RAIZ, 'data', 'uma.json')

const PLANILLA =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ8tumvxptTGBCfScMwWxK7r6ATnGfMw061GKGdzfIVyThcSGzUqjI-vcpME1AtykPmjqTq0xdjgc7D/pub?output=csv'

/**
 * Cuanto puede moverse la UMA de una actualizacion a la otra antes de
 * que el script se plante. Las subas reales son de un digito o dos
 * por vez; un salto de mas del 60 % es una celda corrida, un
 * importrange roto o un separador mal leido. Ante la duda no se
 * publica: el valor viejo esta mal por poco, uno inventado esta mal
 * por cualquier cosa.
 */
const SALTO_MAXIMO = 0.6

function abortar(motivo) {
  console.error('No se actualizo la UMA: ' + motivo)
  console.error('data/uma.json queda como estaba.')
  process.exit(1)
}

/**
 * CSV minimo, con comillas. Google entrecomilla cualquier celda que
 * tenga una coma adentro, y el texto de la norma la va a tener el dia
 * que se escriba distinto. Partir por coma a secas funciona hasta que
 * deja de funcionar, en silencio y en el numero.
 */
function filasCSV(texto) {
  const filas = []
  let celdas = []
  let celda = ''
  let entreComillas = false

  for (let i = 0; i < texto.length; i++) {
    const c = texto[i]

    if (entreComillas) {
      if (c === '"') {
        if (texto[i + 1] === '"') {
          celda += '"'
          i++
        } else {
          entreComillas = false
        }
      } else {
        celda += c
      }
      continue
    }

    if (c === '"') entreComillas = true
    else if (c === ',') {
      celdas.push(celda)
      celda = ''
    } else if (c === '\n') {
      celdas.push(celda)
      filas.push(celdas)
      celdas = []
      celda = ''
    } else if (c !== '\r') {
      celda += c
    }
  }

  celdas.push(celda)
  filas.push(celdas)
  return filas.filter((f) => f.some((c) => c.trim() !== ''))
}

/**
 * Misma regla que el campo de la entrevista: el ultimo separador con
 * una o dos cifras detras es el decimal, cualquier otro separa miles.
 * Las dos lecturas tienen que coincidir o la app mostraria un numero
 * y calcularia con otro.
 */
function parseImporte(raw) {
  const limpio = String(raw).replace(/[^0-9.,]/g, '')
  if (!/[0-9]/.test(limpio)) return null

  const ultimo = Math.max(limpio.lastIndexOf('.'), limpio.lastIndexOf(','))
  const cifrasDetras = ultimo >= 0 ? limpio.length - ultimo - 1 : 0
  const esDecimal = ultimo >= 0 && cifrasDetras >= 1 && cifrasDetras <= 2

  const entero = (esDecimal ? limpio.slice(0, ultimo) : limpio).replace(/[.,]/g, '')
  const fraccion = esDecimal ? limpio.slice(ultimo + 1) : ''

  const n = Number((entero || '0') + (fraccion ? '.' + fraccion : ''))
  return Number.isFinite(n) ? n : null
}

/**
 * La planilla trae la norma dentro de una frase pensada para el uso
 * diario del autor: "Expresado en UMAs: (valor = $ 102.076 segun Res.
 * SGA n° 1785/26)". Lo que le sirve al informe es la cita sola. Si la
 * frase se escribe de otra forma se guarda entera: de mas es
 * verborragico, de menos seria una cita falsa.
 */
function normaDesde(texto) {
  const t = String(texto).trim()
  if (!t) return null
  const m = t.match(/seg[uú]n\s+(.+?)\s*\)?\s*$/i)
  return (m ? m[1] : t).trim() || null
}

/** La primera URL suelta que aparezca en la celda, si hay alguna. */
function urlDesde(texto) {
  const m = String(texto).match(/https?:\/\/\S+/)
  return m ? m[0].replace(/[),.]+$/, '') : null
}

// ---- Bajar y leer ----

const respuesta = await fetch(PLANILLA).catch((e) => {
  abortar('la planilla no respondio (' + e.message + ')')
})

if (!respuesta.ok) abortar('la planilla respondio HTTP ' + respuesta.status)

const csv = await respuesta.text()

// Google devuelve el HTML de una pantalla de error con status 200
// cuando la publicacion se dio de baja. Sin esto, la fila UMA
// simplemente "no aparece" y el mensaje de error apuntaria al lado
// equivocado.
if (/^\s*</.test(csv)) {
  abortar('la planilla devolvio HTML en vez de CSV (¿se despublico?)')
}

const tabla = new Map(
  filasCSV(csv).map((f) => [f[0].trim().toUpperCase(), (f[1] ?? '').trim()]),
)

if (!tabla.has('UMA')) {
  abortar('la planilla no tiene una fila UMA. Filas: ' + [...tabla.keys()].join(', '))
}

const valor = parseImporte(tabla.get('UMA'))

if (valor === null || valor <= 0) {
  abortar('la fila UMA no tiene un numero legible: ' + JSON.stringify(tabla.get('UMA')))
}

// ---- Controlar contra lo que ya hay ----

const actual = JSON.parse(readFileSync(DESTINO, 'utf8'))
const previo = actual.historia[actual.historia.length - 1]

if (previo) {
  const salto = Math.abs(valor - previo.valor) / previo.valor
  if (salto > SALTO_MAXIMO) {
    abortar(
      'el valor salto de ' +
        previo.valor +
        ' a ' +
        valor +
        ' (' +
        Math.round(salto * 100) +
        ' %). Revisá la planilla a mano.',
    )
  }
}

const celdaNorma = tabla.get('ACORDADA') ?? ''
const hoy = new Date().toISOString().slice(0, 10)

if (previo && previo.valor === valor) {
  console.log('La UMA no cambio: $' + valor.toLocaleString('es-AR') + '.')
  process.exit(0)
}

actual.historia.push({
  valor,
  fuente: normaDesde(celdaNorma),
  url: urlDesde(celdaNorma),
  capturado: hoy,
})
actual.actualizado = hoy

writeFileSync(DESTINO, JSON.stringify(actual, null, 2) + '\n', 'utf8')

console.log(
  'UMA actualizada: $' +
    (previo ? previo.valor.toLocaleString('es-AR') + ' -> $' : '') +
    valor.toLocaleString('es-AR') +
    (normaDesde(celdaNorma) ? ' (' + normaDesde(celdaNorma) + ')' : ''),
)
