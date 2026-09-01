"use client"

// ---------------------------------------------------------------
// La banda principal contesta **una** cosa: cuanto es.
//
// Hasta el 24/8/2026 contestaba tres —cuanto es, por que no es lo que
// la tabla sugiere, y como se reparte— y las tres a la vez, con el
// mismo peso. Entre la cifra y la segunda instancia quedaban ocho
// importes de herramientas, y encontrar "lo que corresponderia en 1a
// y 2a" costaba dos lecturas. Es la devolucion de SG del 21/8.
//
// Ahora el archivo exporta tres piezas y el orden lo arma el
// Dashboard:
//
//   HonorariosBand    la cifra, sola
//   RepartoSection    las fracciones del art. 29 y el reparto entre dos
//   EscalaExplicacion de donde sale el numero: el tramo y el excedente
//
// **Las tres siguen mostrando lo mismo que antes.** Ninguna cifra se
// elimino: las dos ultimas se pliegan, y lo que se pliega no es un
// numero sino otra forma de mostrar el que ya esta arriba. El mismo
// caso del apoderado y el procurador, que viven detras del selector
// de rol desde siempre.
//
// Las etapas son fracciones del honorario completo (2/3 y 1/3), tal
// como las calcula el motor. Aca solo se multiplican por el rango ya
// resuelto: no hay regla juridica nueva.
// ---------------------------------------------------------------

import { useState, type ReactNode } from "react"
import type { EscalaAplicada, Rango } from "@/lib/legal/types"
import { pct } from "./format"
import {
  ESCALA_CORRELACION,
  MINIMOS_PROCESO_COMPLETO,
  SUCESION_PRIMERA_ETAPA,
} from "@/lib/legal/jurisprudencia"
import { ajusteDesdeFactor, type CadenaDerivada } from "./cadena"
import {
  AXIS_TINT,
  Card,
  CardHeader,
  Cifra,
  Disclosure,
  Fundamento,
  EnUMA,
  Etiqueta,
  Insignia,
  Norma,
  ROL_TINT,
  Segmented,
  Tile,
  useUma,
} from "./primitives"
import { BarraExcedente, ReglaArt21, huecoDe } from "./ReglaArt21"

type EtapaKey = "full" | "dos" | "una"

const ETAPAS: { key: EtapaKey; factor: number; corto: string }[] = [
  { key: "full", factor: 1, corto: "Completo" },
  { key: "dos", factor: 2 / 3, corto: "2/3" },
  { key: "una", factor: 1 / 3, corto: "1/3" },
]

function escalar(r: Rango, f: number): Rango {
  return {
    minUMA: r.minUMA * f,
    maxUMA: r.maxUMA * f,
    minPesos: r.minPesos * f,
    maxPesos: r.maxPesos * f,
  }
}

/**
 * El art. 29 divide el proceso en tres tercios: la demanda y su
 * contestacion (inc. a), las actuaciones de prueba (inc. b) y las
 * demas diligencias hasta la terminacion (inc. c). El 2/3 es la suma
 * de los dos primeros, asi que **incluye la prueba**.
 *
 * Si el proceso termino antes de la apertura a prueba, esa etapa no
 * existio y ofrecer un 2/3 es enunciar un numero que las propias
 * respuestas de la entrevista desmienten.
 *
 * Se detecta por la transformacion del art. 25, que el motor emite
 * exactamente cuando `aperturaPrueba === false`. No se reimplementa la
 * condicion: se lee el factor que el motor ya emitio.
 */
function terminoAntesDePrueba(cadena: CadenaDerivada): boolean {
  return cadena.txEscala.some((t) => t.id === "escala-art25")
}

function Par({ rango, esProvisorio }: { rango: Rango; esProvisorio: boolean }) {
  return (
    <span className="inline-flex items-baseline gap-1.5 whitespace-nowrap">
      <Cifra value={rango.minPesos} size="md" className="text-value-min" />
      {!esProvisorio && (
        <>
          <span className="font-mono text-[10px] text-faint">a</span>
          <Cifra value={rango.maxPesos} size="md" className="text-value-max" />
        </>
      )}
    </span>
  )
}

