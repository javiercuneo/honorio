// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 L. Javier Cuneo Libarona
// ---------------------------------------------------------------
// El valor del UHOM, versionado.
//
// La Unidad de Honorarios de Mediacion es a los honorarios del
// mediador lo que la UMA es a los del abogado, y sale de la misma
// planilla publicada. Los cuatro motivos por los que no se la pide
// desde el navegador del visitante estan escritos en `uma.ts` y valen
// igual aca: la IP del visitante, el fallo silencioso, el numero sin
// norma y el caso irreproducible.
//
// **Pero no se comporta como la UMA, y de ahi que este separado.**
//
//   1. Se mueve todos los meses. La tabla oficial del Ministerio da
//      junio 2026 $12.450, julio $12.720 y agosto $12.960. La UMA se
//      mueve dos veces por anio. Un archivo versionado que se
//      desactualiza doce veces por anio necesita otra disciplina.
//   2. Es derivado, no fijado. La tabla declara la formula:
//      **valor UR-SINEP x 12, redondeado a la decena proxima
//      superior**. Se comprobo en los tres meses: 1036,67 -> 12.450;
//      1059,48 -> 12.720; 1079,61 -> 12.960. Eso da un control que la
//      UMA no puede tener, y esta implementado en el script.
//   3. La planilla trae el numero pero no su norma. La fila
//      `Acordada` describe la UMA. Mientras no haya una fila propia
//      —`UHOM_FUENTE`, `UHOM_URL`— el valor entra con `fuente: null`
//      y el informe no lo puede citar. El script avisa; no aborta,
//      porque el numero igual es el correcto.
//
// Que el tipo sea distinto de `ValorUMA` teniendo la misma forma es a
// proposito. Confundirlos es un error de un factor de ocho —$102.076
// donde van $12.960— y es exactamente el que la calculadora vieja
// podia cometer en silencio cuando leia la planilla por posicion. Con
// `unidad` adentro, pasar uno donde va el otro deja de compilar.
// ---------------------------------------------------------------

import tabla from '@/data/uhom.json'

export interface ValorUHOM {
  /**
   * La marca que lo separa de `ValorUMA`. No se usa para nada en
   * tiempo de ejecucion: existe para que el compilador rechace el
   * cambiazo. Si algun dia esto se borra "porque no se usa", vuelve a
   * ser posible calcular honorarios de mediacion con la UMA.
   */
  unidad: 'UHOM'
  /** El valor en pesos. */
  valor: number
  /** La norma que lo fijo, si la planilla la trae. */
  fuente: string | null
  /** Enlace a la norma, si la planilla lo trae. */
  url: string | null
  /** Fecha en que el build lo tomo de la planilla (ISO, AAAA-MM-DD). */
  capturado: string
}

/**
 * Del mas viejo al mas nuevo. Se agrega al final, nunca se reescribe.
 *
 * Sirve para auditar y no para calcular: el art. 31 inc. g) del
 * Decreto 696/2025 manda regular con el valor vigente **al momento de
 * regular**, no con el de la fecha de la mediacion. Lo que se usa
 * siempre es el ultimo.
 */
export const HISTORIA_UHOM: ValorUHOM[] = tabla.historia.map((v) => ({
  unidad: 'UHOM' as const,
  valor: v.valor,
  fuente: v.fuente,
  url: v.url,
  capturado: v.capturado,
}))

const ultimo = HISTORIA_UHOM[HISTORIA_UHOM.length - 1]

if (!ultimo) {
  throw new Error(
    'data/uhom.json no tiene ningun valor de UHOM. Corré `npm run uma`.',
  )
}

export const UHOM_VIGENTE: ValorUHOM = ultimo

/**
 * El UHOM es la UR-SINEP por doce, redondeada a la decena proxima
 * superior, asi que **siempre termina en cero**. Es el unico control
 * de forma que se puede hacer sin tener la UR-SINEP al lado, y alcanza
 * para cazar un separador mal leido: 12.960 mal parseado como 12,960
 * da 12,96 y no pasa.
 */
export function esValorUHOMPlausible(valor: number): boolean {
  return Number.isFinite(valor) && valor > 0 && valor % 10 === 0
}
