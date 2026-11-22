import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import FamousCard from '../components/FamousCard'
import { allFamous, getFamous } from './content'
import { famousEntryAnchor, famousEntryHref } from './famousLinks'

describe('exact famous-entry navigation', () => {
  it('gives every entry a stable, unambiguous target within its dialect', () => {
    const targets = new Set<string>()
    for (const { dialectId, phrase } of allFamous) {
      const href = famousEntryHref(dialectId, phrase.id)
      expect(targets.has(href)).toBe(false)
      targets.add(href)
      const url = new URL(href, 'https://example.org')
      expect(url.pathname).toBe(`/dialects/${dialectId}/`)
      expect(decodeURIComponent(url.hash.slice(1))).toBe(famousEntryAnchor(phrase.id))
      expect(famousEntryAnchor(phrase.id)).not.toMatch(/\s/)
    }
    expect(targets.size).toBe(allFamous.length)
  })

  it('uses IDs, not changeable or repeated display labels', () => {
    expect(famousEntryHref('psu', 'famous.musakhan')).toBe('/dialects/psu/#entry-famous.musakhan')
    expect(famousEntryHref('test/id', 'famous.a b')).toBe('/dialects/test%2Fid/#entry-famous.a%20b')
  })

  it('only makes explicitly anchored cards focusable fragment targets', () => {
    const phrase = getFamous('psu', 'famous.musakhan')!
    const plain = renderToStaticMarkup(createElement(FamousCard, { dialectId: 'psu', phrase }))
    expect(plain).not.toContain('tabindex="-1"')
    const html = renderToStaticMarkup(createElement(FamousCard, { dialectId: 'psu', phrase, anchorId: famousEntryAnchor(phrase.id) }))
    expect(html).toContain('id="entry-famous.musakhan"')
    expect(html).toContain('tabindex="-1"')
    expect(html).toContain('scroll-mt-24')
    expect(html).toContain('target:border-brand-700')
  })
})
