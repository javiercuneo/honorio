'use client'

import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { withBasePath } from '@/lib/basePath'

export function LandingView({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
      <div className="mx-auto max-w-lg px-5 text-center">
        <img
          src={withBasePath('/honorio.png')}
          alt="Honorio"
          className="mx-auto mb-8 h-auto w-44 max-w-full sm:w-48"
        />
        <img
          src={withBasePath('/honorio2.png')}
          alt="Honorio — asistente para la regulación de honorarios"
          className="mx-auto mb-8 h-auto w-full max-w-[340px]"
        />
        <Button
          size="lg"
          onClick={onStart}
          className="group mt-9 h-12 rounded-full px-6 text-[15px]"
        >
          Ingresar
          <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
        </Button>
      </div>
    </div>
  )
}