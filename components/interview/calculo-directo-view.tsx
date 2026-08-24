'use client'

// ---------------------------------------------------------------
// El calculo directo: la escala del art. 21 sin entrevista.
//
// Para quien ya sabe lo que quiere. Pone la base y ve la escala, los
// roles, las etapas y los auxiliares de un golpe, como en una hoja de
// calculo. La entrevista contesta "cuanto corresponde en este caso";
// esto contesta "cuanto da la escala para este monto".
//
// **La UMA va primero y el peso al lado.** Es al reves que el
// dashboard, y es deliberado: quien usa esta pantalla esta escribiendo
// una regulacion, y una regulacion se escribe en UMA. El peso es la
// traduccion para el que la lee. Los dos siempre: no todo el que entra
// regula en UMA.
//
// **No aplica ninguna reduccion, y lo dice.** Un numero de esta
// pantalla no es el honorario de ningun caso real: es el punto de
// partida. Quien sabe lo que hace lo entiende solo; el que entra por
// curiosidad tiene que leerlo, por eso la advertencia no esta escondida
// en un pie.
//
// Toda la aritmetica es de lib/legal/calculo-directo.ts. Aca no se
// calcula nada.
// ---------------------------------------------------------------

import { useMemo, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  Cifra,
  EnUMA,
  Etiqueta,
  LedgerRow,
  Disclosure,
  Segmented,
  SinIA,
} from '@/components/dashboard/primitives'
import { calcularDirecto, fraccionDeRango } from '@/lib/legal/calculo-directo'
import type { EtapasRol } from '@/lib/legal/calculo-directo'
import { calcularMediacion } from '@/lib/legal/mediacion'
import { UHOM_VIGENTE } from '@/lib/legal/uhom'
import type { Rango } from '@/lib/legal/types'
import { pesos, pct, umaNum } from '@/components/dashboard/format'
import { AppTopbar } from './app-topbar'
import { parseImporte } from './numeric-field'

/** Las etapas del art. 29, contadas y no en fracciones. */
type EtapaKey = 'tres' | 'dos' | 'una'

const ETAPAS: { key: EtapaKey; corto: string; largo: string }[] = [
  { key: 'tres', corto: '3 etapas', largo: 'Las tres etapas' },
  { key: 'dos', corto: '2 etapas', largo: 'Dos de las tres' },
  { key: 'una', corto: '1 etapa', largo: 'Una de las tres' },
]

/**
 * Un rango, con la UMA arriba y el peso abajo.
 *
 * Es el orden inverso al `LedgerRow` del dashboard a proposito: aca
 * manda la UMA. Ver el encabezado del archivo.
 */
function ParUMA({ rango }: { rango: Rango }) {
  return (
    <div className="text-right">
      <div className="font-meter tabular-nums text-[15px] text-foreground">
        {umaNum(rango.minUMA)} – {umaNum(rango.maxUMA)}
        <span className="ml-1 text-[11px] tracking-wider text-faint">UMA</span>
      </div>
      <div className="mt-0.5 font-mono text-[11px] text-faint">
        <Cifra value={rango.minPesos} size="sm" /> – <Cifra value={rango.maxPesos} size="sm" />
      </div>
    </div>
  )
}

function FilaRol({
  rol,
  articulo,
  rango,
}: {
  rol: string
  articulo: string
  rango: Rango
}) {
  return (
    <LedgerRow
      concepto={
        <span>
          {rol} <span className="ml-1 text-[11px] text-faint">{articulo}</span>
        </span>
      }
      valor={<ParUMA rango={rango} />}
    />
  )
}

