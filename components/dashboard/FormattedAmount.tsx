import { pesos as formatPesos, umas as formatUmas } from "./format"

interface FormattedAmountProps {
  value: number
  format?: "pesos" | "uma"
  className?: string
}

function abbreviate(value: number): string {
  if (value >= 1_000_000_000) return (value / 1_000_000_000).toFixed(1).replace(".0", "") + "B"
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(1).replace(".0", "") + "M"
  return formatPesos(value).replace("$", "")
}

export function FormattedAmount({ value, format: fmt = "pesos", className }: FormattedAmountProps) {
  if (!isFinite(value)) return <span className={className}>N/A</span>

  const isLarge = value >= 1_000_000
  const full = fmt === "uma" ? formatUmas(value) : formatPesos(value)
  const short = (fmt === "uma" ? abbreviate(value) + " UMA" : "$" + abbreviate(value))

  if (!isLarge) {
    return <span className={className}>{full}</span>
  }

  return (
    <span className={className}>
      <span className="block font-medium tracking-tight">{short}</span>
      <span className="block font-mono text-[12px] text-muted-foreground">{full}</span>
    </span>
  )
}
