'use client'

// ---------------------------------------------------------------
// Portada. El logo se compone chico y por encima del wordmark, que es
// el que carga la identidad tipografica del resto de la app. Cuando
// haya assets nuevos, se reemplaza la imagen sin tocar la estructura.
// ---------------------------------------------------------------

import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Ilustracion } from '@/components/brand'

export function LandingView({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <div className="w-full max-w-md text-center">
        <Ilustracion className="mx-auto w-28 text-foreground" />

        <h1 className="mt-6 font-meter text-[52px] font-semibold uppercase leading-none tracking-[0.06em] text-foreground md:text-[64px]">
          Honorio
        </h1>

        <p className="mt-4 text-pretty text-[16px] leading-relaxed text-muted-foreground">
          Calcula honorarios según la Ley 27.423 y te muestra, paso por paso,
          de dónde sale cada número.
        </p>

        <Button
          size="lg"
          onClick={onStart}
          className="group mt-9 h-12 px-6 text-[15px]"
        >
          Comenzar
          <ArrowRight className="ml-1.5 h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
        </Button>

        <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.16em] text-faint">
          Herramienta de referencia · no sustituye el criterio del juez
        </p>
      </div>
    </div>
  )
}
