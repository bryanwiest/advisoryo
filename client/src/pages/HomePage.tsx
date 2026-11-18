import { Link } from 'react-router'
import { AdvisoryCard } from '../components/AdvisoryCard'
import { SearchForm } from '../components/SearchForm'
import { findOrganization } from '../data/organizations'
import { newestFirst } from '../lib/filter'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import type { Advisory } from '../types/advisory'

interface HomePageProps {
  advisories: Advisory[]
}

export function HomePage({ advisories }: HomePageProps) {
  useDocumentTitle('')
  const latest = newestFirst(advisories).slice(0, 4)

  return (
    <main id="main">
      <section className="hero" aria-labelledby="hero-title">
        <div className="container">
          <h1 id="hero-title">Security advisories in CSAF&nbsp;2.0, in one place</h1>
          <p className="lead">
            Manufacturers publish their advisories as validated CSAF documents.
            Operators and security teams find out in seconds whether their products are affected.
          </p>
          <SearchForm />
        </div>
      </section>

      <section className="latest" aria-labelledby="latest-title">
        <div className="container">
          <div className="section-head">
            <h2 id="latest-title">Latest advisories</h2>
            <Link to="/advisories">View all {advisories.length} advisories</Link>
          </div>
          <ul className="advisory-grid">
            {latest.map((advisory) => (
              <li key={advisory.id}>
                <AdvisoryCard advisory={advisory} organization={findOrganization(advisory.organizationSlug)} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="how" aria-labelledby="how-title">
        <div className="container">
          <h2 id="how-title">How it works</h2>
          <ol className="steps">
            <li>
              <h3>Write</h3>
              <p>Publishers create the advisory in an editor such as Secvisogram and export it as CSAF&nbsp;2.0 JSON.</p>
            </li>
            <li>
              <h3>Upload and validate</h3>
              <p>advisoryo checks the document against the CSAF rules and lists every error in plain language.</p>
            </li>
            <li>
              <h3>Publish and find</h3>
              <p>Valid advisories are public right away and searchable by CVE, product, manufacturer, severity and status.</p>
            </li>
          </ol>
        </div>
      </section>

      <section className="audiences" aria-labelledby="audiences-title">
        <div className="container">
          <h2 id="audiences-title">Who it is for</h2>
          <div className="audience-grid">
            <article className="audience">
              <h3>Manufacturers</h3>
              <p>
                Meet your disclosure duties under the EU Cyber Resilience Act without running your own CSAF portal.
                Organisation managers invite publishers and keep the company profile up to date.
              </p>
              <Link to="/upload">Upload an advisory</Link>
            </article>
            <article className="audience">
              <h3>Operators and security teams</h3>
              <p>
                Search all advisories without an account, check which product versions are affected
                and download the original CSAF document for your own tooling.
              </p>
              <Link to="/advisories">Browse advisories</Link>
            </article>
          </div>
        </div>
      </section>
    </main>
  )
}