/** Un extremo del rango: rotulo, cifra grande, UMA y % efectivo. */
function Extremo({
  etiqueta,
  pesos,
  uma,
  efectivo,
  tono,
  ajuste,
}: {
  etiqueta: string
  pesos: number
  uma: number
  efectivo?: number
  tono: string
  ajuste?: string
}) {
  return (
    <div>
      <div className="flex items-baseline gap-2.5">
        <Etiqueta>{etiqueta}</Etiqueta>
        {ajuste ? <Insignia tono={ROL_TINT}>{ajuste}</Insignia> : null}
      </div>
      <div className="mt-2.5">
        <Cifra value={pesos} size="hero" className={tono} />
      </div>
      <div className="mt-2 font-mono text-[12px] text-faint">
        <EnUMA value={uma} />
        {efectivo !== undefined ? (
          <>
            <span className="mx-2">·</span>
            <span className="tabular-nums">{pct(efectivo, 1)} efectivo</span>
          </>
        ) : null}
      </div>
    </div>
  )
}

// ================================================================
// La cifra
// ================================================================

interface HonorariosBandProps {
  rango: Rango
  esProvisorio: boolean
  cadena: CadenaDerivada
  children?: ReactNode
}

export function HonorariosBand({
  rango,
  esProvisorio,
  cadena,
  children,
}: HonorariosBandProps) {
  const ajustaPorRol = Math.abs(cadena.factorRol - 1) > 0.001
  const ajuste = ajustaPorRol ? ajusteDesdeFactor(cadena.factorRol) : undefined
  const efectivo = cadena.porcentajeEfectivo

  return (
    <Card sujeto="propio">
      <CardHeader titulo="Honorarios · primera instancia" sujeto="propio">
        {children}
      </CardHeader>

      <div
        className={
          esProvisorio ? "px-7 py-8" : "grid gap-8 px-7 py-8 sm:grid-cols-2"
        }
      >
        <Extremo
          etiqueta={esProvisorio ? "Honorario provisorio" : "Mínimo"}
          pesos={rango.minPesos}
          uma={rango.minUMA}
          efectivo={efectivo?.min}
          tono="text-value-min"
          ajuste={ajuste}
        />

        {!esProvisorio && (
          <div className="border-t border-hair pt-6 sm:border-l sm:border-t-0 sm:pl-8 sm:pt-0">
            <Extremo
              etiqueta="Máximo"
              pesos={rango.maxPesos}
              uma={rango.maxUMA}
              efectivo={efectivo?.max}
              tono="text-value-max"
              ajuste={ajuste}
            />
          </div>
        )}
      </div>

      {/*
        Provisorio: por que no hay maximo. Se queda pegado a la cifra y
        no baja con el resto de las explicaciones, porque no explica de
        donde sale el numero: explica **por que hay uno solo**. Sin eso,
        la pantalla muestra un unico importe sin decir que le falta el
        otro.
      */}
      {esProvisorio ? (
        <div className="border-t border-hair px-7">
          <Disclosure
            concepto={
              <span className="flex items-baseline gap-2 text-foreground">
                <Insignia tono={AXIS_TINT.honorarios}>Sin máximo</Insignia>
                Esta regulación se practica en el mínimo
              </span>
            }
            articulo="art. 12"
          >
            <div className="space-y-2.5">
              <Norma>
                &ldquo;Si un profesional se aparta de un proceso o gestión antes
                de su conclusión normal, puede solicitar regulación provisoria de
                honorarios, los que se fijarán en el mínimo que le hubiere podido
                corresponder conforme a las actuaciones cumplidas.&rdquo;
              </Norma>
              <p>
                Por eso acá no hay un rango sino un solo valor, y tampoco hay
                reparto por etapas: la regulación definitiva se practica al
                concluir el proceso, sobre la labor efectivamente cumplida, y
                puede resultar mayor. El importe de arriba es un piso, no una
                estimación de lo que finalmente se regule.
              </p>
            </div>
          </Disclosure>
        </div>
      ) : null}
    </Card>
  )
}

// ================================================================
// El reparto: las fracciones del art. 29 y los dos profesionales
// ================================================================

