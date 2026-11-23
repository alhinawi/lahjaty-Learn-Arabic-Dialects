import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import SearchPage from '../screens/SearchPage'
import ComparePage from '../screens/ComparePage'
import { concepts, famousByConcept, STANDARD_ID } from './content'
import { variantsByDialect } from './conceptVariants'
import * as searchModule from './search'
import { useApp } from './store'

const params = vi.hoisted(() => ({ query: new URLSearchParams() }))
vi.mock('next/navigation', () => ({ useSearchParams: () => params.query, useRouter: () => ({ push: vi.fn(), replace: vi.fn() }) }))
vi.mock('../components/PlayButton', () => ({ default: ({ dialectId, phraseId, text }: { dialectId: string; phraseId: string; text: string }) => createElement('span', { 'data-audio-entry': `${dialectId}|${phraseId}`, 'data-text': text }) }))
vi.mock('./store', async (importOriginal) => {
  const original = await importOriginal<typeof import('./store')>()
  return { ...original, useApp: Object.assign((selector: (state: ReturnType<typeof original.useApp.getState>) => unknown) => selector(original.useApp.getState()), original.useApp) }
})
afterEach(() => { vi.restoreAllMocks(); useApp.setState({ myDialectId: null, lang: 'ar' }) })

const multiplicity = (html: string, entry: string) => html.split(`data-audio-entry="${entry}"`).length - 1

describe('all concept expressions in search and comparison', () => {
  it('groups without losing expressions or changing within-dialect order', () => {
    const rows = famousByConcept('buddy')
    const groups = variantsByDialect(rows)
    expect([...groups.values()].flat()).toEqual(rows)
    expect(groups.get('mnf')).toHaveLength(2)
    expect(variantsByDialect([]).size).toBe(0)
  })

  it('shows every search expression exactly once with its own audio ID and exact-entry target', () => {
    for (const c of concepts) {
      const rows = famousByConcept(c.id)
      if (!rows.length) continue
      vi.spyOn(searchModule, 'search').mockReturnValue([{ kind: 'concept', key: `c:${c.id}`, conceptId: c.id, score: 100, matched: c.name }])
      params.query = new URLSearchParams({ q: c.name })
      for (const myDialectId of [null, 'mnf']) {
        useApp.setState({ myDialectId })
        const html = renderToStaticMarkup(createElement(SearchPage))
        for (const { dialectId, phrase } of rows) {
          expect(multiplicity(html, `${dialectId}|${phrase.id}`), `${c.id}/${dialectId}/${phrase.id}`).toBe(1)
          if (dialectId === STANDARD_ID) {
            expect(html).toMatch(new RegExp(`/share/?.*dialect=fs.*phrase=${phrase.id.replaceAll('.', '\\.')}`))
            expect(html).not.toContain('/dialects/fs')
          } else expect(html).toMatch(new RegExp(`/dialects/${dialectId}/?#entry-${phrase.id.replaceAll('.', '\\.')}`))
        }
      }
      vi.restoreAllMocks()
    }
  })

  it('shows every comparison expression exactly once with its own text and audio ID', () => {
    for (const c of concepts) {
      const rows = famousByConcept(c.id)
      if (!rows.length) continue
      params.query = new URLSearchParams({ c: c.id })
      const html = renderToStaticMarkup(createElement(ComparePage))
      for (const { dialectId, phrase } of rows) expect(multiplicity(html, `${dialectId}|${phrase.id}`), `${c.id}/${dialectId}/${phrase.id}`).toBe(1)
      expect((html.match(/data-audio-entry=/g) ?? []).length).toBe(rows.length)
    }
  })
})
