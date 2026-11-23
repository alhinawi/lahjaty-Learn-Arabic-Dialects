import { concepts, famousByConcept, STANDARD_ID } from './content'
import { search } from './search'
import type { WordGroup } from './types'

/** Filter the published index without dropping low-ranked matches behind a global result limit. */
export function conceptIndexEntries(query = '', group: WordGroup | 'all' = 'all') {
  const matching = query.trim() ? new Set(search(query, Infinity).flatMap((hit) => hit.kind === 'concept' ? [hit.conceptId] : [])) : null
  return concepts
    .map((concept) => ({ concept, variants: famousByConcept(concept.id).filter((v) => v.dialectId !== STANDARD_ID) }))
    .filter(({ concept, variants }) => variants.length > 0 && (group === 'all' || !!concept.words?.[group]) && (!matching || matching.has(concept.id)))
}
