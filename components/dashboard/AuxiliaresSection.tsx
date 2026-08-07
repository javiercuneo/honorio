"use client"

// ---------------------------------------------------------------
// Auxiliares de justicia: el 5 %-10 % del art. 21 y, al lado, los
// pisos que la ley fija.
//
// Por que se muestran los dos numeros y no se aplica el piso:
// **aplicarlo es una decision, y no siempre la correcta.** El propio
// art. 21, en su ultimo parrafo, deja a salvo el art. 478 CPCCN, que
// manda a los jueces adecuar los honorarios de los peritos "por
// debajo de sus topes minimos inclusive" a lo que se regule a los
// demas profesionales. Un piso aplicado a ciegas seria un numero que
// la propia ley admite perforar.
//
// El criterio del repositorio: los numeros no se ocultan nunca. Se
// muestran los dos y quien regula decide.
// ---------------------------------------------------------------

import type { Rango } from "@/lib/legal/types"
import { PISOS_AUXILIARES_CON_BASE } from "@/lib/legal/minimos-data"
import { Cifra, Disclosure, EnUMA, Insignia, Tile } from "./primitives"

interface AuxiliaresSectionProps {
  rango: Rango
  valorUMA: number
  esProvisorio?: boolean
}

export function AuxiliaresSection({
  rango,
  valorUMA,
  esProvisorio,
}: AuxiliaresSectionProps) {
  // El unico dato que hace falta señalar: si el 5 % de la base queda
  // por debajo de alguno de los pisos. Es el caso en que el numero de
  // arriba y el de abajo dicen cosas distintas, y es el motivo por el
  // que los dos estan en pantalla.
  const pisoMasAlto = PISOS_AUXILIARES_CON_BASE.reduce(
    (a, p) => Math.max(a, p.uma),
    0,
  )
  const quedaCorto = rango.minUMA < pisoMasAlto

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
          etiqueta="Mínimo · 5%"
          valor={
            <Cifra value={rango.minPesos} size="xl" className="text-value-min" />
          }
          sub={<EnUMA value={rango.minUMA} />}
        />
        {!esProvisorio && (
          <Tile
            etiqueta="Máximo · 10%"
            valor={
              <Cifra value={rango.maxPesos} size="xl" className="text-value-max" />
            }
            sub={<EnUMA value={rango.maxUMA} />}
          />
        )}
      </div>

      <div className="mt-3">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 pb-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-faint">
            Pisos que fija la ley
          </span>
          {quedaCorto ? (
            <Insignia tono="bg-secondary text-foreground">
              el 5 % queda por debajo
            </Insignia>
          ) : null}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {PISOS_AUXILIARES_CON_BASE.map((piso) => (
            <Tile
              key={piso.articulo}
              etiqueta={`${piso.articulo} · ${piso.uma} UMA`}
              valor={
                <Cifra
                  value={piso.uma * valorUMA}
                  size="lg"
                  className="text-foreground"
                />
              }
              sub={piso.concepto}
            />
          ))}
        </div>
      </div>

      <div className="mt-1 px-1">
        <Disclosure concepto="Entre el 5% y el 10% de la base regulatoria">
          <p>
            Alcanza a peritos y demás auxiliares que intervienen en el proceso.
            No incluye las pautas de las leyes especiales que reglamentan cada
            actividad profesional, ni a administradores, interventores,
            liquidadores, árbitros o mediadores, que tienen régimen propio
            (art. 32).
          </p>
        </Disclosure>
        <Disclosure
          concepto="Por qué los pisos se muestran y no se aplican"
          articulo="art. 478 CPCCN"
        >
          <p>
            Porque aplicarlos es una decisión, y no siempre la correcta. El
            propio art. 21, en su último párrafo, extiende sus normas a los
            peritos de parte y consultores técnicos{" "}
            <em>salvo lo dispuesto en el artículo 478 del Código Procesal Civil
            y Comercial de la Nación</em>. Y ese artículo dice lo contrario de
            un piso rígido:
          </p>
          <p className="mt-2 font-law text-[15px] leading-relaxed text-foreground/80">
            &ldquo;Los jueces deberán regular los honorarios de los peritos y
            demás auxiliares de la justicia, conforme a los respectivos
            aranceles, debiendo adecuarlos, por debajo de sus topes mínimos
            inclusive, a las regulaciones que se practicaren en favor de los
            restantes profesionales intervinientes, ponderando la naturaleza,
            complejidad, calidad y extensión en el tiempo de los respectivos
            trabajos.&rdquo;
          </p>
          <p className="mt-2">
            De modo que el piso puede perforarse cuando el honorario del perito
            quedaría desproporcionado con el de los abogados. Eso depende de las
            regulaciones del caso y del mérito de la labor, que son datos que
            esta herramienta no tiene. Por eso muestra los dos números y no
            elige: el 5 %-10 % de la base y los pisos, para que la comparación
            la haga quien regula.
          </p>
        </Disclosure>
      </div>
    </section>
  )
}
