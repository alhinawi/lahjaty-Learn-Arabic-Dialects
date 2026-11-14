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

describe('famousInMyDialect only shows a true equivalent', () => {
  it('does not answer one dialect\'s local phrase with another dialect\'s different phrase', () => {
    const tilapia = famousFor('kfs').find((f) => f.text === 'البلطي')!
    expect(tilapia).toBeTruthy()
    expect(famousInMyDialect(tilapia, 'kfs', 'dkh')).toBeUndefined()
    const coffee = famousFor('dkh').find((f) => f.text === 'يلّا عالقهوة')!
    for (const { phrase, dialectId } of allFamous) {
      expect(famousInMyDialect(phrase, dialectId, 'dkh')).not.toBe(coffee.text)
    }
  })

  it('every answer is the same meaning: a phrase of the visitor\'s dialect with the same concept, the everyday phrase, or the region\'s word', () => {
    for (const myId of ['dkh', 'cai', 'tun', 'naj', 'bag', 'dam']) {
      for (const { phrase, dialectId } of allFamous) {
        const got = famousInMyDialect(phrase, dialectId, myId)
        if (got === undefined) continue
        const concept = getConcept(phrase.concept!)!
        const own = famousFor(myId).filter((x) => x.concept === phrase.concept).map((x) => x.text)
        const words = Object.values(concept.words ?? {})
        const base = getPhrase(concept.base)?.variants[myId]?.text
        expect([...own, ...words, base]).toContain(got)
      }
    }
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
