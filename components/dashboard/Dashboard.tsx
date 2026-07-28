import type { CalculoResultado } from "@/lib/legal/types"
import { ResumenCalculo } from "./ResumenCalculo"
import { EscalaIndicator } from "./EscalaIndicator"
import { NormativaStrip } from "./NormativaStrip"
import { ProfessionalCard } from "./ProfessionalCard"
import { AuxiliaresSection } from "./AuxiliaresSection"

interface DashboardProps {
  resultado: CalculoResultado
  modoTerminacion?: string
  sentenciaResultado?: string
  objetoBase?: string
}

export function Dashboard({ resultado, modoTerminacion, sentenciaResultado, objetoBase }: DashboardProps) {
  const { patrocinante, apoderado, procurador } = resultado.honorarios
  const hasApoderado = (apoderado?.rango?.maxPesos ?? 0) > 0

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="grid gap-5 md:grid-cols-2 md:items-stretch">
        <ResumenCalculo
          tipoProceso={resultado.tipoProceso}
          modoTerminacion={modoTerminacion}
          sentenciaResultado={sentenciaResultado}
          esProvisorio={resultado.esProvisorio}
          objetoBase={objetoBase}
          baseOriginal={resultado.baseOriginal}
          baseFinal={resultado.baseFinal}
          valorUMA={resultado.valorUMA}
        />

        {resultado.escala && (
          <EscalaIndicator escala={resultado.escala} />
        )}
      </div>

      <NormativaStrip transformaciones={resultado.transformaciones} />

      <ProfessionalCard
        rol="patrocinante"
        label="Patrocinante"
        rango={patrocinante.rango}
        transformaciones={resultado.transformaciones.filter(
          (t) => t.visible && (t.id.includes("patrocinante") || t.etapa !== "base")
        )}
        segundaInstancia={resultado.segundaInstancia?.patrocinante}
      />

      {(hasApoderado || procurador?.rango) && (
        <div className="grid gap-5 md:grid-cols-2">
          {hasApoderado && (
            <ProfessionalCard
              rol="apoderado"
              label="Apoderado"
              rango={apoderado.rango}
              transformaciones={resultado.transformaciones.filter(
                (t) => t.visible && (t.id.includes("apoderado") || t.etapa !== "base")
              )}
              segundaInstancia={resultado.segundaInstancia?.apoderado}
            />
          )}
          {procurador?.rango && (
            <ProfessionalCard
              rol="procurador"
              label="Procurador"
              rango={procurador.rango}
              transformaciones={resultado.transformaciones.filter(
                (t) => t.visible && (t.id.includes("procurador") || t.etapa !== "base")
              )}
              segundaInstancia={resultado.segundaInstancia?.procurador}
            />
          )}
        </div>
      )}

      {resultado.auxiliares && (
        <AuxiliaresSection rango={resultado.auxiliares} />
      )}
    </div>
  )
}
