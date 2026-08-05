'use client'

// ---------------------------------------------------------------
// Imprimir el calculo, con o sin los fundamentos.
//
// El interruptor existe porque son dos documentos distintos con el
// mismo numero adentro: el calculo desnudo, para adjuntar, y el
// calculo fundado, para quien tiene que sostenerlo.
//
// La parte que no es obvia: los fundamentos viven en <details>, y un
// <details> cerrado no imprime su contenido. Si no se hiciera nada,
// el informe saldria con los fundamentos que el lector hubiera
// abierto al leer —o sea, cualquier cosa— y el interruptor seria
// decorativo. Asi que antes de imprimir se abren o se cierran todos
// segun lo que se pidio, y despues se restaura exactamente el estado
// que habia.
//
// Se engancha en beforeprint/afterprint y no solo en el boton porque
// el usuario tambien puede imprimir con Ctrl+P, y ahi el informe
// tiene que salir igual.
// ---------------------------------------------------------------

import { useCallback, useEffect, useRef, useState } from 'react'
import { Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/** Marca el arbol que se imprime; el CSS lo ensancha a la hoja. */
export const HOJA_PROPS = { 'data-imprimir': 'hoja' } as const

/** Marca lo que no va al papel: botones, selectores, deslizadores. */
export const SOLO_PANTALLA = { 'data-imprimir': 'no' } as const

function useImpresion(conFundamentos: boolean) {
  // Se lee del ref y no del estado porque los manejadores de
  // beforeprint quedan registrados una sola vez y tienen que ver el
  // valor del momento, no el del render en que se engancharon.
  const conFundamentosRef = useRef(conFundamentos)
  conFundamentosRef.current = conFundamentos

  useEffect(() => {
    let previos: { el: HTMLDetailsElement; abierto: boolean }[] = []

    const antes = () => {
      const todos = Array.from(
        document.querySelectorAll<HTMLDetailsElement>('details'),
      )
      previos = todos.map((el) => ({ el, abierto: el.open }))
      for (const { el } of previos) el.open = conFundamentosRef.current
    }

    const despues = () => {
      for (const { el, abierto } of previos) el.open = abierto
      previos = []
    }

    window.addEventListener('beforeprint', antes)
    window.addEventListener('afterprint', despues)
    return () => {
      window.removeEventListener('beforeprint', antes)
      window.removeEventListener('afterprint', despues)
    }
  }, [])
}

export function BotonImprimir() {
  const [conFundamentos, setConFundamentos] = useState(true)
  const [abierto, setAbierto] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useImpresion(conFundamentos)

  useEffect(() => {
    if (!abierto) return
    const fuera = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setAbierto(false)
    }
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setAbierto(false)
    document.addEventListener('mousedown', fuera)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('mousedown', fuera)
      document.removeEventListener('keydown', esc)
    }
  }, [abierto])

  const imprimir = useCallback(() => {
    setAbierto(false)
    // Un cuadro que se cierra deja un render pendiente; imprimir en
    // el mismo tick sacaria el menu en el papel.
    requestAnimationFrame(() => window.print())
  }, [])

  return (
    <div ref={ref} className="relative" {...SOLO_PANTALLA}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        className="h-8 px-2.5 text-[13px] text-muted-foreground"
      >
        <Printer className="mr-1.5 h-3.5 w-3.5" />
        Imprimir
      </Button>

      {abierto ? (
        <div className="absolute right-0 top-10 z-50 w-72 rounded-lg border border-border bg-card p-4 shadow-[0_8px_24px_rgb(0_0_0/0.10)]">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-faint">
            Informe
          </p>

          <button
            type="button"
            role="switch"
            aria-checked={conFundamentos}
            onClick={() => setConFundamentos((v) => !v)}
            className="mt-2.5 flex w-full items-center justify-between gap-6 py-1.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="text-[13px] text-foreground">
              Incluir los fundamentos
            </span>
            <span
              className={cn(
                'relative h-4 w-7 shrink-0 rounded-full transition-colors',
                conFundamentos ? 'bg-primary' : 'bg-border',
              )}
            >
              <span
                className={cn(
                  'absolute top-0.5 h-3 w-3 rounded-full bg-card transition-transform',
                  conFundamentos ? 'translate-x-3.5' : 'translate-x-0.5',
                )}
              />
            </span>
          </button>

          <p className="mt-2 text-[12px] leading-relaxed text-faint">
            {conFundamentos
              ? 'Cada regla sale con la norma y el criterio que la funda. Es el cálculo para sostener.'
              : 'Solo los números y las reglas aplicadas, sin las explicaciones. Es el cálculo para adjuntar.'}
          </p>

          <Button size="sm" onClick={imprimir} className="mt-4 h-8 w-full text-[13px]">
            Imprimir
          </Button>

          <p className="mt-3 border-t border-hair pt-3 text-[12px] leading-relaxed text-faint">
            Para guardarlo como PDF, elegí «Guardar como PDF» en el destino
            del diálogo de impresión.
          </p>
        </div>
      ) : null}
    </div>
  )
}
