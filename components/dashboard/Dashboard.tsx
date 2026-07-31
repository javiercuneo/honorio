import type { CalculoResultado, Rango, Transformacion, SegundaInstanciaRol } from "@/lib/legal/types"
import { ResumenCalculo } from "./ResumenCalculo"
import { NormativaStrip } from "./NormativaStrip"
import { PanelControlHonorarios } from "./PanelControlHonorarios"
import { AuxiliaresSection } from "./AuxiliaresSection"
import { PartidorSection } from "./PartidorSection"
import { ExhortoResult } from "./ExhortoResult"
import { IncidenteResult } from "./IncidenteResult"

interface DashboardProps {
  resultado: CalculoResultado
  modoTerminacion?: string
  sentenciaResultado?: string
  objetoBase?: string
  tuvoExcepciones?: string
  sucesionUnicoLetrado?: string
  medidaOposicion?: string
  homologacionVivienda?: string
  caducidadCriterio?: string
  aperturaPrueba?: string
  desalojoVivienda?: string
  posesoriasTipo?: string
}

interface RoleInput {
  rol: "patrocinante" | "apoderado" | "procurador"
  label: string
  rango: Rango
  transformaciones: Transformacion[]
  segundaInstancia: SegundaInstanciaRol | undefined
}

export function Dashboard({ resultado, modoTerminacion, sentenciaResultado, objetoBase, tuvoExcepciones, sucesionUnicoLetrado, medidaOposicion, homologacionVivienda, caducidadCriterio, aperturaPrueba, desalojoVivienda, posesoriasTipo }: DashboardProps) {
  if (resultado.tipoProceso === "exhorto") {
    return <ExhortoResult resultado={resultado} />
  }
  if (resultado.tipoProceso === "incidente") {
    return <IncidenteResult resultado={resultado} />
  }

  const { patrocinante, apoderado, procurador } = resultado.honorarios
  const hasApoderado = (apoderado?.rango?.maxPesos ?? 0) > 0

  const roles: RoleInput[] = [
    {
      rol: "patrocinante",
      label: "Patrocinante",
      rango: patrocinante.rango,
      transformaciones: resultado.transformaciones.filter(
        (t) => t.visible && (t.id.includes("patrocinante") || t.etapa !== "base")
      ),
      segundaInstancia: resultado.segundaInstancia?.patrocinante,
    },
  ]

  if (hasApoderado) {
    roles.push({
      rol: "apoderado",
      label: "Apoderado",
      rango: apoderado.rango,
      transformaciones: resultado.transformaciones.filter(
        (t) => t.visible && (t.id.includes("apoderado") || t.etapa !== "base")
      ),
      segundaInstancia: resultado.segundaInstancia?.apoderado,
    })
  }

  if (procurador?.rango) {
    roles.push({
      rol: "procurador",
      label: "Procurador",
      rango: procurador.rango,
      transformaciones: resultado.transformaciones.filter(
        (t) => t.visible && (t.id.includes("procurador") || t.etapa !== "base")
      ),
      segundaInstancia: resultado.segundaInstancia?.procurador,
    })
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <ResumenCalculo
        tipoProceso={resultado.tipoProceso}
        modoTerminacion={modoTerminacion}
        sentenciaResultado={sentenciaResultado}
        esProvisorio={resultado.esProvisorio}
        objetoBase={objetoBase}
        baseOriginal={resultado.baseOriginal}
        baseFinal={resultado.baseFinal}
        valorUMA={resultado.valorUMA}
        tuvoExcepciones={tuvoExcepciones}
        sucesionUnicoLetrado={sucesionUnicoLetrado}
        medidaOposicion={medidaOposicion}
        homologacionVivienda={homologacionVivienda}
        caducidadCriterio={caducidadCriterio}
        aperturaPrueba={aperturaPrueba}
        desalojoVivienda={desalojoVivienda}
        posesoriasTipo={posesoriasTipo}
        escala={resultado.escala}
        transformaciones={resultado.transformaciones}
      />

      <PanelControlHonorarios roles={roles} esProvisorio={resultado.esProvisorio} />

      {resultado.partidor && (
        <PartidorSection partidor={resultado.partidor} esProvisorio={resultado.esProvisorio} />
      )}

      {resultado.auxiliares && (
        <AuxiliaresSection rango={resultado.auxiliares} esProvisorio={resultado.esProvisorio} />
      )}
    </div>
  )
}