import { concepts } from './content'
import { allDictEntries } from './dictionaryAll'
import { normalize } from './search'
import type { Concept, DictEntry } from './types'

/**
 * Exact, deterministic cross-links between a dictionary word and a concept with the same
 * normalized Standard-Arabic name. A link exists only when the match is unambiguous:
 * one concept name per dictionary word, and one dictionary word per linked concept.
 */
const conceptsByName = new Map<string, Concept[]>()
for (const c of concepts) {
  const key = normalize(c.name)
  conceptsByName.set(key, [...(conceptsByName.get(key) ?? []), c])
}
const entriesByName = new Map<string, DictEntry[]>()
for (const e of allDictEntries) {
  const key = normalize(e.fs)
  entriesByName.set(key, [...(entriesByName.get(key) ?? []), e])
}

/** The single concept this dictionary word names, when there is exactly one. */
export function conceptForEntry(entry: DictEntry): Concept | undefined {
  const matches = conceptsByName.get(normalize(entry.fs)) ?? []
  return matches.length === 1 ? matches[0] : undefined
}

/** The single dictionary word naming this concept, when there is exactly one. */
export function entryForConcept(concept: Concept): DictEntry | undefined {
  const matches = entriesByName.get(normalize(concept.name)) ?? []
  return matches.length === 1 ? matches[0] : undefined
}