interface RepartoSectionProps {
  rango: Rango
  cadena: CadenaDerivada
  /**
   * Solo para decidir que se dice al lado de las etapas: el art. 29
   * las divide distinto en el sucesorio, y ahi hay un criterio sobre
   * que escrito cuenta como la primera. No interviene en ninguna
   * cuenta de este componente.
   */
  tipoProceso?: string
}

export function RepartoSection({
  rango,
  cadena,
  tipoProceso,
}: RepartoSectionProps) {
  const [repartoEtapa, setRepartoEtapa] = useState<EtapaKey>("una")
  const [porcentajeA, setPorcentajeA] = useState(60)
  const uma = useUma()

  const etapaElegida = ETAPAS.find((e) => e.key === repartoEtapa) ?? ETAPAS[2]
  const baseReparto = escalar(rango, etapaElegida.factor)
  const a = porcentajeA / 100

  const sinPrueba = terminoAntesDePrueba(cadena)
  const etapasOfrecidas = ETAPAS.filter(
    (e) => e.key !== "full" && !(sinPrueba && e.key === "dos"),
  )

  return (
    <div className="space-y-6">
      <div>
        <Etiqueta>Por etapas</Etiqueta>
        {/*
          El piso del art. 58 es del proceso entero, y esto va **aca**,
          pegado a las fracciones, porque las fracciones son de la labor
          del abogado.
          **Estuvo mal puesto en la seccion de auxiliares** y lo corrigio
          Javier: el perito no divide su labor en etapas. O la completa
          —la pericia y lo que el juez le pida sobre ella— o su honorario
          sale por otro lado: la "regulacion compensatoria adecuada" del
          art. 25, segundo parrafo, inc. b), o el 1/4 de UMA del art. 61
          bis. No hay un "2/3 de perito" contra el cual comparar un piso.
        */}
        <div className="mt-2.5">
          <Disclosure
            concepto="Una fracción no se compara contra el mínimo entero"
            articulo="art. 58"
          >
            <p>
              Los mínimos del art. 58 —10 UMA en el proceso de conocimiento,
              6 en el ejecutivo— <strong>están previstos para el proceso
              completo</strong>. Si el letrado intervino en una o dos etapas,
              su honorario no se mide contra el piso entero. Esto es lo que lo
              sostiene:
            </p>
            <Fundamento criterio={MINIMOS_PROCESO_COMPLETO} className="mt-2" />
          </Disclosure>
        </div>
        {tipoProceso === "sucesion" ? (
          <div className="mt-2.5">
            <Disclosure
              concepto="Qué escrito cuenta como la primera etapa"
              articulo="art. 29"
            >
              <p>
                En el sucesorio el escrito inicial vale por sí solo un tercio
                del juicio, así que decidir si un escrito es <em>el</em>{" "}
                inicial cambia el honorario. La ley no lo define y este es el
                criterio, que es doctrina y no jurisprudencia:
              </p>
              <Fundamento criterio={SUCESION_PRIMERA_ETAPA} className="mt-2" />
            </Disclosure>
          </div>
        ) : null}
        <div className="mt-2.5 grid gap-3 sm:grid-cols-2">
          {etapasOfrecidas.map((e) => {
            const r = escalar(rango, e.factor)
            return (
              <Tile
                key={e.key}
                etiqueta={e.corto}
                valor={
                  <span className="inline-flex flex-wrap items-baseline gap-1.5">
                    <Cifra value={r.minPesos} size="lg" className="text-value-min" />
                    <span className="font-mono text-[10px] text-faint">a</span>
                    <Cifra value={r.maxPesos} size="lg" className="text-value-max" />
                  </span>
                }
                sub={
                  <span>
                    {uma(r.minUMA)} a <EnUMA value={r.maxUMA} />
                  </span>
                }
              />
            )
          })}
        </div>

        {sinPrueba ? (
          <div className="mt-3">
            <Disclosure
              concepto="Por qué no está el 2/3"
              articulo="art. 29 incs. a y b"
            >
              <p>
                El 2/3 es la suma de la demanda y su contestación (inc. a) más
                las actuaciones de prueba (inc. b). Contestaste que el proceso
                terminó antes de la apertura a prueba, así que esa segunda
                etapa no existió y ese importe no corresponde a ninguna labor
                posible. Es el mismo hecho que ya redujo la escala a la mitad
                por el art. 25.
              </p>
            </Disclosure>
          </div>
        ) : null}
      </div>

      <div className="border-t border-hair pt-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Etiqueta>Reparto entre dos profesionales</Etiqueta>
          <Segmented
            ariaLabel="Importe a repartir"
            value={repartoEtapa}
            onChange={setRepartoEtapa}
            options={[ETAPAS[0], ...etapasOfrecidas].map((e) => ({
              value: e.key,
              label: e.corto,
            }))}
          />
        </div>

        {/* Los controles no van al papel; las dos cifras que
            producen, si. */}
        <div className="mt-4 flex items-center gap-5" data-imprimir="no">
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={porcentajeA}
            onChange={(e) => setPorcentajeA(Number(e.target.value))}
            aria-label="Proporción del primer profesional"
            className="h-1 flex-1 cursor-pointer accent-primary"
          />
          <input
            type="number"
            min={0}
            max={100}
            value={porcentajeA}
            onChange={(e) =>
              setPorcentajeA(
                Math.min(100, Math.max(0, Number(e.target.value) || 0)),
              )
            }
            aria-label="Porcentaje del primer profesional"
            className="w-14 shrink-0 rounded-sm border border-border bg-card px-2 py-1 text-right font-mono text-[12px] tabular-nums text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div className="mt-3 grid gap-x-8 sm:grid-cols-2">
          <div>
            <Etiqueta>Primero · {pct(porcentajeA)}</Etiqueta>
            <div className="mt-1.5">
              <Par rango={escalar(baseReparto, a)} esProvisorio={false} />
            </div>
          </div>
          <div className="mt-3 sm:mt-0 sm:text-right">
            <Etiqueta>Segundo · {pct(100 - porcentajeA)}</Etiqueta>
            <div className="mt-1.5">
              <Par rango={escalar(baseReparto, 1 - a)} esProvisorio={false} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ================================================================
// De donde sale el numero
// ================================================================

interface EscalaExplicacionProps {
  escala?: EscalaAplicada
  cadena: CadenaDerivada
  valorUMA: number
  alicuota: string
  /** Lo que arrojaria leer la alicuota del tramo como si fuera directa. */
  ingenuo: number | null
}

export function EscalaExplicacion({
  escala,
  cadena,
  valorUMA,
  alicuota,
  ingenuo,
}: EscalaExplicacionProps) {
  const uma = useUma()

  if (!escala) return null

  const hueco = huecoDe(escala.baseEnUMA)

  /*
    Cuando corre la escala de los incidentes -art. 39 segundo parrafo-
    la tabla de tramos y la barra del excedente no significan nada: el
    rango es plano, del 2 % al 20 %, y no hay grado anterior que
    acumular. Mostrar la tabla ahi seria decir que el honorario sale de
    un tramo del que no sale.
  */
  if (escala.regimen === "incidentes") {
    return (
      <Disclosure
        concepto="Acá no rige la escala progresiva del art. 21"
        articulo="art. 39, 2º párr."
      >
        <p>
          Para el aumento, la disminución, la cesación o la coparticipación
          de alimentos, el art. 39 manda aplicar la escala de los
          incidentes. Es un rango plano del 2 % al 20 % sobre la base, sin
          tramos ni piso del grado anterior, así que la tabla del art. 21 no
          corresponde y no se muestra. De dónde sale ese 2 % al 20 % está
          explicado donde se aplica a los incidentes: viene del art. 33 de
          la Ley 21.839, porque el art. 47 de la 27.423 quedó observado.
        </p>
      </Disclosure>
    )
  }

  return (
    <div className="space-y-3">
      {/* El contrafactico: el numero que espera quien lee solo la tabla */}
      {ingenuo !== null ? (
        <Disclosure
          concepto={
            <span className="text-foreground">
              La tabla del tramo sugiere{" "}
              <Cifra value={ingenuo} size="sm" className="text-foreground" />
            </span>
          }
        >
          <div className="space-y-2.5">
            <Norma>
              &ldquo;En ningún caso los honorarios podrán ser inferiores al
              máximo del grado inmediato anterior de la escala, con más el
              incremento por aplicación al excedente de la alícuota que
              corresponde al grado siguiente.&rdquo;
            </Norma>
            <p>
              Multiplicar la alícuota del tramo ({alicuota}) por la base da ese
              número, y es lo que casi todo el mundo calcula. Pero la escala no
              funciona así: arranca en el máximo del grado anterior y la
              alícuota solo toca el excedente. Sobre ese resultado recién
              después actúan las reducciones. Por eso el número final no guarda
              relación directa con el porcentaje del tramo.
            </p>
          </div>
        </Disclosure>
      ) : null}

      <ReglaArt21 baseEnUMA={escala.baseEnUMA} />

      {/*
        La base cayo entre dos renglones de la tabla. Se dice **cuando
        pasa y no siempre**: es un fundamento del numero que se esta
        mirando, y adelantarlo en los casos donde no juega lo convierte
        en ruido. Que aparezca solo aca es el aviso.
      */}
      {hueco !== null ? (
        <Disclosure
          concepto="Esta base cae entre dos renglones de la tabla"
          articulo="art. 21"
        >
          <p>
            La escala está escrita con números enteros: el renglón anterior
            cierra en {hueco} UMA y el siguiente se rotula desde {hueco + 1}.
            Una base de {uma(escala.baseEnUMA)} UMA no está nombrada por
            ninguno de los dos, y como la base sale de dividir pesos por la
            UMA, caer en uno de esos seis huecos no es raro.
          </p>
          <p className="mt-2">
            <strong>Honorio la calcula en el grado de arriba y no redondea
            la base.</strong> Los {uma(escala.baseEnUMA)} UMA entran enteros
            a la cuenta, y el excedente se mide desde {hueco} UMA —donde la
            ley cierra el grado anterior— y no desde el {hueco + 1} del
            rótulo.
          </p>
          <p className="mt-2">
            El fundamento es el segundo párrafo del artículo, el mismo que
            explica el piso: manda aplicar la alícuota <em>al excedente</em>{" "}
            sobre el máximo del grado anterior. Con esta base hay excedente,
            así que hay grado siguiente. Leerla en el grado de abajo
            obligaría a aplicar la alícuota sobre el total, que es lo que la
            ley reserva a las bases que no exceden ese límite.
          </p>
          <p className="mt-2">
            <strong>No es un empate cosmético: los dos lados del hueco dan
            números distintos.</strong> Justo después de cada corte el piso
            del grado nuevo domina el resultado y la banda se angosta, así
            que caer de un lado o del otro se nota. Es el efecto que muestra
            la barra de acá abajo.
          </p>
          <p className="mt-2">
            <strong>No se encontró fallo ni doctrina sobre el punto.</strong>{" "}
            Queda dicho como lo que es: acá la app eligió, y la elección se
            puede discutir.
          </p>
        </Disclosure>
      ) : null}

      {escala.escalera && cadena.pisoUMA !== null && cadena.aporteExcedenteUMA ? (
        <BarraExcedente
          pisoUMA={cadena.pisoUMA}
          aporteUMA={cadena.aporteExcedenteUMA.min}
          limiteAnterior={escala.escalera.limiteAnterior}
          alicuota={pct(escala.porcentajeMin)}
          excedenteUMA={escala.escalera.excedente}
          valorUMA={valorUMA}
        />
      ) : (
        <p className="font-mono text-[11px] text-faint">
          Base de {uma(escala.baseEnUMA)} UMA en el primer tramo: la alícuota
          se aplica sobre el total, sin grado anterior que acumular.
        </p>
      )}

      {/*
        El "factor de correlacion" del art. 21. Solo cuando hay grado
        anterior: en el primer tramo la regla no juega y el parrafo de
        arriba ya lo dice.
      */}
      {escala.escalera ? (
        <Disclosure
          concepto="Por qué el honorario arranca en el máximo del grado anterior"
          articulo="art. 21, 2º párr."
        >
          <p>
            La escala no se aplica sobre el total de la base: el art. 21
            manda que los honorarios no puedan ser inferiores al máximo del
            grado inmediato anterior, con más la alícuota del grado
            siguiente sobre el excedente. Es la cuenta que muestra la barra
            de arriba, y esto es lo que la sostiene:
          </p>
          <Fundamento criterio={ESCALA_CORRELACION} className="mt-2" />
        </Disclosure>
      ) : null}
    </div>
  )
}
