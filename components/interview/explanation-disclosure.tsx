'use client'

// ---------------------------------------------------------------
// El fundamento juridico de cada paso, detras del mismo "por que" que
// usa el dashboard. Una sola forma de esconder informacion en toda la
// app: misma palabra, mismo tamano, mismo lugar.
// ---------------------------------------------------------------

import type { Explanation } from '@/lib/legal/types'

const VACIO = 'Complete los datos segun corresponda.'

// Varios pasos traen "Ver más" como brief: era el rotulo del boton
// viejo, no un resumen. Al lado de "por que" queda repetido, asi que se
// reemplaza por algo que describa el contenido. El schema no se toca.
const GENERICOS = new Set(['ver más', 'ver mas', 'ver más +', ''])

export function ExplanationDisclosure({
  explanation,
}: {
  explanation: Explanation
}) {
  const articulado = explanation.full.filter((l) => l && l !== VACIO)
  const resumen = GENERICOS.has(explanation.brief.trim().toLowerCase())
    ? 'Qué dice la ley sobre este paso'
    : explanation.brief

  return (
    <details className="group border-t border-hair pt-3">
      <summary className="flex cursor-pointer list-none items-baseline gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <span className="flex-1 text-[13px] leading-snug text-muted-foreground">
          {resumen}
        </span>
        <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-accent-foreground">
          por que
        </span>
      </summary>

      <div className="max-w-2xl pb-1 pt-3">
        <p className="text-[13px] leading-relaxed text-muted-foreground">
          {explanation.expanded}
        </p>

        {articulado.length > 0 ? (
          <ul className="mt-3 space-y-2 border-l-2 border-hair pl-4">
            {articulado.map((line, i) => (
              <li
                key={i}
                className="font-law text-[15px] leading-relaxed text-foreground/80"
              >
                {line}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </details>
  )
}
