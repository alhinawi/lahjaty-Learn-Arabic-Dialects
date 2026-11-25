import { describe, expect, it } from 'vitest'
import { fragmentId } from './fragment'

describe('optional entry fragments', () => {
  it('keeps exact plain entry IDs', () => {
    expect(fragmentId('#basics.hello')).toBe('basics.hello')
  })
  it('decodes encoded entry IDs once', () => {
    expect(fragmentId('#basics%2Ehello')).toBe('basics.hello')
    expect(fragmentId('#%2520')).toBe('%20')
  })
  it('accepts Unicode IDs without interpreting markup or selectors', () => {
    expect(fragmentId('#%D9%85%D8%B1%D8%AD%D8%A8%D8%A7')).toBe('مرحبا')
    expect(fragmentId('#[data-test]')).toBe('[data-test]')
  })
  it('ignores absent and empty fragments', () => {
    for (const hash of ['', '#', 'basics.hello']) expect(fragmentId(hash)).toBeNull()
  })
  it('ignores malformed escapes and invalid UTF-8 instead of throwing', () => {
    for (const hash of ['#%', '#%2', '#%GG', '#%E0%A4%A', '#%FF', '#%ED%A0%80']) {
      expect(() => fragmentId(hash)).not.toThrow()
      expect(fragmentId(hash)).toBeNull()
    }
  })
})
