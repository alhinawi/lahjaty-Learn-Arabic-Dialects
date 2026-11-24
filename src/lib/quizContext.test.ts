import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import QuizExpressionContext from '../components/QuizExpressionContext'
import { allFamous } from './content'
import { useApp } from './store'
vi.mock('./store', async (importOriginal) => {
  const original = await importOriginal<typeof import('./store')>()
  return { ...original, useApp: Object.assign((selector: (state: ReturnType<typeof original.useApp.getState>) => unknown) => selector(original.useApp.getState()), original.useApp) }
})
afterEach(() => useApp.setState({ lang: 'ar' }))
describe('quiz expression context', () => {
  it('never reveals entry links before an answer', () => {
    for (const { dialectId, phrase } of allFamous) expect(renderToStaticMarkup(createElement(QuizExpressionContext, { answered: false, dialectId, phraseId: phrase.id }))).toBe('')
  })
  it('links every answer to its exact entry with a translated label', () => {
    for (const lang of ['ar', 'en'] as const) {
      useApp.setState({ lang })
      for (const { dialectId, phrase } of allFamous) {
        const html = renderToStaticMarkup(createElement(QuizExpressionContext, { answered: true, dialectId, phraseId: phrase.id }))
        const url = new URL(html.match(/href="([^"]+)"/)![1].replaceAll('&amp;', '&'), 'https://example.org')
        expect(url.pathname.replace(/\/$/, '')).toBe('/share')
        expect(url.searchParams.get('dialect')).toBe(dialectId)
        expect(url.searchParams.get('phrase')).toBe(phrase.id)
        expect(html).toContain(lang === 'ar' ? 'عن التعبير' : 'About this expression')
      }
    }
  })
  it('omits invalid or mismatched entry IDs rather than fabricating a destination', () => {
    for (const [dialectId, phraseId] of [['missing', 'famous.now'], ['cai', 'missing'], ['cai', 'greetings.hello']]) expect(renderToStaticMarkup(createElement(QuizExpressionContext, { answered: true, dialectId, phraseId }))).toBe('')
  })
})
