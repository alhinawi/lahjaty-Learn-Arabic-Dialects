/**
 * ElevenLabs voice per dialect for the /api/tts proxy.
 * Voice IDs are not secrets, but they only work with the accounts that own
 * them, so this map starts EMPTY: no dialect is proxied until real voices
 * are chosen from the user's ElevenLabs voice library and filled in here.
 * The frontend falls back to browser speech for every dialect not listed.
 */
export interface TtsVoice {
  voiceId: string
  name: string
}

export const TTS_VOICES: Record<string, TtsVoice> = {}

export const TTS_MODEL_DEFAULT = 'eleven_multilingual_v2'
