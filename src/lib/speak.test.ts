import { afterEach, describe, expect, it, vi } from 'vitest'
import { speak, speakingText, speakSupported, stopSpeak } from './speak'

class FakeUtterance {
  static last: FakeUtterance | null = null
  text: string
  lang = ''
  rate = 1
  voice: unknown = null
  onend: (() => void) | null = null
  onerror: (() => void) | null = null
  constructor(text: string) {
    this.text = text
    FakeUtterance.last = this
  }
}

const EDGE = { lang: 'ar-EG', name: 'Microsoft Hoda Online (Natural) - Arabic (Egypt)' }
const GOOGLE = { lang: 'ar-XA', name: 'Google العربية' }

function installSpeech(voices: Array<{ lang: string; name: string }> = []) {
  const cancel = vi.fn()
  const speakFn = vi.fn()
  ;(globalThis as Record<string, unknown>).window = {
    speechSynthesis: { cancel, speak: speakFn, getVoices: () => voices },
  }
  ;(globalThis as Record<string, unknown>).SpeechSynthesisUtterance = FakeUtterance
  return { cancel, speakFn }
}

afterEach(() => {
  stopSpeak()
  delete (globalThis as Record<string, unknown>).window
  delete (globalThis as Record<string, unknown>).SpeechSynthesisUtterance
})

describe('browser speech fallback (Edge voices only)', () => {
  it('reports no support without the Web Speech API', () => {
    expect(speakSupported()).toBe(false)
    speak('مرحبا')
    expect(speakingText()).toBeNull()
  })

  it('speaks with an Edge Arabic voice when one is installed', () => {
    const { speakFn } = installSpeech([{ lang: 'en-US', name: 'Microsoft Aria' }, EDGE])
    expect(speakSupported()).toBe(true)
    speak('إزيك')
    expect(speakingText()).toBe('إزيك')
    const u = FakeUtterance.last!
    expect(speakFn).toHaveBeenCalledWith(u)
    expect(u.lang).toBe('ar-EG')
    expect(u.voice).toEqual(EDGE)
    expect(u.rate).toBeLessThan(1)
  })

  it('never selects a Google voice, even when it is the only Arabic one', () => {
    const { speakFn } = installSpeech([GOOGLE, { lang: 'en-US', name: 'Microsoft Aria' }])
    expect(speakSupported()).toBe(false)
    speak('مرحبا')
    expect(speakFn).not.toHaveBeenCalled()
    expect(speakingText()).toBeNull()
  })

  it('stays silent when no Edge Arabic voice exists instead of using a default voice', () => {
    const { speakFn } = installSpeech([{ lang: 'en-US', name: 'Microsoft Aria' }])
    expect(speakSupported()).toBe(false)
    speak('مرحبا')
    expect(speakFn).not.toHaveBeenCalled()
  })

  it('cancels the previous utterance before speaking again', () => {
    const { cancel, speakFn } = installSpeech([EDGE])
    speak('واحد')
    speak('اتنين')
    expect(cancel).toHaveBeenCalledTimes(2)
    expect(speakFn).toHaveBeenCalledTimes(2)
    expect(speakingText()).toBe('اتنين')
  })

  it('clears the speaking state when the utterance ends', () => {
    installSpeech([EDGE])
    speak('سلام')
    expect(speakingText()).toBe('سلام')
    FakeUtterance.last!.onend!()
    expect(speakingText()).toBeNull()
  })

  it('stop cancels speech and clears the state', () => {
    const { cancel } = installSpeech([EDGE])
    speak('تمام')
    stopSpeak()
    expect(cancel).toHaveBeenCalled()
    expect(speakingText()).toBeNull()
  })

  it('ignores empty text', () => {
    const { speakFn } = installSpeech([EDGE])
    speak('   ')
    expect(speakFn).not.toHaveBeenCalled()
    expect(speakingText()).toBeNull()
  })
})
