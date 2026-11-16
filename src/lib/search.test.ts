import { describe, expect, it } from 'vitest'
import { concepts, phrases } from './content'
import { comparableHits, normalize, regionalMatchGroups, search } from './search'

describe('normalize', () => {
  it('folds hamza, taa marbuta, alif maqsura and tashkeel', () => {
    expect(normalize('أِزَّيَّك')).toBe(normalize('ازيك'))
    expect(normalize('مدرسة')).toBe(normalize('مدرسه'))
    expect(normalize('على')).toBe(normalize('علي'))
    expect(normalize('إسكندرية')).toBe(normalize('اسكندريه'))
  })
  it('maps Arabic digits to Latin ones', () => {
    expect(normalize('١٢٣')).toBe('123')
  })
})

describe('search', () => {
  it('finds a phrase by its English meaning and shows it in several dialects', () => {
    const p = phrases[0]
    const hits = search(p.english)
    const hit = hits.find((h) => h.kind === 'phrase' && h.phrase.id === p.id)
    expect(hit).toBeDefined()
  })

  it('finds a phrase from any dialect text, even without hamza or tashkeel', () => {
    const p = phrases.find((x) => Object.keys(x.variants).length > 3)!
    const [dialectId, v] = Object.entries(p.variants).find(([id]) => id !== 'msa')!
    const hits = search(normalize(v.text))
    expect(hits.some((h) => h.kind === 'phrase' && h.phrase.id === p.id), `${dialectId}: ${v.text}`).toBe(true)
  })

  it('finds Egypt regions by governorate', () => {
    expect(search('الدقهليه').some((h) => h.kind === 'egypt')).toBe(true)
  })

  it('finds every macro-region by its Arabic and English name', () => {
    for (const [q, group] of [['الخليج', 'gulf'], ['gulf', 'gulf'], ['المغرب العربي', 'maghreb'], ['maghreb', 'maghreb'], ['الشام', 'levant']] as const) {
      const hit = search(q).find((h) => h.kind === 'region' && h.group === group)
      expect(hit, q).toBeTruthy()
    }
  })

  it('returns nothing for an empty query', () => {
    expect(search('   ')).toEqual([])
  })
})

describe('comparableHits', () => {
  it('finds everyday phrases from any dialect, Standard Arabic or English', () => {
    expect(comparableHits('thank you', 'phrase', 3)[0]?.id).toBe('expressions.thank_you')
    expect(comparableHits('شكرا', 'phrase', 5).map((h) => h.id)).toContain('expressions.thank_you')
    expect(comparableHits('برشا', 'phrase', 8).length).toBeGreaterThan(0)
  })

  it('offers only shared meanings on the famous tab, each once', () => {
    const hits = comparableHits('now', 'concept', 8)
    expect(hits.every((h) => h.kind === 'concept')).toBe(true)
    expect(new Set(hits.map((h) => h.id)).size).toBe(hits.length)
    expect(hits.map((h) => h.id)).toContain('now')
  })
})


describe('regional-word coverage', () => {
  it('retrieves the correct concept for every regional word within normal search limits', () => {
    let checked = 0
    for (const c of concepts) {
      for (const [group, word] of Object.entries(c.words ?? {})) {
        const hits = search(word)
        const matching = hits.filter((h) => h.kind === 'concept' && h.conceptId === c.id)
        expect(matching.length, `${c.id}/${group}: ${word}`).toBe(1)
        expect(regionalMatchGroups(matching[0]), `${c.id}/${group}`).toContain(group)
        checked++
      }
    }
    expect(checked).toBe(255)
  })

  it('does not assign macro-region words to an arbitrary single dialect', () => {
    const hit = search('ذلحين').find((h) => h.kind === 'concept' && h.conceptId === 'now')!
    expect(hit).toBeTruthy()
    expect(hit.dialectId).toBeUndefined()
    expect(regionalMatchGroups(hit)).toEqual(['yemen'])
  })
})
