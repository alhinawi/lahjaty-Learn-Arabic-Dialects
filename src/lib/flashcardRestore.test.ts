import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
const hydration = vi.hoisted(() => ({ ready: false }))
vi.mock('./useHydrated', () => ({ useHydrated: () => hydration.ready }))
vi.mock('./store', async (importOriginal) => {
  const original = await importOriginal<typeof import('./store')>()
  return { ...original, useApp: Object.assign((selector: (state: ReturnType<typeof original.useApp.getState>) => unknown) => selector(original.useApp.getState()), original.useApp) }
})
import FlashcardsPage from '../screens/FlashcardsPage'
import { useApp } from './store'
import { phrases } from './content'
afterEach(() => { hydration.ready = false; useApp.setState({ lang: 'ar', dialectId: 'cai', cards: {} }) })
describe('flashcard session restoration', () => {
  it('does not build or show a fresh session before saved review dates restore', () => {
    const html = renderToStaticMarkup(createElement(FlashcardsPage))
    expect(html).toContain('skeleton')
    expect(html).not.toContain('min-h-64')
  })
  it('starts with overdue saved cards rather than a future-due first phrase in both languages', () => {
    const [future, overdue] = phrases.filter((p) => p.variants.cai)
    for (const lang of ['ar', 'en'] as const) {
      useApp.setState({ lang, dialectId: 'cai', cards: { [`cai|${future.id}`]: { box: 5, due: '2099-12-01' }, [`cai|${overdue.id}`]: { box: 1, due: '2000-01-01' } } })
      hydration.ready = true
      const html = renderToStaticMarkup(createElement(FlashcardsPage))
      expect(html).toContain(overdue.variants.cai.text)
      expect(html).not.toContain(future.variants.cai.text)
    }
  })
  it('shows all done when every card is scheduled in the future', () => {
    hydration.ready = true
    useApp.setState({ cards: Object.fromEntries(phrases.filter((p) => p.variants.cai).map((p) => [`cai|${p.id}`, { box: 5, due: '2099-12-01' }])) })
    const html = renderToStaticMarkup(createElement(FlashcardsPage))
    expect(html).not.toContain('min-h-64')
    expect(html).not.toContain('skeleton')
  })
})
