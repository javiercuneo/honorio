"use client"

import type { Partidor } from "@/lib/legal/types"
import { pct } from "./format"
import { Cifra, Disclosure, EnUMA, Tile } from "./primitives"

interface PartidorSectionProps {
  partidor: Partidor
  esProvisorio?: boolean
}

export function PartidorSection({ partidor, esProvisorio }: PartidorSectionProps) {
  return (
    <section>
      <div className="flex items-baseline gap-2.5 pb-3">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground">
          Partidor
        </h2>
        <span className="font-mono text-[10px] uppercase tracking-wider text-faint">
          art. 35
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Tile
          etiqueta={`Minimo · ${pct(partidor.minPorcentaje)}`}
          valor={
            <Cifra value={partidor.minPesos} size="xl" className="text-value-min" />
          }
          sub={<EnUMA value={partidor.minUMA} />}
        />
        {!esProvisorio && (
          <Tile
            etiqueta={`Maximo · ${pct(partidor.maxPorcentaje)}`}
            valor={
              <Cifra value={partidor.maxPesos} size="xl" className="text-value-max" />
            }
            sub={<EnUMA value={partidor.maxUMA} />}
          />
        )}
      </div>

      <div className="mt-1 px-1">
        <Disclosure concepto="Entre el 2% y el 3% de la base regulatoria">
          <p>
            Honorario del partidor designado en la sucesion, por la cuenta
            particionaria. Se calcula sobre la misma base que el resto de la
            regulacion, con independencia de lo que perciban los letrados.
          </p>
        </Disclosure>
      </div>
    </section>
  )
}
