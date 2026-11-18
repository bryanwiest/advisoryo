import { useSearchParams } from 'react-router'
import { AdvisoryTable } from '../components/AdvisoryTable'
import { FilterPanel } from '../components/FilterPanel'
import { PageHead } from '../components/PageHead'
import { findOrganization, organizations } from '../data/organizations'
import { filterAdvisories, filtersFromParams, filtersToParams, type AdvisoryFilters, type SortOrder } from '../lib/filter'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import type { Advisory } from '../types/advisory'

interface AdvisoriesPageProps {
  advisories: Advisory[]
}

const organizationName = (slug: string) => findOrganization(slug)?.name ?? ''

export function AdvisoriesPage({ advisories }: AdvisoriesPageProps) {
  useDocumentTitle('Advisories')
  // The URL is the single source of truth for the filters (see lib/filter.ts).
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = filtersFromParams(searchParams)
  const results = filterAdvisories(advisories, filters, organizationName)

  function updateFilters(next: AdvisoryFilters) {
    // replace: typing in the search field should not create a history entry per keystroke
    setSearchParams(filtersToParams(next), { replace: true })
  }

  return (
    <main id="main">
      <PageHead title="Advisories">
        All published CSAF 2.0 advisories, newest first. Filter by severity, product status or manufacturer.
      </PageHead>

      <div className="container page-body sidebar-layout">
        <FilterPanel
          filters={filters}
          organizations={organizations}
          onChange={updateFilters}
          onReset={() => setSearchParams({})}
        />

        <section className="results" aria-labelledby="results-title">
          <div className="results-head">
            <h2 id="results-title" aria-live="polite">
              {results.length} {results.length === 1 ? 'advisory' : 'advisories'}
            </h2>
            <div className="sort">
              <label htmlFor="sort">Sort by</label>
              <select
                id="sort"
                name="sort"
                value={filters.sort}
                onChange={(event) => updateFilters({ ...filters, sort: event.target.value as SortOrder })}
              >
                <option value="newest">Newest first</option>
                <option value="severity">Highest severity</option>
                <option value="manufacturer">Manufacturer</option>
              </select>
            </div>
          </div>

          {results.length > 0 ? (
            <AdvisoryTable
              advisories={results}
              caption="Published advisories"
              organizationOf={(advisory) => findOrganization(advisory.organizationSlug)}
            />
          ) : (
            <div className="empty-state">
              <p>No advisory matches these filters.</p>
              <button className="button button-secondary" type="button" onClick={() => setSearchParams({})}>
                Reset filters
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
