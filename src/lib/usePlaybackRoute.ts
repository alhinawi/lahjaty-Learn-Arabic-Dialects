import { useEffect } from 'react'
import { stopAudio } from './audio'
import { stopSpeak } from './speak'

/** A phrase belongs to its page. Stop both shared players when leaving it. */
export function usePlaybackRoute(pathname: string) {
  useEffect(() => () => {
    stopAudio()
    stopSpeak()
  }, [pathname])
}
