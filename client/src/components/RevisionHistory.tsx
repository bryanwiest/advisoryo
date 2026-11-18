import { formatDate, isoDate } from '../lib/format'
import type { Revision } from '../types/advisory'

interface RevisionHistoryProps {
  revisions: Revision[]
}

export function RevisionHistory({ revisions }: RevisionHistoryProps) {
  // Newest revision first; `reversed` keeps the list numbers matching the version numbers.
  const newestFirst = [...revisions].reverse()
  return (
    <section className="panel" aria-labelledby="history-title">
      <h2 id="history-title">Revision history</h2>
      <ol className="revisions" reversed>
        {newestFirst.map((revision) => (
          <li key={`${revision.number}-${revision.date}`}>
            <strong>
              Version {revision.number}, <time dateTime={isoDate(revision.date)}>{formatDate(revision.date)}</time>
            </strong>
            {' '}{revision.summary}
          </li>
        ))}
      </ol>
    </section>
  )
}
