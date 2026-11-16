import { describe, expect, it } from 'vitest'
import { conceptForEntry, entryForConcept } from './conceptDict'
import { concepts, getConcept } from './content'
import { allDictEntries } from './dictionaryAll'
import { normalize } from './search'

describe('concept-dictionary cross-links', () => {
  it('links only unambiguous matches, consistently in both directions', () => {
    let entryLinks = 0
    let conceptLinks = 0
    for (const e of allDictEntries) {
      const c = conceptForEntry(e)
      if (!c) continue
      entryLinks++
      expect(normalize(c.name), e.id).toBe(normalize(e.fs))
      expect(getConcept(c.id), e.id).toBeTruthy()
      // concept side links back only when it names exactly one dictionary word
      const back = entryForConcept(c)
      if (back) {
        conceptLinks++
        expect(back.id, c.id).toBe(e.id)
      }
    }
    expect(entryLinks).toBeGreaterThan(0)
    expect(conceptLinks).toBeGreaterThan(0)
    expect(conceptLinks).toBeLessThanOrEqual(entryLinks)
  })

  it('resolves the known exact matches', () => {
    const thanks = allDictEntries.find((e) => e.id === 'basics.thanks')!
    expect(conceptForEntry(thanks)?.id).toBe('thanks')
    expect(entryForConcept(getConcept('thanks')!)?.id).toBe('basics.thanks')
  })

  it('skips ambiguous names: two dictionary words for one concept', () => {
    const neverMind = getConcept('never_mind')!
    const dupes = allDictEntries.filter((e) => normalize(e.fs) === normalize(neverMind.name))
    expect(dupes.length).toBeGreaterThan(1)
    expect(entryForConcept(neverMind)).toBeUndefined()
    for (const d of dupes) expect(conceptForEntry(d)?.id).toBe('never_mind')
  })

  it('keeps concept names unique after normalization', () => {
    const seen = new Map<string, string>()
    for (const c of concepts) {
      const key = normalize(c.name)
      expect(seen.has(key), `${c.id} duplicates ${seen.get(key)}`).toBe(false)
      seen.set(key, c.id)
    }
  })
})
