import { SEVERITIES, SEVERITY_LABELS, STATUSES, STATUS_LABELS } from '../lib/severity'
import type { AdvisoryFilters } from '../lib/filter'
import type { Organization } from '../types/advisory'

interface FilterPanelProps {
  filters: AdvisoryFilters
  organizations: Organization[]
  onChange: (filters: AdvisoryFilters) => void
  onReset: () => void
}

/** Adds the value to the list if it is checked, otherwise removes it. */
function toggle<T>(list: T[], value: T, checked: boolean): T[] {
  return checked ? [...list, value] : list.filter((item) => item !== value)
}

export function FilterPanel({ filters, organizations, onChange, onReset }: FilterPanelProps) {
  return (
    <aside className="filters" aria-labelledby="filter-title">
      <h2 id="filter-title">Filter</h2>
      {/* Filters apply immediately; the form only groups the fields. */}
      <form className="form-stack" role="search" onSubmit={(event) => event.preventDefault()}>
        <div className="field">
          <label htmlFor="q">Search</label>
          <input
            type="search"
            id="q"
            name="q"
            placeholder="CVE ID, product or manufacturer"
            value={filters.query}
            onChange={(event) => onChange({ ...filters, query: event.target.value })}
          />
        </div>

        <fieldset>
          <legend>Severity</legend>
          {SEVERITIES.map((severity) => (
            <div className="choice" key={severity}>
              <input
                type="checkbox"
                id={`sev-${severity}`}
                name="severity"
                value={severity}
                checked={filters.severities.includes(severity)}
                onChange={(event) =>
                  onChange({ ...filters, severities: toggle(filters.severities, severity, event.target.checked) })
                }
              />
              <label htmlFor={`sev-${severity}`}>{SEVERITY_LABELS[severity]}</label>
            </div>
          ))}
        </fieldset>

        <fieldset>
          <legend>Status</legend>
          {STATUSES.map((status) => (
            <div className="choice" key={status}>
              <input
                type="checkbox"
                id={`st-${status}`}
                name="status"
                value={status}
                checked={filters.statuses.includes(status)}
                onChange={(event) =>
                  onChange({ ...filters, statuses: toggle(filters.statuses, status, event.target.checked) })
                }
              />
              <label htmlFor={`st-${status}`}>{STATUS_LABELS[status]}</label>
            </div>
          ))}
        </fieldset>

        <div className="field">
          <label htmlFor="org">Manufacturer</label>
          <select
            id="org"
            name="org"
            value={filters.organization}
            onChange={(event) => onChange({ ...filters, organization: event.target.value })}
          >
            <option value="">All manufacturers</option>
            {organizations.map((organization) => (
              <option key={organization.slug} value={organization.slug}>{organization.name}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="from">Published after</label>
          <input
            type="date"
            id="from"
            name="from"
            value={filters.publishedAfter}
            onChange={(event) => onChange({ ...filters, publishedAfter: event.target.value })}
          />
        </div>

        <div className="form-actions">
          <button className="button button-secondary" type="button" onClick={onReset}>Reset filters</button>
        </div>
      </form>
    </aside>
  )
}
