import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import DictSearch from '../components/DictSearch'
import { useApp } from './store'

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }))
vi.mock('./store', async (importOriginal) => {
  const original = await importOriginal<typeof import('./store')>()
  return { ...original, useApp: Object.assign((selector: (state: ReturnType<typeof original.useApp.getState>) => unknown) => selector(original.useApp.getState()), original.useApp) }
})
afterEach(() => useApp.setState({ lang: 'ar' }))

describe('dictionary search accessibility shell', () => {
  it('starts collapsed with no active or fabricated result in both languages', () => {
    for (const lang of ['ar', 'en'] as const) {
      useApp.setState({ lang })
      const html = renderToStaticMarkup(createElement(DictSearch))
      expect(html).toContain('role="combobox"')
      expect(html).toContain('aria-autocomplete="list"')
      expect(html).toContain('aria-expanded="false"')
      expect(html).toContain('aria-controls=')
      expect(html).not.toContain('aria-activedescendant=')
      expect(html).not.toContain('role="option"')
    }
  })
  it('gives separate controls to repeated search fields', () => {
    const html = renderToStaticMarkup(createElement('div', {}, createElement(DictSearch), createElement(DictSearch)))
    const ids = [...html.matchAll(/aria-controls="([^"]+)"/g)].map((m) => m[1])
    expect(ids).toHaveLength(2)
    expect(new Set(ids).size).toBe(2)
  })
})
