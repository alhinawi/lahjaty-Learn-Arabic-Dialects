import { describe, expect, it } from 'vitest'
import { messages, translate } from './i18n'

describe('i18n', () => {
  it('has the same keys and placeholders in Arabic and English', () => {
    const keys = Object.keys(messages.ar).sort()
    expect(Object.keys(messages.en).sort()).toEqual(keys)
    for (const key of keys as (keyof typeof messages.ar)[]) {
      const vars = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort()
      expect(vars(messages.en[key]), key).toEqual(vars(messages.ar[key]))
    }
  })

  it('fills placeholders', () => {
    expect(translate('en', 'question', { n: 3, total: 10 })).toBe('Question 3 of 10')
  })
})
