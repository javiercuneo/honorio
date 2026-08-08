// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 L. Javier Cuneo Libarona
// ---------------------------------------------------------------
// El honorario basico del mediador.
//
// Escala del ANEXO III del Decreto 1467/2011, sustituido por el
// Decreto 2536/2011. El Decreto 696/2025 reemplazo el Anexo I entero
// —el regimen de honorarios paso del art. 28 al art. 31— pero **no
// toco el Anexo III**: lo cita seis veces como derecho vigente.
//
// Verificada contra dos fuentes: el texto del decreto y la tabla
// oficial del Ministerio con los valores de junio a agosto de 2026.
//
// **Por que la cita no lleva numero de articulo.** Las tres fuentes no
// coinciden: el Decreto 696/2025 y el propio Anexo III dicen
// "articulo 2°", el art. 28 inc. b) del Decreto 2536/2011 dice
// "articulos 4° y 5°", y la tabla oficial de 2026 dice "articulo 4°".
// Los numeros del honorario son identicos en las tres, asi que no
// afecta ningun calculo; afecta la cita, y una cita que no se pudo
// resolver no se escribe. Falta el texto consolidado del Anexo III.
//
// ---- Lo que este modulo NO hace, y por que ----
//
// La escala tiene tres items mas —H (monto indeterminable, 20 UHOM),
// I (sin valor pecuniario, 12 UHOM) y el familiar del art. 31 incs. b)
// y c) de la Ley 26.589 (9 UHOM)— que **son inalcanzables desde la
// entrevista**: `WizardState.baseValor` es un `number` y `ObjetoBase`
// no tiene ninguna opcion sin monto, asi que Honorio siempre tiene una
// cifra y nunca cae en esos tres.
//
// Y hay cuatro reglas del decreto que se decidieron afuera: los
// adicionales por audiencia, el descuento del honorario provisional de
// 2 UHOM (art. 31 inc. g), la mediacion desistida antes de la primera
// audiencia (art. 31 inc. h) y la reconvencion (art. 32 inc. k). El
// motivo es uno solo y es de sistema: el art. 1°, segundo parrafo, de
// la Ley 27.423 aplica el arancel supletoriamente a todos los
// auxiliares de la Justicia, asi que abrir la puerta a las reglas
// propias del mediador obliga a abrirla para cada auxiliar con regimen
// especial. El detalle esta en PLAN_MEDIACION.md del repositorio de
// las calculadoras.
//
// Por eso este modulo no devuelve `Transformacion[]`: no aplica
// ninguna. Entra una base, sale el tramo y su honorario.
// ---------------------------------------------------------------

import type { ValorUHOM } from './uhom'

/** El porcentaje del ultimo tramo, y su tope. Item G. */
export const PORCENTAJE_ITEM_G = 0.02
export const TOPE_ITEM_G_UHOM = 120

export interface ItemEscalaMediacion {
  item: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G'
  /** Limite superior del tramo en UHOM. `null` en el ultimo. */
  hastaUHOM: number | null
  /** Honorario fijo en UHOM. `null` en el ultimo, que es porcentual. */
  honorarioUHOM: number | null
  descripcion: string
}

/**
 * Los siete tramos, en orden. Los limites son inclusivos: el item A
 * llega **hasta** 30 UHOM y el B empieza en "superiores a (A)".
 *
 * No se redondea la base para decidir el tramo. `honorarios.html`
 * redondeaba `baseEnUMA` cerca de cada corte y calculaba con el
 * redondeo; aca 30,4 UHOM cae en B y no en A.
 */
