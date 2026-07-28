'use client'

import { ArrowRight, Scale, FileText, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'

const notes = [
  { icon: FileText, label: 'Seleccion del tipo de proceso' },
  { icon: Scale, label: 'Calculo segun Ley 27.423' },
  { icon: ShieldCheck, label: 'Resultado detallado' },
]

export function IntroView({ onStart }: { onStart: () => void }) {
  return (
    <div className="max-w-lg">
      <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-chart-1" aria-hidden="true" />
        Calculo de honorarios
      </span>

      <h1 className="mt-6 text-balance font-serif text-5xl leading-[1.02] tracking-tight text-foreground md:text-6xl">
        Honorio es un asistente para la regulación de honorarios profesionales
      </h1>

      <p className="mt-5 max-w-md text-pretty text-[16px] leading-relaxed text-muted-foreground">
        A través de la selección de opciones, obtenés el cálculo que corresponde a la ley 27.423
      </p>

      <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
        {notes.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-2 text-[13px] text-muted-foreground"
          >
            <Icon className="h-4 w-4 text-foreground/60" />
            {label}
          </div>
        ))}
      </div>

      <Button
        size="lg"
        onClick={onStart}
        className="group mt-9 h-12 rounded-full px-6 text-[15px]"
      >
        Comenzar
        <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
      </Button>
    </div>
  )
}
