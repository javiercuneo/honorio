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
import {
  PISOS_AUXILIARES_CON_BASE,
  SIN_PERICIA_ART61BIS,
  baseDondeElPisoDejaDeMorder,
} from "@/lib/legal/minimos-data"
import { Cifra, Disclosure, EnUMA, Insignia, Tile } from "./primitives"

interface AuxiliaresSectionProps {
  rango: Rango
  valorUMA: number
  esProvisorio?: boolean
  /**
   * `'antes'` si el proceso termino antes de la apertura a prueba. En
   * ese caso no hubo pericia, y el piso del art. 61 bis —que es "por
   * cada pericia"— presupone una que no existio.
   */
  aperturaPrueba?: string
}

export function AuxiliaresSection({
  rango,
  valorUMA,
  esProvisorio,
  aperturaPrueba,
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

  // Terminado antes de la apertura a prueba no hubo pericia. No se
  // esconde ningun numero —los numeros no se ocultan nunca— pero se
  // dice cual presupone un hecho que no ocurrio, y se muestra el
  // supuesto que la ley previo para ese caso.
  const sinPericia = aperturaPrueba === "antes"

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
              sub={
                piso.suponePericia && sinPericia ? (
                  <>
                    {piso.concepto}
                    <span className="block text-accent-foreground">
                      supone una pericia, y este caso terminó antes de la
                      apertura a prueba
                    </span>
                  </>
                ) : (
                  piso.concepto
                )
              }
            />
          ))}

          {sinPericia ? (
            <Tile
              etiqueta={`${SIN_PERICIA_ART61BIS.articulo} · 1/4 de UMA`}
              valor={
                <Cifra
                  value={SIN_PERICIA_ART61BIS.uma * valorUMA}
                  size="lg"
                  className="text-foreground"
                />
              }
              sub={SIN_PERICIA_ART61BIS.concepto}
            />
          ) : null}
        </div>
      </div>

      <div className="mt-1 px-1">
        <Disclosure concepto="Entre el 5% y el 10% de la base regulatoria">
          <p>
            Alcanza a peritos y demás auxiliares que intervienen en el proceso.
            No incluye las pautas de las leyes especiales que reglamentan cada
            actividad profesional, ni a administradores, interventores,
            liquidadores, árbitros o mediadores, que tienen régimen propio
            (art. 32). El del mediador se calcula acá abajo, con su escala en
            UHOM.
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
          <p className="mt-2">
            Conviene saber cuándo la comparación importa: el 5 % crece con la
            base y los pisos no. Un piso de{" "}
            <strong>2 UMA solo muerde por debajo de una base de{" "}
            {baseDondeElPisoDejaDeMorder(2)} UMA</strong>, y uno de 4 UMA por
            debajo de {baseDondeElPisoDejaDeMorder(4)}. Con bases mayores el
            porcentaje del art. 21 ya los supera y los pisos quedan teóricos.
          </p>
        </Disclosure>

        <Disclosure
          concepto="Qué cambió la Ley 27.802, y qué quedó sin resolver"
          articulo="B.O. 06/03/2026"
        >
          <p>
            Sustituyó los arts. 60 y 61 e incorporó el 61 bis. Los tres fijan
            pisos de <strong>2 UMA</strong> para los peritos, y la ley separa
            por sujeto y no por tipo de juicio: los arts. 60 y 61 son de los
            peritos y liquidadores de averías, y los dos cierran remitiendo a
            las normas específicas «en el caso de los demás auxiliares de la
            Justicia», que son los que siguen con el piso de 4 UMA del art. 58.
          </p>
          <p className="mt-2">
            <strong>Lo que la ley no resolvió, y esta herramienta tampoco
            decide.</strong> El art. 61 bis dice que los honorarios del perito
            «no estarán vinculados a la cuantía del respectivo juicio», pero no
            derogó el 5 % al 10 % del art. 21, que se calcula justamente sobre
            la cuantía. Y el art. 61 remite, para fijarlos, al art. 32, que
            regula administradores, interventores, liquidadores y árbitros con
            escalas sobre utilidades o bienes liquidados: nada de eso encaja con
            un perito médico o ingeniero. Hasta que haya jurisprudencia, las dos
            reglas conviven y por eso se muestran las dos.
          </p>
          <p className="mt-2">
            Un detalle del tercer párrafo del 61 bis: dice que al perito que
            aceptó el cargo y no dictaminó porque el proceso terminó por
            transacción, avenimiento o conciliación <em>«se le regulará»</em> un
            cuarto de UMA. No dice «un mínimo de». Por eso acá no figura entre
            los pisos.
          </p>
        </Disclosure>
      </div>
    </section>
  )
}
