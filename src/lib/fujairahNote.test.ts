import { describe, expect, it } from 'vitest'
import { getFamous } from './content'
import { validateNoteSources } from './noteSources'

describe('Fujairah coast note', () => {
  it('distinguishes entirely on the east coast from having any Gulf of Oman coast', () => {
    const entry = getFamous('emi', 'famous.fujairah')!
    expect(entry.text).toBe('الفجيرة')
    expect(entry.english).toBe('Fujairah')
    expect(entry.standard).toBe('الفجيرة')
    expect(entry.example).toBe('الفجيرة شتوية حلوة في الشتا')
    expect(entry.note).toContain('entirely on the eastern coast')
    expect(entry.note).toContain('Sharjah also has one')
    expect(entry.noteAr).toContain('فالشارقة تطل عليه أيضًا')
    expect(validateNoteSources(entry)).toEqual([])
    expect(entry.noteSources).toHaveLength(2)
  })
})
