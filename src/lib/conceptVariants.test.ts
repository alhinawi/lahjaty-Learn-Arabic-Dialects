import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import ConceptPage from '../screens/ConceptPage'
import ConceptsPage from '../screens/ConceptsPage'
import { concepts, famousByConcept, STANDARD_ID } from './content'
import { conceptDialectCount } from './conceptVariants'
import { translate } from './i18n'

const escape = (text: string) => renderToStaticMarkup(createElement('p', {}, text)).slice(3, -4)
describe('distinct concept dialect counts', () => {
  it('counts dialects once, excluding Standard Arabic and handling empty input', () => {
    expect(conceptDialectCount([])).toBe(0)
    expect(conceptDialectCount([{ dialectId: 'fs' }, { dialectId: 'cai' }, { dialectId: 'cai' }, { dialectId: 'sud' }])).toBe(2)
    expect(conceptDialectCount(famousByConcept('buddy'))).toBe(27)
    expect(conceptDialectCount(famousByConcept('now'))).toBe(33)
    expect(conceptDialectCount(famousByConcept('welcome'))).toBe(14)
  })

  it('shows the distinct count for every published concept without dropping expressions', () => {
    for (const c of concepts) {
      const rows = famousByConcept(c.id).filter((v) => v.dialectId !== STANDARD_ID)
      if (!rows.length) continue
      const html = renderToStaticMarkup(createElement(ConceptPage, { conceptId: c.id }))
      const count = new Set(rows.map((v) => v.dialectId)).size
      expect(html).toContain(escape(translate('ar', 'conceptDialectCount', { n: count })))
      expect((html.match(/<li /g) ?? []).length).toBe(rows.length)
      for (const { dialectId, phrase } of rows) expect(html).toContain(`/share/${dialectId}/${phrase.id}`)
    }
  })

  it('keeps the index card count consistent with each detail page', () => {
    const html = renderToStaticMarkup(createElement(ConceptsPage))
    for (const c of concepts) {
      const rows = famousByConcept(c.id).filter((v) => v.dialectId !== STANDARD_ID)
      if (!rows.length) continue
      const card = html.split('<li>').find((s) => (s.includes(`href="/concepts/${c.id}"`) || s.includes(`href="/concepts/${c.id}/"`)))!
      expect(card, c.id).toBeDefined()
      expect(card, c.id).toContain(escape(translate('ar', 'conceptDialectCount', { n: conceptDialectCount(rows) })))
    }
  })
})
