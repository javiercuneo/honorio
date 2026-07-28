'use client'

import { useState, useCallback } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { obtenerTablasMinimos, formatNumero } from '@/lib/legal/adapters'

type MinimoValue = '' | 'extrajudicial' | 'judicial' | 'acciones_48' | 'contencioso_44' | 'minimos_art58' | 'recursos_csjn' | 'auxiliares_justicia'

const OPTIONS: { value: MinimoValue; label: string }[] = [
  { value: '', label: '-- Seleccione --' },
  { value: 'extrajudicial', label: 'Mínimos por labor extrajudicial (art. 19 inc. b)' },
  { value: 'judicial', label: 'Mínimos en asuntos judiciales no susceptibles de apreciación pecuniaria (art. 19 inc. a)' },
  { value: 'acciones_48', label: 'Acciones de inconstitucionalidad, amparo, hábeas data, hábeas corpus (art.48)' },
  { value: 'contencioso_44', label: 'Demandas contencioso administrativas no susceptibles de apreciación pecuniaria (art. 44)' },
  { value: 'minimos_art58', label: 'Mínimos en juicios susceptibles de apreciación pecuniaria (art. 58)' },
  { value: 'recursos_csjn', label: 'Recursos ante la CSJN (art. 31)' },
  { value: 'auxiliares_justicia', label: 'Auxiliares de justicia' },
]

const NEEDS_NEXT: MinimoValue[] = ['extrajudicial', 'judicial', 'minimos_art58', 'recursos_csjn', 'auxiliares_justicia']
const INLINE: MinimoValue[] = ['acciones_48', 'contencioso_44']

const TEASER_TEXT: Record<string, string> = {
  extrajudicial: 'Al hacer clic en Siguiente verá la tabla',
  judicial: 'Al hacer clic en Siguiente verá la tabla',
  minimos_art58: 'Al hacer clic en Siguiente verá los mínimos correspondientes.',
  recursos_csjn: 'Al hacer clic en Siguiente verá los mínimos correspondientes.',
  auxiliares_justicia: 'Al hacer clic en Siguiente verá los mínimos correspondientes.',
}

function modoToMinimosModo(modo: MinimoValue): string {
  if (modo === 'minimos_art58') return 'art58'
  return modo
}

export function MinimosView({ onBack, umaValor }: { onBack: () => void; umaValor: number }) {
  const [selected, setSelected] = useState<MinimoValue>('')
  const [fullTable, setFullTable] = useState<string | null>(null)

  const uma = umaValor

  const handleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as MinimoValue
    setSelected(val)
    setFullTable(null)
  }, [])

  const handleSiguiente = useCallback(() => {
    if (selected && NEEDS_NEXT.includes(selected)) {
      const html = obtenerTablasMinimos(modoToMinimosModo(selected) as any, uma)
      setFullTable(html)
    }
  }, [selected])

  const renderInline = () => {
    if (selected === 'acciones_48') {
      const val = 20 * uma
      return (
        <div>
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr><th colSpan={2} className="border border-border bg-muted p-2 text-left font-medium">Mínimos del art. 48</th></tr>
            </thead>
            <tbody>
              <tr><td className="border border-border p-2">20 UMA</td><td className="border border-border p-2">{formatNumero(val)}</td></tr>
            </tbody>
          </table>
          <div className="mt-3 rounded-lg border border-border/60 bg-muted/30 p-3 text-[12px] leading-relaxed text-muted-foreground">
            ARTÍCULO 48.- Por la interposición de acciones de inconstitucionalidad, de amparo, de hábeas data, de hábeas corpus, en caso de que no puedan regularse de conformidad con la escala del artículo 21, se aplicarán las normas del artículo 16, con un mínimo de 20 UMA.
          </div>
        </div>
      )
    }
    if (selected === 'contencioso_44') {
      return (
        <div>
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr><th colSpan={3} className="border border-border bg-muted p-2 text-left font-medium">Mínimos del art. 44</th></tr>
            </thead>
            <tbody>
              <tr><td className="border border-border p-2">Acciones contencioso administrativas</td><td className="border border-border p-2">7 UMA</td><td className="border border-border p-2">{formatNumero(7 * uma)}</td></tr>
              <tr><td className="border border-border p-2">Actuaciones administrativas</td><td className="border border-border p-2">5 UMA</td><td className="border border-border p-2">{formatNumero(5 * uma)}</td></tr>
            </tbody>
          </table>
          <div className="mt-3 rounded-lg border border-border/60 bg-muted/30 p-3 text-[12px] leading-relaxed text-muted-foreground">
            ARTÍCULO 44.- La interposición de acciones y peticiones de naturaleza administrativa seguirá las siguientes reglas… En los casos en que los asuntos no sean susceptibles de apreciación pecuniaria, la regulación no será inferior a 7 o 5 UMA, según se trate del ejercicio de acciones contencioso administrativas o actuaciones administrativas, respectivamente.
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-4xl px-5 py-8 md:px-8">
        <header className="flex items-center justify-between mb-8">
          <img src="/honorio.png" alt="Honorio" width="147" className="h-auto" />
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            Mínimos arancelarios
          </span>
        </header>

        <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
          <h2 className="font-serif text-2xl tracking-tight text-foreground md:text-3xl">
            Mínimos arancelarios previstos en la Ley 27.423
          </h2>

          <div className="mt-6">
            <select
              value={selected}
              onChange={handleChange}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-[14px] text-foreground outline-none focus:border-foreground/40 focus:ring-1 focus:ring-foreground/20"
            >
              {OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="mt-6">
            {selected && INLINE.includes(selected) && renderInline()}

            {selected && NEEDS_NEXT.includes(selected) && !fullTable && (
              <div>
                <div className="rounded-lg border border-border/60 bg-muted/30 p-3 text-[13px] leading-relaxed text-muted-foreground">
                  {TEASER_TEXT[selected]}
                </div>
                <Button
                  onClick={handleSiguiente}
                  className="mt-4 h-10 rounded-full px-5 text-[14px]"
                >
                  Siguiente ▶
                </Button>
              </div>
            )}

            {fullTable && (
              <div
                className="prose-table-styles [&_table]:w-full [&_table]:border-collapse [&_table]:text-[13px] [&_th]:border [&_th]:border-border [&_th]:bg-muted [&_th]:p-2 [&_th]:text-left [&_th]:font-medium [&_td]:border [&_td]:border-border [&_td]:p-2 [&_div.legal-box]:mt-3 [&_div.legal-box]:rounded-lg [&_div.legal-box]:border [&_div.legal-box]:border-border/60 [&_div.legal-box]:bg-muted/30 [&_div.legal-box]:p-3 [&_div.legal-box]:text-[12px] [&_div.legal-box]:leading-relaxed [&_div.legal-box]:text-muted-foreground [&_h3]:mb-3 [&_h3]:text-[15px] [&_h3]:font-semibold [&_h4]:mb-3 [&_h4]:text-[14px] [&_h4]:font-semibold"
                dangerouslySetInnerHTML={{ __html: fullTable }}
              />
            )}
          </div>

          <div className="mt-8 border-t border-border pt-5">
            <Button
              variant="ghost"
              onClick={onBack}
              className="h-11 rounded-full px-4 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Volver
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
