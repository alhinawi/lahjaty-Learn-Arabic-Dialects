import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import FamousCard from '../components/FamousCard'
import FamousGrid from '../components/FamousGrid'
import * as contentModule from './content'
import NoteSources from '../components/NoteSources'
import { famousContent, getFamous } from './content'
import { isSafeSourceUrl, validateNoteSources } from './noteSources'
import type { FamousPhrase } from './types'
import { validateContent } from './validate'
import { content } from './content'

const phrase = (): FamousPhrase => structuredClone(getFamous('psr', 'famous.maqluba')!)

describe('note source metadata', () => {
  it('keeps the nine scoped context notes at two sources each', () => {
    const sourced = Object.entries(famousContent.dialects).flatMap(([d, list]) => list.filter((p) => p.noteSources).map((p) => [d, p.id]))
    expect(sourced).toEqual([
      ['cai', 'famous.awi'],
      ['psu', 'famous.kunafa_nabulsiyye'], ['psu', 'famous.musakhan'],
      ['psr', 'famous.maqluba'], ['psr', 'famous.khubz_taboon'], ['psr', 'famous.al_khalil'], ['psr', 'famous.bethlehem'], ['bag', 'famous.chai'], ['emi', 'famous.fujairah'],
    ])
    for (const [dialectId, id] of sourced) {
      const p = getFamous(dialectId, id)!
      expect(p.noteSources).toHaveLength(2)
      expect(validateNoteSources(p)).toEqual([])
    }
  })

  it('accepts absent citations without implying anything about a note', () => {
    const p = phrase()
    delete p.noteSources
    expect(validateNoteSources(p)).toEqual([])
  })

  it('requires bilingual notes and source labels', () => {
    const p = phrase()
    p.noteAr = ''
    p.noteSources![0].title = ' '
    expect(validateNoteSources(p)).toContain('note sources require a note in both languages')
    expect(validateNoteSources(p)).toContain('note source requires Arabic and English titles')
  })

  it('rejects empty citation lists and duplicate destinations', () => {
    const p = phrase()
    p.noteSources!.push(p.noteSources![0])
    expect(validateNoteSources(p)).toContain('duplicate note source URL')
    p.noteSources = []
    expect(validateNoteSources(p)).toContain('note sources must be a non-empty list')
  })

  it('rejects unsafe, relative, malformed and credential-bearing URLs', () => {
    for (const url of ['javascript:void(0)', 'http://example.org/', '/source', 'not a URL', 'https://user:pass@example.org/', ' https://example.org/']) {
      expect(isSafeSourceUrl(url), url).toBe(false)
      const p = phrase()
      p.noteSources![0].url = url
      expect(validateNoteSources(p)).toContain('note source requires an HTTPS URL without credentials')
    }
    expect(isSafeSourceUrl('https://example.org/source')).toBe(true)
  })

  it('connects citation checks to the normal content gate', () => {
    const broken = structuredClone(famousContent)
    broken.dialects.psr.find((p) => p.id === 'famous.maqluba')!.noteSources![0].url = '/bad'
    expect(validateContent(content, undefined, broken).some((e) => e.includes('note source requires an HTTPS URL'))).toBe(true)
  })
})

describe('note source disclosure', () => {
  it('renders nothing when citations are absent or unsafe', () => {
    expect(renderToStaticMarkup(createElement(NoteSources, { lang: 'en' }))).toBe('')
    expect(renderToStaticMarkup(createElement(NoteSources, { lang: 'en', sources: [] }))).toBe('')
    expect(renderToStaticMarkup(createElement(NoteSources, { lang: 'en', sources: [{ title: 'Source', titleAr: 'مصدر', url: '/bad' }] }))).toBe('')
  })

  it('uses a collapsed native disclosure, scoped labels and safe external links in both languages', () => {
    const p = phrase()
    for (const lang of ['ar', 'en'] as const) {
      const html = renderToStaticMarkup(createElement(NoteSources, { lang, sources: p.noteSources }))
      expect(html).toContain('<details')
      expect(html).toContain('<summary')
      expect(html).not.toContain(' open=')
      expect(html).toContain('target="_blank"')
      expect(html).toContain('rel="noopener noreferrer"')
      expect(html).toContain(lang === 'ar' ? 'مصادر الشرح' : 'Sources for this note')
      expect(html).toContain(lang === 'ar' ? 'ليست توثيقًا للنطق أو المثال' : 'not pronunciation or example verification')
      expect(html).toContain(lang === 'ar' ? p.noteSources![0].titleAr : p.noteSources![0].title)
      expect(html).toContain(lang === 'ar' ? 'يفتح في علامة تبويب جديدة' : 'opens in a new tab')
    }
  })
})


describe('source disclosure surfaces', () => {
  it('shows citations with a sourced famous card but not an unsourced card', () => {
    const sourced = renderToStaticMarkup(createElement(FamousCard, { dialectId: 'psr', phrase: phrase() }))
    expect(sourced).toContain('<details')
    expect(sourced).toContain(phrase().noteSources![0].url)
    const withoutSources = phrase()
    delete withoutSources.noteSources
    expect(renderToStaticMarkup(createElement(FamousCard, { dialectId: 'psr', phrase: withoutSources }))).not.toContain('<details')
  })

  it('keeps citations on the daily phrase note too', () => {
    const spy = vi.spyOn(contentModule, 'phraseOfTheDay').mockReturnValue({ dialectId: 'psr', phrase: phrase() })
    try {
      const html = renderToStaticMarkup(createElement(FamousGrid))
      expect(html).toContain('<details')
      expect(html).toContain(phrase().noteSources![0].url)
    } finally {
      spy.mockRestore()
    }
  })
})
