'use client'

// ---------------------------------------------------------------
// Referencias al expediente: el puente entre el caso y una causa.
//
// El caso que se arma en Honorio es abstracto a proposito: no lleva
// ningun dato de nadie. Eso lo hace compartible, y tambien lo deja
// sin anclaje. Quien recibe el informe no tiene por que creer el
// numero: tiene que poder verificar que cada premisa se da en su
// expediente —la caducidad a fs. 25, el monto de la sentencia a
// fs. 140—. Si se dan, el calculo vale ahi.
//
// Tres decisiones que no se ven en el codigo:
//
//   Viven en memoria y en ningun otro lado. No van al enlace de
//   compartir ni a localStorage: una caratula con nombres en una URL
//   termina en chats, historiales y registros de servidores. Se
//   pierden al recargar, y ese es el precio aceptado.
//
//   Una referencia cita una respuesta, no una pregunta. La clave es
//   el paso *y* lo contestado: si al revisar se cambia la caducidad
//   por otra forma de terminacion, la foja que se habia puesto no
//   queda colgada de un hecho que ya no es el del caso.
//
//   El papel dice de quien son. El calculo lo respalda Honorio; las
//   fojas las consigna quien presenta el informe y nadie las verifico.
//   Sin ese rotulo la autoridad de la herramienta quedaria prestada a
//   lo que afirme el usuario.
//
// Si no se completa nada, el informe sale igual que antes.
// ---------------------------------------------------------------

import type { Answers } from '@/lib/legal/types'
import { resumenPaso, type WizardStepDef } from '@/lib/wizard/wizard-schema'
import { SOLO_PANTALLA } from './imprimir'
import { Etiqueta, SeccionPlegable } from './primitives'

export interface Referencias {
  autos: string
  /** Por `claveDato`: el paso y la respuesta que se cita. */
  porDato: Record<string, string>
}

export const REFERENCIAS_VACIAS: Referencias = { autos: '', porDato: {} }

interface Dato {
  clave: string
  rotulo: string
  valor: string
}

function claveDato(paso: WizardStepDef, answers: Answers): string {
  return paso.id + '=' + JSON.stringify(answers[paso.id])
}

/** Las premisas del caso: cada paso contestado, con su respuesta. */
function datosDelCaso(pasos: WizardStepDef[], answers: Answers): Dato[] {
  const datos: Dato[] = []
  for (const paso of pasos) {
    const valor = resumenPaso(paso, answers)
    if (!valor) continue
    datos.push({ clave: claveDato(paso, answers), rotulo: paso.resumenLabel, valor })
  }
  return datos
}

const CAMPO =
  'h-8 w-full rounded-md border border-border bg-background px-2.5 text-[13px] text-foreground placeholder:text-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

/** Donde se cargan. Solo pantalla, plegado: la mayoria no lo usa. */
function EditorReferencias({
  datos,
  referencias,
  onChange,
}: {
  datos: Dato[]
  referencias: Referencias
  onChange: (r: Referencias) => void
}) {
  const setDato = (clave: string, texto: string) =>
    onChange({ ...referencias, porDato: { ...referencias.porDato, [clave]: texto } })

  return (
    <div {...SOLO_PANTALLA} className="mt-10 border-t border-border pt-3">
      <SeccionPlegable etiqueta="Referencias al expediente">
        <p className="max-w-2xl text-[12px] leading-relaxed text-muted-foreground">
          Para presentar este cálculo en una causa: indicá dónde consta cada
          dato —«fs. 25», «sentencia del 3/4»— y quien lo reciba puede
          verificar que el caso es el de su expediente. Salen en el informe
          impreso, rotuladas como tuyas. No se guardan ni viajan en el
          enlace: al recargar la página se pierden.
        </p>

        <label className="mt-4 block max-w-2xl">
          <Etiqueta>Autos / expediente</Etiqueta>
          <input
            type="text"
            value={referencias.autos}
            onChange={(e) => onChange({ ...referencias, autos: e.target.value })}
            placeholder="Optativo"
            className={CAMPO + ' mt-1'}
          />
        </label>

        <ul className="mt-4 max-w-2xl divide-y divide-hair border-y border-hair">
          {datos.map((d) => (
            <li
              key={d.clave}
              className="grid grid-cols-1 items-center gap-x-4 gap-y-1.5 py-2 md:grid-cols-[1fr_12rem]"
            >
              <span className="min-w-0 text-[13px]">
                <span className="text-muted-foreground">{d.rotulo}: </span>
                <span className="text-foreground">{d.valor}</span>
              </span>
              <input
                type="text"
                aria-label={'Referencia de ' + d.rotulo}
                value={referencias.porDato[d.clave] ?? ''}
                onChange={(e) => setDato(d.clave, e.target.value)}
                placeholder="fs. …"
                className={CAMPO}
              />
            </li>
          ))}
        </ul>
      </SeccionPlegable>
    </div>
  )
}

/** Lo que sale en el papel. No existe en pantalla. */
function InformeReferencias({
  datos,
  referencias,
}: {
  datos: Dato[]
  referencias: Referencias
}) {
  const autos = referencias.autos.trim()
  const citados = datos
    .map((d) => ({ ...d, ref: (referencias.porDato[d.clave] ?? '').trim() }))
    .filter((d) => d.ref)

  if (!autos && citados.length === 0) return null

  return (
    <section className="hidden print:mt-10 print:block">
      <Etiqueta>Referencias al expediente</Etiqueta>
      {autos ? <p className="mt-2 text-[13px]">Autos: {autos}</p> : null}
      {citados.length > 0 ? (
        <table className="mt-2 w-full border-collapse text-[12px]">
          <tbody>
            {citados.map((d) => (
              <tr key={d.clave} className="border-b border-hair">
                <td className="py-1 pr-4 text-muted-foreground">{d.rotulo}</td>
                <td className="py-1 pr-4">{d.valor}</td>
                <td className="py-1 text-right font-mono">{d.ref}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
      <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
        Consignadas por quien presenta este informe; Honorio no las
        verificó. El cálculo corresponde a esa causa en la medida en que
        cada dato conste donde se indica.
      </p>
    </section>
  )
}

export function ReferenciasExpediente({
  pasos,
  answers,
  referencias,
  onChange,
}: {
  pasos: WizardStepDef[]
  answers: Answers
  referencias: Referencias
  onChange: (r: Referencias) => void
}) {
  const datos = datosDelCaso(pasos, answers)
  if (datos.length === 0) return null

  return (
    <>
      <EditorReferencias datos={datos} referencias={referencias} onChange={onChange} />
      <InformeReferencias datos={datos} referencias={referencias} />
    </>
  )
}
