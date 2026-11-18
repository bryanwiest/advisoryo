import { STATUS_LABELS } from '../lib/severity'
import type { ProductStatus } from '../types/advisory'

const STATUS_CLASSES: Record<ProductStatus, string> = {
  known_affected: 'status-affected',
  fixed: 'status-fixed',
  known_not_affected: 'status-not-affected',
  under_investigation: 'status-investigation',
}

interface StatusLabelProps {
  status: ProductStatus
  /** "label" for tables, "line" for the footer of an advisory card */
  variant?: 'label' | 'line'
}

export function StatusLabel({ status, variant = 'label' }: StatusLabelProps) {
  if (variant === 'line') return <p className={`status ${STATUS_CLASSES[status]}`}>{STATUS_LABELS[status]}</p>
  return <span className={`status-label ${STATUS_CLASSES[status]}`}>{STATUS_LABELS[status]}</span>
}
