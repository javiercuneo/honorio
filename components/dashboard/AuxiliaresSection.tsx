import type { Rango } from "@/lib/legal/types"
import { umaNum } from "./format"
import { Card, CardHeader, Cifra, Etiqueta } from "./primitives"

interface AuxiliaresSectionProps {
  rango: Rango
  esProvisorio?: boolean
}

export function AuxiliaresSection({ rango, esProvisorio }: AuxiliaresSectionProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader titulo="Auxiliares de justicia" articulo="art. 21" />

      <div className="grid flex-1 divide-y divide-hair sm:grid-cols-2 sm:divide-x sm:divide-y-0">
        <div className="px-6 py-5">
          <Etiqueta>Minimo · 5%</Etiqueta>
          <div className="mt-2">
            <Cifra value={rango.minPesos} size="lg" className="text-value-min" />
          </div>
          <div className="mt-1 font-mono text-[10px] tabular-nums text-faint">
            {umaNum(rango.minUMA)}
            <span className="ml-1 tracking-wider">UMA</span>
          </div>
        </div>

        {!esProvisorio && (
          <div className="px-6 py-5">
            <Etiqueta>Maximo · 10%</Etiqueta>
            <div className="mt-2">
              <Cifra value={rango.maxPesos} size="lg" className="text-value-max" />
            </div>
            <div className="mt-1 font-mono text-[10px] tabular-nums text-faint">
              {umaNum(rango.maxUMA)}
              <span className="ml-1 tracking-wider">UMA</span>
            </div>
          </div>
        )}
      </div>

      <p className="border-t border-hair px-6 py-3 text-[12px] leading-relaxed text-faint">
        Peritos y demas auxiliares: entre el 5% y el 10% de la base regulatoria.
        No incluye las pautas de las leyes especiales de cada profesion.
      </p>
    </Card>
  )
}
