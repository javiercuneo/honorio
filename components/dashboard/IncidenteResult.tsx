import { pesos, umaNum, pct } from "./format"
import type { CalculoResultado } from "@/lib/legal/types"
import { INCIDENTE_ESCALA } from "@/lib/legal/jurisprudencia"
import { Card, CardHeader, Cifra, Disclosure, Etiqueta } from "./primitives"

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
        {/*
          El encabezado va sin articulo a proposito: el que estaba
          —art. 29 inc. g— quedaba arriba de los dos porcentajes y los
          hacia parecer suyos. Las dos citas que corresponden estan
          abajo, cada una con lo que de verdad funda.
        */}
        <CardHeader titulo="Incidente">
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

        {/*
          Los dos porcentajes de arriba no salen de la Ley 27.423, y
          hasta el 7/8/2026 esta pantalla no lo decia: mostraba el
          texto del art. 29 inc. g —que divide el incidente en etapas
          y no fija ninguna alicuota— debajo de un 2 % y un 20 %, sin
          nombrar siquiera de que articulo era. Es la misma clase de
          error que la cita del art. 29 inc. e en la cautelar.
        */}
        <div className="divide-y divide-hair border-t border-hair px-6">
          <Disclosure
            concepto="De dónde sale el 2 % al 20 %"
            articulo="Ley 21.839, art. 33"
          >
            <p>
              No sale de la Ley 27.423. El único artículo que fijaba el
              porcentaje de los incidentes —el 47, del 8 % al 25 % de lo que
              correspondiera al proceso principal, con un piso de 5 UMA— fue
              observado por el Decreto 1077/2017 y nunca entró en vigencia. El
              art. 29 inc. g) divide el incidente en dos etapas, pero no fija
              alícuota alguna.
            </p>
            <p className="mt-2">
              Ante ese hueco, el motor aplica el 2 % al 20 % del art. 33 de la
              Ley 21.839, el régimen anterior. Es un criterio, no una
              transcripción, y esto es lo que lo sostiene:
            </p>
            <p className="mt-2 font-law text-[15px] leading-relaxed text-foreground/80">
              &ldquo;{INCIDENTE_ESCALA.sostiene}&rdquo;
            </p>
            <ul className="mt-3 space-y-2 border-l-2 border-hair pl-4">
              {INCIDENTE_ESCALA.fallos.map((f) => (
                <li key={f.expediente} className="text-[13px] leading-relaxed">
                  {f.tribunal ? <span>{f.tribunal}, </span> : null}
                  <span className="font-mono text-[11px]">{f.expediente}</span>,{" "}
                  <span className="italic">&ldquo;{f.caratula}&rdquo;</span>,{" "}
                  {f.fecha}
                  {f.url ? (
                    <>
                      {" · "}
                      <a
                        href={f.url}
                        target="_blank"
                        rel="noopener"
                        className="text-accent-foreground underline underline-offset-2 hover:text-foreground"
                      >
                        ver la sentencia
                      </a>
                    </>
                  ) : null}
                </li>
              ))}
            </ul>
          </Disclosure>

          <Disclosure
            concepto="En cuántas etapas se divide el incidente"
            articulo="art. 29 inc. g"
          >
            <p className="font-law text-[15px] leading-relaxed text-foreground/80">
              &ldquo;Los incidentes se dividirán en dos (2) etapas; la primera se
              compone del planteo que lo origine, sea verbal o escrito, y la
              segunda, del desarrollo hasta su conclusión.&rdquo;
            </p>
          </Disclosure>
        </div>
      </Card>
    </div>
  )
}
