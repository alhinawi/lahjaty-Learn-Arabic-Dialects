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
afterEach(() => { vi.restoreAllMocks(); useApp.setState({ lang: 'ar', showTranslit: true }) })

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

  it('keeps everyday shares without famous-entry citations', () => {
    const html = render('cai', 'greetings.how_are_you')
    expect(html).not.toContain('<details')
    expect(html).toContain('href="/compare?p=greetings.how_are_you"')
  })

  it('preserves every existing everyday usage note in either language without borrowing sources', () => {
    for (const lang of ['ar', 'en'] as const) {
      useApp.setState({ lang })
      for (const phrase of content.phrases) {
        const note = lang === 'ar' ? phrase.noteAr ?? phrase.note : phrase.note
        const html = render('cai', phrase.id)
        if (!phrase.variants.cai) continue
        expect(html.includes('shared-note-title'), `${lang}/${phrase.id}`).toBe(!!note)
        if (note) expect(html).toContain(renderToStaticMarkup(createElement('p', {}, note)).slice(3, -4))
        expect(html).not.toContain('<details')
      }
    }
  })

  it('uses the existing English fallback for everyday Arabic context and omits an empty section', () => {
    const phrase = structuredClone(content.getPhrase('greetings.how_are_you')!)
    phrase.note = 'Existing usage context'
    delete phrase.noteAr
    const spy = vi.spyOn(content, 'getPhrase').mockReturnValue(phrase)
    expect(render('cai', phrase.id)).toContain(phrase.note)
    delete phrase.note
    expect(render('cai', phrase.id)).not.toContain('shared-note-title')
    spy.mockRestore()
  })

  it('does not offer a nonexistent Standard Arabic dialect overview', () => {
    const html = render('fs', 'famous.al_aan')
    expect(html).not.toContain('/dialects/fs')
    expect(html).toContain('href="/compare?c=now"')
    expect(html).toContain('الآن')
    expect(render('cai', 'greetings.how_are_you')).toContain('/dialects/cai')
  })

  it('preserves every stored famous example in both interface languages', () => {
    for (const lang of ['ar', 'en'] as const) {
      useApp.setState({ lang })
      for (const { dialectId, phrase } of content.allFamous) {
        const html = render(dialectId, phrase.id)
        expect(html.includes('shared-example-title'), `${lang}/${dialectId}/${phrase.id}`).toBe(!!phrase.example)
        if (phrase.example) {
          expect(html).toContain(renderToStaticMarkup(createElement('p', {}, phrase.example)).slice(3, -4))
          expect(html).toContain(lang === 'ar' ? '>مثال</h2>' : '>Example</h2>')
          expect(html).toContain('dir="rtl" lang="ar" class="dialect-text mt-2 text-lg')
        }
      }
    }
  })

  it('keeps examples independent of notes and does not invent everyday examples', () => {
    const phrase = structuredClone(content.getFamous('psu', 'famous.musakhan')!)
    phrase.example = 'Existing stored example'
    delete phrase.note
    delete phrase.noteAr
    delete phrase.noteSources
    vi.spyOn(content, 'getFamous').mockReturnValue(phrase)
    const html = render('psu', phrase.id)
    expect(html).toContain('shared-example-title')
    expect(html).not.toContain('shared-note-title')
    expect(html).not.toContain('<details')
    expect(render('cai', 'greetings.how_are_you')).not.toContain('shared-example-title')
    delete phrase.example
    expect(render('psu', phrase.id)).not.toContain('shared-example-title')
  })

  it('preserves stored everyday transliteration only when the learner enables it', () => {
    for (const lang of ['ar', 'en'] as const) {
      useApp.setState({ lang, showTranslit: true })
      for (const phrase of content.phrases) {
        const variant = phrase.variants.cai
        if (!variant) continue
        const html = render('cai', phrase.id)
        expect(html.includes('data-shared-translit=') , phrase.id).toBe(!!variant.translit)
        if (variant.translit) expect(html).toContain(renderToStaticMarkup(createElement('p', {}, variant.translit)).slice(3, -4))
      }
      useApp.setState({ showTranslit: false })
      expect(render('cai', 'greetings.how_are_you')).not.toContain('data-shared-translit=')
    }
  })

  it('never invents transliteration for famous or untranslated everyday variants', () => {
    useApp.setState({ showTranslit: true })
    expect(render('cai', 'famous.ya_3am')).not.toContain('data-shared-translit=')
    const phrase = structuredClone(content.getPhrase('greetings.how_are_you')!)
    delete phrase.variants.cai.translit
    vi.spyOn(content, 'getPhrase').mockReturnValue(phrase)
    expect(render('cai', phrase.id)).not.toContain('data-shared-translit=')
  })

  it('keeps missing shares missing instead of showing unrelated context', () => {
    expect(render('psu', 'famous.not_an_entry')).not.toContain('shared-note-title')
    expect(render('not_a_dialect', 'famous.musakhan')).not.toContain('shared-note-title')
  })
})
