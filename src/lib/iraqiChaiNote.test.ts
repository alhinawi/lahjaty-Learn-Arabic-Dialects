import { describe, expect, it } from 'vitest'
import { getFamous } from './content'
import { validateNoteSources } from './noteSources'

describe('Iraqi tea note scope', () => {
  it('describes chai without turning the word into a universal sound rule', () => {
    const p = getFamous('bag', 'famous.chai')!
    expect(p.text).toBe('چاي')
    expect(p.note).toContain('not a rule for every sh sound')
    expect(p.noteAr).toContain('ليس قاعدة لتحويل كل شين')
    expect(p.noteAr).not.toContain('العراقي بينطق الشين')
    expect(p.noteSources).toHaveLength(2)
    expect(validateNoteSources(p)).toEqual([])
  })
})
