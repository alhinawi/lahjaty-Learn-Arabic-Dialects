'use client'

import { Play, Square } from 'lucide-react'
import { useState } from 'react'
import { isBroken, playAudio, stopAudio, usePlayingUrl } from '../lib/audio'
import { audioUrl, hasAudio } from '../lib/content'
import { useT } from '../lib/i18n'

interface Props {
  dialectId: string
  phraseId: string
  size?: 'sm' | 'md' | 'lg'
}

/** Renders nothing when the dialect has no audio file for this phrase. */
export default function PlayButton({ dialectId, phraseId, size = 'md' }: Props) {
  const t = useT()
  const url = audioUrl(dialectId, phraseId)
  const playing = usePlayingUrl() === url
  const [failed, setFailed] = useState(() => isBroken(url))

  if (!hasAudio(dialectId, phraseId) || failed) return null

  const dims = size === 'sm' ? 'h-9 w-9' : size === 'lg' ? 'h-14 w-14' : 'h-11 w-11'
  const icon = size === 'lg' ? 'h-6 w-6' : 'h-5 w-5'
  return (
    <button
      type="button"
      onClick={() => (playing ? stopAudio() : playAudio(url, () => setFailed(true)))}
      aria-label={playing ? t('stop') : t('play')}
      className={`${dims} flex shrink-0 items-center justify-center rounded-full ${
        playing ? 'bg-sun-500 text-brand-900' : 'bg-brand-600 text-white hover:bg-brand-700'
      } shadow-sm transition`}
    >
      {playing ? <Square className={icon} fill="currentColor" aria-hidden /> : <Play className={icon} fill="currentColor" aria-hidden />}
    </button>
  )
}
