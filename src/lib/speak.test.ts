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

function installSpeech(voices: Array<{ lang: string }> = []) {
  const cancel = vi.fn()
  const speakFn = vi.fn()
  ;(globalThis as Record<string, unknown>).window = {
    speechSynthesis: {
      cancel,
      speak: speakFn,
      getVoices: () => voices,
    },
  }
  ;(globalThis as Record<string, unknown>).SpeechSynthesisUtterance = FakeUtterance
  return { cancel, speakFn }
}

afterEach(() => {
  delete (globalThis as Record<string, unknown>).window
  delete (globalThis as Record<string, unknown>).SpeechSynthesisUtterance
})

describe('browser speech fallback', () => {
  it('reports no support without the Web Speech API', () => {
    expect(speakSupported()).toBe(false)
    speak('مرحبا')
    expect(speakingText()).toBeNull()
  })

  it('speaks with an Arabic voice when the device has one', () => {
    const { speakFn } = installSpeech([{ lang: 'en-US' }, { lang: 'ar-EG' }])
    expect(speakSupported()).toBe(true)
    speak('إزيك')
    expect(speakingText()).toBe('إزيك')
    const u = FakeUtterance.last!
    expect(speakFn).toHaveBeenCalledWith(u)
    expect(u.lang).toBe('ar-EG')
    expect(u.voice).toEqual({ lang: 'ar-EG' })
    expect(u.rate).toBeLessThan(1)
  })

  it('falls back to generic Arabic when no Arabic voice is installed', () => {
    installSpeech([{ lang: 'en-US' }])
    speak('مرحبا')
    expect(FakeUtterance.last!.lang).toBe('ar')
    expect(FakeUtterance.last!.voice).toBeNull()
  })

  it('cancels the previous utterance before speaking again', () => {
    const { cancel, speakFn } = installSpeech()
    speak('واحد')
    speak('اتنين')
    expect(cancel).toHaveBeenCalledTimes(2)
    expect(speakFn).toHaveBeenCalledTimes(2)
    expect(speakingText()).toBe('اتنين')
  })

  it('clears the speaking state when the utterance ends', () => {
    installSpeech()
    speak('سلام')
    expect(speakingText()).toBe('سلام')
    FakeUtterance.last!.onend!()
    expect(speakingText()).toBeNull()
  })

  it('stop cancels speech and clears the state', () => {
    const { cancel } = installSpeech()
    speak('تمام')
    stopSpeak()
    expect(cancel).toHaveBeenCalled()
    expect(speakingText()).toBeNull()
  })

  it('ignores empty text', () => {
    const { speakFn } = installSpeech()
    speak('   ')
    expect(speakFn).not.toHaveBeenCalled()
    expect(speakingText()).toBeNull()
  })
})
