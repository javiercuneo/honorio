'use client'

// ---------------------------------------------------------------
// Quien firma este calculo y contra que se hizo.
//
// Autoria e informe imprimible eran dos pendientes y resultaron ser
// uno solo: las dos preguntas son la misma. Un nombre suelto en un
// rincon de la interfaz no cumple ninguna funcion; lo que hace falta
// es que el numero, cuando sale de la pantalla y entra en un
// expediente, se pueda defender. Para eso tiene que decir cuatro
// cosas:
//
//   quien lo hizo         responsable identificable
//   con que version       reproducible: el motor de hoy no es el de
//                         dentro de dos anios, y el CHANGELOG explica
//                         que cambio entre uno y otro
//   con que UMA           el unico dato del calculo que se mueve solo
//   cuando                para poder cruzar la UMA con la fecha
//
// La fecha se resuelve despues del montaje a proposito. El sitio es
// un export estatico: si se compusiera en el HTML seria la fecha del
// build —el dia que se publico, no el dia que se calculo— y ademas
// discreparia con el cliente al hidratar.
// ---------------------------------------------------------------

import { useEffect, useState } from 'react'
import { UMA_VIGENTE } from '@/lib/legal/uma'
import type { Answers } from '@/lib/legal/types'
import {
  CONTACTO,
  DOCUMENTACION,
  HONORIO,
  LICENCIA,
  REPOSITORIO,
} from '@/lib/enlaces'
import { BloqueCita } from './compartir'
import { pesos } from './format'
import { Etiqueta } from './primitives'

const VERSION = process.env.NEXT_PUBLIC_VERSION ?? '0.0.0'

const AUTOR = 'L. Javier Cúneo Libarona'

function Enlace({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      className="underline decoration-hair underline-offset-2 transition-colors hover:text-foreground print:no-underline"
    >
      {children}
    </a>
  )
}

// Las respuestas son opcionales porque la firma dice de donde vino el
// calculo aunque no haya un caso que compartir; con ellas, ademas, dice
// como volver a el.
export function Firma({ answers }: { answers?: Answers }) {
  const [fecha, setFecha] = useState<string | null>(null)

  useEffect(() => {
    setFecha(
      new Date().toLocaleDateString('es-AR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    )
  }, [])

  return (
    <footer className="mt-10 border-t border-border pt-5 text-[12px] leading-relaxed text-faint">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <Etiqueta>Honorio {VERSION}</Etiqueta>
        {/* El espacio queda reservado desde el primer pintado para que
            la fecha no empuje la linea al aparecer. */}
        <span className="tabular-nums">
          {fecha ? 'Cálculo del ' + fecha : ' '}
        </span>
      </div>

      <p className="mt-2 text-muted-foreground">
        {AUTOR} · autor de Honorio
      </p>

      <p className="mt-1">
        UMA {pesos(UMA_VIGENTE.valor, false)}
        {UMA_VIGENTE.fuente ? ' — ' + UMA_VIGENTE.fuente : ''}
        {UMA_VIGENTE.url ? (
          <>
            {' '}
            <Enlace href={UMA_VIGENTE.url}>(norma)</Enlace>
          </>
        ) : null}
      </p>

      <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
        <Enlace href={HONORIO}>honorio.ar</Enlace>
        <span aria-hidden="true">·</span>
        {/* Los ocho documentos de dominio son el razonamiento detras
            de cada regla. Van aca y no en la portada porque quien los
            busca es el que ya tiene un numero y no esta de acuerdo:
            entra por el resultado, no por la puerta. */}
        <Enlace href={DOCUMENTACION}>cómo se interpreta la ley</Enlace>
        <span aria-hidden="true">·</span>
        <Enlace href={REPOSITORIO}>código</Enlace>
        <span aria-hidden="true">·</span>
        <Enlace href={LICENCIA}>AGPL-3.0</Enlace>
        <span aria-hidden="true">·</span>
        <Enlace href={'mailto:' + CONTACTO}>{CONTACTO}</Enlace>
      </p>

      {answers ? <BloqueCita answers={answers} /> : null}

      {/* Este descargo no es la disculpa preventiva que se saco del
          repositorio en agosto: es el correcto, y en un papel que se
          adjunta a un expediente hace mas falta que en pantalla. */}
      <p className="mt-3 max-w-2xl">
        Herramienta de referencia. No sustituye el criterio del juez ni
        constituye asesoramiento legal.
      </p>
    </footer>
  )
}
