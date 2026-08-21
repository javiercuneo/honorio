'use client'

// ---------------------------------------------------------------
// Piezas visuales compartidas del dashboard.
// Solo presentacion: ningun calculo juridico vive aca.
//
// Dos reglas que sostienen todo lo demas:
//   1. Los numeros no se ocultan nunca; las frases, siempre.
//      Por eso Cifra siempre esta a la vista y todo fundamento va
//      dentro de <Disclosure>.
//   2. El "por qué" es un unico signo: mismo texto, mismo tamano,
//      mismo lugar. Si cada explicacion tuviera su propia forma, el
//      mecanismo para bajar ruido seria la fuente de ruido.
//
// Sistema de color por eje: cada regla de la ley modifica uno de los
// tres ejes del calculo, y ese eje tiene siempre el mismo color.
//   base       arts. 22, 40          -> ocre
//   escala     arts. 25, 35, 37, 41  -> violeta
//   honorarios arts. 34, 38, 49      -> oxido
// ---------------------------------------------------------------

import { useState, type ReactNode } from "react"
import { Calculator } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePrefs } from "@/components/prefs"
import type { Criterio, Doctrina, Fallo } from "@/lib/legal/jurisprudencia"
import { pesos, splitPesos, umaNum } from "./format"

export type Axis = "base" | "escala" | "honorarios"

export const AXIS_ORDER: Axis[] = ["base", "escala", "honorarios"]

export const AXIS_LABEL: Record<Axis, string> = {
  base: "Base",
  escala: "Escala",
  honorarios: "Honorario",
}

// Clases completas y estaticas: Tailwind no resuelve nombres compuestos.
export const AXIS_INK: Record<Axis, string> = {
  base: "text-axis-base",
  escala: "text-axis-escala",
  honorarios: "text-axis-honorarios",
}

export const AXIS_FILL: Record<Axis, string> = {
  base: "bg-axis-base",
  escala: "bg-axis-escala",
  honorarios: "bg-axis-honorarios",
}

export const AXIS_TINT: Record<Axis, string> = {
  base: "bg-axis-base-tint text-axis-base-tint-foreground",
  escala: "bg-axis-escala-tint text-axis-escala-tint-foreground",
  honorarios: "bg-axis-honorarios-tint text-axis-honorarios-tint-foreground",
}

/**
 * El ajuste por rol (art. 20) no es una reduccion por una razon
 * procesal: ubica al rol respecto del patrocinante. Por eso vive fuera
 * del sistema de tres ejes y no se confunde con el oxido.
 */
export const ROL_TINT = "bg-rol-tint text-rol-tint-foreground"

/** Prosa: justificada y con particion de palabras. */
export function Prosa({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <p
      lang="es"
      className={cn(
        "hyphens-auto text-justify text-[13px] leading-relaxed text-muted-foreground",
        className,
      )}
    >
      {children}
    </p>
  )
}

/** Insignia compacta: un factor, un ajuste, una quita. */
export function Insignia({
  tono,
  children,
}: {
  tono: string
  children: ReactNode
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-baseline rounded-sm px-1.5 py-0.5 font-mono text-[11px] tabular-nums",
        tono,
      )}
    >
      {children}
    </span>
  )
}

// ---- Formateadores atados a las preferencias de lectura ----

export function usePesos() {
  const { prefs } = usePrefs()
  return (v: number) => pesos(v, prefs.centavos)
}

export function useUma() {
  const { prefs } = usePrefs()
  return (v: number) => umaNum(v, prefs.umaDecimales ? 2 : 0)
}

// ---- Tipografia de servicio ----

export function Etiqueta({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        "font-mono text-[10px] uppercase tracking-[0.16em] text-faint",
        className,
      )}
    >
      {children}
    </span>
  )
}

/** Cita de articulo: siempre mono, siempre igual en toda la app. */
export function Articulo({ children }: { children: ReactNode }) {
  return (
    <span className="font-mono text-[10px] uppercase tracking-wider text-faint">
      {children}
    </span>
  )
}

// ---- Cifras ----

type CifraSize = "hero" | "xl" | "lg" | "md" | "sm"

const CIFRA_SIZE: Record<CifraSize, string> = {
  hero: "text-[42px] leading-[1] md:text-[58px]",
  xl: "text-[26px] leading-[1.05]",
  lg: "text-[20px] leading-[1.1]",
  md: "text-[15px] leading-[1.2]",
  sm: "text-[13px] leading-[1.2]",
}

const CIFRA_DEC: Record<CifraSize, string> = {
  hero: "text-[0.34em]",
  xl: "text-[0.5em]",
  lg: "text-[0.55em]",
  md: "text-[0.7em]",
  sm: "text-[0.78em]",
}

