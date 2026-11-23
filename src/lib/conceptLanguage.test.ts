import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import ConceptPage from '../screens/ConceptPage'
import { famousByConcept, getConcept, getDialect, STANDARD_ID } from './content'
import { regionLabel } from './search'
import { useApp } from './store'
import type { WordGroup } from './types'

vi.mock('./store', async (importOriginal) => {
  const original = await importOriginal<typeof import('./store')>()
  return { ...original, useApp: Object.assign((selector: (state: ReturnType<typeof original.useApp.getState>) => unknown) => selector(original.useApp.getState()), original.useApp) }
})
const escaped = (text: string) => renderToStaticMarkup(createElement('p', {}, text)).slice(3, -4)
afterEach(() => useApp.setState({ lang: 'ar' }))

describe('concept detail language', () => {
  it('uses the chosen language for titles, region names, dialect names, countries and notes', () => {
    for (const lang of ['ar', 'en'] as const) for (const conceptId of ['buddy', 'how_are_you', 'now']) {
      useApp.setState({ lang })
      const concept = getConcept(conceptId)!
      const html = renderToStaticMarkup(createElement(ConceptPage, { conceptId }))
      expect(html).toContain(`«${escaped(lang === 'ar' ? concept.name : concept.nameEn)}»`)
      for (const group of Object.keys(concept.words ?? {})) expect(html).toContain(escaped(regionLabel(group as WordGroup, lang)))
      for (const { dialectId, phrase } of famousByConcept(conceptId).filter((v) => v.dialectId !== STANDARD_ID)) {
        const d = getDialect(dialectId)!
        expect(html).toContain(escaped(lang === 'ar' ? d.name : d.nameEn))
        if (d.country) expect(html).toContain(escaped((lang === 'ar' ? d.country : d.countryEn)!))
        const note = lang === 'ar' ? phrase.noteAr ?? phrase.note : phrase.note
        if (note) expect(html).toContain(escaped(note))
        expect(html).toContain(escaped(phrase.text))
        if (phrase.example) expect(html).toContain(escaped(phrase.example))
      }
    }
  })

  it('preserves variant share destinations and the Arabic reference in English', () => {
    useApp.setState({ lang: 'en' })
    const html = renderToStaticMarkup(createElement(ConceptPage, { conceptId: 'buddy' }))
    expect(html).toContain(`lang="ar" class="mt-1 text-end text-sm text-cream-100">${getConcept('buddy')!.name}</p>`)
    for (const { dialectId, phrase } of famousByConcept('buddy').filter((v) => v.dialectId !== STANDARD_ID)) {
      expect(html).toContain(`href="/share/${dialectId}/${phrase.id}`)
    }
  })
})
