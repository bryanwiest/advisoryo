import type { ProductStatus, Severity } from '../types/advisory'

/** Qualitative severity rating scale of CVSS v3.1 */
export function severityFromScore(score: number | null): Severity {
  if (score === null || score === 0) return 'none'
  if (score >= 9) return 'critical'
  if (score >= 7) return 'high'
  if (score >= 4) return 'medium'
  return 'low'
}

export const SEVERITIES: Severity[] = ['critical', 'high', 'medium', 'low']

export const SEVERITY_LABELS: Record<Severity, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  none: 'Unscored',
}

export const STATUSES: ProductStatus[] = ['known_affected', 'fixed', 'known_not_affected', 'under_investigation']

export const STATUS_LABELS: Record<ProductStatus, string> = {
  known_affected: 'Known affected',
  fixed: 'Fixed',
  known_not_affected: 'Not affected',
  under_investigation: 'Under investigation',
}

export function isSeverity(value: string): value is Severity {
  return value in SEVERITY_LABELS
}

export function isProductStatus(value: string): value is ProductStatus {
  return value in STATUS_LABELS
}