/**
 * Importe en pesos. Los centavos se componen mas chicos para que la
 * cifra se lea de un golpe sin perder exactitud, y desaparecen si el
 * lector eligio no verlos.
 */
export function Cifra({
  value,
  size = "md",
  className,
  tachado,
}: {
  value: number
  size?: CifraSize
  className?: string
  tachado?: boolean
}) {
  const { prefs } = usePrefs()
  const { entero, decimal } = splitPesos(value, prefs.centavos)
  return (
    <span
      className={cn(
        "font-meter tabular-nums tracking-tight",
        CIFRA_SIZE[size],
        tachado && "line-through decoration-[1.5px]",
        className,
      )}
    >
      {entero}
      {decimal ? (
        <span className={cn("text-faint", CIFRA_DEC[size])}>,{decimal}</span>
      ) : null}
    </span>
  )
}

export function EnUMA({
  value,
  className,
}: {
  value: number
  className?: string
}) {
  const uma = useUma()
  return (
    <span className={cn("tabular-nums", className)}>
      {uma(value)}
      <span className="ml-1 tracking-wider">UMA</span>
    </span>
  )
}

// ---- Contenedores ----

export function Card({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn("rounded-lg border border-border bg-card", className)}>
      {children}
    </section>
  )
}

export function CardHeader({
  titulo,
  articulo,
  children,
  className,
}: {
  titulo: ReactNode
  articulo?: string
  children?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-b border-border px-7 py-4",
        className,
      )}
    >
      <div className="flex items-baseline gap-2.5">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground">
          {titulo}
        </h2>
        {articulo ? <Articulo>{articulo}</Articulo> : null}
      </div>
      {children}
    </div>
  )
}

/**
 * Control segmentado. Un solo elemento activo, marcado con el acento:
 * el mismo color que marca foco y seleccion en el resto de la app.
 */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
  ariaLabel: string
}) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      // Los tres roles no entran en una pantalla de 320: envuelven en
      // vez de asomarse. El selector de rol es el unico control del
      // dashboard que cambia el numero, asi que no puede quedar medio
      // afuera de la pantalla justo en el telefono mas chico.
      className="inline-flex flex-wrap rounded-md border border-border bg-secondary p-0.5"
    >
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            role="tab"
            aria-selected={active}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn(
              "rounded-sm px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              active
                ? "bg-card text-accent-foreground shadow-[0_1px_2px_rgb(0_0_0/0.06)]"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

// ---- Filas ----

const PUNTEADO =
  "min-w-6 flex-1 translate-y-[-3px] border-b border-dotted border-hair"

/**
 * Fila del ledger: concepto a la izquierda, valor a la derecha, unidos
 * por una linea de puntos. El ojo sigue la fila sin perderse.
 *
 * En una pantalla angosta la fila **envuelve** en vez de desbordar. Un
 * rango como «$4.277.105,25 a $4.579.971,00» no se puede achicar —lleva
 * `whitespace-nowrap` porque partir una cifra al medio es peor— y solo
 * el valor ya mide mas de la mitad de un telefono. Sin envolver, la
 * fila empujaba a **toda la pagina** a un scroll horizontal: el pulgar
 * se llevaba el informe de lado al querer bajar.
 *
 * `justify-end` no hace nada en la primera linea —el punteado tiene
 * `flex-1` y se come el espacio libre— y alinea a la derecha la
 * segunda, que es donde cae el valor cuando no entra.
 */
export function LedgerRow({
  concepto,
  articulo,
  valor,
  sub,
  destacado,
  className,
}: {
  concepto: ReactNode
  articulo?: string
  valor: ReactNode
  sub?: ReactNode
  destacado?: boolean
  className?: string
}) {
  return (
    <div
      data-ledger-row
      className={cn(
        "flex flex-wrap items-baseline justify-end gap-x-3 gap-y-0.5 py-2",
        className,
      )}
    >
      <span
        className={cn(
          "flex min-w-0 items-baseline gap-2 text-[13px]",
          destacado ? "font-medium text-foreground" : "text-muted-foreground",
        )}
      >
        {concepto}
        {articulo ? <Articulo>{articulo}</Articulo> : null}
      </span>
      <span className={PUNTEADO} aria-hidden="true" />
      <span className="shrink-0 text-right">
        <span className="block">{valor}</span>
        {sub ? <span className="block">{sub}</span> : null}
      </span>
    </div>
  )
}

/**
 * El unico modo de esconder informacion en toda la app.
 * Siempre la misma palabra, siempre al borde derecho de la fila.
 */
export function Disclosure({
  concepto,
  articulo,
  valor,
  children,
  className,
}: {
  concepto: ReactNode
  articulo?: string
  valor?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <details data-ledger-row className={cn("group", className)}>
      {/* Envuelve por el mismo motivo que LedgerRow, y ademas tiene una
          pieza mas que no se puede achicar: la etiqueta «por qué». */}
      <summary className="flex cursor-pointer list-none flex-wrap items-baseline justify-end gap-x-3 gap-y-0.5 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <span className="flex min-w-0 items-baseline gap-2 text-[13px] text-muted-foreground">
          {concepto}
          {articulo ? <Articulo>{articulo}</Articulo> : null}
        </span>
        <span className={PUNTEADO} aria-hidden="true" />
        {valor ? <span className="shrink-0 text-right">{valor}</span> : null}
        <span
          data-por-que
          className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-accent-foreground"
        >
          por qué
        </span>
      </summary>
      <div
        lang="es"
        className="max-w-2xl hyphens-auto pb-3 pr-8 text-justify text-[13px] leading-relaxed text-muted-foreground"
      >
        {children}
      </div>
    </details>
  )
}

/**
 * Un bloque que en el telefono llega plegado y en el escritorio ni se
 * entera de que existe el pliegue.
 *
 * El titulo de la seccion queda **siempre a la vista**: que alguien no
 * vaya a redactar una regulacion desde el telefono no quiere decir que
 * no tenga que enterarse de que la app la redacta. Se pliega el
 * contenido, no la existencia.
 *
 * El estado inicial es «cerrado» y `md:block` lo pisa en pantalla
 * grande, asi que no hace falta consultar el ancho al montar. Eso evita
 * lo que pasaria con `matchMedia`: el bloque abriria y se cerraria solo
 * a la vista del lector, y ademas el HTML prerenderizado discreparia
 * con el cliente al hidratar.
 */
export function PlegadoEnCelular({
  etiqueta,
  children,
}: {
  /** Que se despliega, dicho en dos palabras. */
  etiqueta: string
  children: ReactNode
}) {
  const [abierto, setAbierto] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        className="flex w-full items-baseline gap-3 py-2 text-left font-mono text-[11px] uppercase tracking-wider text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
      >
        <span>{abierto ? 'Ocultar' : etiqueta}</span>
        <span className={PUNTEADO} aria-hidden="true" />
      </button>

      <div className={cn('md:block', abierto ? 'block' : 'hidden')}>
        {children}
      </div>
    </>
  )
}

