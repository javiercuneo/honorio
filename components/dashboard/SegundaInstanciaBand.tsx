"use client"

// ---------------------------------------------------------------
// Segunda instancia (art. 30) como seccion propia: quien revisa una
// regulacion en camara entra al dashboard buscando exactamente estos
// tres numeros.
//
// Los rotulos nombran el resultado procesal, no la posicion en una
// tabla, y la base de calculo se dice una sola vez para las tres.
// ---------------------------------------------------------------

import type { ReactNode } from "react"
import type { SegundaInstanciaRol } from "@/lib/legal/types"
import { Cifra, Disclosure, EnUMA, Tile } from "./primitives"

interface SegundaInstanciaBandProps {
  valores: SegundaInstanciaRol
  rolLabel: string
  esProvisorio: boolean
  children?: ReactNode
}

function Valor({ pesos, uma }: { pesos: number; uma: number }) {
  return (
    <>
      <Cifra value={pesos} size="xl" className="text-foreground" />
      <div className="mt-1.5 font-mono text-[11px] text-faint">
        <EnUMA value={uma} />
      </div>
    </>
  )
}

export function SegundaInstanciaBand({
  valores,
  rolLabel,
  esProvisorio,
  children,
}: SegundaInstanciaBandProps) {
  return (
    <section>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 pb-3">
        <div className="flex items-baseline gap-2.5">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground">
            Segunda instancia
          </h2>
          <span className="font-mono text-[10px] uppercase tracking-wider text-faint">
            art. 30
          </span>
        </div>
        {children}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Tile
          etiqueta="Confirmada · 30%"
          valor={
            <Valor
              pesos={valores.minimo.minPesos}
              uma={valores.minimo.minUMA}
            />
          }
        />
        {!esProvisorio && (
          <>
            <Tile
              etiqueta="Confirmada · 35%"
              valor={
                <Valor
                  pesos={valores.maximo.maxPesos}
                  uma={valores.maximo.maxUMA}
                />
              }
            />
            <Tile
              destacado
              etiqueta="Revocada · 40%"
              valor={
                <Valor
                  pesos={valores.revocada.maxPesos}
                  uma={valores.revocada.maxUMA}
                />
              }
            />
          </>
        )}
      </div>

      <div className="mt-1 px-1">
        <Disclosure concepto="Se calculan sobre lo regulado en primera instancia">
          <p>
            El art. 30 fija los honorarios de alzada como un porcentaje de lo
            regulado en primera instancia, no de la base regulatoria: el minimo
            toma el 30% del piso y el maximo el 35% del techo del{" "}
            {rolLabel.toLowerCase()}. Si la camara revoca totalmente la
            sentencia apelada, ese tope sube al 40%. Cualquier reduccion
            aplicada en primera instancia ya viene arrastrada en estos importes.
          </p>
        </Disclosure>
      </div>
    </section>
  )
}
