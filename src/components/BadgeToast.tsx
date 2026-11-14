import { Trophy, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { useT } from '../lib/i18n'
import type { MessageKey } from '../lib/i18n'
import { useApp } from '../lib/store'
import { useProgress } from '../lib/useProgress'

/** Tells the visitor once when they earn a badge. Badges earned before this existed are marked seen quietly. */
export default function BadgeToast() {
  const t = useT()
  const { badges } = useProgress()
  const seen = useApp((s) => s.seenBadges)
  const markSeen = useApp((s) => s.markBadgesSeen)
  const unlocked = badges.filter((b) => b.unlocked).map((b) => b.id)
  const key = unlocked.join(',')
  const fresh = seen ? unlocked.filter((id) => !seen.includes(id)) : []
  const [shown, setShown] = useState<string | null>(null)
  const [lastFresh, setLastFresh] = useState('')
  // A badge earned just now shows at once; the effect below only records it as seen.
  if (fresh.length > 0 && fresh.join(',') !== lastFresh) {
    setLastFresh(fresh.join(','))
    setShown(fresh[0])
  }

  useEffect(() => {
    // The first check after this existed records what was already earned, without a message.
    if (seen === null) markSeen(key ? key.split(',') : [])
    else if (fresh.length > 0) markSeen(fresh)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, seen === null])

  useEffect(() => {
    if (!shown) return
    const id = window.setTimeout(() => setShown(null), 6000)
    return () => window.clearTimeout(id)
  }, [shown])

  if (!shown) return null
  return (
    <div role="status" className="fixed inset-x-0 bottom-24 z-40 flex justify-center px-4">
      <div className="animate-pop flex w-full max-w-sm items-center gap-3 rounded-2xl bg-gradient-to-br from-brand-800 to-brand-950 p-3 text-white shadow-2xl ring-1 ring-sun-400/50">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-b from-sun-300 to-sun-500 text-brand-950">
          <Trophy className="h-6 w-6" aria-hidden />
        </span>
        <Link to="/profile" onClick={() => setShown(null)} className="min-w-0 flex-1">
          <p className="text-xs text-cream-200">{t('badgeEarned')}</p>
          <p className="truncate font-bold">{t(`badge_${shown}` as MessageKey)}</p>
        </Link>
        <button type="button" onClick={() => setShown(null)} aria-label={t('close')} className="rounded-full p-1.5 text-cream-100 hover:bg-white/10">
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  )
}