export const ESCALA_MEDIACION: ItemEscalaMediacion[] = [
  { item: 'A', hastaUHOM: 30, honorarioUHOM: 3, descripcion: 'Asuntos de montos hasta 30 UHOM' },
  { item: 'B', hastaUHOM: 60, honorarioUHOM: 6, descripcion: 'Asuntos de montos superiores a 30 y hasta 60 UHOM' },
  { item: 'C', hastaUHOM: 150, honorarioUHOM: 9, descripcion: 'Asuntos de montos superiores a 60 y hasta 150 UHOM' },
  { item: 'D', hastaUHOM: 300, honorarioUHOM: 12, descripcion: 'Asuntos de montos superiores a 150 y hasta 300 UHOM' },
  { item: 'E', hastaUHOM: 600, honorarioUHOM: 16, descripcion: 'Asuntos de montos superiores a 300 y hasta 600 UHOM' },
  { item: 'F', hastaUHOM: 1000, honorarioUHOM: 20, descripcion: 'Asuntos de montos superiores a 600 y hasta 1000 UHOM' },
  { item: 'G', hastaUHOM: null, honorarioUHOM: null, descripcion: 'Asuntos de montos superiores a 1000 UHOM' },
]

export interface ResultadoMediacion {
  /** La base del expediente expresada en UHOM. Sin redondear. */
  baseEnUHOM: number
  /** El tramo en el que cayo. */
  item: ItemEscalaMediacion
  /** Limite inferior del tramo, en UHOM. 0 en el item A. */
  limiteAnterior: number
  honorarioUHOM: number
  honorarioPesos: number
  /**
   * Si el tope de 120 UHOM recorto el resultado.
   *
   * **El tope es del item G y no de la escala.** Los items A a F topean
   * en 20 UHOM, muy por debajo, asi que aplicarlo como si fuera general
   * daria siempre el mismo numero: es un error de rotulo y no de
   * cuenta, que es justo la clase que ninguna validacion numerica caza.
   * La calculadora vieja lo decia mal.
   */
  porTope: boolean
  /** El valor con el que se calculo, para que el informe lo pueda citar. */
  uhom: ValorUHOM
}

/**
 * El honorario basico del mediador para una base dada.
 *
 * @param basePesos - La base regulatoria del expediente, en pesos, con
 *   las reducciones de los arts. 22 y 40 de la Ley 27.423 **ya
 *   aplicadas**. Es la misma cifra que reciben la escala del art. 21 y
 *   los auxiliares: un juicio tiene una sola base regulatoria. Es una
 *   interpretacion, esta fundada en jurisprudencia y el criterio con
 *   sus fallos vive en `jurisprudencia.ts`.
 * @param uhom - El valor vigente. Se pide el objeto entero y no el
 *   numero a proposito: `calcularDirecto()` recibe la UMA suelta, y si
 *   aca fuera igual nada impediria pasarle la UMA. Son $102.076 donde
 *   van $12.960, un factor de ocho sin ningun error visible.
 *
 * @returns `null` si la base o el valor no son utilizables, con el
 *   mismo criterio que `calcularDirecto()`: mejor nada que un numero.
 */
export function calcularMediacion(
  basePesos: number,
  uhom: ValorUHOM,
): ResultadoMediacion | null {
  if (!Number.isFinite(basePesos) || basePesos <= 0) return null
  if (!uhom || !Number.isFinite(uhom.valor) || uhom.valor <= 0) return null

  const baseEnUHOM = basePesos / uhom.valor

  let limiteAnterior = 0

  for (const item of ESCALA_MEDIACION) {
    const esUltimo = item.hastaUHOM === null

    if (!esUltimo && baseEnUHOM > item.hastaUHOM!) {
      limiteAnterior = item.hastaUHOM!
      continue
    }

    let honorarioUHOM: number
    let porTope = false

    if (item.honorarioUHOM !== null) {
      honorarioUHOM = item.honorarioUHOM
    } else {
      honorarioUHOM = baseEnUHOM * PORCENTAJE_ITEM_G
      if (honorarioUHOM > TOPE_ITEM_G_UHOM) {
        honorarioUHOM = TOPE_ITEM_G_UHOM
        porTope = true
      }
    }

    return {
      baseEnUHOM,
      item,
      limiteAnterior,
      honorarioUHOM,
      honorarioPesos: honorarioUHOM * uhom.valor,
      porTope,
      uhom,
    }
  }

  // Inalcanzable: el ultimo item no tiene limite superior. Existe para
  // que un dia que alguien edite ESCALA_MEDIACION y le ponga tope a G,
  // esto sea un null y no un `undefined` corriendo por el motor.
  return null
}
