import { Link } from 'react-router'
import { PageHead } from '../components/PageHead'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

interface NotFoundPageProps {
  /** What was not found, e.g. "advisory"; default is a page */
  what?: string
}

export function NotFoundPage({ what = 'page' }: NotFoundPageProps) {
  useDocumentTitle('Not found')
  return (
    <main id="main">
      <PageHead title={`This ${what} does not exist`}>
        The address may be mistyped, or the {what} was removed.
      </PageHead>
      <div className="container page-body">
        <p><Link to="/advisories">Browse all advisories</Link> or go back to the <Link to="/">home page</Link>.</p>
      </div>
    </main>
  )
}
