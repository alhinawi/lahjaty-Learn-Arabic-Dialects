import { describe, expect, it } from 'vitest'
import { movePickerIndex } from './pickerNavigation'

describe('comparison picker keyboard cursor', () => {
  it('starts at the first result on down and last on up', () => {
    expect(movePickerIndex(-1, 1, 8)).toBe(0)
    expect(movePickerIndex(-1, -1, 8)).toBe(7)
  })
  it('moves and wraps in either direction', () => {
    expect(movePickerIndex(0, 1, 8)).toBe(1)
    expect(movePickerIndex(7, 1, 8)).toBe(0)
    expect(movePickerIndex(0, -1, 8)).toBe(7)
    expect(movePickerIndex(7, -1, 8)).toBe(6)
  })
  it('handles no results, one result and a stale cursor after list changes', () => {
    expect(movePickerIndex(2, 1, 0)).toBe(-1)
    expect(movePickerIndex(0, -1, 1)).toBe(0)
    expect(movePickerIndex(7, 1, 2)).toBe(0)
    expect(movePickerIndex(7, -1, 2)).toBe(1)
  })
})
