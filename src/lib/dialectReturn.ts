import { categories } from './content'
import index from '../content/dictionary/index.json'

const destinations = new Set([
  '/', '/lessons', '/dictionary', '/practice', '/practice/cards',
  ...categories.map((category) => `/lessons/${category.id}`),
  ...index.topics.map((topic) => `/dictionary/${topic.id}`),
])

/** Only destinations used by the app's change-dialect links can select-and-return. */
export function dialectReturnPath(value: string | null): string | null {
  if (!value) return null
  const path = value === '/' ? value : value.replace(/\/$/, '')
  return destinations.has(path) ? path : null
}