/**
 * «Los cálculos no usan IA», arriba de toda pantalla que devuelve un
 * número.
 *
 * Estaba solo en la portada, y ahí llega tarde: quien pregunta si esto
 * lo hizo una inteligencia artificial no pregunta al entrar, pregunta
 * **cuando ve el número**. Ya paso —le plantearon la objecion mirando
 * un resultado— y se desactivo en el acto, que es exactamente lo que
 * esta linea tiene que hacer sola.
 *
 * Es informacion de mas en una app cuya regla es no agregar ruido, y
 * entra igual: la objecion bloquea el uso entero de la herramienta, no
 * una parte. El precio de una linea es menor que el de una persona que
 * no la puede usar delante de su jefa.
 *
 * No se imprime. En un expediente el papel tiene que decir de que se
 * calculo y con que version —eso lo hace la Firma—; de que no se
 * calculo no le importa a nadie.
 */
export function SinIA({ className }: { className?: string }) {
  return (
    <p
      data-imprimir="no"
      className={cn(
        "flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-faint",
        className,
      )}
    >
      <Calculator className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>
        Los cálculos no usan IA · funciones deterministas, verificadas caso por
        caso
      </span>
    </p>
  )
}

/** Texto de la ley: si aparece serif, se esta leyendo la norma. */
export function Norma({ children }: { children: ReactNode }) {
  return (
    <p className="font-law text-[15px] leading-relaxed text-foreground/80">
      {children}
    </p>
  )
}

/** Cierre de un bloque: la cifra con la que sale. */
export function Total({
  etiqueta,
  children,
}: {
  etiqueta: string
  children: ReactNode
}) {
  return (
    <div className="mt-1 flex flex-wrap items-end justify-between gap-x-4 gap-y-1 border-t border-hair pt-3">
      <Etiqueta>{etiqueta}</Etiqueta>
      <span className="text-right">{children}</span>
    </div>
  )
}

/** Ficha: una cifra con su rotulo. Se escanea de un vistazo. */
export function Tile({
  etiqueta,
  valor,
  sub,
  destacado,
}: {
  etiqueta: ReactNode
  valor: ReactNode
  sub?: ReactNode
  destacado?: boolean
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card px-6 py-5",
        destacado && "border-l-2 border-l-accent-foreground",
      )}
    >
      <Etiqueta>{etiqueta}</Etiqueta>
      <div className="mt-2.5">{valor}</div>
      {sub ? (
        <div className="mt-1.5 font-mono text-[11px] text-faint">{sub}</div>
      ) : null}
    </div>
  )
}

