"use client"

import type { Rango } from "@/lib/legal/types"
import { Cifra, Disclosure, EnUMA, Tile } from "./primitives"

interface AuxiliaresSectionProps {
  rango: Rango
  esProvisorio?: boolean
}

export function AuxiliaresSection({ rango, esProvisorio }: AuxiliaresSectionProps) {
  return (
    <section>
      <div className="flex items-baseline gap-2.5 pb-3">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground">
          Auxiliares de justicia
        </h2>
        <span className="font-mono text-[10px] uppercase tracking-wider text-faint">
          art. 21
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Tile
          etiqueta="Minimo · 5%"
          valor={
            <Cifra value={rango.minPesos} size="xl" className="text-value-min" />
          }
          sub={<EnUMA value={rango.minUMA} />}
        />
        {!esProvisorio && (
          <Tile
            etiqueta="Maximo · 10%"
            valor={
              <Cifra value={rango.maxPesos} size="xl" className="text-value-max" />
            }
            sub={<EnUMA value={rango.maxUMA} />}
          />
        )}
      </div>

      <div className="mt-1 px-1">
        <Disclosure concepto="Entre el 5% y el 10% de la base regulatoria">
          <p>
            Alcanza a peritos y demas auxiliares que intervienen en el proceso.
            No incluye las pautas de las leyes especiales que reglamentan cada
            actividad profesional, ni a administradores, interventores,
            liquidadores, arbitros o mediadores, que tienen regimen propio
            (art. 32).
          </p>
        </Disclosure>
      </div>
    </section>
  )
}
