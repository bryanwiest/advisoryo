import { Link } from 'react-router'
import { advisoryPath } from '../lib/csaf'
import { formatDate, isoDate } from '../lib/format'
import type { Advisory, Organization } from '../types/advisory'
import { SeverityBadge } from './SeverityBadge'
import { StatusLabel } from './StatusLabel'

interface AdvisoryTableProps {
  advisories: Advisory[]
  caption: string
  /** Looks up the manufacturer; omitted on the organization page, where it is always the same */
  organizationOf?: (advisory: Advisory) => Organization | undefined
}

export function AdvisoryTable({ advisories, caption, organizationOf }: AdvisoryTableProps) {
  return (
    <div className="table-wrap">
      <table className="data-table">
        <caption className="visually-hidden">{caption}</caption>
        <thead>
          <tr>
            <th scope="col">Severity</th>
            <th scope="col">Advisory</th>
            <th scope="col">CVE</th>
            <th scope="col">Status</th>
            <th scope="col">Published</th>
          </tr>
        </thead>
        <tbody>
          {advisories.map((advisory) => {
            const organization = organizationOf?.(advisory)
            return (
              <tr key={advisory.id}>
                <td><SeverityBadge severity={advisory.severity} score={advisory.score} /></td>
                <td>
                  <Link className="row-title" to={advisoryPath(advisory)}>{advisory.title}</Link>
                  {organization && (
                    <Link className="row-org" to={`/organizations/${organization.slug}`}>{organization.name}</Link>
                  )}
                </td>
                <td>{advisory.cves.map((cve) => <code key={cve}>{cve}</code>)}</td>
                <td><StatusLabel status={advisory.status} /></td>
                <td><time dateTime={isoDate(advisory.currentReleaseDate)}>{formatDate(advisory.currentReleaseDate)}</time></td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
