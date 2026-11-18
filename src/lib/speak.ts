'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import { stopAudio } from './audio'

/**
 * Browser speech fallback for words and phrases that have no recorded audio file
 * and no proxied ElevenLabs voice. Last resort only, per the owner's rule:
 * Microsoft (Edge) Arabic voices exclusively - Google voices are never used.
 * It reads Modern Standard Arabic pronunciation, so dialect-specific sounds
 * (for example Egyptian ج or ق) are not reproduced.
 */
let currentText: string | null = null
let currentUtterance: SpeechSynthesisUtterance | null = null
const listeners = new Set<(text: string | null) => void>()

function emit() {
  for (const l of listeners) l(currentText)
}

/** True only when an Edge (Microsoft) Arabic voice is available to fall back to. */
export function speakSupported(): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') return false
  return arabicVoice() !== null
}

/** Only Microsoft (Edge) Arabic voices; Google voices are never selected. */
function arabicVoice(): SpeechSynthesisVoice | null {
  return (
    window.speechSynthesis
      .getVoices()
      .find((v) => v.lang?.toLowerCase().startsWith('ar') && /microsoft/i.test(v.name) && !/google/i.test(v.name)) ?? null
  )
}

export function speakingText(): string | null {
  return currentText
}

export function stopSpeak() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel()
  currentUtterance = null
  currentText = null
  emit()
}

/** Speaks Arabic text aloud, stopping any recorded clip or previous utterance. */
export function speak(text: string) {
  if (!speakSupported() || !text.trim()) return
  const voice = arabicVoice()
  if (!voice) return // no Edge Arabic voice: stay silent rather than use a Google voice
  stopAudio()
  const synth = window.speechSynthesis
  synth.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.voice = voice
  u.lang = voice.lang
  u.rate = 0.9
  currentUtterance = u
  currentText = text
  const done = () => {
    if (currentUtterance === u) {
      currentUtterance = null
      currentText = null
      emit()
    }
  }
  u.onend = done
  u.onerror = done
  synth.speak(u)
  emit()
}

/** Hydration-safe Edge-voice availability; updates when the voice list loads. */
export function useSpeakSupported(): boolean {
  return useSyncExternalStore(
    (cb) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return () => {}
      window.speechSynthesis.addEventListener?.('voiceschanged', cb)
      return () => window.speechSynthesis.removeEventListener?.('voiceschanged', cb)
    },
    () => speakSupported(),
    () => false,
  )
}

/** Returns the text being spoken right now, or null. */
export function useSpeakingText(): string | null {
  const [text, setText] = useState<string | null>(currentText)
  useEffect(() => {
    listeners.add(setText)
    return () => {
      listeners.delete(setText)
    }
  }, [])
  return text
}
