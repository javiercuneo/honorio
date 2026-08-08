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
  Norma,
  Segmented,
} from '@/components/dashboard/primitives'
import { calcularDirecto, fraccionDeRango } from '@/lib/legal/calculo-directo'
import type { EtapasRol } from '@/lib/legal/calculo-directo'
import type { Rango } from '@/lib/legal/types'
import { pct, umaNum } from '@/components/dashboard/format'
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
        <h1 className="font-meter text-[30px] leading-tight tracking-tight text-foreground md:text-[38px]">
          Cálculo directo
        </h1>
        <p className="mt-2.5 max-w-xl text-[14px] leading-relaxed text-muted-foreground">
          La escala del art. 21 sobre la base, <strong>sin ninguna reducción</strong>.
          Es el punto de partida de una regulación, no el honorario de un caso.
        </p>

        {/* ---- Entradas ---- */}
        <Card className="mt-7 p-6">
          <div className="grid gap-5 sm:grid-cols-[1fr_auto]">
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
            <label className="block sm:w-44">
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
        </Card>

        {!r ? (
          <p className="mt-8 text-[13px] text-faint">
            Ingresá la base para ver el cálculo.
          </p>
        ) : (
          <>
            {/* ---- La escala ---- */}
            <Card className="mt-6">
              <CardHeader titulo="La escala" />
              <div className="px-6 pb-2">
                <LedgerRow
                  concepto="Base en UMA"
                  valor={
                    <span className="font-meter tabular-nums text-[15px]">
                      <EnUMA value={r.baseEnUMA} />
                    </span>
                  }
                />
                <LedgerRow
                  concepto="Escala aplicable"
                  valor={
                    <span className="text-[13px] text-foreground">{r.escala.titulo}</span>
                  }
                />
                {r.escala.limiteAnterior > 0 ? (
                  <LedgerRow
                    concepto={
                      <span>
                        Excedente sobre {umaNum(r.escala.limiteAnterior)} UMA
                      </span>
                    }
                    valor={
                      <span className="font-meter tabular-nums text-[15px]">
                        <EnUMA value={r.escala.excedente} />
                      </span>
                    }
                    sub={
                      <span className="font-mono text-[11px] text-faint">
                        el tramo anterior aporta {umaNum(r.escala.maximoEscalaAnterior)} UMA
                      </span>
                    }
                  />
                ) : null}
              </div>
            </Card>

            {/* ---- Los roles ---- */}
            <Card className="mt-6">
              <CardHeader titulo="Honorarios" />

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
                  <Etiqueta>Parte de la etapa que se trabajó</Etiqueta>
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
                    aria-label="Parte de la etapa que se trabajó"
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
                <p className="mt-3 text-[12px] leading-relaxed text-faint">
                  Toma esa parte de <strong>una sola</strong> regulación, porque se
                  trabajó parte de la etapa. No es el reparto entre dos
                  profesionales: lo que queda afuera no es de nadie en particular.
                </p>
              </div>
            </Card>

            {/* ---- Auxiliares ---- */}
            <Card className="mt-6">
              <CardHeader titulo="Auxiliares de justicia" />
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
              <div className="px-6 pb-5">
                <Disclosure concepto="De dónde sale el punto medio">
                  <Norma>
                    El art. 21 fija la banda del 5 % al 10 % y no manda promediar.
                    El punto medio no sale de la ley: se muestra porque es lo que
                    se usa cuando no hay razón para ir a un extremo, y elegir
                    dentro de la banda es del juez.
                  </Norma>
                </Disclosure>
              </div>
            </Card>

            {/* ---- Segunda instancia ---- */}
            <Card className="mt-6">
              <CardHeader titulo="Segunda instancia" />
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
              <div className="px-6 pb-5">
                <Disclosure concepto="Art. 30">
                  <Norma>
                    Se calcula sobre el honorario de primera instancia completo, no
                    sobre la etapa elegida arriba: es otra regulación sobre lo
                    mismo. El 40 % se reserva a la revocación en todas sus partes
                    en favor del apelante.
                  </Norma>
                </Disclosure>
              </div>
            </Card>

            {/* ---- Lo que no hace ---- */}
            <Card className="mt-6">
              <CardHeader titulo="Lo que esta pantalla no hace" />
              <div className="px-6 pb-6">
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
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
