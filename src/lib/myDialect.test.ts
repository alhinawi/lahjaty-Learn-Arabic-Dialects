import { describe, expect, it } from 'vitest'
import { allFamous, famousFor, famousStrip, getConcept, getPhrase, phraseOfTheDay } from './content'
import { baseInMyDialect, famousInMyDialect } from './myDialect'

describe('baseInMyDialect', () => {
  const hello = getPhrase('greetings.hello')!

  it('shows the same phrase in the visitor\'s dialect', () => {
    expect(baseInMyDialect(hello, 'tun', 'dkh')).toBe(hello.variants.dkh.text)
  })

  it('shows nothing without a dialect, for Standard Arabic, or on the visitor\'s own dialect', () => {
    expect(baseInMyDialect(hello, 'tun', null)).toBeUndefined()
    expect(baseInMyDialect(hello, 'tun', 'fs')).toBeUndefined()
    expect(baseInMyDialect(hello, 'dkh', 'dkh')).toBeUndefined()
  })
})

describe('famousInMyDialect', () => {
  it('prefers the visitor\'s own famous phrase with the same meaning', () => {
    const cai = famousFor('cai').find((f) => f.concept === 'very')!
    const shq = famousFor('shq').find((f) => f.concept === 'very')!
    expect(famousInMyDialect(shq, 'shq', 'cai')).toBe(cai.text)
  })

  it('falls back to the region\'s everyday word', () => {
    const f = allFamous.find(({ phrase }) => phrase.concept === 'now')!.phrase
    const mine = famousFor('mar').find((x) => x.concept === 'now')
    expect(famousInMyDialect(f, 'xx', 'mar')).toBe(mine?.text ?? getConcept('now')!.words!.maghreb)
  })

  it('returns nothing for a phrase without a shared meaning', () => {
    const f = allFamous.find(({ phrase }) => !phrase.concept)!
    expect(famousInMyDialect(f.phrase, f.dialectId, 'cai')).toBeUndefined()
  })
})

describe('home highlight', () => {
  it('picks a phrase every day and one per dialect in the strip', () => {
    for (let day = 20000; day < 20010; day++) expect(phraseOfTheDay(day).phrase.text).toBeTruthy()
    const strip = famousStrip(20000)
    expect(new Set(strip.map((s) => s.dialectId)).size).toBe(strip.length)
    expect(strip.some((s) => s.dialectId === 'fs')).toBe(false)
  })
})
