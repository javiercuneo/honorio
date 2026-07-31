import type { Partidor } from "@/lib/legal/types"
import { umaNum, pct } from "./format"
import { Card, CardHeader, Cifra, Etiqueta } from "./primitives"

interface PartidorSectionProps {
  partidor: Partidor
  esProvisorio?: boolean
}

export function PartidorSection({ partidor, esProvisorio }: PartidorSectionProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader titulo="Partidor" articulo="art. 35" />

      <div className="grid flex-1 divide-y divide-hair sm:grid-cols-2 sm:divide-x sm:divide-y-0">
        <div className="px-6 py-5">
          <Etiqueta>Minimo · {pct(partidor.minPorcentaje)}</Etiqueta>
          <div className="mt-2">
            <Cifra value={partidor.minPesos} size="lg" className="text-value-min" />
          </div>
          <div className="mt-1 font-mono text-[10px] tabular-nums text-faint">
            {umaNum(partidor.minUMA)}
            <span className="ml-1 tracking-wider">UMA</span>
          </div>
        </div>

        {!esProvisorio && (
          <div className="px-6 py-5">
            <Etiqueta>Maximo · {pct(partidor.maxPorcentaje)}</Etiqueta>
            <div className="mt-2">
              <Cifra value={partidor.maxPesos} size="lg" className="text-value-max" />
            </div>
            <div className="mt-1 font-mono text-[10px] tabular-nums text-faint">
              {umaNum(partidor.maxUMA)}
              <span className="ml-1 tracking-wider">UMA</span>
            </div>
          </div>
        )}
      </div>

      <p className="border-t border-hair px-6 py-3 text-[12px] leading-relaxed text-faint">
        Honorario del partidor en la sucesion: entre el {pct(partidor.minPorcentaje)} y el{" "}
        {pct(partidor.maxPorcentaje)} de la base regulatoria.
      </p>
    </Card>
  )
}