export function CalculoDirectoView({
  onBack,
  umaValor,
}: {
  onBack: () => void
  umaValor: number
}) {
  const [baseTexto, setBaseTexto] = useState('')
  const [umaTexto, setUmaTexto] = useState(String(umaValor))
  const [etapa, setEtapa] = useState<EtapaKey>('tres')
  // La fraccion de UNA etapa, para el que trabajo solo parte de ella.
  // No es el reparto entre dos profesionales del dashboard: ver
  // fraccionDeRango() en lib/legal/calculo-directo.ts.
  const [fraccion, setFraccion] = useState(100)

  const base = parseImporte(baseTexto)
  const uma = parseImporte(umaTexto)

  const r = useMemo(
    () => (base && uma ? calcularDirecto(base, uma) : null),
    [base, uma],
  )

  // El honorario del mediador sale de la misma base y de otra unidad.
  // No depende de la UMA, asi que no entra en el useMemo de arriba.
  const med = useMemo(
    () => (base ? calcularMediacion(base, UHOM_VIGENTE) : null),
    [base],
  )

  const conFraccion = (etapas: EtapasRol): Rango =>
    fraccionDeRango(etapas[etapa], fraccion / 100)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppTopbar caso="Cálculo directo">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="h-8 px-2.5 text-[13px] text-muted-foreground"
        >
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
          Volver
        </Button>
      </AppTopbar>

      <div className="mx-auto max-w-3xl px-6 pb-24 pt-8 md:px-8">
        <SinIA className="mb-3" />
        <h1 className="font-meter text-[30px] leading-tight tracking-tight text-foreground md:text-[38px]">
          Cálculo directo
        </h1>
        <p className="mt-2.5 max-w-xl text-[14px] leading-relaxed text-muted-foreground">
          La escala del art. 21 sobre la base, <strong>sin ninguna reducción</strong>.
          Es el punto de partida de una regulación, no el honorario de un caso.
        </p>

        {/* ---- Entradas y escala, en paralelo ----
             En la misma card y a la misma altura para que los
             honorarios, que es lo que se viene a ver, no queden
             debajo del pliegue. */}
        <Card className="mt-7">
          <div className="grid gap-x-9 gap-y-7 p-6 md:grid-cols-2">
            <div className="space-y-5">
              <label className="block">
                <Etiqueta>Base regulatoria</Etiqueta>
                <input
                  type="text"
                  inputMode="decimal"
                  autoFocus
                  value={baseTexto}
                  onChange={(e) => setBaseTexto(e.target.value)}
                  placeholder="0,00"
                  aria-label="Base regulatoria en pesos"
                  className="mt-2 w-full rounded-md border border-border bg-card px-3 py-2 font-meter text-[22px] tabular-nums text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </label>
              <label className="block">
                <Etiqueta>Valor de la UMA</Etiqueta>
                <input
                  type="text"
                  inputMode="decimal"
                  value={umaTexto}
                  onChange={(e) => setUmaTexto(e.target.value)}
                  aria-label="Valor de la UMA"
                  className="mt-2 w-full rounded-md border border-border bg-card px-3 py-2 font-mono text-[15px] tabular-nums text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </label>
            </div>

            <div className="md:border-l md:border-hair md:pl-9">
              <Etiqueta>La escala</Etiqueta>
              {!r ? (
                <p className="mt-3 text-[13px] text-faint">
                  Ingresá la base para ver el cálculo.
                </p>
              ) : (
                <dl className="mt-3 space-y-3.5">
                  <div>
                    <dt className="text-[12px] text-faint">Base en UMA</dt>
                    <dd className="font-meter tabular-nums text-[19px] text-foreground">
                      <EnUMA value={r.baseEnUMA} />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[12px] text-faint">Escala aplicable</dt>
                    <dd className="text-[13px] leading-snug text-foreground">
                      {r.escala.titulo}
                    </dd>
                  </div>
                  {r.escala.limiteAnterior > 0 ? (
                    <div>
                      <dt className="text-[12px] text-faint">
                        Excedente sobre {umaNum(r.escala.limiteAnterior)} UMA
                      </dt>
                      <dd className="font-meter tabular-nums text-[15px] text-foreground">
                        <EnUMA value={r.escala.excedente} />
                        <span className="ml-2 font-mono text-[11px] text-faint">
                          el tramo anterior aporta {umaNum(r.escala.maximoEscalaAnterior)} UMA
                        </span>
                      </dd>
                    </div>
                  ) : null}
                </dl>
              )}
            </div>
          </div>
        </Card>

        {!r ? null : (
          <>
            {/* ---- Los roles ---- */}
            <Card className="mt-6" sujeto="propio">
              <CardHeader titulo="Honorarios" sujeto="propio" />

              <div className="flex flex-wrap items-center justify-between gap-3 px-6 pb-1">
                <Etiqueta>Etapas cumplidas · art. 29</Etiqueta>
                <Segmented
                  ariaLabel="Etapas cumplidas"
                  value={etapa}
                  onChange={setEtapa}
                  options={ETAPAS.map((e) => ({ value: e.key, label: e.corto }))}
                />
              </div>

              <div className="px-6 pb-2">
                <FilaRol rol="Patrocinante" articulo="art. 21" rango={conFraccion(r.patrocinante)} />
                <FilaRol rol="Apoderado" articulo="art. 20" rango={conFraccion(r.apoderado)} />
                <FilaRol rol="Procurador" articulo="art. 20" rango={conFraccion(r.procurador)} />
              </div>

              {/* Fraccion de la etapa elegida. */}
              <div className="border-t border-hair px-6 py-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Etiqueta>Porcentaje de la etapa</Etiqueta>
                  <span className="font-meter tabular-nums text-[13px] text-foreground">
                    {pct(fraccion)}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-5">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={fraccion}
                    onChange={(e) => setFraccion(Number(e.target.value))}
                    aria-label="Porcentaje de la etapa"
                    className="h-1 flex-1 cursor-pointer accent-primary"
                  />
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={fraccion}
                    onChange={(e) =>
                      setFraccion(Math.min(100, Math.max(0, Number(e.target.value) || 0)))
                    }
                    aria-label="Porcentaje de la etapa"
                    className="w-14 shrink-0 rounded-sm border border-border bg-card px-2 py-1 text-right font-mono text-[12px] tabular-nums text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
              </div>
            </Card>

            {/* ---- Segunda instancia ---- */}
            <Card className="mt-6" sujeto="propio">
              <CardHeader titulo="Segunda instancia" sujeto="propio" />
              <div className="px-6 pb-2">
                <LedgerRow
                  concepto="Mínimo · 30 % del patrocinante"
                  valor={<ParUMA rango={r.segundaInstancia.patrocinante.minimo} />}
                />
                <LedgerRow
                  concepto="Máximo · 35 %"
                  valor={<ParUMA rango={r.segundaInstancia.patrocinante.maximo} />}
                />
                <LedgerRow
                  concepto="Revocada en todas sus partes · 40 %"
                  valor={<ParUMA rango={r.segundaInstancia.patrocinante.revocada} />}
                />
              </div>
            </Card>

            {/* ---- El honorario de otro ----
                 Auxiliares y mediador van despues de la segunda
                 instancia, y no antes, por el mismo motivo que en el
                 dashboard: hasta aca es el honorario del profesional
                 que se consulta, y de aca para abajo el de otro. Hasta
                 el 24/8/2026 la segunda instancia quedaba ultima,
                 despues de dos sujetos ajenos, y eso no era una
                 decision: era el orden en que se fueron escribiendo. */}
            <div className="mt-8 flex items-center gap-3.5">
              <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.16em] text-faint">
                Honorarios de otros intervinientes
              </span>
              <span className="h-px flex-1 bg-border" aria-hidden="true" />
            </div>

            {/* ---- Auxiliares ---- */}
            <Card className="mt-6" sujeto="otro">
              <CardHeader titulo="Auxiliares de justicia" sujeto="otro" />
              <div className="px-6 pb-2">
                <LedgerRow
                  concepto={
                    <span>
                      5 % a 10 % de la base{' '}
                      <span className="ml-1 text-[11px] text-faint">art. 21</span>
                    </span>
                  }
                  valor={<ParUMA rango={r.auxiliares.rango} />}
                />
                <LedgerRow
                  concepto="Punto medio"
                  valor={
                    <div className="text-right">
                      <div className="font-meter tabular-nums text-[15px] text-foreground">
                        <EnUMA value={r.auxiliares.promedioUMA} />
                      </div>
                      <div className="mt-0.5 font-mono text-[11px] text-faint">
                        <Cifra value={r.auxiliares.promedioPesos} size="sm" />
                      </div>
                    </div>
                  }
                />
              </div>
            </Card>

            {/* ---- Mediador ----
              Va pegado a auxiliares, igual que en el dashboard, y por
              el mismo motivo: los dos se calculan sobre la base y no
              sobre el honorario del abogado.

              Aca no lleva la jurisprudencia de la base unica y en el
              dashboard si. No es un olvido: esta pantalla **no aplica
              ninguna reduccion**, asi que la discusion sobre si las de
              los arts. 22 y 40 alcanzan al mediador no se plantea. El
              regimen completo esta en la guia.

              La unidad va primero y el peso al lado, como en toda esta
              pantalla —solo que la unidad de acá es el UHOM—.
            */}
            {med ? (
              <Card className="mt-6" sujeto="otro">
                <CardHeader titulo="Mediador" sujeto="otro">
                  <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
                    <span className="tracking-wider text-faint">UHOM</span>{' '}
                    {pesos(UHOM_VIGENTE.valor)}
                  </span>
                </CardHeader>
                <div className="px-6 pb-2">
                  <LedgerRow
                    concepto={
                      <span>
                        Honorario básico · ítem {med.item.item}{' '}
                        <span className="ml-1 text-[11px] text-faint">
                          Decreto 2536/2015, Anexo III art. 2°
                        </span>
                      </span>
                    }
                    valor={
                      <div className="text-right">
                        <div className="font-meter tabular-nums text-[15px] text-foreground">
                          {umaNum(med.honorarioUHOM)}
                          <span className="ml-1 text-[11px] tracking-wider text-faint">
                            UHOM
                          </span>
                        </div>
                        <div className="mt-0.5 font-mono text-[11px] text-faint">
                          <Cifra value={med.honorarioPesos} size="sm" />
                        </div>
                      </div>
                    }
                  />
                  <LedgerRow
                    concepto="Monto del asunto"
                    valor={
                      <div className="text-right">
                        <div className="font-meter tabular-nums text-[15px] text-foreground">
                          {umaNum(med.baseEnUHOM)}
                          <span className="ml-1 text-[11px] tracking-wider text-faint">
                            UHOM
                          </span>
                        </div>
                        <div className="mt-0.5 font-mono text-[11px] text-faint">
                          {med.item.descripcion}
                        </div>
                      </div>
                    }
                  />
                  {med.porTope ? (
                    <Disclosure
                      concepto="Por qué no es el 2 % del monto"
                      valor={
                        <span className="font-mono text-[11px] text-faint">
                          tope · 120 UHOM
                        </span>
                      }
                    >
                      <p className="text-[13px] leading-relaxed text-muted-foreground">
                        Por encima de 1000 UHOM el honorario es el 2 % del monto
                        del asunto, con un tope de 120 UHOM. Acá el 2 % daría{' '}
                        {pesos(base! * 0.02)}, así que el tope lo recorta a{' '}
                        {pesos(med.honorarioPesos)}. El tope es de ese último
                        tramo y no de la escala: los seis anteriores llegan a
                        20 UHOM como máximo.
                      </p>
                    </Disclosure>
                  ) : null}
                </div>
              </Card>
            ) : null}

            {/* ---- Lo que no hace ---- */}
            <Card className="mt-6">
              <div className="px-6 py-1">
                <Disclosure concepto="Lo que esta pantalla no hace">
                <p className="text-[13px] leading-relaxed text-muted-foreground">
                  No aplica <strong>ninguna</strong> reducción. Si el caso tiene
                  alguna de estas, el número de arriba no es el que corresponde y
                  el camino es la entrevista:
                </p>
                <ul className="mt-3 space-y-1.5 text-[13px] text-muted-foreground">
                  <li>· Demanda rechazada o caducidad, −30 % de la base (art. 22)</li>
                  <li>· Desalojo u homologación de vivienda, −20 % de la base (art. 40)</li>
                  <li>· Terminación anormal antes de la prueba, −50 % de la escala (art. 25)</li>
                  <li>· Único letrado en la sucesión, −50 % de la escala (art. 35)</li>
                  <li>· Medida cautelar, 25 % o 50 % de la escala (art. 37)</li>
                  <li>· Ejecución de sentencia, −50 % de la escala y −10 % sin excepciones (art. 41)</li>
                </ul>
                <p className="mt-4 text-[12px] leading-relaxed text-faint">
                  Tampoco decide el punto dentro de la banda. La escala da un
                  mínimo y un máximo; elegir adentro es del juez.
                </p>
                </Disclosure>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
