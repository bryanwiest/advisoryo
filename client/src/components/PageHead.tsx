import type { ReactNode } from 'react'

interface PageHeadProps {
  title: string
  children?: ReactNode
}

export function PageHead({ title, children }: PageHeadProps) {
  return (
    <section className="page-head">
      <div className="container">
        <h1>{title}</h1>
        {children && <p>{children}</p>}
      </div>
    </section>
  )
}
