import { pesos, umaNum, pct } from "./format"
import type { CalculoResultado } from "@/lib/legal/types"
import { Card, CardHeader, Cifra, Etiqueta } from "./primitives"

interface IncidenteResultProps {
  resultado: CalculoResultado
}

export function IncidenteResult({ resultado }: IncidenteResultProps) {
  const inc = resultado.incidente
  const rango = resultado.honorarios.patrocinante.rango
  if (!inc) return null

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader titulo="Incidente" articulo="art. 29 inc. g">
          <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
            <span className="tracking-wider text-faint">Base</span>{" "}
            {pesos(resultado.baseFinal)}
            <span className="mx-2 text-faint">·</span>
            <span className="tracking-wider text-faint">UMA</span>{" "}
            {pesos(resultado.valorUMA)}
          </span>
        </CardHeader>

        <div className="grid divide-y divide-hair sm:grid-cols-2 sm:divide-x sm:divide-y-0">
          <div className="px-6 py-5">
            <Etiqueta>Mínimo · {pct(inc.porcentajeMin)}</Etiqueta>
            <div className="mt-2">
              <Cifra
                value={rango.minPesos}
                size="hero"
                className="text-value-min"
              />
            </div>
            <div className="mt-1.5 font-mono text-[11px] tabular-nums text-faint">
              {umaNum(rango.minUMA, 4)}
              <span className="ml-1 tracking-wider">UMA</span>
            </div>
          </div>

          {!resultado.esProvisorio && (
            <div className="px-6 py-5">
              <Etiqueta>Máximo · {pct(inc.porcentajeMax)}</Etiqueta>
              <div className="mt-2">
                <Cifra
                  value={rango.maxPesos}
                  size="hero"
                  className="text-value-max"
                />
              </div>
              <div className="mt-1.5 font-mono text-[11px] tabular-nums text-faint">
                {umaNum(rango.maxUMA, 4)}
                <span className="ml-1 tracking-wider">UMA</span>
              </div>
            </div>
          )}
        </div>

        <details className="border-t border-hair px-6 py-4">
          <summary className="cursor-pointer list-none">
            <Etiqueta className="transition-colors hover:text-foreground">
              Texto del artículo
            </Etiqueta>
          </summary>
          <p className="mt-3 max-w-3xl font-law text-[15px] leading-relaxed text-muted-foreground">
            &ldquo;Los incidentes se dividirán en 2 etapas; la primera se compone
            del planteo que lo origine, sea verbal o escrito, y la segunda, del
            desarrollo hasta su conclusión.&rdquo;
          </p>
        </details>
      </Card>
    </div>
  )
}
