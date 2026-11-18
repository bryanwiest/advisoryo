import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { SEVERITIES, SEVERITY_LABELS } from '../lib/severity'

/** Search on the home page: leads to the advisory list with the search as URL parameters. */
export function SearchForm() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [severity, setSeverity] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const params = new URLSearchParams()
    if (query.trim()) params.set('q', query.trim())
    if (severity) params.set('severity', severity)
    navigate(`/advisories?${params}`)
  }

  return (
    <form className="search-form" role="search" onSubmit={handleSubmit}>
      <div className="field field-grow">
        <label htmlFor="q">Search advisories</label>
        <input
          type="search"
          id="q"
          name="q"
          placeholder="CVE ID, product or manufacturer"
          autoComplete="off"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="severity">Severity</label>
        <select id="severity" name="severity" value={severity} onChange={(event) => setSeverity(event.target.value)}>
          <option value="">Any</option>
          {SEVERITIES.map((value) => (
            <option key={value} value={value}>{SEVERITY_LABELS[value]}</option>
          ))}
        </select>
      </div>
      <button className="button" type="submit">Search</button>
    </form>
  )
}
