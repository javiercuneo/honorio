'use client'

import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { pesos } from '@/components/dashboard/format'
import { MINIMOS_CATEGORIAS, type MinimoCategoria } from '@/lib/legal/minimos-data'
import { withBasePath } from '@/lib/basePath'

const OPTIONS: { value: string; label: string }[] = [
  { value: '', label: '-- Seleccione --' },
  { value: 'extrajudicial', label: 'Mínimos por labor extrajudicial (art. 19 inc. b)' },
  { value: 'judicial', label: 'Mínimos en asuntos judiciales no susceptibles de apreciación pecuniaria (art. 19 inc. a)' },
  { value: 'acciones_48', label: 'Acciones de inconstitucionalidad, amparo, hábeas data, hábeas corpus (art.48)' },
  { value: 'contencioso_44', label: 'Demandas contencioso administrativas no susceptibles de apreciación pecuniaria (art. 44)' },
  { value: 'art58', label: 'Mínimos en juicios susceptibles de apreciación pecuniaria (art. 58)' },
  { value: 'recursos_csjn', label: 'Recursos ante la CSJN (art. 31)' },
  { value: 'auxiliares_justicia', label: 'Auxiliares de justicia' },
]

function CategoriaTable({ categoria, umaValor }: { categoria: MinimoCategoria; umaValor: number }) {
  return (
    <div className="mt-6 space-y-6">
      <h3 className="font-serif text-lg tracking-tight text-foreground">{categoria.titulo}</h3>

      {categoria.grupos.map((grupo, gi) => (
        <div key={gi} className="overflow-hidden rounded-xl border border-border">
          {grupo.titulo && (
            <div className="border-b border-border bg-muted/20 px-4 py-2.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              {grupo.titulo}
            </div>
          )}
          <table className="w-full border-collapse font-mono text-[13px]">
            <thead>
              <tr className="border-b border-border/50 bg-muted/10 text-[10px] uppercase tracking-wider text-muted-foreground/60">
                <th className="px-4 py-2.5 text-left font-medium">Concepto</th>
                <th className="px-4 py-2.5 text-right font-medium">UMA</th>
                <th className="px-4 py-2.5 text-right font-medium">Pesos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {grupo.items.map((item, ii) => (
                <tr key={ii}>
                  <td className="px-4 py-3 text-left text-foreground">{item.label}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-muted-foreground">
                    {item.umaLabel ?? `${item.uma} UMA`}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-medium text-value-min">
                    {pesos(item.uma * umaValor)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      <details className="group">
        <summary className="cursor-pointer font-mono text-[11px] uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground">
          Ver texto del artículo
        </summary>
        <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
          {categoria.textoLegal}
        </p>
      </details>
    </div>
  )
}

export function MinimosView({ onBack, umaValor }: { onBack: () => void; umaValor: number }) {
  const [selected, setSelected] = useState('')
  const categoria = selected ? MINIMOS_CATEGORIAS[selected] : null

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-4xl px-5 py-8 md:px-8">
        <header className="flex items-center justify-between mb-8">
          <img src={withBasePath('/honorio.png')} alt="Honorio" width="147" className="h-auto" />
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
              onChange={(e) => setSelected(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-[14px] text-foreground outline-none focus:border-foreground/40 focus:ring-1 focus:ring-foreground/20"
            >
              {OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {categoria && <CategoriaTable categoria={categoria} umaValor={umaValor} />}

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
