import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import SharePage from '../screens/SharePage'
import * as content from './content'
import { useApp } from './store'

vi.mock('./store', async (importOriginal) => {
  const original = await importOriginal<typeof import('./store')>()
  return { ...original, useApp: Object.assign((selector: (state: ReturnType<typeof original.useApp.getState>) => unknown) => selector(original.useApp.getState()), original.useApp) }
})

const render = (dialectId: string, phraseId: string) => renderToStaticMarkup(createElement(SharePage, { dialectId, phraseId }))
afterEach(() => { vi.restoreAllMocks(); useApp.setState({ lang: 'ar' }) })

describe('shared famous-phrase context', () => {
  it('keeps all six existing sourced notes and scoped citations in both languages', () => {
    for (const lang of ['ar', 'en'] as const) {
      useApp.setState({ lang })
      for (const { dialectId, phrase } of content.allFamous.filter(({ phrase }) => phrase.noteSources)) {
        const html = render(dialectId, phrase.id)
        expect(html).toContain(renderToStaticMarkup(createElement('p', {}, lang === 'ar' ? phrase.noteAr! : phrase.note!)).slice(3, -4))
        expect(html).toContain(lang === 'ar' ? 'عن التعبير' : 'About this expression')
        expect(html).toContain('aria-labelledby="shared-note-title"')
        expect(html).toContain('<details')
        expect(html).not.toContain(' open=')
        expect(html).toContain(lang === 'ar' ? 'ليست توثيقًا للنطق أو المثال' : 'not pronunciation or example verification')
        for (const source of phrase.noteSources!) expect(html).toContain(source.url)
      }
    }
  })

  it('shows an existing unsourced note without implying that sources exist', () => {
    const item = content.allFamous.find(({ phrase }) => phrase.noteAr && !phrase.noteSources)!
    expect(render(item.dialectId, item.phrase.id)).toContain(item.phrase.noteAr!)
    expect(render(item.dialectId, item.phrase.id)).not.toContain('<details')
  })

  it('omits an empty note section and uses the existing Arabic fallback', () => {
    const phrase = structuredClone(content.getFamous('psu', 'famous.musakhan')!)
    delete phrase.noteAr
    delete phrase.noteSources
    const spy = vi.spyOn(content, 'getFamous').mockReturnValue(phrase)
    expect(render('psu', phrase.id)).toContain(phrase.note!)
    delete phrase.note
    expect(render('psu', phrase.id)).not.toContain('shared-note-title')
    spy.mockRestore()
  })

  it('keeps everyday shares without a famous-note disclosure', () => {
    const html = render('cai', 'greetings.how_are_you')
    expect(html).not.toContain('shared-note-title')
    expect(html).not.toContain('<details')
    expect(html).toContain('href="/compare?p=greetings.how_are_you"')
  })

  it('keeps missing shares missing instead of showing unrelated context', () => {
    expect(render('psu', 'famous.not_an_entry')).not.toContain('shared-note-title')
    expect(render('not_a_dialect', 'famous.musakhan')).not.toContain('shared-note-title')
  })
})
