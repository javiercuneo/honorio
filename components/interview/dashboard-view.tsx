'use client'

import { useMemo } from "react"
import { motion } from "motion/react"
import { ArrowLeft, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { UseWizardReturn } from "@/hooks/useWizard"
import { calcularResultadoEstructurado } from "@/lib/legal/adapters"
import { Dashboard } from "@/components/dashboard/Dashboard"

const ease = [0.22, 1, 0.36, 1] as const

type DashboardViewProps = {
  wizard: UseWizardReturn
  onBack: () => void
  onRestart: () => void
  onShowMinimos: () => void
}

export function DashboardView({ wizard, onBack, onRestart, onShowMinimos }: DashboardViewProps) {
  const { resultado, modoTerminacion, sentenciaResultado, objetoBase } = useMemo(() => {
    try {
      wizard.calculate()
      const result = calcularResultadoEstructurado()
      return {
        resultado: result,
        modoTerminacion: wizard.answers.modoTerminacion as string | undefined,
        sentenciaResultado: wizard.answers.sentenciaResultado as string | undefined,
        objetoBase: wizard.answers.objeto as string | undefined,
      }
    } catch (e: unknown) {
      return { resultado: null, modoTerminacion: undefined, sentenciaResultado: undefined }
    }
  }, [wizard])

  return (
    <div className="mx-auto max-w-6xl px-5 pb-16 md:px-8">
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
        className="flex flex-col gap-4 border-b border-border py-8 md:flex-row md:items-end md:justify-between"
      >
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-accent-foreground">
            Calculo generado
          </span>
          <h1 className="mt-4 text-balance font-serif text-4xl leading-[1.02] tracking-tight text-foreground md:text-5xl">
            Resultados
          </h1>
          <p className="mt-2 max-w-lg text-[15px] leading-relaxed text-muted-foreground">
            Calculo en base a los datos ingresados
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="ghost"
            onClick={onBack}
            className="h-10 rounded-full px-4 text-muted-foreground"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Revisar
          </Button>
          <Button
            variant="outline"
            onClick={onRestart}
            className="h-10 rounded-full px-5"
          >
            <RotateCcw className="mr-1.5 h-4 w-4" />
            Nuevo calculo
          </Button>
          <Button
            variant="ghost"
            onClick={onShowMinimos}
            className="h-10 rounded-full px-5"
          >
            Ver minimos
          </Button>
        </div>
      </motion.header>

      <div className="mt-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease, delay: 0.1 }}
        >
          {resultado ? (
            <Dashboard
              resultado={resultado}
              modoTerminacion={modoTerminacion}
              sentenciaResultado={sentenciaResultado}
              objetoBase={objetoBase}
            />
          ) : (
            <div className="rounded-2xl border border-border bg-card p-10 text-center">
              <p className="text-muted-foreground">
                Error al generar el calculo. Verifique los datos ingresados.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
