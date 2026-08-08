"use client"

// ---------------------------------------------------------------
// El honorario basico del mediador, al lado del de los auxiliares.
//
// Van juntos porque comparten lo que importa: los dos salen de la
// **base** y no del honorario del abogado. Pero no son lo mismo —otra
// ley, otra unidad, otra escala— y por eso esta seccion trae su propia
// linea de base y dice UHOM en cada cifra.
//
// **Llama a la funcion pura del motor en vez de recibir el resultado
// ya calculado.** Es lo mismo que hace LegacyLoader con UMA_VIGENTE:
// mediacion no comparte la unidad con `CalculoResultado`, y meterla
// ahi obligaria a que un tipo que habla en UMA cargue un campo en
// UHOM. Mantenerlos separados hace que confundirlos sea un error de
// tipos y no un numero mal calculado.
//
// El encabezado dice "si hubo mediacion previa" a proposito. La
// entrevista no pregunta si la hubo —no se agrega ninguna pregunta por
// el mediador— asi que el numero se ofrece condicionado en vez de
// afirmar un hecho que la app no sabe.
// ---------------------------------------------------------------

import { calcularMediacion } from "@/lib/legal/mediacion"
import { UHOM_VIGENTE } from "@/lib/legal/uhom"
import { MEDIACION_BASE_UNICA } from "@/lib/legal/jurisprudencia"
import { pesos, umaNum } from "./format"
import { Cifra, Disclosure, Insignia, Tile } from "./primitives"

/**
 * El equivalente de `EnUMA`, en la otra unidad. Es un componente
 * aparte y no un parametro de aquel: si la unidad fuera un `string`
 * configurable, la etiqueta y el numero podrian dejar de coincidir sin
 * que nada avise, que es exactamente el error que esta seccion tiene
 * que hacer imposible.
 */
function EnUHOM({ value }: { value: number }) {
  return (
    <span className="tabular-nums">
      {umaNum(value, 2)}
      <span className="ml-1 tracking-wider">UHOM</span>
    </span>
  )
}

interface MediacionSectionProps {
  /**
   * La base del expediente, con las reducciones de los arts. 22 y 40 ya
   * aplicadas. Es la misma que recibe `AuxiliaresSection`.
   */
  baseFinal: number
}

