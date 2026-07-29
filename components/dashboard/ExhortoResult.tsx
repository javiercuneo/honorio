import { pesos, umas } from "./format"
import type { CalculoResultado } from "@/lib/legal/types"

interface ExhortoResultProps {
  resultado: CalculoResultado
}

export function ExhortoResult({ resultado }: ExhortoResultProps) {
  const ex = resultado.exhorto
  if (!ex) return null

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="rounded-2xl border border-border bg-card px-6 pb-6 pt-6 md:px-8 md:pb-8 md:pt-8">
        <h2 className="text-xl font-bold text-foreground">Exhorto &mdash; Art. 50</h2>
        <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
          UMA: {pesos(resultado.valorUMA)}
        </p>

        <div className="mt-6 overflow-hidden rounded-xl border border-border">
          <table className="w-full border-collapse font-mono text-[13px]">
            <thead>
              <tr className="border-b border-border/50 bg-muted/20 text-[10px] uppercase tracking-wider text-muted-foreground/60">
                <th className="px-4 py-2.5 text-left font-medium">Inciso</th>
                <th className="px-4 py-2.5 text-right font-medium">UMA</th>
                <th className="px-4 py-2.5 text-right font-medium">Pesos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              <tr>
                <td className="px-4 py-3 text-left text-foreground">
                  a) Notificaciones o actos semejantes
                </td>
                <td className="px-4 py-3 text-right text-muted-foreground">3</td>
                <td className="px-4 py-3 text-right font-medium text-foreground">
                  {pesos(ex.incisoA)}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-left text-foreground">
                  b) Inscripciones y actos registrales
                </td>
                <td className="px-4 py-3 text-right text-muted-foreground">
                  {ex.incisoB.minUMA} a {ex.incisoB.maxUMA}
                </td>
                <td className="px-4 py-3 text-right font-medium text-foreground">
                  <span className="text-value-min">{pesos(ex.incisoB.minPesos)}</span>
                  {" / "}
                  <span className="text-value-max">{pesos(ex.incisoB.maxPesos)}</span>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-left text-foreground">
                  c) Diligencias de prueba
                </td>
                <td className="px-4 py-3 text-right text-muted-foreground">
                  {ex.incisoC.minUMA} a {ex.incisoC.maxUMA}
                </td>
                <td className="px-4 py-3 text-right font-medium text-foreground">
                  <span className="text-value-min">{pesos(ex.incisoC.minPesos)}</span>
                  {" / "}
                  <span className="text-value-max">{pesos(ex.incisoC.maxPesos)}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <details className="group mt-5">
          <summary className="cursor-pointer font-mono text-[11px] uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground">
            Ver texto del artículo
          </summary>
          <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground">Artículo 50.</span>{" "}
            Los honorarios por diligenciamiento de exhortos u oficios contemplados
            en la ley 22.172 serán regulados de conformidad a las siguientes pautas:
            a) si se tratare de notificaciones o actos semejantes, los honorarios no
            podrán ser inferiores a 3 UMA; b) si se solicitaren inscripciones de
            dominios, hijuelas, testamentos, gravámenes, secuestros, embargos,
            inhibiciones, inventarios, remates, desalojos, o cualquier otro acto
            registral, los honorarios se regularán en una escala entre 10 y 20 UMA;
            c) si se tratare de diligencias de prueba y se hubiera intervenido en su
            producción o contralor, el juez exhortado regulará los honorarios
            proporcionalmente a la labor desarrollada, en una escala entre 7 y 30 UMA.
          </p>
        </details>
      </div>
    </div>
  )
}
