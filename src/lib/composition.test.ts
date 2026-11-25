import { describe, expect, it } from 'vitest'
import { isComposingKey } from './composition'

describe('search input composition ownership', () => {
  it('leaves composing keys to the input method, including legacy confirmation events', () => {
    expect(isComposingKey({ isComposing: true }, false)).toBe(true)
    expect(isComposingKey({ isComposing: false }, true)).toBe(true)
    expect(isComposingKey({ isComposing: false, keyCode: 229 }, false)).toBe(true)
  })
  it('allows ordinary keyboard navigation again after composition', () => {
    expect(isComposingKey({ isComposing: false, keyCode: 13 }, false)).toBe(false)
    expect(isComposingKey({}, false)).toBe(false)
  })
})
