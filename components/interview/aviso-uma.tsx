'use client'

// ---------------------------------------------------------------
// components/interview/aviso-uma.tsx
// Lo que acompaña al campo de la UMA en el primer paso: de qué norma
// sale el valor escrito, y la UMA de otra fecha.
//
// **Avisa, no corrige y no bloquea.** Hasta el 29/10/2026 el campo
// recortaba a 50.000 cualquier UMA menor, en silencio. Una UMA que no es
// la de hoy puede ser exactamente la que corresponde —la del cierre de
// una planilla de liquidación, por ejemplo—, así que el campo la acepta
// y esto le dice al usuario lo único que puede no saber: que no es la
// vigente, o que no la fijó ninguna norma.
//
// Ninguna regla jurídica: la serie y la búsqueda son de
// lib/legal/serie-uma.ts, y el fallo, de jurisprudencia.ts.
// ---------------------------------------------------------------

import { useState } from 'react'
import { UMA_VIGENTE } from '@/lib/legal/uma'
import { PRIMERA_VIGENCIA, procedenciaDe, umaAl, SERIE_UMA } from '@/lib/legal/serie-uma'
import { UMA_CIERRE_PLANILLA } from '@/lib/legal/jurisprudencia'
import { Disclosure, Etiqueta, Fundamento } from '@/components/dashboard/primitives'
import { pesos } from '@/components/dashboard/format'

function fechaCorta(iso: string): string {
  const [a, m, d] = iso.split('-')
  return Number(d) + '/' + Number(m) + '/' + a
}

/**
 * Lee una fecha escrita a mano, **siempre dia primero**: 31/7/2023,
 * 31-07-23, 31.7.2023. Tambien mes y anio solos (7/2023), que toma el
 * dia 1: la UMA rige por mes. Devuelve AAAA-MM-DD, o `null` si no es una
 * fecha que exista.
 *
 * Reemplaza al `<input type="date">`, que el navegador muestra en el
 * formato de su idioma —mes/dia/anio en uno en ingles— y no en el que
 * usa un expediente. El orden aca es uno solo y esta escrito en el
 * campo.
 */
export function leerFecha(texto: string): string | null {
  const partes = texto.trim().split(/[\/.\-\s]+/).filter(Boolean)
  if (partes.length < 2 || partes.length > 3 || partes.some((p) => !/^\d+$/.test(p))) return null
  const [d, m, a] = partes.length === 3 ? partes : ['1', ...partes]
  let anio = Number(a)
  if (a.length === 2) anio += 2000
  else if (a.length !== 4) return null
  const mes = Number(m)
  const dia = Number(d)
  const f = new Date(Date.UTC(anio, mes - 1, dia))
  if (f.getUTCFullYear() !== anio || f.getUTCMonth() !== mes - 1 || f.getUTCDate() !== dia) return null
  return anio + '-' + String(mes).padStart(2, '0') + '-' + String(dia).padStart(2, '0')
}

const VIGENTE = pesos(UMA_VIGENTE.valor, false)
const ULTIMO_TRAMO = SERIE_UMA[SERIE_UMA.length - 1]

/**
 * El rótulo de abajo del campo. Decía siempre la norma de la UMA
 * vigente, también debajo de una UMA de 2023.
 */
export function unidadDeUma(valor: number): { unidad: string; unidadHref?: string } {
  const p = procedenciaDe(valor)
  if (p.norma) return { unidad: p.norma, unidadHref: p.url ?? undefined }
  return { unidad: 'Valor escrito a mano', unidadHref: undefined }
}

export function AvisoUma({
  valor,
  onUsar,
}: {
  valor: number
  onUsar: (valor: number) => void
}) {
  const procedencia = procedenciaDe(valor)

  return (
    <div className="mt-6 max-w-lg space-y-4">
      {valor > 0 && procedencia.tipo === 'historica' ? (
        <p className="border-l-2 border-hair pl-3 text-[13px] leading-relaxed text-muted-foreground">
          Es la UMA vigente desde el {fechaCorta(procedencia.vigencia!)}, no
          la de hoy ({VIGENTE}). El cálculo sale con la que escribiste.
        </p>
      ) : null}

      {valor > 0 && procedencia.tipo === 'manual' ? (
        <p className="rounded-sm border-l-2 border-destructive/40 bg-destructive/[0.05] px-3 py-2 text-[13px] leading-relaxed text-destructive">
          {pesos(valor, false)} no coincide con ninguna UMA que haya fijado la
          Corte. La vigente es {VIGENTE}. Podés calcular igual.
        </p>
      ) : null}

      <UmaAUnaFecha onUsar={onUsar} actual={valor} />
    </div>
  )
}

