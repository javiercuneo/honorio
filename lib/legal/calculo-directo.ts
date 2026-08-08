// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 L. Javier Cuneo Libarona
// ---------------------------------------------------------------
// lib/legal/calculo-directo.ts
// La escala del art. 21 desnuda, sin entrevista y sin reducciones.
//
// Para que existe: hay un uso que la entrevista no cubre. Alguien que
// ya sabe lo que quiere pone la base y necesita ver la escala, los
// roles y los auxiliares de un golpe, como en una hoja de calculo.
// La entrevista contesta "cuanto corresponde en este caso"; esto
// contesta "cuanto da la escala para este monto", que es otra
// pregunta y el punto de partida de cualquier regulacion.
//
// **"Sin reducciones" no es un caso: es la ausencia de caso.** Este
// modulo no arma un WizardState con respuestas por defecto y llama a
// buildGeneral(). Seria mas corto y estaria mal: cada respuesta por
// defecto es una afirmacion juridica. Decir "sentencia admitida" es
// sostener que la demanda prospero; "hubo apertura a prueba" es
// sostener que el proceso llego hasta ahi. El numero saldria igual
// hoy, pero el modo estaria afirmando cosas del caso que nadie dijo,
// y el dia que se agregue una regla que dependa de una de esas
// respuestas empezaria a aplicarla en silencio.
//
// Asi que se componen las funciones puras de calculate.ts y nada
// mas. No hay aritmetica nueva aca, y eso es a proposito: significa
// que este modo **no puede divergir** del resultado de la entrevista,
// porque es el mismo codigo. calculoDirecto.validation.ts lo
// comprueba corriendo los dos caminos y comparandolos.
//
// Lo que este modulo NO hace, y es su definicion:
//   - reducir la base      (arts. 22 y 40)
//   - reducir la escala    (arts. 25, 35, 37 y 41)
//   - reducir el honorario (el -10 % del art. 41)
// Si el caso tiene alguna, el camino es la entrevista.
// ---------------------------------------------------------------

import {
  calcularApoderado,
  calcularAuxiliares,
  calcularEscala,
  calcularProcurador,
  calcularSegundaInstancia,
} from './calculate'
import type { Rango, SegundaInstancia } from './types'

/**
 * Las etapas del art. 29.
 *
 * Se nombran contando etapas y no como fracciones —`tres`, `dos`,
 * `una` en vez de "completo", "2/3", "1/3"— porque es lo que dice el
 * articulo: el proceso se divide en etapas y se cuenta cuantas se
 * trabajaron. El numero es el mismo; la formulacion es la del texto.
 */
export interface EtapasRol {
  /** Las tres etapas: el honorario completo. */
  tres: Rango
  /** Dos de las tres. */
  dos: Rango
  /** Una de las tres. */
  una: Rango
}

export interface EscalaDirecta {
  /** Tal como lo rotula el motor: "5ª escala (151-450 UMA): 15% a 20%". */
  titulo: string
  porcentajeMin: number
  porcentajeMax: number
  /** Limite superior del tramo anterior, en UMA. 0 en la primera. */
  limiteAnterior: number
  /** Piso acumulado que aporta el tramo anterior, en UMA. 0 en la primera. */
  maximoEscalaAnterior: number
  /** Lo que excede el limite del tramo anterior, en UMA. */
  excedente: number
}

export interface AuxiliaresDirecto {
  rango: Rango
  /**
   * El punto medio entre el 5 % y el 10 %.
   *
   * No sale de la ley: el art. 21 fija la banda y no manda promediar.
   * Se muestra porque es lo que se usa en la practica cuando no hay
   * razon para ir a un extremo, y va rotulado como lo que es.
   */
  promedioUMA: number
  promedioPesos: number
}

export interface CalculoDirecto {
  basePesos: number
  valorUMA: number
  baseEnUMA: number
  escala: EscalaDirecta
  /** Art. 21. */
  patrocinante: EtapasRol
  /** Art. 20: 1,4 veces el patrocinante. */
  apoderado: EtapasRol
  /** Art. 20: 40 % del patrocinante. */
  procurador: EtapasRol
  /** Art. 21, antepenultimo parrafo: 5 % a 10 % de la base. */
  auxiliares: AuxiliaresDirecto
  /** Art. 30, sobre el honorario completo. */
  segundaInstancia: SegundaInstancia
}

/** Arma un Rango desde dos valores en UMA. */
function rango(minUMA: number, maxUMA: number, valorUMA: number): Rango {
  return {
    minUMA,
    maxUMA,
    minPesos: minUMA * valorUMA,
    maxPesos: maxUMA * valorUMA,
  }
}

