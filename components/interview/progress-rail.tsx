'use client'

import { motion } from 'motion/react'

type ProgressRailProps = {
  total: number
  /** zero-based index of the active step */
  current: number
  /** how many steps have a saved answer */
  completed: number
}

export function ProgressRail({ total, current, completed }: ProgressRailProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex flex-1 items-center gap-1.5" aria-hidden="true">
        {Array.from({ length: total }).map((_, i) => {
          const state =
            i < completed ? 'done' : i === current ? 'active' : 'upcoming'
          return (
            <div
              key={i}
              className="relative h-1 flex-1 overflow-hidden rounded-full bg-border/70"
            >
              <motion.span
                className="absolute inset-y-0 left-0 rounded-full bg-foreground"
                initial={false}
                animate={{
                  width:
                    state === 'done'
                      ? '100%'
                      : state === 'active'
                        ? '45%'
                        : '0%',
                  opacity: state === 'upcoming' ? 0 : 1,
                }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          )
        })}
      </div>
      <span className="shrink-0 font-mono text-xs tabular-nums tracking-wider text-muted-foreground">
        {String(Math.min(current + 1, total)).padStart(2, '0')}
        <span className="mx-0.5 opacity-40">/</span>
        {String(total).padStart(2, '0')}
      </span>
    </div>
  )
}
