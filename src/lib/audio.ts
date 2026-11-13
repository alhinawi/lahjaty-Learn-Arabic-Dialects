import { useEffect, useState } from 'react'

/** One shared player so only one clip plays at a time. */
let current: HTMLAudioElement | null = null
let currentUrl: string | null = null
const listeners = new Set<(url: string | null) => void>()
const broken = new Set<string>()

function emit() {
  for (const l of listeners) l(currentUrl)
}

export function stopAudio() {
  if (current) {
    current.pause()
    current = null
  }
  currentUrl = null
  emit()
}

export function playAudio(url: string, onBroken?: () => void) {
  stopAudio()
  const audio = new Audio(url)
  current = audio
  currentUrl = url
  audio.onended = () => {
    if (current === audio) stopAudio()
  }
  audio.onerror = () => {
    broken.add(url)
    if (current === audio) stopAudio()
    onBroken?.()
  }
  audio.play().catch(() => {
    if (current === audio) stopAudio()
  })
  emit()
}

export const isBroken = (url: string) => broken.has(url)

/** Returns the url that is playing now, or null. */
export function usePlayingUrl() {
  const [url, setUrl] = useState<string | null>(currentUrl)
  useEffect(() => {
    listeners.add(setUrl)
    return () => {
      listeners.delete(setUrl)
    }
  }, [])
  return url
}
