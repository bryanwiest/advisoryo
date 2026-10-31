import type { CsafBranch, CsafDocument } from '../types/csaf'

export interface ValidationError {
  /** JSON pointer to the faulty field, e.g. /document/tracking/version */
  path: string
  message: string
}

export type ValidationResult =
  | { valid: true; document: CsafDocument }
  | { valid: false; errors: ValidationError[] }

const CVE_PATTERN = /^CVE-\d{4}-\d{4,}$/
const TRACKING_STATUSES = ['final', 'interim']

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== ''
}

function isDate(value: unknown): boolean {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value))
}

/** Calls visit() for every product defined in the product tree, with its JSON pointer. */
function walkProducts(
  doc: CsafDocument,
  visit: (product: { name?: string; product_id?: string }, path: string, ancestors: CsafBranch[]) => void,
) {
  const walk = (branches: CsafBranch[] | undefined, path: string, ancestors: CsafBranch[]) => {
    branches?.forEach((branch, index) => {
      const branchPath = `${path}/${index}`
      if (branch.product) visit(branch.product, `${branchPath}/product`, [...ancestors, branch])
      walk(branch.branches, `${branchPath}/branches`, [...ancestors, branch])
    })
  }
  walk(doc.product_tree?.branches, '/product_tree/branches', [])
  doc.product_tree?.full_product_names?.forEach((product, index) =>
    visit(product, `/product_tree/full_product_names/${index}`, []),
  )
}

/**
 * Checks the parts of a CSAF 2.0 document that advisoryo needs to publish it.
 * This is a subset of the official JSON schema and the mandatory tests (section 6.1);
 * the complete validation moves to the backend in milestone 3.
 */
export function validateCsaf(input: unknown): ValidationResult {
  const errors: ValidationError[] = []
  const error = (path: string, message: string) => errors.push({ path, message })

  if (!isObject(input)) {
    return { valid: false, errors: [{ path: '/', message: 'The file must contain a JSON object.' }] }
  }
  const doc = input as CsafDocument
  const meta = doc.document

  if (!meta || !isObject(doc.document)) {
    error('/document', 'The document section is missing.')
    return { valid: false, errors }
  }
  if (meta.csaf_version !== '2.0') error('/document/csaf_version', 'Only CSAF version 2.0 is supported.')
  if (!isNonEmptyString(meta.category)) error('/document/category', 'The document category is missing.')
  if (!isNonEmptyString(meta.title)) error('/document/title', 'The title is missing.')
  if (!isNonEmptyString(meta.publisher?.name)) error('/document/publisher/name', 'The publisher name is missing.')

  const tracking = meta.tracking
  if (!tracking || !isObject(meta.tracking)) {
    error('/document/tracking', 'The tracking section is missing.')
  } else {
    if (!isNonEmptyString(tracking.id)) error('/document/tracking/id', 'The tracking ID is missing.')
    if (!TRACKING_STATUSES.includes(tracking.status ?? '')) {
      error('/document/tracking/status', 'Only documents with status "final" or "interim" can be published.')
    }
    if (!isDate(tracking.initial_release_date)) {
      error('/document/tracking/initial_release_date', 'The initial release date is missing or not a valid date.')
    }
    if (!isDate(tracking.current_release_date)) {
      error('/document/tracking/current_release_date', 'The current release date is missing or not a valid date.')
    }
    const history = tracking.revision_history
    if (!Array.isArray(history) || history.length === 0) {
      error('/document/tracking/revision_history', 'The revision history needs at least one entry.')
    } else {
      history.forEach((revision, index) => {
        if (!isDate(revision.date)) {
          error(`/document/tracking/revision_history/${index}/date`, 'The revision date is not a valid date.')
        }
      })
      const last = history[history.length - 1]
      if (tracking.version !== last.number) {
        error('/document/tracking/version', 'The version must match the last entry of the revision history.')
      }
    }
  }

  // Product IDs must be unique and every reference must point to a defined product.
  const productIds = new Set<string>()
  walkProducts(doc, (product, path) => {
    if (!isNonEmptyString(product.product_id)) {
      error(`${path}/product_id`, 'The product ID is missing.')
    } else if (productIds.has(product.product_id)) {
      error(`${path}/product_id`, `The product ID ${product.product_id} is defined twice.`)
    } else {
      productIds.add(product.product_id)
    }
  })

  const checkReferences = (ids: unknown, path: string) => {
    if (!Array.isArray(ids)) return
    ids.forEach((id, index) => {
      if (!productIds.has(id)) error(`${path}/${index}`, `The product ID ${String(id)} is not defined in the product tree.`)
    })
  }

  if (meta.category === 'csaf_security_advisory' && (!Array.isArray(doc.vulnerabilities) || doc.vulnerabilities.length === 0)) {
    error('/vulnerabilities', 'A security advisory must describe at least one vulnerability.')
  }

  doc.vulnerabilities?.forEach((vulnerability, v) => {
    const path = `/vulnerabilities/${v}`
    if (vulnerability.cve !== undefined && !CVE_PATTERN.test(vulnerability.cve)) {
      error(`${path}/cve`, `${vulnerability.cve} is not a valid CVE ID (expected format CVE-YYYY-NNNN).`)
    }
    Object.entries(vulnerability.product_status ?? {}).forEach(([category, ids]) =>
      checkReferences(ids, `${path}/product_status/${category}`),
    )
    vulnerability.remediations?.forEach((remediation, r) =>
      checkReferences(remediation.product_ids, `${path}/remediations/${r}/product_ids`),
    )
    vulnerability.scores?.forEach((score, s) => {
      const base = score.cvss_v3?.baseScore
      if (base !== undefined && (typeof base !== 'number' || base < 0 || base > 10)) {
        error(`${path}/scores/${s}/cvss_v3/baseScore`, 'The CVSS base score must be a number between 0 and 10.')
      }
      checkReferences(score.products, `${path}/scores/${s}/products`)
    })
  })

  return errors.length > 0 ? { valid: false, errors } : { valid: true, document: doc }
}
