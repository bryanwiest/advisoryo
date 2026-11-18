import { SEVERITY_LABELS } from '../lib/severity'
import type { Severity } from '../types/advisory'

interface SeverityBadgeProps {
  severity: Severity
  score: number | null
}

export function SeverityBadge({ severity, score }: SeverityBadgeProps) {
  return (
    <span className={`badge badge-${severity}`}>
      {SEVERITY_LABELS[severity]}
      {score !== null && ` ${score.toFixed(1)}`}
    </span>
  )
}
