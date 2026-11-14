import { BookOpen, ChevronLeft, Flame, Layers, MapPinned, Shuffle } from 'lucide-react'
import CategoryIcon from '../components/CategoryIcon'
import { Link } from 'react-router'
import ProfileCard from '../components/ProfileCard'
import DialectChip from '../components/DialectChip'
import { categories, getDialect, phrases } from '../lib/content'
import { currentStreak, dayKey, dueCount } from '../lib/srs'
import { useName, useT } from '../lib/i18n'
import { useApp } from '../lib/store'

export default function PracticePage() {
  const t = useT()
  const name = useName()
  const dialectId = useApp((s) => s.dialectId)
  const best = useApp((s) => s.bestScores)
  const lang = useApp((s) => s.lang)
  const cards = useApp((s) => s.cards)
  const streak = useApp((s) => s.streak)
  const dialect = getDialect(dialectId)
  const today = dayKey()
  const due = dueCount(
    phrases.filter((p) => p.variants[dialectId]).map((p) => `${dialectId}|${p.id}`),
    cards,
    today,
  )
  const days = currentStreak(streak, today)

  const modes = [
    {
      to: '/practice/cards',
      icon: Layers,
      title: t('modeCards'),
      body: t('modeCardsBody'),
      best: undefined as number | undefined,
      extra: due > 0 ? t('cardsDue', { n: due }) : undefined,
    },
    {
      to: '/practice/meaning',
      icon: BookOpen,
      title: t('modeMeaning'),
      body: t('modeMeaningBody', { dialect: dialect ? name(dialect) : '' }),
      best: best[`meaning|${dialectId}`],
      extra: undefined,
    },
    {
      to: '/practice/match',
      icon: Shuffle,
      title: t('modeMatch'),
      body: t('modeMatchBody'),
      best: best['match|all'],
      extra: undefined,
    },
    {
      to: '/practice/guess',
      icon: MapPinned,
      title: t('modeGuess'),
      body: t('modeGuessBody'),
      best: best['guess|all'],
      extra: undefined,
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold">{t('practiceTitle')}</h1>
        <span className="inline-flex items-center gap-1 rounded-full bg-sun-100 px-3 py-1 text-sm font-bold text-amber-800" title={t('streakTitle')}>
          <Flame className="h-4 w-4" aria-hidden />
          {t('streakDays', { n: days })}
        </span>
      </div>
      <ProfileCard />
      <DialectChip next="/practice" />
      <h2 className="pt-2 text-sm font-bold text-slate-600">{t('practiceIntro')}</h2>
      <ul className="space-y-3">
        {modes.map((m) => (
          <li key={m.to}>
            <Link
              to={m.to}
              className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-brand-500"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                <m.icon className="h-6 w-6" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-bold text-slate-900">{m.title}</span>
                <span className="block text-xs text-slate-500">{m.body}</span>
                {m.extra && <span className="mt-1 block text-xs font-semibold text-amber-700">{m.extra}</span>}
                {m.best !== undefined && (
                  <span className="mt-1 block text-xs font-semibold text-amber-700">{t('bestScore', { n: m.best })}</span>
                )}
              </span>
              <ChevronLeft className="h-5 w-5 text-slate-400 ltr:rotate-180" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
      <h2 className="pt-2 text-sm font-bold text-slate-600">{t('quizBySituation')}</h2>
      <ul className="grid grid-cols-2 gap-2">
        {categories.map((c) => {
          const score = best[`meaning|${dialectId}:${c.id}`]
          return (
            <li key={c.id}>
              <Link
                to={`/practice/meaning?c=${c.id}`}
                className="flex h-full items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3 text-sm font-semibold text-slate-900 shadow-sm hover:border-brand-500"
              >
                <CategoryIcon id={c.id} className="h-5 w-5 shrink-0 text-brand-700" />
                <span className="min-w-0 flex-1">
                  <span className="block">{lang === 'ar' ? c.name : c.nameEn}</span>
                  {score !== undefined && <span className="block text-xs font-semibold text-amber-700">{t('bestScore', { n: score })}</span>}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
