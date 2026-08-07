"use client"

// ---------------------------------------------------------------
// Actuaciones posteriores a la ejecucion propiamente dicha
// (art. 41, ultima oracion), como seccion propia.
//
// Por que una seccion y no una cuarta tarjeta al lado del completo,
// el 2/3 y el 1/3: esa fila divide *una* regulacion en fracciones del
// art. 29. El 40 % del art. 41 no es una fraccion de esa regulacion,
// es **otra regulacion sobre la misma base**, como la segunda
// instancia o el partidor. Ponerlas en la misma linea diria que son
// comparables, y de hecho pueden concurrir: el mismo profesional
// puede cobrar la ejecucion y las posteriores.
// ---------------------------------------------------------------

import type { ReactNode } from "react"
import type { Rango } from "@/lib/legal/types"
import { Cifra, Disclosure, EnUMA, Tile } from "./primitives"

interface ActuacionesPosterioresSectionProps {
  rango: Rango
  rolLabel: string
  esProvisorio: boolean
  children?: ReactNode
}

function Valor({ pesos, uma }: { pesos: number; uma: number }) {
  return (
    <>
      <Cifra value={pesos} size="xl" className="text-foreground" />
      <div className="mt-1.5 font-mono text-[11px] text-faint">
        <EnUMA value={uma} />
      </div>
    </>
  )
}

export function ActuacionesPosterioresSection({
  rango,
  rolLabel,
  esProvisorio,
  children,
}: ActuacionesPosterioresSectionProps) {
  return (
    <section>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 pb-3">
        <div className="flex items-baseline gap-2.5">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground">
            Actuaciones posteriores a la ejecución
          </h2>
          <span className="font-mono text-[10px] uppercase tracking-wider text-faint">
            art. 41
          </span>
        </div>
        {children}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Tile
          etiqueta="Mínimo · 40% de la escala"
          valor={<Valor pesos={rango.minPesos} uma={rango.minUMA} />}
        />
        {!esProvisorio && (
          <Tile
            etiqueta="Máximo · 40% de la escala"
            valor={<Valor pesos={rango.maxPesos} uma={rango.maxUMA} />}
          />
        )}
      </div>

      <div className="mt-1 px-1">
        <Disclosure
          concepto="Es otra regulación, no una etapa de la ejecución"
          articulo="art. 41"
        >
          <p>
            &ldquo;Las actuaciones posteriores a la ejecución propiamente dicha
            se regularán en un cuarenta por ciento (40%) de la escala del citado
            artículo.&rdquo; El artículo citado es el 21, así que el 40 % se
            toma de la escala completa y no de la mitad que el mismo art. 41
            aplica a la ejecución: las dos son fracciones de lo mismo, la
            ejecución al 50 % y las posteriores al 40 %.
          </p>
          <p className="mt-2">
            Por eso está acá abajo y no entre las fracciones por etapas: aquella
            fila reparte una misma regulación, y esto es otra que se suma. El
            mismo profesional puede cobrar la ejecución y las posteriores. El
            importe está expresado para el {rolLabel.toLowerCase()} y arrastra
            las reducciones de base que correspondan, porque llegan en la
            escala.
          </p>
          <p className="mt-2">
            <strong>Un criterio, no un texto:</strong> acá no se aplica el 10 %
            de reducción por no haber excepciones. Esa quita del art. 41 se
            refiere al honorario de la ejecución —tener excepciones o no es un
            hecho de la ejecución, no de lo que viene después— y esta última
            oración regula un tramo aparte remitiendo a la escala sin
            descuentos.
          </p>
        </Disclosure>
      </div>
    </section>
  )
}
