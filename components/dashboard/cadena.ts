// ---------------------------------------------------------------
// Derivacion de la cadena de calculo para mostrarla en pantalla.
//
// IMPORTANTE: este modulo NO reimplementa ninguna regla de la ley.
// Toma valores que el motor ya calculo (el rango final del rol, los
// factores acumulados de cada transformacion y los datos de escalera
// del art. 21) y los re-expresa hacia atras con aritmetica simple
// —divisiones por el factor acumulado y restas— para poder mostrar
// los estados intermedios por los que paso el numero.
//
// Si alguna regla cambia en lib/legal/calculate.ts, aca no hay nada
// que actualizar: los factores vienen dados por las Transformaciones.
// ---------------------------------------------------------------

import type { EscalaAplicada, Rango, Transformacion } from "@/lib/legal/types"

export interface CadenaDerivada {
  txBase: Transformacion[]
  txEscala: Transformacion[]
  txFinal: Transformacion[]
  /** Factor acumulado de las reducciones de escala (1 si no hubo). */
  factorEscala: number
  /** Factor acumulado de las reducciones finales (1 si no hubo). */
  factorFinal: number
  /**
   * Relacion entre el rol mostrado y el patrocinante: 1.4 para el
   * apoderado, 0.4 para el procurador, 1 para el patrocinante (art. 20).
   * El motor la aplica al final, sobre el honorario ya reducido.
   */
  factorRol: number
  /**
   * Los tres primeros tramos se expresan siempre en terminos del
   * patrocinante: la escala del art. 21 es la del patrocinante, y el
   * ajuste por rol es un paso posterior e independiente.
   */
  escalaBruta: Rango
  /** Honorario despues de las reducciones de escala. */
  trasEscala: Rango
  /** Honorario del patrocinante tras las reducciones finales. */
  trasFinal: Rango
  /** Honorario del rol mostrado: el que devuelve el motor. */
  final: Rango
  /** Maximo acumulado del grado anterior de la escala, en UMA. */
  pisoUMA: number | null
  /** Parte del honorario que aporta el excedente, en UMA. */
  aporteExcedenteUMA: { min: number; max: number } | null
  /**
   * Porcentaje que el honorario final representa sobre la base
   * regulatoria. No es la alicuota de la escala: por eso se muestra.
   */
  porcentajeEfectivo: { min: number; max: number } | null
}

function escalarRango(r: Rango, f: number): Rango {
  return {
    minUMA: r.minUMA * f,
    maxUMA: r.maxUMA * f,
    minPesos: r.minPesos * f,
    maxPesos: r.maxPesos * f,
  }
}

/**
 * El factor acumulado de un tramo es el valorPosterior de su ultima
 * transformacion: el motor va encadenando ahi el producto.
 */
function factorAcumulado(tx: Transformacion[]): number {
  if (tx.length === 0) return 1
  const ultimo = tx[tx.length - 1].valorPosterior
  return ultimo > 0 ? ultimo : 1
}

export function derivarCadena({
  transformaciones,
  final,
  patrocinante,
  escala,
  baseFinal,
}: {
  transformaciones: Transformacion[]
  /** Rango del rol que se esta mostrando. */
  final: Rango
  /** Rango del patrocinante: es el que sale de la escala. */
  patrocinante: Rango
  escala?: EscalaAplicada
  baseFinal: number
}): CadenaDerivada {
  const visibles = transformaciones.filter((t) => t.visible)
  const txBase = visibles.filter((t) => t.etapa === "base")
  const txEscala = visibles.filter((t) => t.etapa === "escala")
  const txFinal = visibles.filter((t) => t.etapa === "honorarios")

  const factorEscala = factorAcumulado(txEscala)
  const factorFinal = factorAcumulado(txFinal)
  const factorRol =
    patrocinante.minUMA > 0 ? final.minUMA / patrocinante.minUMA : 1

  const trasFinal = patrocinante
  const trasEscala = escalarRango(trasFinal, 1 / factorFinal)
  const escalaBruta = escalarRango(trasEscala, 1 / factorEscala)

  const pisoUMA = escala?.escalera?.maximoEscalaAnterior ?? null
  const aporteExcedenteUMA =
    pisoUMA !== null
      ? {
          min: escalaBruta.minUMA - pisoUMA,
          max: escalaBruta.maxUMA - pisoUMA,
        }
      : null

  const porcentajeEfectivo =
    baseFinal > 0
      ? {
          min: (final.minPesos / baseFinal) * 100,
          max: (final.maxPesos / baseFinal) * 100,
        }
      : null

  return {
    txBase,
    txEscala,
    txFinal,
    factorEscala,
    factorFinal,
    factorRol,
    escalaBruta,
    trasEscala,
    trasFinal,
    final,
    pisoUMA,
    aporteExcedenteUMA,
    porcentajeEfectivo,
  }
}

/**
 * "-30%" a partir del factor 0.7. Los factores del motor son
 * multiplicadores; en pantalla se lee mejor la quita.
 */
export function quitaDesdeFactor(factor: number): string {
  const quita = (1 - factor) * 100
  const redondeada = Math.round(quita * 10) / 10
  return "−" + redondeada.toLocaleString("es-AR") + "%"
}

/**
 * El ajuste por rol puede sumar (apoderado, 1.4 -> "+40%") o llevar a
 * una fraccion (procurador, 0.4 -> "40% del patrocinante").
 */
export function ajusteDesdeFactor(factor: number): string {
  if (factor > 1) {
    const suma = Math.round((factor - 1) * 1000) / 10
    return "+" + suma.toLocaleString("es-AR") + "%"
  }
  const porc = Math.round(factor * 1000) / 10
  return porc.toLocaleString("es-AR") + "%"
}
