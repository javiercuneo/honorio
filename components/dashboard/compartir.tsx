'use client'

// ---------------------------------------------------------------
// Compartir el calculo, citarlo y reportar que esta mal.
//
// Las tres cosas son la misma: que el numero pueda salir de esta
// pantalla sin perder de donde vino. Un calculo que se comparte como
// captura no se puede verificar; uno que se cita sin decir con que
// version se hizo no se puede reproducir; y un error que se reporta
// sin el caso no se puede corregir.
//
// El enlace resuelve las tres. Lleva el caso entero en el fragmento
// —ver lib/compartir.ts, que explica por que va ahi y no en la query—
// asi que abrirlo devuelve exactamente esta pantalla.
//
// La cita se imprime y el resto no: en el papel el enlace es lo unico
// que queda para volver, y un boton impreso no sirve para nada.
// ---------------------------------------------------------------

import { useCallback, useEffect, useState } from 'react'
import { Check, Copy, Link2, MessageSquareWarning } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Answers } from '@/lib/legal/types'
import { enlaceDelCaso } from '@/lib/compartir'
import { UMA_VIGENTE } from '@/lib/legal/uma'
import { CONTACTO } from '@/lib/enlaces'
import { pesos } from './format'
import { SOLO_PANTALLA } from './imprimir'

const VERSION = process.env.NEXT_PUBLIC_VERSION ?? '0.0.0'

/**
 * El enlace del caso, resuelto despues del montaje.
 *
 * Sale de `window.location`, que en el prerender no existe: componerlo
 * durante el render dejaria el HTML publicado con un enlace vacio y
 * ademas discreparia con el cliente al hidratar. Es el mismo motivo
 * por el que la fecha de la firma se resuelve asi.
 */
function useEnlace(answers: Answers): string | null {
  const [enlace, setEnlace] = useState<string | null>(null)
  useEffect(() => {
    setEnlace(enlaceDelCaso(answers))
  }, [answers])
  return enlace
}

function useCopiado(): [boolean, (texto: string) => Promise<void>] {
  const [copiado, setCopiado] = useState(false)
  const copiar = useCallback(async (texto: string) => {
    try {
      await navigator.clipboard.writeText(texto)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 1800)
    } catch {
      // Sin portapapeles —contexto inseguro, permiso negado— el enlace
      // sigue estando a la vista en la cita para copiarlo a mano.
    }
  }, [])
  return [copiado, copiar]
}

/** El boton de la barra: se lleva el caso en el portapapeles. */
export function BotonCompartir({ answers }: { answers: Answers }) {
  const enlace = useEnlace(answers)
  const [copiado, copiar] = useCopiado()

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={!enlace}
      onClick={() => enlace && copiar(enlace)}
      className="h-8 px-2.5 text-[13px] text-muted-foreground"
      {...SOLO_PANTALLA}
    >
      {copiado ? (
        <Check className="mr-1.5 h-3.5 w-3.5" />
      ) : (
        <Link2 className="mr-1.5 h-3.5 w-3.5" />
      )}
      {copiado ? 'Enlace copiado' : 'Copiar enlace'}
    </Button>
  )
}

/**
 * Como se cita este calculo, y como se avisa que esta mal.
 *
 * Vive dentro de la firma porque contesta la misma pregunta que el
 * resto de ese bloque: contra que se hizo este numero.
 */
export function BloqueCita({ answers }: { answers: Answers }) {
  const enlace = useEnlace(answers)
  const [copiado, copiar] = useCopiado()
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

  const cita =
    'Honorio ' +
    VERSION +
    (fecha ? ', cálculo del ' + fecha : '') +
    ', UMA ' +
    pesos(UMA_VIGENTE.valor, false) +
    (enlace ? ' — ' + enlace : '')

  const reporte =
    'mailto:' +
    CONTACTO +
    '?subject=' +
    encodeURIComponent('Honorio ' + VERSION + ' — un cálculo que no cierra') +
    '&body=' +
    encodeURIComponent(
      'Qué esperaba y qué me dio:\n\n\n' +
        '(Si podés, decime qué artículo o criterio lo funda.)\n\n' +
        '-----\n' +
        'El caso, para reproducirlo:\n' +
        (enlace ?? '(abrir Honorio y copiar el enlace desde la barra)') +
        '\n\n' +
        cita +
        '\n',
    )

  return (
    <div className="mt-4 border-t border-hair pt-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-faint">
        Cómo citar este cálculo
      </p>

      {/* El enlace se rompe donde haga falta: es largo a proposito,
          porque lleva el caso adentro, y en el papel tiene que entrar
          entero o no sirve. */}
      <p className="mt-1.5 break-all font-mono text-[11px] leading-relaxed text-muted-foreground">
        {cita}
      </p>

      <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-2" {...SOLO_PANTALLA}>
        <button
          type="button"
          disabled={!enlace}
          onClick={() => copiar(cita)}
          className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {copiado ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copiado ? 'Copiada' : 'Copiar la cita'}
        </button>

        <a
          href={reporte}
          className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <MessageSquareWarning className="h-3.5 w-3.5" />
          Este cálculo no cierra
        </a>
      </div>

      {/* Una linea, no un parrafo. Lo unico que hace falta decir es que
          el enlace no delata el caso; el resto se entiende usandolo. */}
      <p className="mt-2 text-[12px] leading-relaxed text-faint" {...SOLO_PANTALLA}>
        El enlace abre este mismo cálculo y no viaja a ningún servidor.
      </p>
    </div>
  )
}
