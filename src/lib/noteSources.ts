import type { FamousPhrase } from './types'

/** Citations are external publisher pages, never scripts or credential-bearing URLs. */
export function isSafeSourceUrl(value: unknown): value is string {
  if (typeof value !== 'string' || value !== value.trim()) return false
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && !!url.hostname && !url.username && !url.password
  } catch {
    return false
  }
}

export function validateNoteSources(phrase: FamousPhrase): string[] {
  if (phrase.noteSources === undefined) return []
  const errors: string[] = []
  if (!phrase.note?.trim() || !phrase.noteAr?.trim()) errors.push('note sources require a note in both languages')
  if (!Array.isArray(phrase.noteSources) || !phrase.noteSources.length) return [...errors, 'note sources must be a non-empty list']
  const seen = new Set<string>()
  for (const source of phrase.noteSources) {
    if (typeof source?.title !== 'string' || !source.title.trim() || typeof source?.titleAr !== 'string' || !source.titleAr.trim()) {
      errors.push('note source requires Arabic and English titles')
    }
    if (!isSafeSourceUrl(source?.url)) {
      errors.push('note source requires an HTTPS URL without credentials')
    } else {
      const url = new URL(source.url).href
      if (seen.has(url)) errors.push('duplicate note source URL')
      seen.add(url)
    }
  }
  return errors
}
