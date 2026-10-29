// Copyright (C) 2026 Luis Javier Cuneo Libarona. Todos los derechos reservados.
// Codigo publicado para auditoria, sin licencia de uso: ver LICENSE.
// ---------------------------------------------------------------
// lib/legal/serie-uma.ts
// La UMA a una fecha: que valor regia un dia dado, y que norma lo fijo.
//
// Por que existe: la base regulatoria se puede expresar en UMA a una
// fecha que no es la de hoy. El caso que lo trajo es el de una
// planilla de liquidacion que se cierra, se aprueba meses despues y
// recien entonces se regula: la CFed. Rosario, Sala A, la expreso en
// UMA a la fecha del cierre de la planilla (ver UMA_CIERRE_PLANILLA en
// jurisprudencia.ts). Para eso hace falta la serie, no solo el valor
// vigente.
//
// **La serie no se escribe aca.** `data/serie-uma.json` es copia byte a
// byte de la del sitio de herramientas, reconstruida de los actos de la
// CSJN uno por uno —no copiada de compilaciones de terceros, que tienen
// errores documentados en el propio archivo—. La trae
// `scripts/actualizar-serie-uma.mjs`.
//
// **Se completa con `data/uma.json`**, que es la que la app usa para
// calcular y la que se actualiza todos los dias. La serie del otro
// sitio se alimenta de honorio.ar, asi que va un paso atras: sin esta
// union, el mes en curso no tendria valor a su fecha. Donde las dos
// tienen la misma vigencia tienen que decir el mismo numero, y
// `serieUma.validation.ts` falla si no.
//
// Datos puros y funciones puras. No conoce React.
// ---------------------------------------------------------------

import serie from '@/data/serie-uma.json'
import { HISTORIA_UMA, UMA_VIGENTE } from './uma'

export interface TramoUMA {
  valor: number
  /** Desde cuando rige (AAAA-MM-DD). Es la fecha que decide que valor corresponde. */
  vigencia: string
  /** La acordada o resolucion de la CSJN que lo fija. */
  norma: string
  url: string | null
  /**
   * De donde salio el tramo. `serie` es la reconstruida de los actos;
   * `planilla` es un valor de `data/uma.json` que la serie todavia no
   * tiene. Se distingue porque no tienen el mismo respaldo.
   */
  origen: 'serie' | 'planilla'
}

/**
 * La forma exacta, y ninguna otra. `03/07/2026` tiene dos lecturas y
 * elegir mal corre una vigencia tres meses: es la misma regla que el
 * lector de la planilla.
 */
const ISO = /^\d{4}-\d{2}-\d{2}$/

function deLaSerie(): TramoUMA[] {
  return serie.valores.map((v) => {
    if (!ISO.test(v.vigencia)) {
      throw new Error('data/serie-uma.json: vigencia mal formada: ' + v.vigencia)
    }
    return {
      valor: v.valor,
      vigencia: v.vigencia,
      norma: v.norma,
      url: 'url' in v && typeof v.url === 'string' ? v.url : null,
      origen: 'serie' as const,
    }
  })
}

function unir(): TramoUMA[] {
  const tramos = deLaSerie()
  const vigencias = new Set(tramos.map((t) => t.vigencia))

  // Solo las entradas de la planilla que traen vigencia: las anteriores
  // al 9/9/2026 no la tienen y no se puede inventar.
  for (const h of HISTORIA_UMA) {
    if (!h.vigencia || !ISO.test(h.vigencia) || vigencias.has(h.vigencia)) continue
    tramos.push({
      valor: h.valor,
      vigencia: h.vigencia,
      norma: h.fuente ?? 'sin norma consignada',
      url: h.url,
      origen: 'planilla',
    })
    vigencias.add(h.vigencia)
  }

  return tramos.sort((a, b) => (a.vigencia < b.vigencia ? -1 : a.vigencia > b.vigencia ? 1 : 0))
}

/** Del mas viejo al mas nuevo, sin dos tramos con la misma vigencia. */
export const SERIE_UMA: TramoUMA[] = unir()

/** La vigencia del primer valor: antes de eso no hay UMA. */
export const PRIMERA_VIGENCIA = SERIE_UMA[0]?.vigencia ?? ''

/**
 * El valor que regia el dia `fecha` (AAAA-MM-DD): el ultimo tramo cuya
 * vigencia es igual o anterior a esa fecha.
 *
 * Devuelve `null` si la fecha esta mal formada o es anterior a la
 * primera UMA. **No devuelve el primer valor "por las dudas"**: una
 * fecha anterior a la ley no tiene UMA, y un numero ahi seria
 * inventado.
 */
export function umaAl(fecha: string): TramoUMA | null {
  if (!ISO.test(fecha)) return null
  let elegido: TramoUMA | null = null
  for (const t of SERIE_UMA) {
    if (t.vigencia <= fecha) elegido = t
    else break
  }
  return elegido
}

/**
 * Los tramos que tienen ese valor exacto. Sirve para decir de que norma
 * sale una UMA escrita a mano, o que no sale de ninguna.
 *
 * Es una lista porque nada impide que dos actos fijen el mismo numero;
 * hoy no pasa.
 */
export function tramosConValor(valor: number): TramoUMA[] {
  return SERIE_UMA.filter((t) => t.valor === valor)
}

/**
 * De donde sale un valor de UMA, para decirlo al lado del numero.
 *
 * - `vigente`: es la de `data/uma.json`, con la cita que trae la planilla.
 * - `historica`: rigio en otro momento y se sabe desde cuando y por que norma.
 * - `manual`: no lo fijo ninguna norma de la serie. **No es un error**
 *   —puede ser una UMA que la serie todavia no tiene, o una provincial—,
 *   pero el papel no puede atribuirsela a una norma.
 *
 * Existe porque la firma del informe citaba la UMA vigente aunque el
 * calculo se hubiera hecho con otra: el numero salia de una UMA y el
 * papel decia otra.
 */
export interface ProcedenciaUMA {
  tipo: 'vigente' | 'historica' | 'manual'
  norma: string | null
  url: string | null
  vigencia: string | null
}

export function procedenciaDe(valor: number): ProcedenciaUMA {
  if (valor === UMA_VIGENTE.valor) {
    return {
      tipo: 'vigente',
      norma: UMA_VIGENTE.fuente,
      url: UMA_VIGENTE.url,
      vigencia: UMA_VIGENTE.vigencia ?? null,
    }
  }
  const tramo = tramosConValor(valor)[0]
  if (tramo) {
    return { tipo: 'historica', norma: tramo.norma, url: tramo.url, vigencia: tramo.vigencia }
  }
  return { tipo: 'manual', norma: null, url: null, vigencia: null }
}
