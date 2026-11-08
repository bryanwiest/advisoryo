import type { Advisory, ProductStatus, Severity } from '../types/advisory'
import { isProductStatus, isSeverity } from './severity'

export type SortOrder = 'newest' | 'severity' | 'manufacturer'

export interface AdvisoryFilters {
  query: string
  severities: Severity[]
  statuses: ProductStatus[]
  organization: string
  publishedAfter: string
  sort: SortOrder
}

const SORT_ORDERS: SortOrder[] = ['newest', 'severity', 'manufacturer']

/**
 * Filters live in the URL (?q=...&severity=high&severity=critical), so a filtered list
 * can be bookmarked and shared, and the search form on the home page can link to it.
 */
export function filtersFromParams(params: URLSearchParams): AdvisoryFilters {
  const sort = params.get('sort') ?? ''
  return {
    query: params.get('q') ?? '',
    severities: params.getAll('severity').filter(isSeverity),
    statuses: params.getAll('status').filter(isProductStatus),
    organization: params.get('org') ?? '',
    publishedAfter: params.get('from') ?? '',
    sort: SORT_ORDERS.includes(sort as SortOrder) ? (sort as SortOrder) : 'newest',
  }
}

export function filtersToParams(filters: AdvisoryFilters): URLSearchParams {
  const params = new URLSearchParams()
  if (filters.query) params.set('q', filters.query)
  filters.severities.forEach((severity) => params.append('severity', severity))
  filters.statuses.forEach((status) => params.append('status', status))
  if (filters.organization) params.set('org', filters.organization)
  if (filters.publishedAfter) params.set('from', filters.publishedAfter)
  if (filters.sort !== 'newest') params.set('sort', filters.sort)
  return params
}

/** Text that the free-text search looks at: ID, title, CVEs, products and manufacturer. */
function searchText(advisory: Advisory, organizationName: string): string {
  const products = advisory.vulnerabilities.flatMap((v) => v.products.map((p) => p.product))
  return [advisory.id, advisory.title, organizationName, ...advisory.cves, ...products].join(' ').toLowerCase()
}

export function filterAdvisories(
  advisories: Advisory[],
  filters: AdvisoryFilters,
  organizationName: (slug: string) => string,
): Advisory[] {
  const words = filters.query.toLowerCase().split(/\s+/).filter(Boolean)

  const result = advisories.filter((advisory) => {
    if (filters.severities.length > 0 && !filters.severities.includes(advisory.severity)) return false
    if (filters.statuses.length > 0 && !filters.statuses.includes(advisory.status)) return false
    if (filters.organization && advisory.organizationSlug !== filters.organization) return false
    if (filters.publishedAfter && advisory.currentReleaseDate.slice(0, 10) < filters.publishedAfter) return false
    const text = searchText(advisory, organizationName(advisory.organizationSlug))
    return words.every((word) => text.includes(word))
  })

  return result.sort((a, b) => {
    if (filters.sort === 'severity') return (b.score ?? -1) - (a.score ?? -1)
    if (filters.sort === 'manufacturer') {
      return organizationName(a.organizationSlug).localeCompare(organizationName(b.organizationSlug))
    }
    return b.currentReleaseDate.localeCompare(a.currentReleaseDate)
  })
}

export function newestFirst(advisories: Advisory[]): Advisory[] {
  return [...advisories].sort((a, b) => b.currentReleaseDate.localeCompare(a.currentReleaseDate))
}
