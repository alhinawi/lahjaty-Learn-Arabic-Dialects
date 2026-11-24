import { describe, expect, it, vi } from 'vitest'
import { shareOrCopy } from './share'
const url = 'https://example.org/share/?dialect=bag&phrase=famous.chai'
describe('share recovery', () => {
  it('uses native sharing first with the exact title and destination', async () => {
    const share = vi.fn().mockResolvedValue(undefined), copy = vi.fn()
    expect(await shareOrCopy('چاي', url, { share, copy })).toBe('shared')
    expect(share).toHaveBeenCalledWith({ title: 'چاي', text: 'چاي', url })
    expect(copy).not.toHaveBeenCalled()
  })
  it('does not copy or report failure when the visitor cancels', async () => {
    const copy = vi.fn()
    expect(await shareOrCopy('چاي', url, { share: vi.fn().mockRejectedValue({ name: 'AbortError' }), copy })).toBe('cancelled')
    expect(copy).not.toHaveBeenCalled()
  })
  it('copies the same link after non-cancellation native failures', async () => {
    const copy = vi.fn().mockResolvedValue(undefined)
    expect(await shareOrCopy('چاي', url, { share: vi.fn().mockRejectedValue({ name: 'NotAllowedError' }), copy })).toBe('copied')
    expect(copy).toHaveBeenCalledWith(url)
  })
  it('copies when native sharing is unavailable', async () => {
    expect(await shareOrCopy('چاي', url, { copy: vi.fn().mockResolvedValue(undefined) })).toBe('copied')
  })
  it('offers manual copying when neither capability works or exists', async () => {
    expect(await shareOrCopy('چاي', url, {})).toBe('manual')
    expect(await shareOrCopy('چاي', url, { copy: vi.fn().mockRejectedValue(new Error('denied')) })).toBe('manual')
    expect(await shareOrCopy('چاي', url, { share: vi.fn().mockRejectedValue(new Error('denied')) })).toBe('manual')
  })
})
