'use client'

import { useEffect, useState } from 'react'
import { stopAudio } from './audio'

/**
 * Browser speech fallback for words and phrases that have no recorded audio file.
 * Uses the Web Speech API (free, built into the browser). The voice is whatever
 * Arabic voice the device has: it reads Modern Standard Arabic pronunciation,
 * so dialect-specific sounds (for example Egyptian ج or ق) are not reproduced.
 */
let currentText: string | null = null
let currentUtterance: SpeechSynthesisUtterance | null = null
const listeners = new Set<(text: string | null) => void>()

function emit() {
  for (const l of listeners) l(currentText)
}

export function speakSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined'
}

function arabicVoice(): SpeechSynthesisVoice | null {
  return window.speechSynthesis.getVoices().find((v) => v.lang?.toLowerCase().startsWith('ar')) ?? null
}

export function speakingText(): string | null {
  return currentText
}

export function stopSpeak() {
  if (!speakSupported()) return
  window.speechSynthesis.cancel()
  currentUtterance = null
  currentText = null
  emit()
}

/** Speaks Arabic text aloud, stopping any recorded clip or previous utterance. */
export function speak(text: string) {
  if (!speakSupported() || !text.trim()) return
  stopAudio()
  const synth = window.speechSynthesis
  synth.cancel()
  const u = new SpeechSynthesisUtterance(text)
  const voice = arabicVoice()
  if (voice) u.voice = voice
  u.lang = voice?.lang ?? 'ar'
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
