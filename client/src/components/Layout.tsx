import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router'
import { SiteFooter } from './SiteFooter'
import { SiteHeader } from './SiteHeader'

/** Page frame shared by all routes. The current page is rendered in <Outlet />. */
export function Layout() {
  const { pathname } = useLocation()

  // A single-page app keeps the scroll position on navigation; start each new page at the top.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <SiteHeader />
      <Outlet />
      <SiteFooter />
    </>
  )
}
