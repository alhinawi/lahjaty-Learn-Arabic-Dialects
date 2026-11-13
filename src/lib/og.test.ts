import { describe, expect, it } from 'vitest'
import { allFamous, dialects, STANDARD_ID } from './content'
import { allEgyptNodes } from './egypt'
import { famousSlug, ogImageFor, sharePath } from './og'

describe('ogImageFor', () => {
  it('gives the home card to the home page and unknown pages', () => {
    expect(ogImageFor('/')).toBe('/og/home.jpg')
    expect(ogImageFor('/nothing/here')).toBe('/og/home.jpg')
  })

  it('gives every dialect, Egypt page and famous phrase its own card', () => {
    for (const d of dialects.filter((x) => x.id !== STANDARD_ID)) expect(ogImageFor(`/dialects/${d.id}`)).toBe(`/og/dialects/${d.id}.jpg`)
    expect(ogImageFor('/egypt')).toBe('/og/egypt.jpg')
    for (const n of allEgyptNodes()) expect(ogImageFor(`/egypt/${n.id}/`)).toBe(`/og/egypt/${n.id}.jpg`)
    const { dialectId, phrase } = allFamous[0]
    expect(ogImageFor(sharePath(dialectId, phrase.id))).toBe(`/og/p/${dialectId}/${famousSlug(phrase.id)}.jpg`)
  })

  it('shares an everyday phrase with its dialect card', () => {
    expect(ogImageFor(sharePath('cai', 'greetings.how_are_you'))).toBe('/og/dialects/cai.jpg')
  })
})