function UmaAUnaFecha({ onUsar, actual }: { onUsar: (v: number) => void; actual: number }) {
  const [texto, setTexto] = useState('')
  const fecha = texto ? leerFecha(texto) : null
  const tramo = fecha ? umaAl(fecha) : null
  const esElUltimo = tramo !== null && tramo.vigencia === ULTIMO_TRAMO?.vigencia

  return (
    <details className="group">
      <summary className="cursor-pointer list-none font-mono text-[11px] uppercase tracking-[0.18em] text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <span className="underline decoration-hair underline-offset-4">
          Usar la UMA de otra fecha
        </span>
      </summary>

      <div className="mt-3 rounded-md border border-border bg-card px-4 py-3">
        <label className="block">
          <Etiqueta>Fecha</Etiqueta>
          <input
            type="text"
            inputMode="numeric"
            value={texto}
            placeholder="dd/mm/aaaa"
            onChange={(e) => setTexto(e.target.value)}
            className="mt-1.5 w-40 rounded-md border border-border bg-background px-2.5 py-1.5 font-mono text-[14px] tabular-nums text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>

        {texto.trim().length >= 6 && !fecha ? (
          <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
            No la puedo leer como fecha. Escribila día, mes y año: 31/7/2023.
          </p>
        ) : null}

        {fecha && !tramo ? (
          <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
            Antes del {fechaCorta(PRIMERA_VIGENCIA)} no había UMA: la Ley 27.423
            todavía no regía.
          </p>
        ) : null}

        {tramo ? (
          <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              Regía{' '}
              <span className="font-meter text-[17px] tabular-nums text-foreground">
                {pesos(tramo.valor, false)}
              </span>
              , desde el {fechaCorta(tramo.vigencia)} —{' '}
              {tramo.url ? (
                <a
                  href={tramo.url}
                  target="_blank"
                  rel="noopener"
                  className="underline decoration-hair underline-offset-2 hover:text-accent-foreground"
                >
                  {tramo.norma}
                </a>
              ) : (
                tramo.norma
              )}
              .
            </p>
            <button
              type="button"
              disabled={tramo.valor === actual}
              onClick={() => onUsar(tramo.valor)}
              className="rounded-md border border-border px-3 py-1 text-[13px] text-foreground transition-colors hover:border-ring hover:text-accent-foreground disabled:cursor-default disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {tramo.valor === actual ? 'Es la que estás usando' : 'Usar este valor'}
            </button>
            {/*
              La Corte fija la UMA con demora y hacia atrás: casi todos
              los actos salen después del día desde el que rigen. Para una
              fecha reciente, el último valor publicado puede no ser el
              que termine rigiendo.
            */}
            {esElUltimo ? (
              <p className="w-full text-[12px] leading-relaxed text-faint">
                Es el último valor publicado. La Corte fija la UMA con demora y
                con efecto hacia atrás: para una fecha reciente puede salir
                otro.
              </p>
            ) : null}
          </div>
        ) : null}

        <Disclosure
          className="mt-2 border-t border-hair"
          concepto="Cuándo se usa una UMA que no es la de hoy"
        >
          <p className="text-[13px] leading-relaxed text-muted-foreground">
            Cuando la planilla de liquidación se cierra, se aprueba y se regula
            en momentos distintos, hay quien expresa la base en UMA a la fecha
            del cierre de la planilla y no a la de la regulación, para que la
            demora no deprecie el honorario. Honorio propone siempre la vigente:
            elegir otra es decisión de quien regula.
          </p>
          <Fundamento criterio={UMA_CIERRE_PLANILLA} className="mt-3" />
        </Disclosure>
      </div>
    </details>
  )
}
