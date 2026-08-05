// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 L. Javier Cuneo Libarona
// ---------------------------------------------------------------
// El valor de la UMA, versionado.
//
// Antes lo buscaba el navegador de cada visitante, en cada carga, a
// una planilla publicada de Google. Eso traia cuatro problemas, y
// ninguno era el de la planilla:
//
//   1. La app declara que nada de lo que se escribe sale del
//      navegador, pero cada visitante le mandaba su IP a Google. Es
//      el mismo razonamiento por el que se saco @vercel/analytics el
//      4/8: una afirmacion de privacidad no puede depender de a quien
//      le pide un archivo la pagina.
//   2. Si el pedido fallaba, el motor seguia con un valor viejo
//      escrito a mano y solo avisaba por console.warn. Un numero
//      equivocado en silencio, que es lo unico que este proyecto no
//      se puede permitir.
//   3. El valor llegaba sin norma y sin fecha, asi que el informe no
//      podia citar de donde salio.
//   4. El mismo caso calculado con dos meses de diferencia daba
//      distinto sin que quedara registro de por que.
//
// Ahora la planilla la lee el build, no el visitante:
// `scripts/actualizar-uma.mjs` la baja, la compara con lo que hay
// aca y agrega una entrada si el valor cambio. La planilla sigue
// siendo la superficie de edicion —es lo que el autor ya mantiene
// todos los dias— y el archivo versionado es la fuente.
//
// Que sea una lista y no un solo numero es a proposito: es lo que
// hace que un calculo de hoy siga siendo reproducible dentro de dos
// anios, y deja abierto calcular con la UMA vigente a una fecha
// anterior sin volver a tocar esto.
// ---------------------------------------------------------------

import tabla from '@/data/uma.json'

export interface ValorUMA {
  /** El valor en pesos. */
  valor: number
  /** La norma que lo fijo, tal como la publica la fuente. */
  fuente: string | null
  /** Enlace a la norma, si la planilla lo trae. */
  url: string | null
  /** Fecha en que el build lo tomo de la planilla (ISO, AAAA-MM-DD). */
  capturado: string
}

/**
 * Del mas viejo al mas nuevo. Se agrega al final, nunca se reescribe:
 * un valor que ya se uso para calcular es historia, no un borrador.
 */
export const HISTORIA_UMA: ValorUMA[] = tabla.historia

/**
 * El ultimo valor conocido. Es el que la entrevista propone; el
 * usuario puede pisarlo a mano en el primer paso.
 *
 * La lista nunca esta vacia —el script se niega a dejarla asi— pero
 * el tipo no lo sabe, y un `undefined` que llegue al motor daria una
 * division por cero en vez de un error. De ahi la guarda.
 */
const ultimo = HISTORIA_UMA[HISTORIA_UMA.length - 1]

if (!ultimo) {
  throw new Error(
    'data/uma.json no tiene ningun valor de UMA. Corré `npm run uma`.',
  )
}

export const UMA_VIGENTE: ValorUMA = ultimo
