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
//
// ---- Por que hay tan poca prosa aca ----
//
// La primera version traia tres desplegables largos: la escala entera,
// todo lo que el numero no incluye, y por que la cita no lleva numero
// de articulo. **Eso es documentacion, no dashboard.** Se movio a
// `documentacion.html` del sitio de herramientas, donde alguien lo lee
// una vez, y aca quedo lo que solo se puede decir junto al numero:
//
//   - Que la base es una interpretacion, con los fallos que la
//     sostienen. Es lo unico que **mueve la cifra que esta en
//     pantalla**, y la regla del repositorio es que una interpretacion
//     se funda o no se afirma.
//   - Por que el 2 % dejo de ser 2 %, y solo cuando eso pasa.
//
// Todo lo demas describe la herramienta, no este caso.
// ---------------------------------------------------------------

import { calcularMediacion } from "@/lib/legal/mediacion"
import { UHOM_VIGENTE } from "@/lib/legal/uhom"
import { MEDIACION_BASE_UNICA } from "@/lib/legal/jurisprudencia"
import { pesos, umaNum } from "./format"
import { Cifra, Disclosure, Fundamento, Insignia, Tile } from "./primitives"

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
          Decreto 2536/2015, Anexo III art. 2°
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
        {/*
          Solo cuando pasa. Si el tope no mordio, decir que existe es
          describir la escala, y eso esta en la documentacion.
        */}
        {m.porTope ? (
          <Disclosure
            concepto="Por qué el honorario no es el 2 % del monto"
            valor={<span className="font-mono text-[11px]">tope · 120 UHOM</span>}
          >
            <p>
              Por encima de 1000 UHOM el honorario es el 2 % del monto del
              asunto, pero con un tope de 120 UHOM. Acá el 2 % daría{" "}
              {pesos(m.baseEnUHOM * 0.02 * UHOM_VIGENTE.valor)}, así que el tope
              lo recorta a {pesos(m.honorarioPesos)}. El tope es de ese último
              tramo y no de la escala: los seis anteriores llegan a 20 UHOM como
              máximo y nunca pueden alcanzarlo.
            </p>
          </Disclosure>
        ) : null}

        <Disclosure
          concepto="Por qué la base es la misma que la del expediente"
          articulo="Ley 27.423, art. 1°"
        >
          <p>
            El Decreto 696/2025 le da al mediador una base propia (art. 31
            inc. d). Acá se usa <em>la del expediente</em>, con las reducciones
            de los arts. 22 y 40 ya aplicadas, porque el arancel se aplica
            supletoriamente a todos los auxiliares de la Justicia y porque la
            alternativa produce tantas bases como profesionales intervengan,
            cada una apelable por separado. <strong>Es una interpretación</strong>,
            y esto es lo que la sostiene:
          </p>
          <Fundamento criterio={MEDIACION_BASE_UNICA} className="mt-2" />
          <p className="mt-3">
            En el primero el apelante era un perito que planteó que la reducción
            del 30 % del art. 22 no lo alcanzaba por ser auxiliar de la Justicia
            y no letrado. La Sala lo rechazó: la ley arancelaria no distingue
            según el profesional de que se trate.
          </p>
        </Disclosure>
      </div>
    </section>
  )
}
