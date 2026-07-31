import { pesos, umaNum } from "./format"
import type { CalculoResultado } from "@/lib/legal/types"
import { Card, CardHeader, Cifra, Etiqueta, LedgerRow } from "./primitives"

interface ExhortoResultProps {
  resultado: CalculoResultado
}

function Par({ min, max }: { min: number; max: number }) {
  return (
    <span className="inline-flex items-baseline gap-1.5 whitespace-nowrap">
      <Cifra value={min} size="md" className="text-value-min" />
      <span className="font-mono text-[10px] text-faint">a</span>
      <Cifra value={max} size="md" className="text-value-max" />
    </span>
  )
}

export function ExhortoResult({ resultado }: ExhortoResultProps) {
  const ex = resultado.exhorto
  if (!ex) return null

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader titulo="Exhorto" articulo="art. 50">
          <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
            <span className="tracking-wider text-faint">UMA</span>{" "}
            {pesos(resultado.valorUMA)}
          </span>
        </CardHeader>

        <div className="px-6 py-5">
          <LedgerRow
            concepto="a) Notificaciones o actos semejantes"
            valor={
              <Cifra value={ex.incisoA} size="md" className="text-foreground" />
            }
            sub={
              <span className="font-mono text-[10px] tabular-nums text-faint">
                no menos de 3 UMA
              </span>
            }
          />
          <LedgerRow
            concepto="b) Inscripciones y actos registrales"
            valor={<Par min={ex.incisoB.minPesos} max={ex.incisoB.maxPesos} />}
            sub={
              <span className="font-mono text-[10px] tabular-nums text-faint">
                {umaNum(ex.incisoB.minUMA, 0)} a {umaNum(ex.incisoB.maxUMA, 0)}
                <span className="ml-1 tracking-wider">UMA</span>
              </span>
            }
          />
          <LedgerRow
            concepto="c) Diligencias de prueba"
            valor={<Par min={ex.incisoC.minPesos} max={ex.incisoC.maxPesos} />}
            sub={
              <span className="font-mono text-[10px] tabular-nums text-faint">
                {umaNum(ex.incisoC.minUMA, 0)} a {umaNum(ex.incisoC.maxUMA, 0)}
                <span className="ml-1 tracking-wider">UMA</span>
              </span>
            }
          />
        </div>

        <details className="border-t border-hair px-6 py-4">
          <summary className="cursor-pointer list-none">
            <Etiqueta className="transition-colors hover:text-foreground">
              Texto del artículo
            </Etiqueta>
          </summary>
          <p className="mt-3 max-w-3xl font-law text-[15px] leading-relaxed text-muted-foreground">
            Los honorarios por diligenciamiento de exhortos u oficios
            contemplados en la ley 22.172 serán regulados de conformidad a las
            siguientes pautas: a) si se tratare de notificaciones o actos
            semejantes, los honorarios no podrán ser inferiores a 3 UMA; b) si se
            solicitaren inscripciones de dominios, hijuelas, testamentos,
            gravámenes, secuestros, embargos, inhibiciones, inventarios, remates,
            desalojos, o cualquier otro acto registral, los honorarios se
            regularán en una escala entre 10 y 20 UMA; c) si se tratare de
            diligencias de prueba y se hubiera intervenido en su producción o
            contralor, el juez exhortado regulará los honorarios
            proporcionalmente a la labor desarrollada, en una escala entre 7 y 30
            UMA.
          </p>
        </details>
      </Card>
    </div>
  )
}
