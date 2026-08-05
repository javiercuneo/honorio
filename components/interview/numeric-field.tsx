'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import type { NumericStepDef } from '@/lib/wizard/wizard-schema'

type NumericFieldProps = {
  step: NumericStepDef
  value: number
  onChange: (value: string | string[] | number) => void
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v))
}

/**
 * Lee un importe escrito o pegado, sin suponer de donde salio.
 *
 * El parser anterior daba por hecho el formato es-AR —punto de miles,
 * coma de decimales— y multiplicaba por cien lo que llegara con punto
 * decimal: pegar "66316779.77" cargaba $6.631.677.977. Un formato con
 * separador de miles ingles ("66,316,779.77") daba NaN y el campo
 * volvia al valor anterior. Los dos fallaban en silencio, que es lo
 * peor que puede hacer el campo del que depende el resultado.
 *
 * La regla, unica y explicita: **el ultimo separador con una o dos
 * cifras detras es el decimal; cualquier otro separa miles.** Con eso
 * entran las dos convenciones sin ambiguedad:
 *
 *   66.316.779,77  ->  66316779.77   (es-AR)
 *   66,316,779.77  ->  66316779.77   (en-US)
 *   66316779.77    ->  66316779.77
 *   66316779,77    ->  66316779.77
 *   66.316.779     ->  66316779      (tres cifras detras: son miles)
 *   1,5            ->  1.5
 *
 * Lo unico que la regla no cubre es un decimal de exactamente tres
 * cifras ("1,234" por 1 con 234 milesimas). No existe en pesos, y
 * admitirlo obligaria a leer "66.316.779" como 66 mil.
 *
 * Devuelve null cuando no hay ningun numero que leer: no es lo mismo
 * un campo a medio escribir que un campo invalido, y el llamador
 * necesita distinguirlos.
 */
export function parseImporte(raw: string): number | null {
  const limpio = raw.replace(/[^0-9.,]/g, '')
  if (!/[0-9]/.test(limpio)) return null

  const ultimo = Math.max(limpio.lastIndexOf('.'), limpio.lastIndexOf(','))
  const cifrasDetras = ultimo >= 0 ? limpio.length - ultimo - 1 : 0
  const esDecimal = ultimo >= 0 && cifrasDetras >= 1 && cifrasDetras <= 2

  const entero = (esDecimal ? limpio.slice(0, ultimo) : limpio).replace(/[.,]/g, '')
  const fraccion = esDecimal ? limpio.slice(ultimo + 1) : ''

  const n = Number((entero || '0') + (fraccion ? '.' + fraccion : ''))
  return Number.isFinite(n) ? n : null
}

/**
 * Un campo sin responder muestra vacio, no "0".
 *
 * El cero era el valor por defecto del schema y se veia como si
 * alguien lo hubiera escrito: quien tipeaba encima terminaba con
 * "0153661235" —el numero salia bien igual, porque el cero a la
 * izquierda no cambia nada, pero lo que se leia en pantalla no era
 * lo que la persona habia escrito—.
 */
function mostrar(value: number): string {
  return value === 0 ? '' : value.toLocaleString('es-AR')
}

export function NumericField({ step, value, onChange }: NumericFieldProps) {
  const [draft, setDraft] = useState(() => mostrar(value))
  const [enFoco, setEnFoco] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Mientras el campo tiene el foco manda lo que el usuario escribio:
  // reformatear ahi le mueve el cursor a mitad de una cifra. Al salir
  // del foco la cifra se normaliza, y esa normalizacion es la
  // confirmacion visual de como se leyo lo que pego.
  useEffect(() => {
    if (!enFoco) setDraft(mostrar(value))
  }, [value, enFoco])

  // Se confirma en cada tecla y en cada pegado, no al salir del campo.
  // Antes solo se confirmaba en blur y en Enter, y bastaba pegar un
  // numero y apretar "Calcular" para que el resultado saliera con el
  // valor anterior. El valor que se ve y el valor que entra al motor
  // ya no se pueden separar.
  const escribir = (raw: string) => {
    setDraft(raw)
    const leido = parseImporte(raw)
    if (leido !== null) onChange(clamp(leido, step.min, step.max))
  }

  return (
    <div className="max-w-lg">
      <div className="flex items-end gap-2">
        {step.prefix ? (
          <span className="pb-2 font-meter text-4xl leading-none text-muted-foreground md:text-5xl">
            {step.prefix}
          </span>
        ) : null}
        <input
          ref={inputRef}
          inputMode="decimal"
          aria-label={step.pregunta}
          value={draft}
          placeholder="0"
          onChange={(e) => escribir(e.target.value)}
          onFocus={() => setEnFoco(true)}
          onBlur={() => setEnFoco(false)}
          className={cn(
            'w-full min-w-0 bg-transparent font-meter text-6xl leading-none tracking-tight text-foreground outline-none md:text-7xl',
            'caret-foreground selection:bg-accent placeholder:text-faint',
          )}
        />
        {step.suffix ? (
          <span className="pb-2 font-meter text-4xl leading-none text-muted-foreground md:text-5xl">
            {step.suffix}
          </span>
        ) : null}
      </div>
      <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        {step.unidadHref ? (
          <a
            href={step.unidadHref}
            target="_blank"
            rel="noopener"
            className="underline decoration-hair underline-offset-4 transition-colors hover:text-accent-foreground"
          >
            {step.unidad}
          </a>
        ) : (
          step.unidad
        )}
      </p>
    </div>
  )
}
