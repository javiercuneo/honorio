"use client"

import { useMemo, useState } from "react"
import type { CalculoResultado, Rango, SegundaInstanciaRol } from "@/lib/legal/types"
import { pct } from "./format"
import { derivarCadena } from "./cadena"
import { ChipsCaso, type ChipsCasoProps } from "./ChipsCaso"
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
    "Es el honorario que sale directamente de la escala del art. 21.",
  apoderado:
    "El art. 20 reconoce al apoderado un 40% mas que al patrocinante por la gestion del mandato. Se aplica sobre el honorario ya reducido, al final de la cadena.",
  procurador:
    "El art. 20 fija el honorario del procurador en el 40% de lo que corresponde al patrocinante. Se aplica sobre el honorario ya reducido, al final de la cadena.",
}

type DashboardProps = Omit<ChipsCasoProps, "tipoProceso" | "valorUMA" | "transformaciones"> & {
  resultado: CalculoResultado
}

export function Dashboard({ resultado, ...caso }: DashboardProps) {
  const [rol, setRol] = useState<RolKey>("patrocinante")

  if (resultado.tipoProceso === "exhorto") {
    return <ExhortoResult resultado={resultado} />
  }
  if (resultado.tipoProceso === "incidente") {
    return <IncidenteResult resultado={resultado} />
  }

  return (
    <DashboardGeneral resultado={resultado} caso={caso} rol={rol} setRol={setRol} />
  )
}

function DashboardGeneral({
  resultado,
  caso,
  rol,
  setRol,
}: {
  resultado: CalculoResultado
  caso: Omit<ChipsCasoProps, "tipoProceso" | "valorUMA" | "transformaciones">
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
  const escala = resultado.escala

  const cadena = derivarCadena({
    transformaciones: resultado.transformaciones,
    final: rango,
    patrocinante: patrocinante.rango,
    escala,
    baseFinal: resultado.baseFinal,
  })

  // En provisorios solo rige el minimo: nombrar el maximo seria enunciar
  // un tope que este calculo no esta afirmando.
  const alicuota = escala
    ? resultado.esProvisorio
      ? pct(escala.porcentajeMin)
      : `${pct(escala.porcentajeMin)} a ${pct(escala.porcentajeMax)}`
    : ""

  // Lo que arroja leer la alicuota del tramo como si fuera directa sobre
  // la base. Solo tiene sentido mostrarlo cuando difiere del resultado:
  // en el primer tramo de la escala ambos coinciden y la frase mentiria.
  const ingenuoBruto = escala
    ? (resultado.baseFinal * escala.porcentajeMin) / 100
    : 0
  const ingenuo =
    escala &&
    escala.escalera &&
    Math.abs(ingenuoBruto - rango.minPesos) / Math.max(1, rango.minPesos) > 0.01
      ? ingenuoBruto
      : null

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
    <div className="space-y-8">
      <HonorariosBand
        rango={rango}
        rolLabel={ROL_LABEL[rol]}
        esProvisorio={resultado.esProvisorio}
        escala={escala}
        cadena={cadena}
        valorUMA={resultado.valorUMA}
        alicuota={alicuota}
        ingenuo={ingenuo}
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
        escala={escala}
        cadena={cadena}
        rango={rango}
        rolLabel={ROL_LABEL[rol]}
        notaRol={ROL_NOTA[rol]}
        alicuota={alicuota}
        esProvisorio={resultado.esProvisorio}
      >
        <ChipsCaso
          {...caso}
          tipoProceso={resultado.tipoProceso}
          valorUMA={resultado.valorUMA}
          transformaciones={resultado.transformaciones}
        />
      </CadenaCalculo>

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
  )
}