export function MediacionSection({ baseFinal }: MediacionSectionProps) {
  const m = calcularMediacion(baseFinal, UHOM_VIGENTE)
  if (!m) return null

  return (
    <section>
      <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1 pb-3">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground">
          Mediador
        </h2>
        <span className="font-mono text-[10px] uppercase tracking-wider text-faint">
          Decreto 2536/2011, Anexo III
        </span>
        <Insignia tono="bg-secondary text-foreground">
          si hubo mediación previa
        </Insignia>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Tile
          etiqueta="Honorario básico"
          destacado
          valor={
            <Cifra value={m.honorarioPesos} size="xl" className="text-foreground" />
          }
          sub={<EnUHOM value={m.honorarioUHOM} />}
        />
        <Tile
          etiqueta={`Monto del asunto · ítem ${m.item.item}`}
          valor={<Cifra value={baseFinal} size="lg" className="text-foreground" />}
          sub={
            <>
              <EnUHOM value={m.baseEnUHOM} />
              <span className="mx-1.5 text-faint">·</span>
              {m.item.descripcion}
            </>
          }
        />
      </div>

      <div className="mt-2 px-1 font-mono text-[11px] tabular-nums text-faint">
        <span className="tracking-wider">UHOM</span> {pesos(UHOM_VIGENTE.valor)}
        {UHOM_VIGENTE.fuente ? (
          <>
            <span className="mx-2">·</span>
            <span className="font-sans">{UHOM_VIGENTE.fuente}</span>
          </>
        ) : null}
      </div>

      <div className="mt-1 px-1">
        <Disclosure
          concepto="Por qué la base es la misma que la del expediente"
          articulo="Ley 27.423, art. 1°"
        >
          <p>
            El Decreto 696/2025 le da al mediador una base propia: el monto del
            acuerdo, el de la sentencia o el reclamado en la mediación, según
            cómo termine (art. 31 inc. d). Acá se usa <em>la del expediente</em>,
            con las reducciones de los arts. 22 y 40 de la Ley 27.423 ya
            aplicadas. <strong>Es una interpretación</strong>, y se aparta del
            decreto en cuatro supuestos: demanda desestimada, desalojo,
            alimentos y reconvención.
          </p>
          <p className="mt-2">
            Se decidió así por el art. 1°, segundo párrafo, de la Ley 27.423 —el
            arancel se aplica supletoriamente a los demás auxiliares de la
            Justicia— y sobre todo por lo que produce la alternativa en el
            expediente: tantas bases como profesionales intervengan, cada una
            con su método de valuación y cada una apelable por separado, además
            de la apelación del honorario. Una base por expediente es lo que
            permite concentrar el acto de regulación.
          </p>
          <p className="mt-2">Y esto es lo que lo sostiene:</p>
          <p className="mt-2 font-law text-[15px] leading-relaxed text-foreground/80">
            &ldquo;{MEDIACION_BASE_UNICA.sostiene}&rdquo;
          </p>
          <ul className="mt-3 space-y-2 border-l-2 border-hair pl-4">
            {MEDIACION_BASE_UNICA.fallos.map((f) => (
              <li key={f.expediente} className="text-[13px] leading-relaxed">
                {f.tribunal ? <span>{f.tribunal}, </span> : null}
                <span className="font-mono text-[11px]">{f.expediente}</span>,{" "}
                <span className="italic">&ldquo;{f.caratula}&rdquo;</span>,{" "}
                {f.fecha}
              </li>
            ))}
          </ul>
          <p className="mt-3">
            El primero es el que decide el punto: reduce la base un 30 % por el
            art. 22 y regula a la mediadora sobre esa base, en la misma
            resolución. El segundo es el plenario del que sale la doctrina. Las
            dos sentencias de sala invocan además a la Corte —
            <span className="font-mono text-[11px]">Fallos 329:1191</span> y
            &ldquo;De Souza&rdquo;, del 27/10/1992—, citas que se leyeron dentro
            de ellas y no en el original.
          </p>
        </Disclosure>

        <Disclosure concepto="Qué incluye y qué no incluye este número">
          <p>
            Es el <strong>honorario básico</strong> de la escala del Anexo III,
            y nada más. No se le suma ni se le resta nada.
          </p>
          <p className="mt-2">
            <strong>No descuenta el honorario provisional</strong> de 2 UHOM que
            el mediador percibe al cierre y que el art. 31 inc. g) manda
            descontar al regular. No aplica los{" "}
            <strong>adicionales por audiencia</strong> —desde la cuarta, y desde
            la segunda en los supuestos familiares—, ni la reducción a la mitad
            por <strong>mediación desistida</strong> antes de la primera
            audiencia (art. 31 inc. h), ni la de la{" "}
            <strong>reconvención</strong> (art. 32 inc. k).
          </p>
          <p className="mt-2">
            El motivo de las cuatro es el mismo, y es de sistema: el arancel se
            aplica supletoriamente a todos los auxiliares de la Justicia, así
            que incorporar las reglas propias del mediador obligaría a
            incorporar las de cada auxiliar con régimen especial. Las cuatro
            dependen además de datos que la entrevista no pide, y no se agrega
            ninguna pregunta por el mediador.
          </p>
          <p className="mt-2">
            Tampoco llega a los tres ítems de la escala que no dependen de un
            monto —cosas de valor indeterminable (20 UHOM), cuestiones sin valor
            pecuniario (12 UHOM) y la mediación familiar por cuidado personal,
            comunicación o plan de parentalidad (9 UHOM)—. No es una decisión:
            esta herramienta parte siempre de una base en pesos, así que no hay
            recorrido que llegue a esos tres.
          </p>
        </Disclosure>

        <Disclosure concepto="La escala, y por qué la cita no lleva artículo">
          <p>
            Siete tramos de monto fijo en UHOM: 3 hasta 30 UHOM, 6 hasta 60, 9
            hasta 150, 12 hasta 300, 16 hasta 600 y 20 hasta 1000. Por encima de
            1000 UHOM es el <strong>2 % del monto del asunto</strong>, con un
            tope de 120 UHOM. <strong>El tope es de ese último tramo</strong> y
            no de la escala: los seis anteriores llegan a 20 UHOM como máximo.
          </p>
          {m.porTope ? (
            <p className="mt-2">
              En este caso el 2 % supera las 120 UHOM, así que el honorario
              quedó recortado en el tope.
            </p>
          ) : null}
          <p className="mt-2">
            La escala está en el Anexo III del Decreto 1467/2011, sustituido por
            el Decreto 2536/2011. El Decreto 696/2025 reemplazó la
            reglamentación entera pero no ese anexo: lo cita como derecho
            vigente. <strong>El número de artículo no se cita porque las
            fuentes no coinciden</strong> —el decreto de 2025 dice «artículo 2°»
            y la tabla oficial de 2026 dice «artículo 4°»—. Los honorarios son
            los mismos en todas, así que la diferencia no toca ningún número:
            toca la cita, y una cita que no se pudo resolver no se escribe.
          </p>
        </Disclosure>
      </div>
    </section>
  )
}
