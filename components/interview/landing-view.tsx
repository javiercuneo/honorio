'use client'

import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function LandingView({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
      <div className="mx-auto max-w-lg px-5 text-center">
        <img
          src="/honorio.png"
          alt="Honorio"
          className="mx-auto h-auto w-auto mb-8"
        />
        <img
          src="/honorio2.png"
          alt="Honorio"
          className="mx-auto h-auto w-auto mb-8"
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