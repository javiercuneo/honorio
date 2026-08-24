"use client"

// ---------------------------------------------------------------
// El texto de la regulacion, para copiar y pegar.
//
// Es la tercera forma de la misma salida —el numero, el informe
// imprimible y ahora la prosa— y por eso vive en el dashboard y no en
// una pantalla aparte: se alimenta del mismo `CalculoResultado`.
//
// ---- Por que hay que cargar profesionales a mano ----
//
// **Honorio no sabe cuantos profesionales intervinieron ni en que
// caracter.** La entrevista no lo pregunta, porque el numero no
// depende de eso: la escala del art. 21 da una banda por rol y esa
// banda es la misma haya un letrado o cuatro.
//
// Un texto de regulacion, en cambio, tiene una linea por profesional.
// Asi que este panel pide lo que falta —cuantos, con que nombre, en
// que caracter— y no lo inventa. Es la unica entrada de la pantalla, y
// esta es la razon por la que existe.
//
// **El tipo de perito no cambia la cuenta.** Medico, caligrafo o
// ingeniero cobran el mismo 5 %-10 % del art. 21. Los atajos de "+
// perito" escriben un rotulo, no eligen una escala, y por eso el rotulo
// es editable: si dijera algo que el motor usa, no podria serlo.
//
// ---- El punto dentro de la banda ----
//
// Lo elige la persona, campo por campo, y **el campo arranca vacio**.
// Un valor por defecto en el medio de la banda seria una decision
// jurisdiccional disfrazada de conveniencia: el que apura lo acepta sin
// pensarlo, y la app habria empezado a regular.
//
// La banda se sigue viendo al lado del campo. "Los numeros no se
// ocultan nunca": es lo que permite ver si el punto quedo pegado a un
// borde.
//
// **No se imprime.** Lleva `data-imprimir="no"`, como los controles:
// el informe imprimible ya contiene los mismos numeros, y agregarle el
// texto lo duplicaria en el mismo papel. El texto se copia y se pega,
// que es para lo que existe.
//
// Toda la redaccion es de lib/legal/regulacion-prosa.ts. Aca no se
// escribe ni una frase del texto.
// ---------------------------------------------------------------

import { useMemo, useState } from "react"
import { Plus, X, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  bandasDe,
  generarProsa,
  verificarNumeros,
} from "@/lib/legal/regulacion-prosa"
import type { PuntoElegido, BandaRegulable } from "@/lib/legal/regulacion-prosa"
import { calcularMediacion } from "@/lib/legal/mediacion"
import { UHOM_VIGENTE } from "@/lib/legal/uhom"
import type { CalculoResultado } from "@/lib/legal/types"
import { pesos, umaNum } from "./format"
import {
  Disclosure,
  EncabezadoSeccion,
  Etiqueta,
  PlegadoEnCelular,
  Prosa,
} from "./primitives"

/** Una fila de la lista: un profesional con su banda y su punto. */
interface Fila {
  id: number
  banda: string
  /** Lo que el usuario escribio. Vacio = hueco visible en el texto. */
  profesional: string
  /** El punto, en UMA, como texto: el campo arranca vacio a proposito. */
  uma: string
}

/**
 * Los atajos, **derivados de las bandas que el resultado ofrece** y no
 * de una lista fija.
 *
 * La primera version tenia una lista escrita a mano —patrocinante,
 * apoderado, peritos— y filtraba por banda existente. En el incidente
 * eso dejaba un solo chip, el del mediador: su unica banda es la del
 * 2 %-20 % y ninguno de los atajos la nombraba. **Cada banda tiene su
 * chip o no tiene ninguno**, y derivarlos lo hace imposible de olvidar.
 *
 * Las variantes de perito son lo unico escrito a mano, y **escriben un
 * rotulo, no eligen una escala**: medico, contador, caligrafo e
 * ingeniero cobran el mismo 5 %-10 % del art. 21. Por eso el rotulo
 * queda editable.
 */
