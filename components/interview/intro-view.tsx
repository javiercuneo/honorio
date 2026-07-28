'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, Scale, FileText, ShieldCheck, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

const notes = [
  { icon: FileText, label: 'Seleccion del tipo de proceso' },
  { icon: Scale, label: 'Calculo segun Ley 27.423' },
  { icon: ShieldCheck, label: 'Resultado detallado' },
]

export function IntroView({ onStart, onShowMinimos }: { onStart: () => void; onShowMinimos: () => void }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="max-w-lg">
      <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-chart-1" aria-hidden="true" />
        Calculo de honorarios
      </span>

      <h1 className="mt-6 text-balance font-serif text-5xl leading-[1.02] tracking-tight text-foreground md:text-6xl">
        Honorio es un asistente para la regulación de honorarios profesionales
      </h1>

      <p className="mt-5 max-w-md text-pretty text-[16px] leading-relaxed text-muted-foreground">
        A través de la selección de opciones, obtenés el cálculo que corresponde a la ley 27.423
      </p>

      <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
        {notes.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-2 text-[13px] text-muted-foreground"
          >
            <Icon className="h-4 w-4 text-foreground/60" />
            {label}
          </div>
        ))}
      </div>

      <Button
        size="lg"
        onClick={onStart}
        className="group mt-9 h-12 rounded-full px-6 text-[15px]"
      >
        Comenzar
        <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
      </Button>

      <p className="mt-10 text-[13px] text-muted-foreground">
        ¿Necesitás ver solo los minimos arancelarios?
        <button
          onClick={onShowMinimos}
          className="ml-2 underline underline-offset-2 hover:text-foreground"
        >
          Ver
        </button>
      </p>

      <div className="mt-6 rounded-2xl border border-border/80 bg-secondary/40">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex w-full items-center gap-2.5 rounded-2xl px-4 py-3 text-left transition-colors hover:bg-secondary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <HelpCircle className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="flex-1 text-[13px] leading-snug text-muted-foreground">
            Información adicional
          </span>
          <span className="shrink-0 font-mono text-[11px] uppercase tracking-wider text-muted-foreground/80">
            {open ? 'Cerrar' : 'Ver más'}
          </span>
        </button>

        <AnimatePresence initial={false}>
          {open ? (
            <motion.div
              key="body"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="space-y-4 border-t border-border/70 px-4 pb-4 pt-3.5">
                <div>
                  <h4 className="text-[13px] font-medium text-foreground/85">Naturaleza de la herramienta</h4>
                  <ul className="mt-2 list-disc space-y-1.5 pl-4 text-[13px] leading-relaxed text-muted-foreground">
                    <li>Esta herramienta es de carácter referencial; no sustituye el criterio del juez ni debe considerarse un dictamen profesional</li>
                    <li>Los resultados se basan en interpretaciones de la Ley 27.423 que podrían diferir de tu criterio o del de los distintos tribunales</li>
                    <li>En cada paso, intentaremos explicitar el fundamento jurídico y su impacto en el cálculo</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-[13px] font-medium text-foreground/85">Ámbito de aplicación temporal</h4>
                  <ul className="mt-2 list-disc space-y-1.5 pl-4 text-[13px] leading-relaxed text-muted-foreground">
                    <li>Vigencia: La ley 27423 se publicó en el BO el 22/12/17.</li>
                    <li>Te sirve si seguís el criterio de aplicación inmediata a todos los juicios en trámite, incluidos los iniciados antes de su entrada en vigencia</li>
                    <li>Si seguís el precedente "Establecimiento Las Marías" (CSJN, 04/09/2018) podes usarlo para las etapas con principio de ejecución bajo la nueva ley.</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-[13px] font-medium text-foreground/85">Restricciones y exclusiones del cálculo</h4>
                  <ul className="mt-2 list-disc space-y-1.5 pl-4 text-[13px] leading-relaxed text-muted-foreground">
                    <li>Mínimos arancelarios: El asistente no aplica automáticamente los mínimos de los arts. 58, 61, etc. Si el resultado es menor a dichos mínimos y los consideras aplicables, desestimá el cálculo o hace clic en "ver mínimos"</li>
                    <li>Reducciones y topes: no se contemplan las limitaciones por prorrateo (art. 730 CCyCN), reajuste de precio (art. 1255 CCyCN), ejecución hipotecaria especial (art. 60 Ley 24.441) o régimen de vivienda (art. 254 CCyCN / art. 48 Ley 14.394).</li>
                    <li>Materias excluidas: la herramienta no está pensada para juicios penales. Solo menciona algunos mínimos para referencia</li>
                    <li>Asuntos no susceptibles de apreciación pecuniaria: para algunos casos sin monto determinado (por ejemplo convocatoria de asamblea), no es posible un cálculo matemático; debes recurrir a las pautas del art. 16. Si haces clic en "ver mínimos" podes ver algunos valores para referencia</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-[13px] font-medium text-foreground/85">Auxiliares de justicia</h4>
                  <ul className="mt-2 list-disc space-y-1.5 pl-4 text-[13px] leading-relaxed text-muted-foreground">
                    <li>Leyes especiales: no se incluyen las pautas de las leyes especiales que reglamenten cada actividad profesional (art. 1, 2° párrafo de la ley 27423) ni las modificaciones de la Ley 27.802 (Modernización Laboral) pero se muestran algunas reglas incorporadas por ésta.</li>
                    <li>Excluidos: no contempla los cálculos de los honorarios de los administradores judiciales, interventores o veedores, interventores recaudadores, liquidadores judiciales, árbitros, mediadores o amigables componedores (art. 32).</li>
                    <li>Mediadores: tienen normativa propia (Ley 26.589 y Decretos 2536/15 y 696/2025). Puede utilizar nuestra calculadora web (<a href="https://javiercuneo.github.io/Herramientas-Judiciales-IA/calculadoras/honorarios-mediacion.html" target="_blank" rel="noopener" className="underline underline-offset-2 hover:text-foreground">link</a>).</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-[13px] font-medium text-foreground/85">Reconvención y acumulación de acciones</h4>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                    Art. 28: en estos supuestos, los honorarios se regulan por separado para cada acción. Le sugerimos reiniciar el asistente para cada una de las pretensiones según sus particularidades.
                  </p>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  )
}
