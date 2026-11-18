import { Link } from 'react-router'
import { advisoryPath } from '../lib/csaf'
import { formatDate, isoDate } from '../lib/format'
import type { Advisory, Organization } from '../types/advisory'
import { SeverityBadge } from './SeverityBadge'
import { StatusLabel } from './StatusLabel'

interface AdvisoryCardProps {
  advisory: Advisory
  organization: Organization | undefined
}

export function AdvisoryCard({ advisory, organization }: AdvisoryCardProps) {
  return (
    <article className="advisory-card">
      <header>
        <SeverityBadge severity={advisory.severity} score={advisory.score} />
        <h3><Link to={advisoryPath(advisory)}>{advisory.title}</Link></h3>
      </header>
      <dl className="meta">
        <dt>Manufacturer</dt>
        <dd>
          {organization
            ? <Link to={`/organizations/${organization.slug}`}>{organization.name}</Link>
            : advisory.document.document?.publisher?.name}
        </dd>
        <dt>CVE</dt>
        <dd>{advisory.cves.length > 0 ? <code>{advisory.cves.join(', ')}</code> : 'none'}</dd>
        <dt>Published</dt>
        <dd><time dateTime={isoDate(advisory.currentReleaseDate)}>{formatDate(advisory.currentReleaseDate)}</time></dd>
      </dl>
      <StatusLabel status={advisory.status} variant="line" />
    </article>
  )
}
