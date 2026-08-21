// ---------------------------------------------------------------
// Leer la planilla publicada.
//
// Vive aparte porque ahora la leen dos scripts —`actualizar-uma.mjs`,
// que la copia al repositorio, y `verificar-publicado.mjs`, que
// controla que lo publicado coincida con ella— y **el control no
// puede tener su propio lector**. Si el que sincroniza y el que
// verifica interpretan el CSV distinto, el control diria que todo
// esta bien exactamente cuando no lo esta: los dos errores se
// cancelarian. Un control que se equivoca igual que lo que controla
// es peor que no tenerlo, porque ademas da tranquilidad.
//
// Es el mismo razonamiento que ya estaba anotado para `parseImporte`
// y el campo de la entrevista, llevado un paso mas.
// ---------------------------------------------------------------

export const PLANILLA =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ8tumvxptTGBCfScMwWxK7r6ATnGfMw061GKGdzfIVyThcSGzUqjI-vcpME1AtykPmjqTq0xdjgc7D/pub?output=csv'

/**
 * CSV minimo, con comillas. Google entrecomilla cualquier celda que
 * tenga una coma adentro, y el texto de la norma la va a tener el dia
 * que se escriba distinto. Partir por coma a secas funciona hasta que
 * deja de funcionar, en silencio y en el numero.
 */
export function filasCSV(texto) {
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
export function parseImporte(raw) {
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
export function normaDesde(texto) {
  const t = String(texto).trim()
  if (!t) return null
  const m = t.match(/seg[uú]n\s+(.+?)\s*\)?\s*$/i)
  return (m ? m[1] : t).trim() || null
}

/** La primera URL suelta que aparezca en la celda, si hay alguna. */
export function urlDesde(texto) {
  const m = String(texto).match(/https?:\/\/\S+/)
  return m ? m[0].replace(/[),.]+$/, '') : null
}

/**
 * Baja la planilla y la devuelve como diccionario `clave -> valor`.
 *
 * Se lee por clave y no por posicion: agregar una fila o cambiarlas de
 * orden no puede romper el numero.
 *
 * `alFallar` recibe el motivo y decide que hacer. Los dos scripts que
 * la usan no fallan igual —uno no debe tocar los archivos, el otro
 * tiene que gritar— asi que el modulo no elige por ellos.
 */
export async function leerPlanilla(alFallar) {
  const respuesta = await fetch(PLANILLA).catch((e) => {
    alFallar('la planilla no respondio (' + e.message + ')')
  })

  if (!respuesta) return null
  if (!respuesta.ok) alFallar('la planilla respondio HTTP ' + respuesta.status)

  const csv = await respuesta.text()

  // Google devuelve el HTML de una pantalla de error con status 200
  // cuando la publicacion se dio de baja. Sin esto, la fila UMA
  // simplemente "no aparece" y el mensaje de error apuntaria al lado
  // equivocado.
  if (/^\s*</.test(csv)) {
    alFallar('la planilla devolvio HTML en vez de CSV (¿se despublico?)')
  }

  return new Map(
    filasCSV(csv).map((f) => [f[0].trim().toUpperCase(), (f[1] ?? '').trim()]),
  )
}
