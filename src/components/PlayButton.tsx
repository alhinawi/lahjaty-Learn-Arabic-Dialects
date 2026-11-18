'use client'

import { Play, Square } from 'lucide-react'
import { useState, useSyncExternalStore } from 'react'
import { isBroken, playAudio, stopAudio, usePlayingUrl } from '../lib/audio'
import { audioUrl, hasAudio } from '../lib/content'
import { useT } from '../lib/i18n'
import { speak, speakSupported, stopSpeak, useSpeakingText } from '../lib/speak'

interface Props {
  dialectId: string
  phraseId: string
  /** Arabic text to read aloud with browser speech when no recording exists. */
  text?: string
  size?: 'sm' | 'md' | 'lg'
}

/**
 * Plays the recorded clip when one exists, otherwise reads the text aloud with
 * the device's Arabic speech voice. Renders nothing when neither is possible.
 */
export default function PlayButton({ dialectId, phraseId, text, size = 'md' }: Props) {
  const t = useT()
  const url = audioUrl(dialectId, phraseId)
  const playing = usePlayingUrl() === url
  const speaking = useSpeakingText() === (text ?? null) && text !== undefined
  const [failed, setFailed] = useState(() => isBroken(url))
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )

  const hasFile = hasAudio(dialectId, phraseId) && !failed
  const canSpeak = mounted && !!text?.trim() && speakSupported()
  if (!hasFile && !canSpeak) return null

  const active = hasFile ? playing : speaking
  const dims = size === 'sm' ? 'h-9 w-9' : size === 'lg' ? 'h-14 w-14' : 'h-11 w-11'
  const icon = size === 'lg' ? 'h-6 w-6' : 'h-5 w-5'
  return (
    <button
      type="button"
      onClick={() => {
        if (hasFile) {
          if (playing) {
            stopAudio()
          } else {
            stopSpeak()
            playAudio(url, () => setFailed(true))
          }
        } else if (speaking) {
          stopSpeak()
        } else if (text) {
          speak(text)
        }
      }}
      aria-label={active ? t('stop') : t('play')}
      className={`${dims} flex shrink-0 items-center justify-center rounded-full ${
        active ? 'bg-sun-500 text-brand-900' : 'bg-brand-600 text-white hover:bg-brand-700'
      } shadow-sm transition`}
    >
      {active ? <Square className={icon} fill="currentColor" aria-hidden /> : <Play className={icon} fill="currentColor" aria-hidden />}
    </button>
  )
}
