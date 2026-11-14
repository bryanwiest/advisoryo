import { Link, useLocation, useParams } from 'react-router'
import { DownloadJsonButton } from '../components/DownloadJsonButton'
import { ProductStatusTable } from '../components/ProductStatusTable'
import { RevisionHistory } from '../components/RevisionHistory'
import { SeverityBadge } from '../components/SeverityBadge'
import { VulnerabilityPanel } from '../components/VulnerabilityPanel'
import { findOrganization } from '../data/organizations'
import { formatDate, isoDate } from '../lib/format'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import type { Advisory } from '../types/advisory'
import { NotFoundPage } from './NotFoundPage'

interface AdvisoryPageProps {
  advisories: Advisory[]
}

const REMEDIATION_LABELS: Record<string, string> = {
  vendor_fix: 'Vendor fix',
  workaround: 'Workaround',
  mitigation: 'Mitigation',
  none_available: 'No fix available yet',
  no_fix_planned: 'No fix planned',
}

const LANGUAGES: Record<string, string> = { en: 'English', de: 'German' }

export function AdvisoryPage({ advisories }: AdvisoryPageProps) {
  const { id = '' } = useParams()
  const location = useLocation()
  const advisory = advisories.find((candidate) => candidate.id.toLowerCase() === id.toLowerCase())
  useDocumentTitle(advisory ? advisory.title : 'Advisory not found')

  if (!advisory) return <NotFoundPage what="advisory" />

  const organization = findOrganization(advisory.organizationSlug)
  // Set by the upload page after a successful upload (see UploadPage.tsx)
  const justPublished = (location.state as { published?: 'new' | 'revision' } | null)?.published
  const remediations = advisory.vulnerabilities.flatMap((v) => v.remediations)
  // The same remediation often applies to several vulnerabilities; show it once.
  const uniqueRemediations = remediations.filter(
    (r, index) => remediations.findIndex((other) => other.category === r.category && other.details === r.details) === index,
  )

  return (
    <main id="main">
      <article className="advisory-detail">
        <header className="page-head">
          <div className="container">
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <ol>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/advisories">Advisories</Link></li>
                <li aria-current="page">{advisory.id}</li>
              </ol>
            </nav>
            {justPublished && (
              <p className="notice notice-success" role="status">
                {justPublished === 'revision'
                  ? `Version ${advisory.version} of ${advisory.id} is published.`
                  : `${advisory.id} is published and now listed under Advisories.`}
              </p>
            )}
            <SeverityBadge severity={advisory.severity} score={advisory.score} />
            <h1>{advisory.title}</h1>
            <ul className="detail-meta">
              <li>
                by {organization
                  ? <Link to={`/organizations/${organization.slug}`}>{organization.name}</Link>
                  : advisory.document.document?.publisher?.name}
              </li>
              <li>Tracking ID <code>{advisory.id}</code></li>
              <li>
                Version {advisory.version}, updated{' '}
                <time dateTime={isoDate(advisory.currentReleaseDate)}>{formatDate(advisory.currentReleaseDate)}</time>
              </li>
            </ul>
            <div className="detail-actions">
              <DownloadJsonButton data={advisory.document} fileName={`${advisory.id.toLowerCase()}.json`}>
                Download CSAF JSON
              </DownloadJsonButton>
              <a className="button button-secondary" href="https://secvisogram.github.io/">Open in Secvisogram</a>
            </div>
          </div>
        </header>

        <div className="container page-body detail-layout">
          <div className="detail-main">
            {advisory.summary && (
              <section aria-labelledby="summary-title">
                <h2 id="summary-title">Summary</h2>
                <p>{advisory.summary}</p>
              </section>
            )}

            <section aria-labelledby="vuln-title">
              <h2 id="vuln-title">Vulnerabilities</h2>
              {advisory.vulnerabilities.map((vulnerability, index) => (
                <VulnerabilityPanel key={vulnerability.cve ?? index} vulnerability={vulnerability} />
              ))}
            </section>

            <section aria-labelledby="products-title">
              <h2 id="products-title">Affected products</h2>
              {advisory.vulnerabilities.map((vulnerability, index) => (
                <ProductStatusTable
                  key={vulnerability.cve ?? index}
                  products={vulnerability.products}
                  caption={`Product status for ${vulnerability.cve ?? `vulnerability ${index + 1}`}`}
                />
              ))}
            </section>

            {uniqueRemediations.length > 0 && (
              <section aria-labelledby="remediation-title">
                <h2 id="remediation-title">Remediation</h2>
                <ul className="remediation-list">
                  {uniqueRemediations.map((remediation) => (
                    <li key={`${remediation.category}-${remediation.details}`}>
                      <strong>{REMEDIATION_LABELS[remediation.category] ?? remediation.category}</strong>
                      <p>{remediation.details}</p>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <aside className="detail-aside" aria-label="Document information">
            <section className="panel" aria-labelledby="doc-title">
              <h2 id="doc-title">Document</h2>
              <dl className="meta">
                <dt>Profile</dt>
                <dd><code className="code-wrap">{advisory.category}</code></dd>
                <dt>Status</dt>
                <dd className="capitalize">{advisory.documentStatus}</dd>
                {advisory.tlp && (
                  <>
                    <dt>TLP</dt>
                    <dd>{advisory.tlp}</dd>
                  </>
                )}
                {advisory.lang && (
                  <>
                    <dt>Language</dt>
                    <dd>{LANGUAGES[advisory.lang] ?? advisory.lang}</dd>
                  </>
                )}
                <dt>First published</dt>
                <dd><time dateTime={isoDate(advisory.initialReleaseDate)}>{formatDate(advisory.initialReleaseDate)}</time></dd>
              </dl>
            </section>
            <RevisionHistory revisions={advisory.revisions} />
          </aside>
        </div>
      </article>
    </main>
  )
}
