import { useParams } from 'react-router'
import { AdvisoryTable } from '../components/AdvisoryTable'
import { findOrganization } from '../data/organizations'
import { newestFirst } from '../lib/filter'
import { formatMonth, initials } from '../lib/format'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import type { Advisory, ProductType } from '../types/advisory'
import { NotFoundPage } from './NotFoundPage'

interface OrganizationPageProps {
  advisories: Advisory[]
}

const PRODUCT_TYPES: Record<ProductType, string> = {
  software: 'Software',
  hardware: 'Hardware and IoT devices',
  machinery: 'Machinery and industrial systems',
  other: 'Other',
}

export function OrganizationPage({ advisories }: OrganizationPageProps) {
  const { slug } = useParams()
  const organization = findOrganization(slug)
  useDocumentTitle(organization?.name ?? 'Manufacturer not found')

  if (!organization) return <NotFoundPage what="manufacturer" />

  const own = newestFirst(advisories.filter((advisory) => advisory.organizationSlug === organization.slug))

  return (
    <main id="main">
      <section className="page-head" aria-labelledby="org-title">
        <div className="container org-head">
          <span className="org-avatar" aria-hidden="true">{initials(organization.name)}</span>
          <div>
            {organization.verified && <span className="badge badge-verified">Verified manufacturer</span>}
            <h1 id="org-title">{organization.name}</h1>
            <p>{organization.description}</p>
          </div>
        </div>
      </section>

      <div className="container page-body detail-layout">
        <section aria-labelledby="org-advisories-title">
          <div className="results-head">
            <h2 id="org-advisories-title">Advisories by {organization.name}</h2>
          </div>
          {own.length > 0
            ? <AdvisoryTable advisories={own} caption={`Advisories published by ${organization.name}`} />
            : <p className="empty-state">This manufacturer has not published any advisories yet.</p>}
        </section>

        <aside className="detail-aside" aria-label="Organization information">
          <section className="panel" aria-labelledby="about-title">
            <h2 id="about-title">About</h2>
            <dl className="meta">
              <dt>Website</dt>
              <dd><a href={organization.website}>{new URL(organization.website).host}</a></dd>
              <dt>Products</dt>
              <dd>{PRODUCT_TYPES[organization.productType]}</dd>
              <dt>On advisoryo since</dt>
              <dd><time dateTime={organization.memberSince}>{formatMonth(organization.memberSince)}</time></dd>
              <dt>Advisories</dt>
              <dd>{own.length}</dd>
            </dl>
          </section>

          <section className="panel" aria-labelledby="contact-title">
            <h2 id="contact-title">Report a vulnerability</h2>
            <p className="hint">Found a security issue in a product of this manufacturer? Contact their security team.</p>
            <p><a href={`mailto:${organization.securityContact}`}>{organization.securityContact}</a></p>
          </section>
        </aside>
      </div>
    </main>
  )
}
