import { useEffect, useRef } from 'react'
import type { ValidationError } from '../lib/csaf'

interface ValidationErrorsProps {
  errors: ValidationError[]
}

export function ValidationErrors({ errors }: ValidationErrorsProps) {
  const headingRef = useRef<HTMLHeadingElement>(null)

  // Move the focus to the result so that keyboard and screen reader users notice it.
  useEffect(() => {
    if (errors.length > 0) headingRef.current?.focus()
  }, [errors])

  if (errors.length === 0) return null

  return (
    <section className="validation" aria-labelledby="validation-title">
      <h2 id="validation-title" ref={headingRef} tabIndex={-1}>
        {errors.length === 1 ? '1 problem found' : `${errors.length} problems found`}, nothing was published
      </h2>
      <ul className="validation-list">
        {errors.map((error) => (
          <li key={`${error.path}-${error.message}`}>
            {error.path && <code>{error.path}</code>}
            {error.message}
          </li>
        ))}
      </ul>
    </section>
  )
}
