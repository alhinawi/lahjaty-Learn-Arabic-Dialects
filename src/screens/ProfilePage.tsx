'use client'

import { BookOpen, ChevronLeft, Compass, Crown, Flame, Heart, Lock, Medal, Sparkles, Type } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import Link from 'next/link'
import BadgeIcon from '../components/BadgeIcon'
import StreakCalendar from '../components/StreakCalendar'
import { getDialect } from '../lib/content'
import { useName, useT } from '../lib/i18n'
import type { MessageKey } from '../lib/i18n'
import { currentStreak, dayKey } from '../lib/srs'
import { useApp } from '../lib/store'
import { useProgress } from '../lib/useProgress'

/** Everything the visitor did, from this browser: level, stats, practice calendar and badges. */
export default function ProfilePage() {
  const t = useT()
  const name = useName()
  const streak = useApp((s) => s.streak)
  const myDialectId = useApp((s) => s.myDialectId)
  const dialectId = useApp((s) => s.dialectId)
  const goal = useApp((s) => s.goal)
  const { stats, level, badges } = useProgress()
  const mine = myDialectId ? getDialect(myDialectId) : undefined
  const learning = getDialect(dialectId)
  const days = currentStreak(streak, dayKey())
  const unlocked = badges.filter((b) => b.unlocked).length
  const pct = Math.round(((stats.xp - level.from) / (level.to - level.from)) * 100)

  const cells: { icon: LucideIcon; value: number; label: string }[] = [
    { icon: Type, value: stats.known, label: t('statKnown') },
    { icon: BookOpen, value: stats.learnedTotal, label: t('statLearned') },
    { icon: Crown, value: stats.mastered, label: t('statMastered') },
    { icon: Medal, value: stats.quizzes, label: t('statQuizzes') },
    { icon: Flame, value: stats.bestStreak, label: t('statBestStreak') },
    { icon: Compass, value: stats.dialectsStarted, label: t('statDialectsStarted') },
  ]

  return (
    <div className="space-y-5">
      <section className="pattern-stars relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-800 to-brand-950 p-5 text-white shadow-xl">
        <div aria-hidden className="absolute -top-16 -end-12 h-44 w-44 rounded-full bg-sun-400/15 blur-2xl" />
        <div className="relative flex items-center gap-4">
          <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-sun-300 to-sun-500 text-brand-950 shadow-lg ring-4 ring-sun-400/25">
            <span className="text-center leading-none">
              <span className="block text-[11px] font-semibold">{t('level')}</span>
              <span className="font-display text-3xl font-bold">{level.level}</span>
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-2xl font-bold">{t('profileTitle')}</h1>
            <p className="mt-0.5 text-sm text-cream-100">
              {learning ? t('profileLearning', { dialect: name(learning) }) : null}
              {mine ? ` · ${t('profileMine', { dialect: name(mine) })}` : null}
            </p>
            {goal && <p className="mt-0.5 text-xs text-cream-200">{t('forYourGoalBody', { goal: t(`goal_${goal}`) })}</p>}
          </div>
        </div>
        <div className="relative mt-4">
          <div className="flex items-center justify-between text-xs text-cream-100">
            <span className="flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-sun-300" aria-hidden />
              {t('xpPoints', { n: stats.xp })}
            </span>
            <span>{t('xpToNext', { n: level.to - stats.xp, level: level.level + 1 })}</span>
          </div>
          <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-white/15" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={t('level')}>
            <div className="h-full rounded-full bg-gradient-to-r from-sun-300 to-sun-500 transition-[width] duration-700" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <div className="relative mt-4 flex items-center gap-2 rounded-2xl bg-white/10 p-3 ring-1 ring-white/10">
          <Flame className={`h-6 w-6 ${days > 0 ? 'text-sun-300' : 'text-cream-200'}`} aria-hidden />
          <p className="text-sm font-semibold">{days > 0 ? t('streakDays', { n: days }) : t('streakNone')}</p>
        </div>
      </section>

      <section aria-labelledby="stats-h">
        <h2 id="stats-h" className="sr-only">
          {t('statsTitle')}
        </h2>
        <div className="stagger grid grid-cols-3 gap-2.5">
          {cells.map(({ icon: Icon, value, label }) => (
            <div key={label} className="rounded-2xl border border-slate-200 bg-white p-3 text-center shadow-sm">
              <Icon className="mx-auto h-5 w-5 text-brand-700" aria-hidden />
              <p className="mt-1 font-display text-2xl font-bold text-slate-900">{value}</p>
              <p className="text-[11px] leading-tight text-slate-600">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 font-bold">{t('calendarTitle')}</h2>
        <StreakCalendar />
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between">
          <h2 className="text-lg font-bold">{t('badgesTitle')}</h2>
          <span className="text-sm font-semibold text-brand-700">{t('badgesCount', { n: unlocked, total: badges.length })}</span>
        </div>
        <ul className="stagger grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {badges.map((b) => (
            <li
              key={b.id}
              className={`relative overflow-hidden rounded-2xl border p-3 ${
                b.unlocked ? 'border-sun-400/70 bg-gradient-to-br from-sand-50 to-sand-100 shadow-sm' : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                    b.unlocked ? 'bg-gradient-to-b from-brand-700 to-brand-900 text-sun-300 ring-2 ring-sun-400/60' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {b.unlocked ? <BadgeIcon icon={b.icon} className="h-5 w-5" /> : <Lock className="h-4 w-4" aria-hidden />}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900">{t(`badge_${b.id}` as MessageKey)}</p>
                  <p className="text-xs leading-snug text-slate-600">{t(`badge_${b.id}Body` as MessageKey)}</p>
                </div>
              </div>
              {!b.unlocked && (
                <div className="mt-2.5">
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-brand-600" style={{ width: `${(b.value / b.goal) * 100}%` }} />
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">
                    {b.value} / {b.goal}
                  </p>
                </div>
              )}
              <span className="sr-only">{b.unlocked ? t('badgeUnlocked') : t('badgeLocked')}</span>
            </li>
          ))}
        </ul>
      </section>

      <Link href="/favorites" className="lift flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <Heart className="h-5 w-5 text-rose-600" aria-hidden />
        <span className="flex-1 font-semibold">{t('navFavorites')}</span>
        <span className="text-sm text-slate-500">{stats.favorites}</span>
        <ChevronLeft className="h-4 w-4 text-slate-400 ltr:rotate-180" aria-hidden />
      </Link>

      <p className="text-center text-xs text-slate-500">{t('profilePrivate')}</p>
    </div>
  )
}
