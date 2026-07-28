'use client'

import { useMemo } from 'react'
import { motion } from 'motion/react'
import { ArrowLeft, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { UseWizardReturn } from '@/hooks/useWizard'

const ease = [0.22, 1, 0.36, 1] as const

type DashboardViewProps = {
  wizard: UseWizardReturn
  onBack: () => void
  onRestart: () => void
}

let _calcCount = 0

export function DashboardView({ wizard, onBack, onRestart }: DashboardViewProps) {
  const html = useMemo(() => {
    _calcCount++
    const callId = _calcCount
    console.group('[DIAG] DashboardView.useMemo calculate() #' + callId)
    console.log('answers:', JSON.parse(JSON.stringify(wizard.answers)))
    try {
      const result = wizard.calculate()
      console.log('result length:', result?.length ?? 0)
      console.log('result preview:', result?.substring?.(0, 200) ?? '(empty)')
      console.groupEnd()
      return result || '<p class="text-muted-foreground">El motor no genero contenido. Verifique los datos.</p>'
    } catch (e: unknown) {
      console.error('[DIAG] EXCEPCION en calculate() #' + callId + ':', e)
      if (e instanceof Error) {
        console.error('[DIAG] Stack:', e.stack)
      }
      console.groupEnd()
      const errMsg = e instanceof Error ? e.message : String(e)
      return '<p class="text-destructive">Error al generar el calculo: ' + errMsg + '</p>'
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
            Cálculo en base a los datos ingresados
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
            Nuevo cálculo
          </Button>
        </div>
      </motion.header>

      <div className="mt-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease, delay: 0.1 }}
          className="rounded-2xl border border-border bg-card p-6 md:p-10"
        >
          <div
            className="prose prose-sm max-w-none prose-headings:font-serif prose-headings:text-foreground prose-headings:tracking-tight prose-p:text-muted-foreground prose-strong:text-foreground prose-table:w-full prose-td:px-3 prose-td:py-2 prose-th:px-3 prose-th:py-2 prose-th:text-left prose-th:font-mono prose-th:text-[11px] prose-th:uppercase prose-th:tracking-wider prose-th:text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </motion.div>
      </div>
    </div>
  )
}