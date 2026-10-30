import type { CsafDocument } from './csaf'

// Normalized data model used for search and display.
// The original CSAF document is kept unchanged in `document`.

export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'none'

/** Product status, simplified from the eight CSAF categories. */
export type ProductStatus = 'known_affected' | 'fixed' | 'known_not_affected' | 'under_investigation'

export interface ProductEntry {
  productId: string
  product: string
  version: string
  status: ProductStatus
}

export interface Cvss {
  score: number
  vector: string
  version: string
}

export interface Remediation {
  category: string
  details: string
}

export interface Vulnerability {
  cve: string | null
  cwe: { id: string; name: string } | null
  description: string
  cvss: Cvss | null
  products: ProductEntry[]
  remediations: Remediation[]
}

export interface Revision {
  number: string
  date: string
  summary: string
}

export interface Advisory {
  /** CSAF tracking ID, e.g. EXN-SA-2026-007 */
  id: string
  title: string
  organizationSlug: string
  summary: string
  category: string
  documentStatus: string
  tlp: string | null
  lang: string | null
  version: string
  initialReleaseDate: string
  currentReleaseDate: string
  revisions: Revision[]
  vulnerabilities: Vulnerability[]
  /** Derived: highest CVSS score of all vulnerabilities */
  score: number | null
  severity: Severity
  /** Derived: overall status shown in lists */
  status: ProductStatus
  cves: string[]
  document: CsafDocument
}

export type ProductType = 'software' | 'hardware' | 'machinery' | 'other'

export interface Organization {
  slug: string
  name: string
  description: string
  website: string
  productType: ProductType
  securityContact: string
  /** Month the organization joined, YYYY-MM */
  memberSince: string
  verified: boolean
}
