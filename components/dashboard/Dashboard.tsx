"use client"

import { useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import type { CalculoResultado, Rango, SegundaInstanciaRol } from "@/lib/legal/types"
import { CaratulaCaso, type CaratulaCasoProps } from "./CaratulaCaso"
import { HonorariosBand } from "./HonorariosBand"
import { SegundaInstanciaBand } from "./SegundaInstanciaBand"
import { CadenaCalculo } from "./CadenaCalculo"
import { AuxiliaresSection } from "./AuxiliaresSection"
import { PartidorSection } from "./PartidorSection"
import { ExhortoResult } from "./ExhortoResult"
import { IncidenteResult } from "./IncidenteResult"
import { Segmented } from "./primitives"

type RolKey = "patrocinante" | "apoderado" | "procurador"

const ROL_LABEL: Record<RolKey, string> = {
  patrocinante: "Patrocinante",
  apoderado: "Apoderado",
  procurador: "Procurador",
}

const ROL_NOTA: Record<RolKey, string> = {
  patrocinante:
    "Honorario del letrado patrocinante: es el que sale directamente de la escala.",
  apoderado:
    "El apoderado percibe un 40% mas que el patrocinante por la gestion del mandato (art. 20).",
  procurador:
    "El procurador percibe el 40% de lo que corresponde al patrocinante (art. 20).",
}

interface DashboardProps extends Omit<CaratulaCasoProps, "tipoProceso" | "esProvisorio" | "valorUMA"> {
  resultado: CalculoResultado
}

export function Dashboard({ resultado, ...caratula }: DashboardProps) {
  const [rol, setRol] = useState<RolKey>("patrocinante")

  if (resultado.tipoProceso === "exhorto") {
    return <ExhortoResult resultado={resultado} />
  }
  if (resultado.tipoProceso === "incidente") {
    return <IncidenteResult resultado={resultado} />
  }

  return (
    <DashboardGeneral
      resultado={resultado}
      caratula={caratula}
      rol={rol}
      setRol={setRol}
    />
  )
}

function DashboardGeneral({
  resultado,
  caratula,
  rol,
  setRol,
}: {
  resultado: CalculoResultado
  caratula: Omit<CaratulaCasoProps, "tipoProceso" | "esProvisorio" | "valorUMA">
  rol: RolKey
  setRol: (r: RolKey) => void
}) {
  const { patrocinante, apoderado, procurador } = resultado.honorarios

  const rolesDisponibles = useMemo(() => {
    const out: RolKey[] = ["patrocinante"]
    if ((apoderado?.rango?.maxPesos ?? 0) > 0) out.push("apoderado")
    if ((procurador?.rango?.maxPesos ?? 0) > 0) out.push("procurador")
    return out
  }, [apoderado, procurador])

  const rangoPorRol: Record<RolKey, Rango> = {
    patrocinante: patrocinante.rango,
    apoderado: apoderado.rango,
    procurador: procurador.rango,
  }

  const rango = rangoPorRol[rol] ?? patrocinante.rango
  const segunda: SegundaInstanciaRol | undefined = resultado.segundaInstancia?.[rol]

  const selectorRol =
    rolesDisponibles.length > 1 ? (
      <Segmented
        ariaLabel="Rol profesional"
        value={rol}
        onChange={setRol}
        options={rolesDisponibles.map((r) => ({ value: r, label: ROL_LABEL[r] }))}
      />
    ) : null

  return (
    <div className="space-y-4">
      <CaratulaCaso
        {...caratula}
        tipoProceso={resultado.tipoProceso}
        esProvisorio={resultado.esProvisorio}
        valorUMA={resultado.valorUMA}
        transformaciones={resultado.transformaciones}
      />

      <HonorariosBand
        rango={rango}
        rolLabel={ROL_LABEL[rol]}
        esProvisorio={resultado.esProvisorio}
        notaRol={ROL_NOTA[rol]}
      >
        {selectorRol}
      </HonorariosBand>

      {segunda ? (
        <SegundaInstanciaBand
          valores={segunda}
          rolLabel={ROL_LABEL[rol]}
          esProvisorio={resultado.esProvisorio}
        >
          <span className="font-mono text-[10px] uppercase tracking-wider text-faint">
            {ROL_LABEL[rol]}
          </span>
        </SegundaInstanciaBand>
      ) : null}

      <CadenaCalculo
        baseOriginal={resultado.baseOriginal}
        baseFinal={resultado.baseFinal}
        valorUMA={resultado.valorUMA}
        escala={resultado.escala}
        transformaciones={resultado.transformaciones}
        rango={rango}
        patrocinante={patrocinante.rango}
        rolLabel={ROL_LABEL[rol]}
        notaRol={ROL_NOTA[rol]}
        esProvisorio={resultado.esProvisorio}
      />

      <div
        className={cn(
          "grid gap-4",
          resultado.partidor ? "lg:grid-cols-2" : "grid-cols-1",
        )}
      >
        {resultado.auxiliares ? (
          <AuxiliaresSection
            rango={resultado.auxiliares}
            esProvisorio={resultado.esProvisorio}
          />
        ) : null}
        {resultado.partidor ? (
          <PartidorSection
            partidor={resultado.partidor}
            esProvisorio={resultado.esProvisorio}
          />
        ) : null}
      </div>
    </div>
  )
}
