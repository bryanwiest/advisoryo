import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { PageHead } from '../components/PageHead'
import { ValidationErrors } from '../components/ValidationErrors'
import { findOrganization, organizations } from '../data/organizations'
import { advisoryPath, toAdvisory, validateCsaf, type ValidationError } from '../lib/csaf'
import { newestFirst } from '../lib/filter'
import { checkUpload, MAX_FILE_SIZE, type UploadType } from '../lib/upload'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import type { Advisory } from '../types/advisory'

interface UploadPageProps {
  advisories: Advisory[]
  onPublish: (advisory: Advisory) => void
}

export function UploadPage({ advisories, onPublish }: UploadPageProps) {
  useDocumentTitle('Upload advisory')
  const navigate = useNavigate()

  const [organizationSlug, setOrganizationSlug] = useState(organizations[0].slug)
  const [uploadType, setUploadType] = useState<UploadType>('new')
  const [existingId, setExistingId] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [changeSummary, setChangeSummary] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [errors, setErrors] = useState<ValidationError[]>([])
  const [checking, setChecking] = useState(false)

  const organization = findOrganization(organizationSlug)!
  const ownAdvisories = newestFirst(advisories.filter((advisory) => advisory.organizationSlug === organizationSlug))
  const existing = advisories.find((advisory) => advisory.id === existingId)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!file) return
    if (file.size > MAX_FILE_SIZE) {
      setErrors([{ path: '', message: 'The file is larger than 2 MB.' }])
      return
    }

    setChecking(true)
    let json: unknown
    try {
      json = JSON.parse(await file.text())
    } catch (error) {
      setErrors([{ path: '', message: `The file is not valid JSON: ${(error as Error).message}` }])
      setChecking(false)
      return
    }

    const result = validateCsaf(json)
    const problems = result.valid
      ? checkUpload(result.document, { organization, type: uploadType, advisories, existing })
      : result.errors
    setChecking(false)

    if (!result.valid || problems.length > 0) {
      setErrors(problems)
      return
    }

    const advisory = toAdvisory(result.document, organization.slug)
    // The optional summary from the form replaces the summary of the newest revision.
    const summary = changeSummary.trim()
    const revisions = summary
      ? advisory.revisions.map((revision, index, all) => (index === all.length - 1 ? { ...revision, summary } : revision))
      : advisory.revisions
    onPublish({ ...advisory, revisions })
    navigate(advisoryPath(advisory), { state: { published: uploadType } })
  }

  return (
    <main id="main">
      <PageHead title="Upload advisory">
        Upload a CSAF 2.0 JSON document. advisoryo validates it and publishes it only if it is valid.
      </PageHead>

      <div className="container container-narrow page-body">
        <p className="notice notice-info">
          To try it out, download the sample <a href="/samples/thd-sa-2026-012.json" download>valid advisory</a> or
          the <a href="/samples/invalid-thd-sa-2026-013.json" download>invalid advisory</a> and upload it for
          Thermo Devices AG. Uploads are kept until the page is reloaded; storage follows with the backend.
        </p>

        <form className="form-card form-stack" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="organization">Organization</label>
            <select
              id="organization"
              name="organization"
              required
              value={organizationSlug}
              onChange={(event) => {
                setOrganizationSlug(event.target.value)
                setExistingId('')
              }}
            >
              {organizations.map((option) => (
                <option key={option.slug} value={option.slug}>{option.name}</option>
              ))}
            </select>
          </div>

          <fieldset>
            <legend>Upload type</legend>
            <div className="choice">
              <input
                type="radio"
                id="type-new"
                name="type"
                value="new"
                checked={uploadType === 'new'}
                onChange={() => setUploadType('new')}
              />
              <label htmlFor="type-new">New advisory</label>
            </div>
            <div className="choice">
              <input
                type="radio"
                id="type-revision"
                name="type"
                value="revision"
                checked={uploadType === 'revision'}
                onChange={() => setUploadType('revision')}
              />
              <label htmlFor="type-revision">New revision of an existing advisory</label>
            </div>
          </fieldset>

          {uploadType === 'revision' && (
            <div className="field">
              <label htmlFor="advisory">Existing advisory</label>
              <select
                id="advisory"
                name="advisory"
                required
                value={existingId}
                onChange={(event) => setExistingId(event.target.value)}
              >
                <option value="">Select an advisory</option>
                {ownAdvisories.map((advisory) => (
                  <option key={advisory.id} value={advisory.id}>
                    {advisory.id}, {advisory.title} (version {advisory.version})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="field">
            <label htmlFor="document">CSAF document</label>
            <input
              type="file"
              id="document"
              name="document"
              accept=".json,application/json"
              required
              aria-describedby="document-hint"
              onChange={(event) => {
                setFile(event.target.files?.[0] ?? null)
                setErrors([])
              }}
            />
            <p id="document-hint" className="hint">
              JSON only, up to 2 MB. Documents exported from Secvisogram can be uploaded directly.
            </p>
          </div>

          <div className="field">
            <label htmlFor="summary">Change summary (optional)</label>
            <textarea
              id="summary"
              name="summary"
              rows={3}
              aria-describedby="summary-hint"
              value={changeSummary}
              onChange={(event) => setChangeSummary(event.target.value)}
            />
            <p id="summary-hint" className="hint">Shown in the revision history of the advisory.</p>
          </div>

          <div className="choice">
            <input
              type="checkbox"
              id="confirm"
              name="confirm"
              required
              checked={confirmed}
              onChange={(event) => setConfirmed(event.target.checked)}
            />
            <label htmlFor="confirm">I confirm that this advisory may be published publicly (TLP:CLEAR).</label>
          </div>

          <div className="form-actions">
            <button className="button" type="submit" disabled={checking}>
              {checking ? 'Checking…' : 'Validate and publish'}
            </button>
            <Link to="/advisories">Cancel</Link>
          </div>
        </form>

        <ValidationErrors errors={errors} />
      </div>
    </main>
  )
}
