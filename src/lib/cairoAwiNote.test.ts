import { describe, expect, it } from 'vitest'
import { getFamous } from './content'
import { validateNoteSources } from './noteSources'

describe('Cairo awi usage note', () => {
  it('keeps the existing entry and example while narrowing the usage claim', () => {
    const entry = getFamous('cai', 'famous.awi')!
    expect(entry.text).toBe('أوي')
    expect(entry.english).toBe('Very / So much')
    expect(entry.standard).toBe('جدًّا')
    expect(entry.example).toBe('الفيلم ده حلو أوي')
    expect(entry.concept).toBe('very')
    expect(entry.note).toContain('also intensify a verb')
    expect(entry.noteAr).toContain('مش شرط')
    expect(entry.note).not.toMatch(/always|Q turns|glottal/)
    expect(validateNoteSources(entry)).toEqual([])
    expect(entry.noteSources).toHaveLength(2)
  })
})
