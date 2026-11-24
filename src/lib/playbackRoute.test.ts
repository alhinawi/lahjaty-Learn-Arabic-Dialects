import { beforeEach, describe, expect, it, vi } from 'vitest'
const f = vi.hoisted(() => ({ effect: undefined as undefined | (() => () => void), deps: [] as unknown[], audio: vi.fn(), speech: vi.fn() }))
vi.mock('react', () => ({ useEffect: (effect: () => () => void, deps: unknown[]) => { f.effect = effect; f.deps = deps } }))
vi.mock('./audio', () => ({ stopAudio: f.audio }))
vi.mock('./speak', () => ({ stopSpeak: f.speech }))
import { usePlaybackRoute } from './usePlaybackRoute'

beforeEach(() => { f.audio.mockReset(); f.speech.mockReset() })
describe('page-bound playback', () => {
  it('leaves playback alone on mount and stops both players on route cleanup', () => {
    usePlaybackRoute('/word/basics.yes/')
    expect(f.deps).toEqual(['/word/basics.yes/'])
    const leave = f.effect!()
    expect(f.audio).not.toHaveBeenCalled()
    expect(f.speech).not.toHaveBeenCalled()
    leave()
    expect(f.audio).toHaveBeenCalledTimes(1)
    expect(f.speech).toHaveBeenCalledTimes(1)
  })
  it('also stops on unmount and installs cleanup for the next page', () => {
    usePlaybackRoute('/concepts/buddy/')
    const leave = f.effect!()
    usePlaybackRoute('/practice/')
    expect(f.deps).toEqual(['/practice/'])
    leave()
    f.effect!()()
    expect(f.audio).toHaveBeenCalledTimes(2)
    expect(f.speech).toHaveBeenCalledTimes(2)
  })
})
