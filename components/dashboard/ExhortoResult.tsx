import { pesos, umaNum } from "./format"
import type { CalculoResultado } from "@/lib/legal/types"
import {
  EXHORTO_AUXILIARES,
  EXHORTO_INCISO_A_TECHO,
  EXHORTO_MONTO_PAUTA,
} from "@/lib/legal/jurisprudencia"
import {
  Card,
  CardHeader,
  Cifra,
  Disclosure,
  Etiqueta,
  Fundamento,
  LedgerRow,
} from "./primitives"

interface ExhortoResultProps {
  resultado: CalculoResultado
}

const ART_50_TEXTO =
  "Los honorarios por diligenciamiento de exhortos u oficios contemplados en la " +
  "ley 22.172 serán regulados de conformidad a las siguientes pautas: a) si se " +
  "tratare de notificaciones o actos semejantes, los honorarios no podrán ser " +
  "inferiores a 3 UMA; b) si se solicitaren inscripciones de dominios, hijuelas, " +
  "testamentos, gravámenes, secuestros, embargos, inhibiciones, inventarios, " +
  "remates, desalojos, o cualquier otro acto registral, los honorarios se " +
  "regularán en una escala entre 10 y 20 UMA. En los casos de designaciones de " +
  "auxiliares de la Justicia ante rogatorias u oficios provenientes de otra " +
  "jurisdicción y a los efectos de poder establecer la base regulatoria de los " +
  "honorarios por ante el juez oficiado, se deberá acompañar copia de la demanda, " +
  "y de la reconvención, si la hubiera; c) si se tratare de diligencias de prueba " +
  "y se hubiera intervenido en su producción o contralor, el juez exhortado " +
  "regulará los honorarios proporcionalmente a la labor desarrollada, en una " +
  "escala entre 7 y 30 UMA."

function Par({ min, max }: { min: number; max: number }) {
  return (
    <span className="inline-flex items-baseline gap-1.5 whitespace-nowrap">
      <Cifra value={min} size="md" className="text-value-min" />
      <span className="font-mono text-[10px] text-faint">a</span>
      <Cifra value={max} size="md" className="text-value-max" />
    </span>
  )
}

function UmaSub({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-[10px] tabular-nums text-faint">
      {children}
    </span>
  )
}

/**
 * El resultado de un exhorto.
 *
 * **La pantalla se rearmó el 21/8/2026 y el motivo es la regla del
 * repositorio, no una preferencia**: los números no se ocultan y las
 * explicaciones sí. Esta tarjeta había quedado con un párrafo de prosa
 * debajo de cada cifra —seis en total— y el resultado era que había que
 * leer para encontrar los números. Todo eso está ahora en los «por
 * qué», que es el único modo de esconder información que la app tiene.
 *
 * Lo que quedó arriba es únicamente lo que hace falta para leer un
 * número: qué es, de qué artículo sale, y en qué unidad está.
 */
