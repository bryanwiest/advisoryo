import { toAdvisory, validateCsaf } from '../lib/csaf'
import type { Advisory } from '../types/advisory'
import { findOrganizationByName } from './organizations'

// Every JSON file in ./csaf is a real CSAF 2.0 document. Vite bundles them at build time,
// and they run through the same validation and normalization as an uploaded file.
const files = import.meta.glob<unknown>('./csaf/*.json', { eager: true, import: 'default' })

export const sampleAdvisories: Advisory[] = Object.entries(files).flatMap(([file, json]) => {
  const result = validateCsaf(json)
  if (!result.valid) {
    console.error(`Sample advisory ${file} is invalid`, result.errors)
    return []
  }
  const organization = findOrganizationByName(result.document.document?.publisher?.name)
  if (!organization) {
    console.error(`Sample advisory ${file} has an unknown publisher`)
    return []
  }
  return [toAdvisory(result.document, organization.slug)]
})
