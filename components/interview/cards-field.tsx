'use client'

import { OptionCard } from './option-card'
import { cn } from '@/lib/utils'
import { Fundamento } from '@/components/dashboard/primitives'
import {
  CADUCIDAD_ART22,
  CADUCIDAD_ART25,
  type Criterio,
} from '@/lib/legal/jurisprudencia'
import type { CardsStepDef } from '@/lib/wizard/wizard-schema'

/**
 * Los pasos donde elegir una opcion es elegir un criterio, y lo que
 * sostiene a cada una.
 *
 * **Hoy hay uno solo, y es el unico que puede haber por ahora:** la
 * caducidad es el unico punto en el que la app no decide sino que
 * pregunta, porque las dos lecturas conviven en la Camara. En todos los
 * demas pasos las opciones describen hechos del expediente —hubo
 * excepciones o no, se abrio a prueba o no— y un hecho no se funda en
 * jurisprudencia.
 *
 * Vive en la presentacion y no en `wizard-schema.ts` a proposito: el
 * schema dice que se pregunta y bajo que condicion, y no tiene ninguna
 * otra dependencia de `lib/legal/`.
 */
const FUNDAMENTOS: Record<string, Record<string, Criterio>> = {
  caducidadCriterio: {
    art22: CADUCIDAD_ART22,
    art25: CADUCIDAD_ART25,
  },
}

type CardsFieldProps = {
  step: CardsStepDef
  value: string | string[] | undefined
  onChange: (value: string | string[] | number) => void
}

export function CardsField({ step, value, onChange }: CardsFieldProps) {
  const multi = step.select === 'multi'
  const selectedIds = multi
    ? Array.isArray(value)
      ? value
      : []
    : typeof value === 'string'
      ? [value]
      : []

  const handleSelect = (id: string) => {
    if (!multi) {
      onChange(id)
      return
    }
    const set = new Set(selectedIds)
    if (set.has(id)) set.delete(id)
    else set.add(id)
    onChange(Array.from(set))
  }

  const cols =
    step.options.length >= 9
      ? 'sm:grid-cols-2 lg:grid-cols-3'
      : step.options.length >= 6
        ? 'sm:grid-cols-2 lg:grid-cols-4'
        : 'sm:grid-cols-3'

  const fundamentos = FUNDAMENTOS[step.id]

  return (
    <>
      <div
        role={multi ? 'group' : 'radiogroup'}
        aria-label={step.pregunta}
        className={cn('grid grid-cols-1 gap-2.5', cols)}
      >
        {step.options.map((option, index) => (
          <OptionCard
            key={option.id}
            option={option}
            index={index}
            multi={multi}
            selected={selectedIds.includes(option.id)}
            onSelect={() => handleSelect(option.id)}
          />
        ))}
      </div>

      {fundamentos ? (
        <div className="mt-5 space-y-5 border-t border-hair pt-5">
          <p className="text-[13px] leading-relaxed text-muted-foreground">
            La ley no resolvió este caso y las dos lecturas conviven. Ninguna
            es la correcta por defecto: esto es lo que sostiene a cada una.
          </p>
          {step.options.map((option) =>
            fundamentos[option.id] ? (
              <div key={option.id}>
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-faint">
                  {option.label}
                </p>
                <Fundamento
                  criterio={fundamentos[option.id]}
                  className="mt-2"
                />
              </div>
            ) : null,
          )}
        </div>
      ) : null}
    </>
  )
}
