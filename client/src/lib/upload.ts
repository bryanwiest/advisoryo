import type { Advisory, Organization } from '../types/advisory'
import type { CsafDocument } from '../types/csaf'
import type { ValidationError } from './csaf'

export const MAX_FILE_SIZE = 2 * 1024 * 1024

export type UploadType = 'new' | 'revision'

interface UploadContext {
  organization: Organization
  type: UploadType
  /** All advisories that are already published */
  advisories: Advisory[]
  /** Only for revisions: the advisory that gets a new version */
  existing: Advisory | undefined
}

/**
 * Platform rules on top of the CSAF validation: who may publish what.
 * In milestone 3 the backend checks these again, because a client-side check can be bypassed.
 */
export function checkUpload(doc: CsafDocument, context: UploadContext): ValidationError[] {
  const errors: ValidationError[] = []
  const meta = doc.document!
  const tracking = meta.tracking!
  const id = tracking.id!

  if (meta.publisher?.name !== context.organization.name) {
    errors.push({
      path: '/document/publisher/name',
      message: `The publisher is "${meta.publisher?.name}", but you upload for ${context.organization.name}.`,
    })
  }

  const sameId = context.advisories.find((advisory) => advisory.id.toLowerCase() === id.toLowerCase())

  if (context.type === 'new' && sameId) {
    errors.push({
      path: '/document/tracking/id',
      message: `An advisory with the ID ${id} already exists. Choose "New revision" to update it.`,
    })
  }

  if (context.type === 'revision' && context.existing) {
    if (id !== context.existing.id) {
      errors.push({
        path: '/document/tracking/id',
        message: `The tracking ID must be ${context.existing.id}, the advisory you selected.`,
      })
    } else if (!(Number(tracking.version) > Number(context.existing.version))) {
      errors.push({
        path: '/document/tracking/version',
        message: `Version ${tracking.version} is not newer than the published version ${context.existing.version}.`,
      })
    }
  }

  return errors
}
