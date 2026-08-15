'use client'

import { useMemo } from "react"
import { motion } from "motion/react"
import { ArrowLeft, RotateCcw, FileSpreadsheet } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { UseWizardReturn } from "@/hooks/useWizard"
import { calcularResultadoEstructurado } from "@/lib/legal/adapters"
import { Dashboard } from "@/components/dashboard/Dashboard"
import { Firma } from "@/components/dashboard/Firma"
import { BotonImprimir, HOJA_PROPS } from "@/components/dashboard/imprimir"
import { BotonCompartir } from "@/components/dashboard/compartir"
import { PROCESO_LABEL, SENTENCIA_LABEL, EXCEPCIONES_LABEL } from "@/components/dashboard/format"
import { SinIA } from "@/components/dashboard/primitives"
import { AppTopbar } from "./app-topbar"

const ease = [0.22, 1, 0.36, 1] as const

type DashboardViewProps = {
  wizard: UseWizardReturn
  onBack: () => void
  onRestart: () => void
  onShowMinimos: () => void
}

export function DashboardView({ wizard, onBack, onRestart, onShowMinimos }: DashboardViewProps) {
  const datos = useMemo(() => {
    try {
      wizard.calculate()
      const a = wizard.answers
      return {
        resultado: calcularResultadoEstructurado(),
        modoTerminacion: a.modoTerminacion as string | undefined,
        sentenciaResultado: a.sentenciaResultado as string | undefined,
        objetoBase: a.objeto as string | undefined,
        tuvoExcepciones: a.tuvoExcepciones as string | undefined,
        sucesionUnicoLetrado: a.sucesionUnicoLetrado as string | undefined,
        medidaOposicion: a.medidaOposicion as string | undefined,
        homologacionVivienda: a.homologacionVivienda as string | undefined,
        caducidadCriterio: a.caducidadCriterio as string | undefined,
        aperturaPrueba: a.aperturaPrueba as string | undefined,
        desalojoVivienda: a.desalojoVivienda as string | undefined,
        posesoriasTipo: a.posesoriasTipo as string | undefined,
      }
    } catch {
      return null
    }
  }, [wizard])

  const resultado = datos?.resultado ?? null

  // Identificacion del caso en una linea, para la topbar.
  const caso = resultado
    ? [
        PROCESO_LABEL[resultado.tipoProceso] ?? resultado.tipoProceso,
        datos?.sentenciaResultado
          ? SENTENCIA_LABEL[datos.sentenciaResultado]
          : null,
        datos?.tuvoExcepciones
          ? EXCEPCIONES_LABEL[datos.tuvoExcepciones]
          : null,
        resultado.esProvisorio ? 'Provisorio' : null,
      ]
        .filter(Boolean)
        .join(' · ')
    : undefined

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppTopbar caso={caso}>
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="h-8 px-2.5 text-[13px] text-muted-foreground"
        >
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
          Revisar
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onShowMinimos}
          className="h-8 px-2.5 text-[13px] text-muted-foreground"
        >
          <FileSpreadsheet className="mr-1.5 h-3.5 w-3.5" />
          Minimos
        </Button>
        <BotonCompartir answers={wizard.answers} />
        <BotonImprimir />
        <Button variant="outline" size="sm" onClick={onRestart} className="h-8 text-[13px]">
          <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
          Nuevo cálculo
        </Button>
      </AppTopbar>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
        className="mx-auto max-w-5xl px-6 pb-24 pt-8 md:px-8"
        {...HOJA_PROPS}
      >
        {/* En pantalla la cabecera dice de que se trata; en papel la
            cabecera no va, asi que el titulo lo pone el informe. */}
        <div className="hidden print:mb-6 print:block">
          <p className="font-meter text-[17px] font-semibold uppercase tracking-[0.06em]">
            Honorio
          </p>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.12em]">
            Cálculo de honorarios · Ley 27.423{caso ? ' · ' + caso : ''}
          </p>
        </div>

        {/* Arriba del numero y no al pie: la pregunta por la IA aparece
            mirando el resultado, no al entrar. */}
        <SinIA className="mb-5" />

        {resultado && datos ? (
          <Dashboard
            resultado={resultado}
            modoTerminacion={datos.modoTerminacion}
            sentenciaResultado={datos.sentenciaResultado}
            objetoBase={datos.objetoBase}
            tuvoExcepciones={datos.tuvoExcepciones}
            sucesionUnicoLetrado={datos.sucesionUnicoLetrado}
            medidaOposicion={datos.medidaOposicion}
            homologacionVivienda={datos.homologacionVivienda}
            caducidadCriterio={datos.caducidadCriterio}
            aperturaPrueba={datos.aperturaPrueba}
            desalojoVivienda={datos.desalojoVivienda}
            posesoriasTipo={datos.posesoriasTipo}
          />
        ) : (
          <div className="rounded-lg border border-border bg-card p-10 text-center">
            <p className="text-[13px] text-muted-foreground">
              No se pudo generar el cálculo. Revise los datos ingresados.
            </p>
          </div>
        )}

        {resultado ? <Firma answers={wizard.answers} /> : null}
      </motion.div>
    </div>
  )
}
