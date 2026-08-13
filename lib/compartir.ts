// ---------------------------------------------------------------
// lib/compartir.ts
// El caso entero, codificado en el fragmento de la URL.
//
// Para que un calculo se pueda compartir y, sobre todo, verificar:
// quien recibe el enlace ve el mismo numero con las mismas respuestas,
// y quien lee un informe impreso puede volver a la pantalla que lo
// produjo. Es la condicion de que un calculo se pueda citar.
//
// **Va en el fragmento (`#`) y no en la query (`?`) a proposito.** El
// fragmento no viaja al servidor: ningun request lleva el caso, ni al
// host que sirve el sitio ni a nadie en el camino. Eso es lo que hace
// que compartir un calculo no contradiga la promesa de que nada de lo
// que se escribe sale del navegador. En la query, la misma
// funcionalidad la romperia.
//
// El formato lleva version (`c1`). Si alguna vez cambia la forma de
// codificar, el numero sube y los enlaces viejos siguen abriendo con
// el lector viejo en vez de decodificarse mal en silencio: un enlace
// que se abre torcido es peor que uno que no abre.
//
// Nada de esto es una regla juridica. Es serializacion: que entra, que
// sale, y nada mas.
// ---------------------------------------------------------------

import type { Answers } from '@/lib/legal/types'
import { ALL_STEPS } from '@/lib/wizard/wizard-schema'

const VERSION = 'c1'

/** Los ids que el schema realmente pregunta. Lo demas se descarta. */
const IDS_VALIDOS = new Set(ALL_STEPS.map((paso) => paso.id))

function aBase64Url(texto: string): string {
  const bytes = new TextEncoder().encode(texto)
  let binario = ''
  for (const byte of bytes) binario += String.fromCharCode(byte)
  return btoa(binario).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function desdeBase64Url(dato: string): string {
  const normalizado = dato.replace(/-/g, '+').replace(/_/g, '/')
  const relleno = normalizado + '='.repeat((4 - (normalizado.length % 4)) % 4)
  const binario = atob(relleno)
  const bytes = Uint8Array.from(binario, (c) => c.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

/**
 * El caso como fragmento, sin el `#`.
 *
 * Se omiten las respuestas vacias: no aportan nada y acortan un enlace
 * que se va a pegar en un WhatsApp.
 */
export function codificarCaso(answers: Answers): string {
  const limpio: Answers = {}
  for (const [id, valor] of Object.entries(answers)) {
    if (!IDS_VALIDOS.has(id)) continue
    if (valor === undefined || valor === null || valor === '') continue
    if (Array.isArray(valor) && valor.length === 0) continue
    limpio[id] = valor
  }
  return VERSION + '=' + aBase64Url(JSON.stringify(limpio))
}

/**
 * El camino inverso, con desconfianza: el fragmento lo escribe
 * cualquiera y puede venir cortado por un cliente de mail.
 *
 * Devuelve `null` si no hay nada que leer. Lo que devuelve son
 * respuestas **candidatas**: que sean coherentes entre si no lo decide
 * este archivo sino la poda del schema, igual que cuando las tipea una
 * persona.
 */
export function decodificarCaso(fragmento: string): Answers | null {
  const crudo = fragmento.startsWith('#') ? fragmento.slice(1) : fragmento
  if (!crudo.startsWith(VERSION + '=')) return null

  try {
    const datos = JSON.parse(desdeBase64Url(crudo.slice(VERSION.length + 1)))
    if (typeof datos !== 'object' || datos === null || Array.isArray(datos)) return null

    const answers: Answers = {}
    for (const [id, valor] of Object.entries(datos as Record<string, unknown>)) {
      if (!IDS_VALIDOS.has(id)) continue
      if (typeof valor === 'string' || typeof valor === 'number' || typeof valor === 'boolean') {
        answers[id] = valor
      } else if (Array.isArray(valor) && valor.every((v) => typeof v === 'string')) {
        answers[id] = valor as string[]
      }
    }
    return Object.keys(answers).length > 0 ? answers : null
  } catch {
    return null
  }
}

/**
 * El enlace completo al caso, desde donde se este corriendo.
 *
 * Usa la ubicacion actual y no el dominio de `enlaces.ts` para que en
 * desarrollo el enlace apunte a desarrollo. Solo tiene sentido en el
 * navegador; en el prerender devuelve cadena vacia.
 */
export function enlaceDelCaso(answers: Answers): string {
  if (typeof window === 'undefined') return ''
  const { origin, pathname } = window.location
  return origin + pathname + '#' + codificarCaso(answers)
}
