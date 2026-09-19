'use client'

// ---------------------------------------------------------------
// Imprimir el calculo, con todos los fundamentos, sin ninguno, o con
// los que el lector dejo abiertos.
//
// El selector existe porque son documentos distintos con el mismo
// numero adentro: el calculo desnudo, para adjuntar, el calculo
// fundado, para quien tiene que sostenerlo, y el fundado a medida.
//
// La parte que no es obvia: los fundamentos viven en <details>, y un
// <details> cerrado no imprime su contenido. Si no se hiciera nada,
// el informe saldria con los fundamentos que el lector hubiera
// abierto al leer —o sea, cualquier cosa— y el selector seria
// decorativo. Asi que antes de imprimir se abren o se cierran todos
// segun lo que se pidio, y despues se restaura exactamente el estado
// que habia.
//
// Se engancha en beforeprint/afterprint y no solo en el boton porque
// el usuario tambien puede imprimir con Ctrl+P, y ahi el informe
// tiene que salir igual.
//
// La tercera opcion, «los que tengo abiertos», parece contradecir lo
// anterior y no lo hace. Lo que se evitaba era que el informe saliera
// con lo abierto *por casualidad*. Elegido a proposito, es la forma de
// decidir que fundamentos van: se abren al lado de su numero, que es
// donde se entiende que es cada uno, y no en una lista de titulos
// sueltos. Ninguna opcion toca las cifras: se eligen frases.
// ---------------------------------------------------------------

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Segmented } from './primitives'

/** Marca el arbol que se imprime; el CSS lo ensancha a la hoja. */
export const HOJA_PROPS = { 'data-imprimir': 'hoja' } as const

/** Marca lo que no va al papel: botones, selectores, deslizadores. */
export const SOLO_PANTALLA = { 'data-imprimir': 'no' } as const

type Fundamentos = 'todos' | 'ninguno' | 'abiertos'

const FUNDAMENTOS_OPCIONES: { value: Fundamentos; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'ninguno', label: 'Ninguno' },
  { value: 'abiertos', label: 'Abiertos' },
]

const FUNDAMENTOS_AYUDA: Record<Fundamentos, string> = {
  todos:
    'Cada regla sale con la norma y el criterio que la funda. Es el cálculo para sostener.',
  ninguno:
    'Solo los números y las reglas aplicadas, sin las explicaciones. Es el cálculo para adjuntar.',
  abiertos:
    'Sale como lo estás viendo. Cerrá este cuadro, abrí en el resultado los «por qué» que te sirven, cerrá los que no, y volvé a imprimir. Los números salen siempre.',
}

function useImpresion(fundamentos: Fundamentos) {
  // Se lee del ref y no del estado porque los manejadores de
  // beforeprint quedan registrados una sola vez y tienen que ver el
  // valor del momento, no el del render en que se engancharon.
  const fundamentosRef = useRef(fundamentos)
  fundamentosRef.current = fundamentos

  useEffect(() => {
    let previos: { el: HTMLDetailsElement; abierto: boolean }[] = []

    const antes = () => {
      if (fundamentosRef.current === 'abiertos') return
      const todos = Array.from(
        document.querySelectorAll<HTMLDetailsElement>('details'),
      )
      previos = todos.map((el) => ({ el, abierto: el.open }))
      const abrir = fundamentosRef.current === 'todos'
      for (const { el } of previos) el.open = abrir
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

/**
 * `referencias` es el editor de las referencias al expediente. Vive
 * adentro de este menu y no en el resultado: es una decision sobre el
 * papel, y la pantalla no tiene por que crecer para quien no la usa.
 */
export function BotonImprimir({ referencias }: { referencias?: ReactNode }) {
  const [fundamentos, setFundamentos] = useState<Fundamentos>('todos')
  const [abierto, setAbierto] = useState(false)
  const [conReferencias, setConReferencias] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useImpresion(fundamentos)

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
        onClick={() => {
          setConReferencias(false)
          setAbierto((v) => !v)
        }}
        aria-expanded={abierto}
        className="h-8 px-2.5 text-[13px] text-muted-foreground"
      >
        <Printer className="mr-1.5 h-3.5 w-3.5" />
        Imprimir
      </Button>

      {abierto ? (
        <div
          className={cn(
            'absolute right-0 top-10 z-50 max-h-[calc(100vh-4rem)] overflow-y-auto rounded-lg border border-border bg-card p-4 shadow-[0_8px_24px_rgb(0_0_0/0.10)]',
            conReferencias ? 'w-[26rem] max-w-[calc(100vw-2rem)]' : 'w-72',
          )}
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-faint">
            Informe
          </p>

          <p className="mt-2.5 text-[13px] text-foreground">Fundamentos</p>
          <div className="mt-1.5">
            <Segmented
              options={FUNDAMENTOS_OPCIONES}
              value={fundamentos}
              onChange={setFundamentos}
              ariaLabel="Qué fundamentos imprimir"
            />
          </div>

          <p className="mt-2 text-[12px] leading-relaxed text-faint">
            {FUNDAMENTOS_AYUDA[fundamentos]}
          </p>

          {conReferencias ? (
            <div className="mt-4 border-t border-hair pt-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-faint">
                Referencias al expediente
              </p>
              <div className="mt-2">{referencias}</div>
            </div>
          ) : null}

          <div className="mt-4 flex gap-2">
            <Button size="sm" onClick={imprimir} className="h-8 flex-1 text-[13px]">
              Imprimir
            </Button>
            {referencias && !conReferencias ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setConReferencias(true)}
                className="h-8 flex-1 text-[13px]"
              >
                Con referencias…
              </Button>
            ) : null}
          </div>

          <p className="mt-3 border-t border-hair pt-3 text-[12px] leading-relaxed text-faint">
            Para guardarlo como PDF, elegí «Guardar como PDF» en el destino
            del diálogo de impresión.
          </p>
        </div>
      ) : null}
    </div>
  )
}
