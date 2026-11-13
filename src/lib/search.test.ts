import { describe, expect, it } from 'vitest'
import { phrases } from './content'
import { normalize, search } from './search'

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

  it('returns nothing for an empty query', () => {
    expect(search('   ')).toEqual([])
  })
})
