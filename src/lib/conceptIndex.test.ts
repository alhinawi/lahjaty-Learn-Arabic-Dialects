import { describe, expect, it } from 'vitest'
import { conceptIndexEntries } from './conceptIndex'
import { concepts, famousByConcept, STANDARD_ID, WORD_GROUPS } from './content'
import { search } from './search'

describe('searchable concept index', () => {
  it('preserves every published concept in order with only real dialect expressions', () => {
    const rows = conceptIndexEntries()
    expect(rows.map((r) => r.concept)).toEqual(concepts.filter((c) => famousByConcept(c.id).some((v) => v.dialectId !== STANDARD_ID)))
    expect(conceptIndexEntries('  ')).toEqual(rows)
    for (const row of rows) expect(row.variants.every((v) => v.dialectId !== STANDARD_ID)).toBe(true)
  })
  it('matches English, Arabic normalized spelling and existing dialect expressions', () => {
    for (const q of ['buddy', 'يا عم', 'دِلْوَقْتِي', 'Now']) {
      const expected = new Set(search(q, Infinity).flatMap((h) => h.kind === 'concept' ? [h.conceptId] : []))
      expect(expected.size).toBeGreaterThan(0)
      expect(conceptIndexEntries(q).map((r) => r.concept.id)).toEqual(conceptIndexEntries().filter((r) => expected.has(r.concept.id)).map((r) => r.concept.id))
    }
  })
  it('intersects search and region filters, including empty results', () => {
    for (const group of WORD_GROUPS) {
      expect(conceptIndexEntries('', group)).toEqual(conceptIndexEntries().filter((r) => r.concept.words?.[group]))
      expect(conceptIndexEntries('يا', group)).toEqual(conceptIndexEntries('يا').filter((r) => r.concept.words?.[group]))
    }
    expect(conceptIndexEntries('zzzznomatch999')).toEqual([])
  })
})
