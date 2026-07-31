'use client'

import { useMemo } from "react"
import { motion } from "motion/react"
import { ArrowLeft, RotateCcw, FileSpreadsheet } from "lucide-react"
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
  const { resultado, modoTerminacion, sentenciaResultado, objetoBase, tuvoExcepciones, sucesionUnicoLetrado, medidaOposicion, homologacionVivienda, caducidadCriterio, aperturaPrueba, desalojoVivienda, posesoriasTipo } = useMemo(() => {
    try {
      wizard.calculate()
      const result = calcularResultadoEstructurado()
      return {
        resultado: result,
        modoTerminacion: wizard.answers.modoTerminacion as string | undefined,
        sentenciaResultado: wizard.answers.sentenciaResultado as string | undefined,
        objetoBase: wizard.answers.objeto as string | undefined,
        tuvoExcepciones: wizard.answers.tuvoExcepciones as string | undefined,
        sucesionUnicoLetrado: wizard.answers.sucesionUnicoLetrado as string | undefined,
        medidaOposicion: wizard.answers.medidaOposicion as string | undefined,
        homologacionVivienda: wizard.answers.homologacionVivienda as string | undefined,
        caducidadCriterio: wizard.answers.caducidadCriterio as string | undefined,
        aperturaPrueba: wizard.answers.aperturaPrueba as string | undefined,
        desalojoVivienda: wizard.answers.desalojoVivienda as string | undefined,
        posesoriasTipo: wizard.answers.posesoriasTipo as string | undefined,
      }
    } catch {
      return { resultado: null, modoTerminacion: undefined, sentenciaResultado: undefined }
    }
  }, [wizard])

  return (
    <div className="mx-auto max-w-5xl px-5 pb-20 md:px-8">
      {/* La caratula del caso es el titulo de la pantalla: aca solo van
          las acciones, en una barra discreta. */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease }}
        className="flex flex-wrap items-center justify-between gap-3 py-5"
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-faint">
          Resultado del calculo
        </span>
        <div className="flex shrink-0 flex-wrap items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="h-9 text-muted-foreground"
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Revisar respuestas
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onShowMinimos}
            className="h-9 text-muted-foreground"
          >
            <FileSpreadsheet className="mr-1.5 h-3.5 w-3.5" />
            Minimos
          </Button>
          <Button variant="outline" size="sm" onClick={onRestart} className="h-9">
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            Nuevo calculo
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease, delay: 0.06 }}
      >
        {resultado ? (
          <Dashboard
            resultado={resultado}
            modoTerminacion={modoTerminacion}
            sentenciaResultado={sentenciaResultado}
            objetoBase={objetoBase}
            tuvoExcepciones={tuvoExcepciones}
            sucesionUnicoLetrado={sucesionUnicoLetrado}
            medidaOposicion={medidaOposicion}
            homologacionVivienda={homologacionVivienda}
            caducidadCriterio={caducidadCriterio}
            aperturaPrueba={aperturaPrueba}
            desalojoVivienda={desalojoVivienda}
            posesoriasTipo={posesoriasTipo}
          />
        ) : (
          <div className="rounded-lg border border-border bg-card p-10 text-center">
            <p className="text-[13px] text-muted-foreground">
              No se pudo generar el calculo. Revise los datos ingresados.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  )
}