/**
 * Lo que sostiene un criterio: la frase, los fallos y la doctrina.
 *
 * Existe porque el mismo bloque estaba escrito dos veces —en
 * `IncidenteResult` y en `MediacionSection`— y ya habian empezado a
 * divergir: uno mostraba el enlace a la sentencia y el otro no, sin
 * ningun motivo. Con seis criterios mas, la copia numero tres era la
 * que iba a quedar sin enlaces para siempre.
 *
 * **Los fallos y la doctrina no se mezclan.** Van en dos listas, con su
 * rotulo, porque un fallo dice lo que un tribunal resolvio y un autor
 * dice lo que le parece. Y cuando no hay ningun fallo **se dice**, en
 * vez de dejar que la lista de doctrina ocupe ese lugar en silencio:
 * que un criterio se apoye solo en doctrina es informacion para quien
 * lo va a usar, no un detalle de armado.
 */
export function Fundamento({
  criterio,
  className,
}: {
  criterio: Criterio
  className?: string
}) {
  const { fallos, doctrina, contraria } = criterio

  return (
    <div className={className}>
      {criterio.sostiene ? (
        <p className="font-law text-[15px] leading-relaxed text-foreground/80">
          &ldquo;{criterio.sostiene}&rdquo;
        </p>
      ) : null}

      {fallos.length ? (
        <ListaFallos fallos={fallos} />
      ) : (
        <p className="mt-3 text-[13px] leading-relaxed text-faint">
          Sin jurisprudencia cargada: lo que sigue es doctrina, y por eso
          está dicho aparte.
        </p>
      )}

      {doctrina?.length ? <ListaDoctrina doctrina={doctrina} /> : null}

      {/*
        La otra lectura del mismo texto. Va **abajo y con su rótulo**, no
        mezclada: lo que la app hace y lo que la app descarta no se leen
        igual. Y cuando no trae fuentes se dice, porque una alternativa
        que nadie escribió pesa distinto de una que sostiene un autor.
      */}
      {contraria ? (
        <div className="mt-4 border-t border-hair pt-3">
          <Etiqueta>La lectura contraria, que esta app no sigue</Etiqueta>
          <p className="mt-1.5 font-law text-[15px] leading-relaxed text-foreground/70">
            &ldquo;{contraria.sostiene}&rdquo;
          </p>
          {contraria.fallos?.length ? (
            <ListaFallos fallos={contraria.fallos} />
          ) : null}
          {contraria.doctrina?.length ? (
            <ListaDoctrina doctrina={contraria.doctrina} />
          ) : null}
          {!contraria.fallos?.length && !contraria.doctrina?.length ? (
            <p className="mt-2 text-[13px] leading-relaxed text-faint">
              No se encontró quién la sostenga por escrito: ni fallo ni
              doctrina. Queda dicha igual, porque el texto la admite.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

function ListaFallos({ fallos }: { fallos: Fallo[] }) {
  return (
    <ul className="mt-3 space-y-2 border-l-2 border-hair pl-4">
      {fallos.map((f) => (
        <li key={f.expediente + f.fecha} className="text-[13px] leading-relaxed">
          {f.tribunal ? <span>{f.tribunal}, </span> : null}
          <span className="font-mono text-[11px]">{f.expediente}</span>,{" "}
          <span className="italic">&ldquo;{f.caratula}&rdquo;</span>, {f.fecha}
          {f.publicacion ? (
            <span className="text-faint"> · {f.publicacion}</span>
          ) : null}
          {f.url ? (
            <>
              {" · "}
              <a
                href={f.url}
                target="_blank"
                rel="noopener"
                className="text-accent-foreground underline underline-offset-2 hover:text-foreground"
              >
                ver la sentencia
              </a>
            </>
          ) : null}
          {f.transcripcion ? (
            <p className="mt-1.5 font-law text-[14px] leading-relaxed text-foreground/70">
              &ldquo;{f.transcripcion}&rdquo;
            </p>
          ) : null}
        </li>
      ))}
    </ul>
  )
}

function ListaDoctrina({ doctrina }: { doctrina: Doctrina[] }) {
  return (
    <div className="mt-3">
      <Etiqueta>Doctrina</Etiqueta>
      <ul className="mt-1.5 space-y-1.5 border-l-2 border-hair pl-4">
        {doctrina.map((d) => (
          <li key={d.obra + d.anio} className="text-[13px] leading-relaxed">
            {d.autor}, <span className="italic">{d.obra}</span>,{" "}
            {d.ciudad ? `${d.ciudad}, ` : ""}
            {d.editorial}, {d.anio}
            {d.pagina ? `, ${d.pagina}` : ""}
            {d.transcripcion ? (
              <p className="mt-1.5 font-law text-[14px] leading-relaxed text-foreground/70">
                &ldquo;{d.transcripcion}&rdquo;
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  )
}