export function ExhortoResult({ resultado }: ExhortoResultProps) {
  const ex = resultado.exhorto
  if (!ex) return null

  const ref = ex.referencia
  const aux = resultado.auxiliares
  const hayAuxiliares = aux.maxUMA > 0

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader titulo="Exhorto" articulo={"art. 50 inc. " + ex.inciso}>
          <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
            <span className="tracking-wider text-faint">UMA</span>{" "}
            {pesos(resultado.valorUMA)}
          </span>
        </CardHeader>

        {/* ---- Los números, sin nada intercalado ---- */}
        <div className="px-6 py-5">
          {ex.piso ? (
            <>
              <Etiqueta>{ex.etiqueta} · piso, sin máximo</Etiqueta>
              <div className="mt-2 flex items-baseline gap-3">
                <Cifra
                  value={ex.piso.pesos}
                  size="xl"
                  className="text-value-min"
                />
                <UmaSub>
                  {umaNum(ex.piso.uma, 0)}
                  <span className="ml-1 tracking-wider">UMA</span>
                </UmaSub>
              </div>
            </>
          ) : ex.banda ? (
            <>
              <Etiqueta>{ex.etiqueta} · escala del inciso</Etiqueta>
              <div className="mt-2">
                <Par min={ex.banda.minPesos} max={ex.banda.maxPesos} />
              </div>
              <div className="mt-1.5">
                <UmaSub>
                  {umaNum(ex.banda.minUMA, 0)} a {umaNum(ex.banda.maxUMA, 0)}
                  <span className="ml-1 tracking-wider">UMA</span>
                </UmaSub>
              </div>
            </>
          ) : null}
        </div>

        <div className="border-t border-hair px-6 py-4">
          {ex.cantidadActos ? (
            <LedgerRow
              concepto="Actos que comprende"
              valor={
                <span className="font-meter text-[15px] tabular-nums">
                  {ex.cantidadActos}
                </span>
              }
            />
          ) : null}

          {ref ? (
            <LedgerRow
              concepto="Monto del juicio exhortante"
              articulo="pauta, no base"
              valor={
                <Cifra
                  value={ref.montoPesos}
                  size="md"
                  className="text-foreground"
                />
              }
              sub={
                <UmaSub>
                  {umaNum(ref.montoUMA, 2)}
                  <span className="ml-1 tracking-wider">UMA</span>
                </UmaSub>
              }
            />
          ) : (
            <LedgerRow
              concepto="Monto del juicio exhortante"
              valor={
                <span className="text-[13px] text-muted-foreground">
                  no susceptible de apreciación pecuniaria
                </span>
              }
            />
          )}

          {hayAuxiliares ? (
            <LedgerRow
              concepto="Auxiliar de la Justicia"
              articulo="arts. 21 y 61"
              valor={<Par min={aux.minPesos} max={aux.maxPesos} />}
              sub={
                <UmaSub>
                  {umaNum(aux.minUMA, 2)} a {umaNum(aux.maxUMA, 2)}
                  <span className="ml-1 tracking-wider">UMA</span>
                </UmaSub>
              }
            />
          ) : null}
        </div>

        {/* ---- Todo lo demás, plegado ---- */}
        <div className="divide-y divide-hair border-t border-hair px-6">
          {ex.piso ? (
            <Disclosure
              concepto="Por qué no hay un máximo, y contra qué medir"
              articulo="arts. 50 y 58"
            >
              <p>
                El inciso a) dice que los honorarios «no podrán ser inferiores a
                3 UMA» y calla el máximo. La app no le inventa uno. Lo que sí
                puede mostrar son los órdenes de magnitud que la propia ley fija:
                los actos registrales del inciso b) van de 10 a 20 UMA, las
                diligencias de prueba del c) de 7 a 30, y el art. 58 inc. a) pone
                en 10 UMA el mínimo de un proceso de conocimiento{" "}
                <strong>entero</strong>.
              </p>
              {ex.cantidadActos ? (
                <p className="mt-2">
                  Los {ex.cantidadActos} actos declarados{" "}
                  <strong>no multiplican el piso</strong>: quedan escritos en la
                  resolución como el hecho que sostiene apartarse de las 3 UMA.
                </p>
              ) : null}
              <Fundamento criterio={EXHORTO_INCISO_A_TECHO} className="mt-3" />
            </Disclosure>
          ) : null}

          <Disclosure
            concepto="Quién cobra esta cantidad"
            articulo="arts. 50 y 20"
          >
            <p>
              La cantidad del inciso es de quien diligencia el exhorto, sin
              distinguir si actuó con patrocinio o como apoderado. El art. 50
              fija un número por inciso, no un honorario de patrocinio del cual
              los demás sean múltiplo, así que{" "}
              <strong>no corre el 1,4 ni el 40 % del art. 20</strong>. Por eso el
              resultado muestra una cifra y no tres.
            </p>
          </Disclosure>

          <Disclosure
            concepto="Por qué el monto del principal no es una base"
            articulo="ley 22.172, arts. 3° y 12"
          >
            <p>
              El juicio de origen sigue en trámite: cuando el juez oficiado
              regula, todavía no sabe si la demanda prosperará. Las dos salas que
              trataron el punto lo llaman pauta —«indiciaria» una, «parámetro
              cuantitativo» la otra— y no base regulatoria.
            </p>
            <p className="mt-2">
              De ahí sale también algo que la app <strong>no</strong> escribe en
              la resolución: Sala C agrega que los honorarios del exhorto son «a
              cuenta de los que en definitiva se determinen». Es una lectura
              razonable de su caso y no necesariamente de todos, así que queda
              acá como información y no como una frase puesta en boca de quien
              regula.
            </p>
            <Fundamento criterio={EXHORTO_MONTO_PAUTA} className="mt-3" />
          </Disclosure>

          <Disclosure
            concepto="El auxiliar en el exhorto, y si la escala lo alcanza"
            articulo="arts. 10 y 50 inc. b"
          >
            <p>
              Que el auxiliar cobra en el exhorto no se discute: el art. 10
              prohíbe devolver el exhorto sin acreditar el pago de sus
              honorarios, y el art. 50 inc. b) nombra las «designaciones de
              auxiliares de la Justicia ante rogatorias u oficios». Esa oración
              está escrita en el inciso b) y rige los tres.
            </p>
            <p className="mt-2">
              <strong>Lo que sí se discute es si la escala del inciso lo
              topea.</strong> Honorio calcula su banda por las reglas generales
              —el 5 % al 10 % del art. 21, con el piso del art. 61 y la facultad
              del art. 478 del Código Procesal de perforarlo—, y por eso puede
              superar las 30 UMA del inciso c). Es una elección entre dos
              lecturas vivas, y las dos están acá abajo.
            </p>
            <Fundamento criterio={EXHORTO_AUXILIARES} className="mt-3" />
          </Disclosure>

          {ref?.art21 ? (
            <Disclosure
              concepto="Qué daría la escala del art. 21 sobre ese monto"
              articulo="art. 21"
            >
              <p>
                <strong>Es una referencia y no se regula.</strong> Va plegada
                porque no produce el honorario del abogado —lo produce la escala
                del inciso—, y porque está discutida: Sala J sostiene que los
                porcentuales del art. 21 son inaplicables al exhorto y lo reitera
                en cuatro sentencias propias, mientras Sala C los aplica. Para el
                auxiliar, en cambio, es la regla operativa.
              </p>
              <p className="mt-3 font-mono text-[11px] uppercase tracking-wider text-faint">
                {ref.art21.tituloEscala}
              </p>
              <div className="mt-1">
                <LedgerRow
                  concepto="Patrocinante, tres etapas"
                  valor={
                    <Par
                      min={ref.art21.patrocinante.minPesos}
                      max={ref.art21.patrocinante.maxPesos}
                    />
                  }
                  sub={
                    <UmaSub>
                      {umaNum(ref.art21.patrocinante.minUMA, 2)} a{" "}
                      {umaNum(ref.art21.patrocinante.maxUMA, 2)}
                      <span className="ml-1 tracking-wider">UMA</span>
                    </UmaSub>
                  }
                />
                <LedgerRow
                  concepto="Auxiliares, 5 % a 10 %"
                  valor={
                    <Par
                      min={ref.art21.auxiliares.minPesos}
                      max={ref.art21.auxiliares.maxPesos}
                    />
                  }
                  sub={
                    <UmaSub>
                      {umaNum(ref.art21.auxiliares.minUMA, 2)} a{" "}
                      {umaNum(ref.art21.auxiliares.maxUMA, 2)}
                      <span className="ml-1 tracking-wider">UMA</span>
                    </UmaSub>
                  }
                />
              </div>
              <p className="mt-2 text-[12px] leading-relaxed text-faint">
                Estas cifras no se recortan a la escala del inciso: recortarlas
                borraría lo único que informan, que es el tamaño del pleito.
              </p>
            </Disclosure>
          ) : null}

          <Disclosure concepto="Texto del artículo" articulo="art. 50">
            <p className="font-law text-[15px] leading-relaxed text-foreground/80">
              {ART_50_TEXTO}
            </p>
          </Disclosure>
        </div>
      </Card>
    </div>
  )
}
