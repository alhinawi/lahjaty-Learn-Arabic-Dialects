import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { allFamous, famousFor, getFamous } from './content'
import { search } from './search'
import WithdrawnFeshlum from '../components/WithdrawnFeshlum'

describe('disputed Feshlum dish withdrawal', () => {
  it('does not teach or search the disputed Benghazi entry', () => {
    expect(getFamous('ben', 'famous.feshlum')).toBeUndefined()
    expect(famousFor('ben').some((p) => p.id === 'famous.feshlum')).toBe(false)
    expect(allFamous.some(({ dialectId, phrase }) => dialectId === 'ben' && phrase.id === 'famous.feshlum')).toBe(false)
    expect(search('فشلوم').some((h) => h.kind === 'famous' && h.phrase.id === 'famous.feshlum')).toBe(false)
  })
  it('keeps a bilingual correction with sources and no playback or old example', () => {
    for (const lang of ['ar', 'en'] as const) {
      const html = renderToStaticMarkup(createElement(WithdrawnFeshlum, { lang }))
      expect(html).toContain(lang === 'ar' ? 'تصحيح مدخل' : 'Entry correction')
      expect(html).toContain('https://alwasat.ly/news/libya/492419')
      expect(html).toContain('https://alwasat.ly/news/libya/472526')
      expect(html).toContain('/dialects/ben')
      expect(html).not.toContain('نتغدّوا حوت اليوم')
      expect(html).not.toContain('<button')
    }
  })
})
