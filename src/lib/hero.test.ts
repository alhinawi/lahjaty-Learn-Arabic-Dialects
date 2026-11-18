import { describe, expect, it } from 'vitest'
import { content, dialects, getDialect, STANDARD_ID } from './content'
import { buildGreetings } from '../components/Hero'

describe('hero greeting carousel', () => {
  it('shows at most one dialect per country', () => {
    const greetings = buildGreetings()
    expect(greetings.length).toBeGreaterThan(0)
    const countries = greetings.map((g) => getDialect(g.dialectId)!.country)
    expect(new Set(countries).size).toBe(countries.length)
  })

  it('skips Modern Standard Arabic and empty texts', () => {
    for (const g of buildGreetings()) {
      expect(g.dialectId).not.toBe(STANDARD_ID)
      expect(g.text.trim().length).toBeGreaterThan(0)
    }
  })

  it('never repeats the same sentence, and still covers most countries', () => {
    const greetings = buildGreetings()
    expect(new Set(greetings.map((g) => g.text)).size).toBe(greetings.length)
    const phrase = content.phrases.find((p) => p.id === 'greetings.how_are_you')!
    const countriesWithText = new Set(
      dialects
        .filter((d) => d.id !== STANDARD_ID && phrase.variants[d.id]?.text?.trim())
        .map((d) => d.country || d.id),
    )
    // Only identical texts across countries are dropped, so coverage stays high.
    expect(greetings.length).toBeGreaterThanOrEqual(countriesWithText.size - 7)
  })
})
