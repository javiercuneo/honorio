"use client"

// ---------------------------------------------------------------
// Segunda instancia (art. 30) como seccion propia, no como un
// desplegable de primera instancia: quien revisa una regulacion en
// camara entra al dashboard buscando exactamente estos tres numeros.
// ---------------------------------------------------------------

import type { ReactNode } from "react"
import type { SegundaInstanciaRol } from "@/lib/legal/types"
import { umaNum } from "./format"
import { Card, CardHeader, Cifra, Etiqueta } from "./primitives"

interface SegundaInstanciaBandProps {
  valores: SegundaInstanciaRol
  rolLabel: string
  esProvisorio: boolean
  children?: ReactNode
}

function Tier({
  etiqueta,
  detalle,
  pesos,
  uma,
  destacado,
}: {
  etiqueta: string
  detalle: string
  pesos: number
  uma: number
  destacado?: boolean
}) {
  return (
    <div className="px-6 py-5">
      <Etiqueta>{etiqueta}</Etiqueta>
      <div className="mt-2">
        <Cifra
          value={pesos}
          size="lg"
          className={destacado ? "text-value-max" : "text-value-min"}
        />
      </div>
      <div className="mt-1 font-mono text-[10px] tabular-nums text-faint">
        {umaNum(uma, 4)}
        <span className="ml-1 tracking-wider">UMA</span>
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-faint">{detalle}</p>
    </div>
  )
}

export function SegundaInstanciaBand({
  valores,
  rolLabel,
  esProvisorio,
  children,
}: SegundaInstanciaBandProps) {
  return (
    <Card>
      <CardHeader titulo="Honorarios · segunda instancia" articulo="art. 30">
        {children}
      </CardHeader>

      <div className="grid divide-y divide-hair sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <Tier
          etiqueta="Minimo · 30%"
          detalle={`30% del minimo regulado en primera instancia al ${rolLabel.toLowerCase()}.`}
          pesos={valores.minimo.minPesos}
          uma={valores.minimo.minUMA}
        />
        {!esProvisorio && (
          <>
            <Tier
              etiqueta="Maximo · 35%"
              detalle="35% del maximo regulado en primera instancia."
              pesos={valores.maximo.maxPesos}
              uma={valores.maximo.maxUMA}
            />
            <Tier
              etiqueta="Sentencia revocada · 40%"
              detalle="Tope elevado al 40% cuando la alzada revoca totalmente la sentencia apelada."
              pesos={valores.revocada.maxPesos}
              uma={valores.revocada.maxUMA}
              destacado
            />
          </>
        )}
      </div>

      <p className="border-t border-hair px-6 py-3 text-[12px] leading-relaxed text-faint">
        Los honorarios de alzada se calculan sobre lo regulado en primera
        instancia, no sobre la base regulatoria. Si en primera instancia hubo
        reducciones, estas ya vienen arrastradas en estos importes.
      </p>
    </Card>
  )
}
