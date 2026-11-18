import { Link, NavLink } from 'react-router'
import logo from '../assets/logo/advisoryo.svg'
import logoDark from '../assets/logo/advisoryo-dark.svg'

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link className="brand" to="/" aria-label="advisoryo home">
          <picture>
            <source media="(prefers-color-scheme: dark)" srcSet={logoDark} />
            <img src={logo} alt="advisoryo" width="160" height="45" />
          </picture>
        </Link>
        <nav className="main-nav" aria-label="Main navigation">
          <ul>
            {/* NavLink sets aria-current="page" on the active link, which the CSS highlights */}
            <li><NavLink to="/" end>Home</NavLink></li>
            <li><NavLink to="/advisories">Advisories</NavLink></li>
            <li><NavLink to="/upload">Upload</NavLink></li>
            <li><Link className="button button-small" to="/login">Sign in</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  )
}
