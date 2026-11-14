'use client'

import { ChevronLeft, Trophy } from 'lucide-react'
import Link from 'next/link'
import { useT } from '../lib/i18n'
import { useProgress } from '../lib/useProgress'

/** A short line with the visitor's level and badges, leading to the profile page. */
export default function ProfileCard() {
  const t = useT()
  const { level, badges, stats } = useProgress()
  const unlocked = badges.filter((b) => b.unlocked).length
  const pct = Math.round(((stats.xp - level.from) / (level.to - level.from)) * 100)
  return (
    <Link href="/profile" className="lift flex items-center gap-3 rounded-2xl border border-sun-300/70 bg-white p-3.5 shadow-sm">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-brand-700 to-brand-900 text-sun-300 ring-2 ring-sun-400/50">
        <Trophy className="h-5 w-5" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-bold text-slate-900">{t('profileCardTitle')}</span>
        <span className="block text-xs text-slate-600">{t('profileCardBody', { level: level.level, n: unlocked })}</span>
        <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-slate-100">
          <span className="block h-full rounded-full bg-gradient-to-r from-sun-400 to-sun-500" style={{ width: `${pct}%` }} />
        </span>
      </span>
      <ChevronLeft className="h-4 w-4 shrink-0 text-slate-400 ltr:rotate-180" aria-hidden />
    </Link>
  )
}
