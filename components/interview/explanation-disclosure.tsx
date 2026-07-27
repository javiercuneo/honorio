'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { HelpCircle, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Explanation } from '@/lib/legal/types'

export function ExplanationDisclosure({
  explanation,
}: {
  explanation: Explanation
}) {
  const [open, setOpen] = useState(false)
  const [showFull, setShowFull] = useState(false)

  return (
    <div className="rounded-2xl border border-border/80 bg-secondary/40">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-2.5 rounded-2xl px-4 py-3 text-left transition-colors hover:bg-secondary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <HelpCircle className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="flex-1 text-[13px] leading-snug text-muted-foreground">
          {explanation.brief}
        </span>
        <span className="shrink-0 font-mono text-[11px] uppercase tracking-wider text-muted-foreground/80">
          {open ? 'Cerrar' : 'Fundamento legal'}
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
            <div className="border-t border-border/70 px-4 pb-4 pt-3.5">
              <p className="text-[13px] leading-relaxed text-foreground/75">
                {explanation.expanded}
              </p>

              <button
                type="button"
                onClick={() => setShowFull((v) => !v)}
                aria-expanded={showFull}
                className={cn(
                  'mt-3 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground',
                )}
              >
                <Plus
                  className={cn(
                    'h-3.5 w-3.5 transition-transform duration-300',
                    showFull && 'rotate-45',
                  )}
                />
                {showFull ? 'Ocultar detalles' : 'Ver articulado completo'}
              </button>

              <AnimatePresence initial={false}>
                {showFull ? (
                  <motion.ul
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 space-y-2.5">
                      {explanation.full.map((line, i) => (
                        <li
                          key={i}
                          className="flex gap-2.5 text-[13px] leading-relaxed text-muted-foreground"
                        >
                          <span
                            className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-foreground/40"
                            aria-hidden="true"
                          />
                          {line}
                        </li>
                      ))}
                    </div>
                  </motion.ul>
                ) : null}
              </AnimatePresence>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
