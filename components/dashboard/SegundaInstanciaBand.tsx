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
import { Cifra, Disclosure, EncabezadoSeccion, EnUMA, Tile } from "./primitives"

interface SegundaInstanciaBandProps {
  valores: SegundaInstanciaRol
  rolLabel: string
  esProvisorio: boolean
  children?: ReactNode
}

function Valor({ pesos, uma }: { pesos: number; uma: number }) {
  return (
    <>
      <Cifra value={pesos} size="lg" className="text-foreground" />
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
      <EncabezadoSeccion titulo="Segunda instancia" articulo="art. 30" sujeto="propio">
        {children}
      </EncabezadoSeccion>

      {/*
        Los tres recuadros van iguales. El 40 % de la revocada estuvo
        destacado hasta el 24/8/2026, por ser el tope posible, y se
        quito: con la seccion ya marcada como del mismo sujeto que la
        primera instancia, ese realce competia con la marca en vez de
        sumarle. Dos jerarquias encimadas no son una jerarquia.
      */}
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
