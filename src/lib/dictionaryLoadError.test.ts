import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import DictionaryLoadError from '../components/DictionaryLoadError'
import { translate } from './i18n'
import { useApp } from './store'

vi.mock('./store', async (importOriginal) => {
  const original = await importOriginal<typeof import('./store')>()
  return { ...original, useApp: Object.assign((selector: (state: ReturnType<typeof original.useApp.getState>) => unknown) => selector(original.useApp.getState()), original.useApp) }
})
afterEach(() => useApp.setState({ lang: 'ar' }))
describe('dictionary download recovery', () => {
  it('offers a real retry button and explains failure instead of claiming no results', () => {
    for (const lang of ['ar', 'en'] as const) {
      useApp.setState({ lang })
      const html = renderToStaticMarkup(createElement(DictionaryLoadError, { onRetry: vi.fn() }))
      expect(html).toContain('role="status"')
      expect(html).toContain('type="button"')
      expect(html).toContain(translate(lang, 'dictLoadFailed'))
      expect(html).toContain(translate(lang, 'dictRetry'))
      expect(html).not.toContain(translate(lang, 'dictNotFound'))
    }
  })
})
