import { describe, expect, it } from 'vitest'
import { getFamous } from './content'
import { validateNoteSources } from './noteSources'

describe('Ubar archaeological context', () => {
  it('keeps the headword while qualifying identification and withdrawing the unsupported historical example', () => {
    const entry = getFamous('dho', 'famous.ubar')!
    expect(entry.text).toBe('أوبار')
    expect(entry.standard).toBe('أوبار')
    expect(entry.english).toBe('Ubar')
    expect(entry.example).toBeUndefined()
    expect(entry.note).toContain('caravan oasis')
    expect(entry.note).toContain('has been proposed')
    expect(entry.note).toContain('does not establish')
    expect(entry.noteAr).toContain('لا يثبت')
    expect(entry.noteAr).not.toContain('ذكرت في القرآن')
    expect(validateNoteSources(entry)).toEqual([])
    expect(entry.noteSources).toHaveLength(2)
  })
})
