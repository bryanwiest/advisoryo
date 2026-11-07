const dateFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
const monthFormat = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' })

/** "2026-10-17T09:00:00.000Z" → "17 Oct 2026" */
export function formatDate(iso: string): string {
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? iso : dateFormat.format(date)
}

/** "2026-03" → "March 2026" */
export function formatMonth(yearMonth: string): string {
  return monthFormat.format(new Date(`${yearMonth}-01T00:00:00`))
}

/** Value for the datetime attribute of <time>: only the date part */
export function isoDate(iso: string): string {
  return iso.slice(0, 10)
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter((word) => /^[A-Z]/.test(word))
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
}
