import { BookOpen, ChevronLeft, Shuffle } from 'lucide-react'
import { Link } from 'react-router'
import DialectChip from '../components/DialectChip'
import { getDialect } from '../lib/content'
import { useName, useT } from '../lib/i18n'
import { useApp } from '../lib/store'

export default function PracticePage() {
  const t = useT()
  const name = useName()
  const dialectId = useApp((s) => s.dialectId)
  const best = useApp((s) => s.bestScores)
  const dialect = getDialect(dialectId)

  const modes = [
    {
      to: '/practice/meaning',
      icon: BookOpen,
      title: t('modeMeaning'),
      body: t('modeMeaningBody', { dialect: dialect ? name(dialect) : '' }),
      best: best[`meaning|${dialectId}`],
    },
    {
      to: '/practice/match',
      icon: Shuffle,
      title: t('modeMatch'),
      body: t('modeMatchBody'),
      best: best['match|all'],
    },
  ]

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">{t('practiceTitle')}</h1>
      <DialectChip next="/practice" />
      <h2 className="pt-2 text-sm font-bold text-slate-500">{t('practiceIntro')}</h2>
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
                {m.best !== undefined && (
                  <span className="mt-1 block text-xs font-semibold text-sun-500">{t('bestScore', { n: m.best })}</span>
                )}
              </span>
              <ChevronLeft className="h-5 w-5 text-slate-300 ltr:rotate-180" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
