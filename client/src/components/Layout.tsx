import { Outlet } from 'react-router'
import { SiteFooter } from './SiteFooter'
import { SiteHeader } from './SiteHeader'

/** Page frame shared by all routes. The current page is rendered in <Outlet />. */
export function Layout() {
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <SiteHeader />
      <Outlet />
      <SiteFooter />
    </>
  )
}
