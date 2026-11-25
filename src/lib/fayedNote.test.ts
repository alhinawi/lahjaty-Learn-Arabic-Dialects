import { describe, expect, it } from 'vitest'
import { getFamous } from './content'
import { validateNoteSources } from './noteSources'

describe('Fayed location note', () => {
  it('keeps the lexical entry while correcting the village label and limiting the note to location', () => {
    const entry = getFamous('cnl', 'famous.fayed')!
    expect(entry.text).toBe('فايد')
    expect(entry.english).toBe('Fayed')
    expect(entry.standard).toBe('فايد')
    expect(entry.example).toBe('بوري فايد على الفحم')
    expect(entry.note).toContain('city in Ismailia Governorate')
    expect(entry.note).toContain('western shore')
    expect(entry.note).not.toMatch(/village|mullet|famous/)
    expect(entry.noteAr).toContain('مدينة بمحافظة الإسماعيلية')
    expect(validateNoteSources(entry)).toEqual([])
    expect(entry.noteSources).toHaveLength(2)
  })
})