const PERITOS = ['médico/a', 'contador/a', 'ingeniero/a', 'calígrafo/a']

function atajosDe(bandas: BandaRegulable[]) {
  const chips: { texto: string; banda: string; profesional: string }[] = []
  for (const b of bandas) {
    if (b.clave === 'auxiliares') {
      for (const tipo of PERITOS) {
        chips.push({
          texto: '+ perito ' + tipo.replace('/a', ''),
          banda: b.clave,
          profesional: 'perito/a ' + tipo + ' ',
        })
      }
      continue
    }
    chips.push({ texto: '+ ' + b.etiqueta, banda: b.clave, profesional: '' })
  }
  return chips
}

let proximoId = 1

export function ProsaSection({ resultado }: { resultado: CalculoResultado }) {
  const [filas, setFilas] = useState<Fila[]>([])
  const [mediador, setMediador] = useState("")
  const [conMediador, setConMediador] = useState(false)
  const [copiado, setCopiado] = useState(false)

  const bandas = useMemo(() => bandasDe(resultado), [resultado])
  const porClave = useMemo(
    () => new Map(bandas.map((b) => [b.clave, b])),
    [bandas],
  )
  const atajos = useMemo(() => atajosDe(bandas), [bandas])

  const mediacion = useMemo(
    () => (conMediador ? calcularMediacion(resultado.baseFinal, UHOM_VIGENTE) : null),
    [conMediador, resultado.baseFinal],
  )

  const opciones = useMemo(() => {
    const puntos: PuntoElegido[] = filas
      .filter((f) => f.uma.trim() !== "")
      .map((f) => ({
        banda: f.banda,
        uma: Number(f.uma.replace(",", ".")),
        profesional: f.profesional,
      }))
    return { resultado, puntos, mediacion, mediador }
  }, [filas, resultado, mediacion, mediador])

  const salida = useMemo(() => generarProsa(opciones), [opciones])

  // El control mecanico, corriendo en la pantalla y no solo en la
  // validacion. Si alguna vez aparece un importe que el resultado no
  // tiene, se ve aca antes de que alguien lo pegue.
  const intrusos = useMemo(
    () => (salida.texto ? verificarNumeros(salida.texto, opciones) : []),
    [salida.texto, opciones],
  )

  const sinPunto = filas.filter((f) => f.uma.trim() === "").length
  const listo =
    salida.texto !== "" &&
    salida.huecos.length === 0 &&
    salida.errores.length === 0 &&
    intrusos.length === 0 &&
    sinPunto === 0

  function agregar(banda: string, profesional = "") {
    setFilas((f) => [...f, { id: proximoId++, banda, profesional, uma: "" }])
  }

  function editar(id: number, cambio: Partial<Fila>) {
    setFilas((f) => f.map((x) => (x.id === id ? { ...x, ...cambio } : x)))
  }

  async function copiar() {
    await navigator.clipboard.writeText(salida.texto)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 1800)
  }

  return (
    <section data-imprimir="no">
      {/*
        Sin marca de sujeto, a diferencia de las demas secciones: el
        texto lleva una linea por profesional —patrocinante, apoderado,
        procurador, peritos, mediador—, asi que **no es de un sujeto,
        es de todos**. Por eso tampoco va adentro de ninguna de las dos
        zonas: las redacta a las dos.
      */}
      <EncabezadoSeccion
        titulo="Regulación redactada"
        articulo="borrador para revisar"
      />

      {/* Es la seccion mas larga del informe —una pantalla y media en un
          telefono— y la que menos sentido tiene ahi: nadie carga cuatro
          profesionales y copia una regulacion con el pulgar. Pero tiene
          que saber que existe, para buscarla despues en la computadora. */}
      <PlegadoEnCelular etiqueta="Ver el texto redactado">
      <Prosa>
        Es un <strong>borrador para revisar</strong>, no una resolución. Dice
        únicamente lo que Honorio calculó: el resto del expediente —quién
        intervino, qué hizo, la ley aplicable a cada etapa— lo agregás vos. Y es
        una <strong>regulación de primera instancia</strong>: la segunda no entra
        acá.
      </Prosa>

      <Prosa className="mt-2">
        El texto lo arma una función del programa, no un modelo de lenguaje:{" "}
        <strong>el mismo cálculo produce siempre el mismo texto</strong>, palabra
        por palabra, y hay una validación que lo comprueba. Nada de lo que
        escribís sale del navegador.
      </Prosa>

      <Disclosure concepto="Por qué hay que cargar los profesionales a mano">
        La entrevista no pregunta cuántos profesionales intervinieron ni en qué
        carácter, porque el número no depende de eso: la escala del art. 21 da
        una banda por rol, y esa banda es la misma haya un letrado o cuatro. Un
        texto de regulación, en cambio, lleva una línea por profesional.
        <br />
        <br />
        Los atajos de perito escriben un rótulo y nada más: médico, calígrafo o
        ingeniero cobran el mismo 5 %-10 % del art. 21. Por eso el rótulo queda
        editable.
      </Disclosure>

      {/* ---- Los atajos ---- */}
      <div className="mt-4 flex flex-wrap gap-2">
        {atajos.map((a) => (
          <Button
            key={a.texto + a.banda}
            variant="outline"
            size="sm"
            className="font-mono text-[12px]"
            onClick={() => agregar(a.banda, a.profesional)}
          >
            {a.texto}
          </Button>
        ))}
        <Button
          variant="outline"
          size="sm"
          className="font-mono text-[12px]"
          onClick={() => setConMediador((v) => !v)}
        >
          {conMediador ? "− mediador" : "+ mediador"}
        </Button>
      </div>

      {/* ---- Las filas ---- */}
      {filas.length > 0 ? (
        <div className="mt-4 space-y-3">
          {filas.map((fila) => {
            const banda = porClave.get(fila.banda)!
            const valor = fila.uma.trim() === "" ? null : Number(fila.uma.replace(",", "."))
            // El techo solo acota donde la ley puso uno. Sin esto, el
            // inciso a) del art. 50 —"no podran ser inferiores a 3
            // UMA", sin maximo— marcaba en rojo todo numero por
            // encima del piso: la pantalla decia "fuera de la banda"
            // de un texto que el motor redacta sin problema.
            const fuera =
              valor !== null &&
              Number.isFinite(valor) &&
              (valor < banda.rango.minUMA - 1e-6 ||
                (!banda.techoAbierto && valor > banda.rango.maxUMA + 1e-6))

            return (
              <div
                key={fila.id}
                className="rounded-[var(--radius)] border border-border p-3"
              >
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <input
                      className="w-full bg-transparent font-sans text-[14px] outline-none placeholder:text-muted-foreground"
                      placeholder="Nombre del profesional"
                      value={fila.profesional}
                      onChange={(e) => editar(fila.id, { profesional: e.target.value })}
                    />
                    <Etiqueta>{banda.etiqueta}</Etiqueta>
                  </div>
                  <button
                    aria-label="Quitar"
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => setFilas((f) => f.filter((x) => x.id !== fila.id))}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <input
                    className={
                      "w-28 rounded-[var(--radius)] border bg-transparent px-2 py-1 text-right font-meter text-[15px] tabular-nums outline-none focus:ring-2 focus:ring-ring " +
                      (fuera ? "border-destructive" : "border-border")
                    }
                    inputMode="decimal"
                    placeholder="UMA"
                    value={fila.uma}
                    onChange={(e) => editar(fila.id, { uma: e.target.value })}
                  />
                  <span className="font-mono text-[12px] text-muted-foreground">
                    {banda.techoAbierto ? (
                      <>
                        desde {umaNum(banda.rango.minUMA, 2)} UMA, sin máximo
                      </>
                    ) : (
                      <>
                        banda: {umaNum(banda.rango.minUMA, 2)} a{" "}
                        {umaNum(banda.rango.maxUMA, 2)} UMA
                      </>
                    )}
                  </span>
                  {valor !== null && Number.isFinite(valor) && !fuera ? (
                    <span className="font-mono text-[12px] text-muted-foreground">
                      = {pesos(valor * resultado.valorUMA)}
                    </span>
                  ) : null}
                </div>

                {fuera ? (
                  <p className="mt-2 font-mono text-[12px] text-destructive">
                    {banda.techoAbierto
                      ? "Por debajo del mínimo legal. El texto no se redacta con un número que perfora el piso."
                      : "Fuera de la banda. El texto no se redacta con un número que perfora la escala."}
                  </p>
                ) : null}
              </div>
            )
          })}
        </div>
      ) : null}

      {/* ---- Otras bandas, para las que no tienen atajo ---- */}
      <details className="mt-3">
        <summary className="cursor-pointer font-mono text-[12px] text-muted-foreground">
          Otras bandas de este resultado ({bandas.length})
        </summary>
        <div className="mt-2 flex flex-wrap gap-2">
          {bandas.map((b) => (
            <Button
              key={b.clave}
              variant="ghost"
              size="sm"
              className="font-mono text-[11px]"
              onClick={() => agregar(b.clave)}
            >
              <Plus className="mr-1 h-3 w-3" />
              {b.etiqueta}
            </Button>
          ))}
        </div>
      </details>

      {conMediador ? (
        <div className="mt-3 rounded-[var(--radius)] border border-border p-3">
          <input
            className="w-full bg-transparent font-sans text-[14px] outline-none placeholder:text-muted-foreground"
            placeholder="Nombre del mediador o la mediadora"
            value={mediador}
            onChange={(e) => setMediador(e.target.value)}
          />
          <Etiqueta>
            mediador — {mediacion ? umaNum(mediacion.honorarioUHOM, 2) : "—"} UHOM
          </Etiqueta>
        </div>
      ) : null}

      {/* ---- El texto ---- */}
      <div className="mt-5">
        {salida.errores.length > 0 ? (
          <ul className="mb-3 space-y-1">
            {salida.errores.map((e) => (
              <li key={e} className="font-mono text-[12px] text-destructive">
                {e}
              </li>
            ))}
          </ul>
        ) : null}

        {intrusos.length > 0 ? (
          <p className="mb-3 font-mono text-[12px] text-destructive">
            El texto trae {intrusos.length} importe(s) que no salen del cálculo:{" "}
            {intrusos.map((n) => pesos(n)).join(", ")}. No lo uses y avisá.
          </p>
        ) : null}

        <textarea
          readOnly
          value={salida.texto || "Agregá al menos un profesional y su punto dentro de la banda."}
          rows={14}
          className="w-full rounded-[var(--radius)] border border-border bg-[var(--sunk)] p-3 font-mono text-[12px] leading-relaxed outline-none"
        />

        {(salida.huecos.length > 0 || sinPunto > 0) && salida.texto ? (
          <ul className="mt-2 space-y-1">
            {sinPunto > 0 ? (
              <li className="font-mono text-[12px] text-muted-foreground">
                {sinPunto} profesional(es) sin punto elegido: no salen en el texto.
              </li>
            ) : null}
            {salida.huecos.map((h) => (
              <li key={h} className="font-mono text-[12px] text-muted-foreground">
                Falta: {h}
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-3 flex items-center gap-3">
          <Button onClick={copiar} disabled={!listo}>
            {copiado ? (
              <>
                <Check className="mr-2 h-4 w-4" /> Copiado
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" /> Copiar el texto
              </>
            )}
          </Button>
          {!listo && salida.texto ? (
            <span className="font-mono text-[12px] text-muted-foreground">
              Completá lo que falta para poder copiarlo.
            </span>
          ) : null}
        </div>
      </div>
      </PlegadoEnCelular>
    </section>
  )
}
