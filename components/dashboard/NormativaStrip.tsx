import type { Transformacion } from "@/lib/legal/types"

interface NormativaStripProps {
  transformaciones: Transformacion[]
}

export function NormativaStrip({ transformaciones }: NormativaStripProps) {
  const articulos = new Set<string>()

  for (const t of transformaciones) {
    const match = t.articulo.match(/\d+/)
    if (match) articulos.add("Art. " + match[0])
  }

  if (articulos.size === 0) return null

  const sorted = Array.from(articulos).sort((a, b) => {
    const na = parseInt(a.replace(/\D/g, ""), 10)
    const nb = parseInt(b.replace(/\D/g, ""), 10)
    return na - nb
  })

  return (
    <div className="flex items-center gap-2 border-b border-border pb-3">
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50">
        Normativa
      </span>
      <span className="font-mono text-[11px] tracking-wide text-muted-foreground/60">
        {sorted.join(" \u00B7 ")}
      </span>
    </div>
  )
}
