'use client'

// ---------------------------------------------------------------
// Minimos arancelarios de la Ley 27.423.
//
// Es una tabla de referencia, no un tramite: se abre mostrando todo y
// se filtra escribiendo. La version anterior heredaba del asistente
// clasico un <select> que obligaba a elegir una categoria antes de ver
// un solo numero, y un orden que era el de armado del <select> (el
// inciso b) del art. 19 antes que el a).
//
// Se compone con las mismas piezas que el dashboard: LedgerRow para
// cada concepto, Disclosure para el texto de la norma. Los numeros no
// se ocultan nunca; las frases, siempre.
// ---------------------------------------------------------------

import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  Cifra,
  EnUMA,
  Etiqueta,
  LedgerRow,
  Disclosure,
  Norma,
} from '@/components/dashboard/primitives'
import type { MinimoCategoria, MinimoItem } from '@/lib/legal/minimos-data'
import {
  buscarMinimos,
  contarConceptos,
  resaltar,
  tokenizar,
  TOTAL_CONCEPTOS,
} from '@/lib/minimos-buscar'
import { AppTopbar } from './app-topbar'

/** El texto del concepto con la coincidencia marcada. */
function Resaltado({ texto, tokens }: { texto: string; tokens: string[] }) {
  const tramos = useMemo(() => resaltar(texto, tokens), [texto, tokens])
  return (
    <span>
      {tramos.map((t, i) =>
        t.marcado ? (
          <mark
            key={i}
            className="rounded-[2px] bg-accent-foreground/15 text-foreground"
          >
            {t.texto}
          </mark>
        ) : (
          <span key={i}>{t.texto}</span>
        ),
      )}
    </span>
  )
}

function Concepto({
  item,
  umaValor,
  tokens,
}: {
  item: MinimoItem
  umaValor: number
  tokens: string[]
}) {
  return (
    <LedgerRow
      concepto={<Resaltado texto={item.label} tokens={tokens} />}
      valor={<Cifra value={item.uma * umaValor} className="text-value-min" />}
      sub={
        <span className="font-mono text-[11px] text-faint">
          {item.umaLabel ?? <EnUMA value={item.uma} />}
        </span>
      }
    />
  )
}

function Categoria({
  categoria,
  umaValor,
  tokens,
}: {
  categoria: MinimoCategoria
  umaValor: number
  tokens: string[]
}) {
  return (
    <Card>
      {/* El titulo tambien se resalta: si la fila entro por la
          categoria y no por su propio nombre, se ve por que. */}
      <CardHeader
        titulo={<Resaltado texto={categoria.titulo} tokens={tokens} />}
        articulo={categoria.articulo}
      />

      <div className="px-7 py-3">
        {categoria.grupos.map((grupo, gi) => (
          <div key={gi} className={gi > 0 ? 'mt-5 border-t border-hair pt-4' : undefined}>
            {grupo.titulo ? (
              <div className="pb-1.5">
                <Etiqueta>{grupo.titulo}</Etiqueta>
              </div>
            ) : null}
            {grupo.items.map((item, ii) => (
              <Concepto key={ii} item={item} umaValor={umaValor} tokens={tokens} />
            ))}
          </div>
        ))}
      </div>

      <div className="border-t border-hair px-7">
        <Disclosure concepto="Qué dice el artículo" articulo={categoria.articulo}>
          <Norma>{categoria.textoLegal}</Norma>
        </Disclosure>
      </div>
    </Card>
  )
}

export function MinimosView({
  onBack,
  umaValor,
}: {
  onBack: () => void
  umaValor: number
}) {
  const [consulta, setConsulta] = useState('')
  const campo = useRef<HTMLInputElement>(null)

  const categorias = useMemo(() => buscarMinimos(consulta), [consulta])
  const tokens = useMemo(() => tokenizar(consulta), [consulta])
  const encontrados = contarConceptos(categorias)
  const filtrando = tokens.length > 0

  // "/" lleva al buscador y Escape lo limpia, como en el resto de la
  // app, donde todo se puede manejar sin sacar las manos del teclado.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const dentro = document.activeElement === campo.current
      if (e.key === '/' && !dentro) {
        e.preventDefault()
        campo.current?.focus()
      } else if (e.key === 'Escape' && dentro) {
        setConsulta('')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppTopbar caso="Mínimos arancelarios">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="h-8 px-2.5 text-[13px] text-muted-foreground"
        >
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
          Volver
        </Button>
      </AppTopbar>

      <div className="mx-auto max-w-3xl px-6 pb-24 pt-8 md:px-8">
        <h1 className="font-meter text-[30px] leading-tight tracking-tight text-foreground md:text-[38px]">
          Mínimos arancelarios
        </h1>
        <p className="mt-2.5 max-w-xl text-[14px] leading-relaxed text-muted-foreground">
          Los pisos que la Ley 27.423 fija en UMA, convertidos a la UMA vigente.
          Ninguno se aplica solo: si el cálculo del art. 21 queda por debajo de
          un mínimo aplicable, el mínimo manda.
        </p>

        {/* Buscador */}
        <div className="sticky top-0 z-20 -mx-6 mt-7 bg-background/95 px-6 py-3 backdrop-blur md:-mx-8 md:px-8">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint"
              aria-hidden="true"
            />
            <input
              ref={campo}
              type="search"
              value={consulta}
              onChange={(e) => setConsulta(e.target.value)}
              placeholder="Buscar: perito, amparo, divorcio, carta documento, art. 58…"
              aria-label="Buscar un concepto"
              className="h-11 w-full rounded-md border border-border bg-card pl-10 pr-10 text-[14px] text-foreground placeholder:text-faint focus-visible:border-ring focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring [&::-webkit-search-cancel-button]:hidden"
            />
            {filtrando ? (
              <button
                type="button"
                onClick={() => {
                  setConsulta('')
                  campo.current?.focus()
                }}
                aria-label="Limpiar la búsqueda"
                className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-sm text-faint transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>

          <div className="mt-2 flex items-baseline justify-between gap-4">
            <Etiqueta>
              {filtrando
                ? `${encontrados} de ${TOTAL_CONCEPTOS} conceptos`
                : `${TOTAL_CONCEPTOS} conceptos`}
            </Etiqueta>
            <Etiqueta>UMA {new Intl.NumberFormat('es-AR').format(umaValor)}</Etiqueta>
          </div>
        </div>

        {/* Resultados */}
        {categorias.length > 0 ? (
          <div className="mt-4 space-y-5">
            {categorias.map((cat) => (
              <Categoria
                key={cat.id}
                categoria={cat}
                umaValor={umaValor}
                tokens={tokens}
              />
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-lg border border-border bg-card px-7 py-12 text-center">
            <p className="text-[14px] text-muted-foreground">
              Ningún concepto coincide con «{consulta}».
            </p>
            <p className="mt-2 text-[13px] text-faint">
              La tabla solo trae los mínimos que la ley enumera. Si el asunto no
              está acá, no tiene mínimo propio: se regula por el art. 21 o, si no
              hay monto, por las pautas del art. 16.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
