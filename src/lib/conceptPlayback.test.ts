import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import ConceptPage from '../screens/ConceptPage'
import { concepts, famousByConcept, STANDARD_ID } from './content'
import { useApp } from './store'

vi.mock('../components/PlayButton', () => ({ default: ({ dialectId, phraseId, text }: { dialectId: string; phraseId: string; text: string }) => createElement('span', { 'data-audio-entry': `${dialectId}|${phraseId}`, 'data-text': text }) }))
vi.mock('./store', async (importOriginal) => {
  const original = await importOriginal<typeof import('./store')>()
  return { ...original, useApp: Object.assign((selector: (state: ReturnType<typeof original.useApp.getState>) => unknown) => selector(original.useApp.getState()), original.useApp) }
})
afterEach(() => useApp.setState({ lang: 'ar' }))

describe('concept entry playback', () => {
  it('passes each dialect expression, not just one per dialect, to the existing playback control in either language', () => {
    for (const lang of ['ar', 'en'] as const) for (const c of concepts) {
      useApp.setState({ lang })
      const rows = famousByConcept(c.id).filter((v) => v.dialectId !== STANDARD_ID)
      const html = renderToStaticMarkup(createElement(ConceptPage, { conceptId: c.id }))
      expect((html.match(/data-audio-entry=/g) ?? []).length).toBe(rows.length)
      for (const { dialectId, phrase } of rows) {
        const marker = renderToStaticMarkup(createElement('span', { 'data-audio-entry': `${dialectId}|${phrase.id}`, 'data-text': phrase.text }))
        expect(html.split(marker).length - 1, `${lang}/${c.id}/${dialectId}/${phrase.id}`).toBe(1)
      }
      expect(html).not.toContain('data-audio-entry="fs|')
    }
  })

  it('adds no playback entry to a missing concept', () => {
    expect(renderToStaticMarkup(createElement(ConceptPage, { conceptId: 'not_a_concept' }))).not.toContain('data-audio-entry=')
  })
})
