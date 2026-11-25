import { describe, expect, it } from 'vitest'
import { getFamous } from './content'
import { validateNoteSources } from './noteSources'

describe('Luxor heritage note', () => {
  it('preserves the lexical entry and replaces the unsubstantiated global proportion with named heritage', () => {
    const entry = getFamous('sai', 'famous.luxor')!
    expect(entry.text).toBe('الأقصر')
    expect(entry.standard).toBe('الأقصر')
    expect(entry.english).toBe('Luxor')
    expect(entry.example).toBe('الصعيد كله تاريخ والأقصر عاصمته')
    expect(entry.note).toContain('ancient Thebes')
    expect(entry.note).toContain('UNESCO World Heritage site')
    expect(entry.note).toContain('Valley of the Kings')
    expect(entry.note).not.toMatch(/third|one.third|antiquities/)
    expect(entry.noteAr).not.toMatch(/تلت|ثلث/)
    expect(validateNoteSources(entry)).toEqual([])
    expect(entry.noteSources).toHaveLength(2)
  })
})
