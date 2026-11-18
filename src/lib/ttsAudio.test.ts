import { describe, expect, it } from 'vitest'
import { audioUrl, hasAudio, hasTtsVoice, ttsDialects } from './content'

describe('tts proxy chain', () => {
  it('ships with no proxied voices until real ElevenLabs voices are wired', () => {
    expect(ttsDialects()).toEqual([])
    expect(hasTtsVoice('cai')).toBe(false)
  })

  it('falls back to the local audio path when neither a file nor a voice exists', () => {
    expect(hasAudio('cai', 'greetings.hello')).toBe(false)
    expect(audioUrl('cai', 'greetings.hello')).toBe('/audio/cai/greetings.hello.mp3')
  })
})