/**
 * Toma una fraccion de un rango.
 *
 * Existe para el caso que la hoja de calculo resuelve a mano con una
 * fila fija de "1/4 etapa": un profesional se lleva parte de una
 * etapa porque hizo parte del trabajo de esa etapa.
 *
 * **No es el reparto entre dos profesionales** que ya tiene el
 * dashboard. Aquel parte un importe en dos porciones que suman 100 %;
 * esto toma una sola porcion y el resto no es de nadie en particular.
 * Dan el mismo numero y significan distinto, y confundirlos es la
 * clase de error que no mueve ninguna cifra pero deja un rotulo
 * mintiendo.
 */
export function fraccionDeRango(r: Rango, fraccion: number): Rango {
  return {
    minUMA: r.minUMA * fraccion,
    maxUMA: r.maxUMA * fraccion,
    minPesos: r.minPesos * fraccion,
    maxPesos: r.maxPesos * fraccion,
  }
}

/**
 * La escala del art. 21 sobre una base, sin ninguna reduccion.
 *
 * Devuelve `null` con los mismos datos con los que `calcularEscala()`
 * devuelve `null` —base o UMA ausentes o no positivas—, para que el
 * llamador no tenga que conocer dos reglas distintas.
 *
 * **La base no se redondea.** Una hoja de calculo puede mostrar la
 * base en UMA redondeada, y esta bien mientras sea presentacion: la
 * calculadora vieja `calculadoras/honorarios.html` redondeaba *y
 * calculaba con el redondeo*, que con una base de 209,34 UMA daba
 * 41,85 en vez de 41,901.
 */
export function calcularDirecto(
  basePesos: number,
  valorUMA: number,
): CalculoDirecto | null {
  const e = calcularEscala(basePesos, valorUMA)
  if (!e) return null

  const etapasDe = (r: { full: { min: number; max: number }; dos: { min: number; max: number }; uno: { min: number; max: number } }): EtapasRol => ({
    tres: rango(r.full.min, r.full.max, valorUMA),
    dos: rango(r.dos.min, r.dos.max, valorUMA),
    una: rango(r.uno.min, r.uno.max, valorUMA),
  })

  const patrocinante = etapasDe(e.patrocinante)
  const apoderado = etapasDe(e.apoderado)

  // El procurador es el 40 % del patrocinante (art. 20). Se calcula
  // etapa por etapa y no una vez sobre el completo: da lo mismo
  // —el factor es lineal— pero deja cada etapa saliendo de su etapa,
  // que es lo que hay que poder leer en la pantalla.
  const procuradorDe = (r: Rango) => {
    const p = calcularProcurador(r.minUMA, r.maxUMA, valorUMA)
    return rango(p.minUMA, p.maxUMA, valorUMA)
  }
  const procurador: EtapasRol = {
    tres: procuradorDe(patrocinante.tres),
    dos: procuradorDe(patrocinante.dos),
    una: procuradorDe(patrocinante.una),
  }

  const aux = calcularAuxiliares(e.baseEnUMA, valorUMA)
  const promedioUMA = (aux.minUMA + aux.maxUMA) / 2

  // La segunda instancia se calcula sobre el honorario completo: es
  // otra regulacion sobre lo mismo, no una etapa mas.
  const apo = calcularApoderado(e.patrocinante.full.min, e.patrocinante.full.max, valorUMA)
  const proc = calcularProcurador(e.patrocinante.full.min, e.patrocinante.full.max, valorUMA)
  const segundaInstancia = calcularSegundaInstancia(
    e.patrocinante.full.min,
    e.patrocinante.full.max,
    apo.minUMA,
    apo.maxUMA,
    proc.minUMA,
    proc.maxUMA,
    valorUMA,
  )

  return {
    basePesos,
    valorUMA,
    baseEnUMA: e.baseEnUMA,
    escala: {
      titulo: e.tituloEscala,
      porcentajeMin: e.minPorc,
      porcentajeMax: e.maxPorc,
      limiteAnterior: e.limiteAnterior,
      maximoEscalaAnterior: e.maximoEscalaAnterior,
      excedente: e.baseEnUMA - e.limiteAnterior,
    },
    patrocinante,
    apoderado,
    procurador,
    auxiliares: {
      rango: aux,
      promedioUMA,
      promedioPesos: promedioUMA * valorUMA,
    },
    segundaInstancia,
  }
}
