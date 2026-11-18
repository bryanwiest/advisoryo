// Subset of the CSAF 2.0 JSON format that advisoryo reads.
// Full specification: https://docs.oasis-open.org/csaf/csaf/v2.0/csaf-v2.0.html
// All fields are optional here because uploaded documents are untrusted;
// validateCsaf() in lib/csaf.ts checks which ones are actually present.

export interface CsafNote {
  category?: string
  text?: string
  title?: string
}

export interface CsafRevision {
  date?: string
  number?: string
  summary?: string
}

export interface CsafTracking {
  id?: string
  status?: string
  version?: string
  initial_release_date?: string
  current_release_date?: string
  revision_history?: CsafRevision[]
}

export interface CsafDocumentMeta {
  category?: string
  csaf_version?: string
  title?: string
  lang?: string
  distribution?: { tlp?: { label?: string } }
  notes?: CsafNote[]
  publisher?: { category?: string; name?: string; namespace?: string }
  tracking?: CsafTracking
}

export interface CsafFullProductName {
  name?: string
  product_id?: string
}

export interface CsafBranch {
  category?: string
  name?: string
  product?: CsafFullProductName
  branches?: CsafBranch[]
}

export interface CsafProductTree {
  branches?: CsafBranch[]
  full_product_names?: CsafFullProductName[]
}

export type CsafProductStatusCategory =
  | 'first_affected'
  | 'first_fixed'
  | 'fixed'
  | 'known_affected'
  | 'known_not_affected'
  | 'last_affected'
  | 'recommended'
  | 'under_investigation'

export interface CsafVulnerability {
  cve?: string
  cwe?: { id?: string; name?: string }
  notes?: CsafNote[]
  product_status?: Partial<Record<CsafProductStatusCategory, string[]>>
  remediations?: { category?: string; details?: string; product_ids?: string[] }[]
  scores?: {
    cvss_v3?: { baseScore?: number; baseSeverity?: string; vectorString?: string; version?: string }
    products?: string[]
  }[]
}

export interface CsafDocument {
  document?: CsafDocumentMeta
  product_tree?: CsafProductTree
  vulnerabilities?: CsafVulnerability[]
}
