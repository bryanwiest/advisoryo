import type { Advisory } from '../types/advisory'

export function newestFirst(advisories: Advisory[]): Advisory[] {
  return [...advisories].sort((a, b) => b.currentReleaseDate.localeCompare(a.currentReleaseDate))
}
