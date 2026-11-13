import { ChevronLeft, Sparkles } from 'lucide-react'
import { Link } from 'react-router'
import CategoryIcon from '../components/CategoryIcon'
import DialectChip from '../components/DialectChip'
import ProgressBar from '../components/ProgressBar'
import { categories, getDialect, phrasesInCategory } from '../lib/content'
import { useName, useT } from '../lib/i18n'
import { useApp } from '../lib/store'

export default function LessonsPage() {
  const t = useT()
  const name = useName()
  const dialectId = useApp((s) => s.dialectId)
  const learnedIds = useApp((s) => s.learned[dialectId])
  const learned = learnedIds ?? []

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">{t('lessonsTitle')}</h1>
      <DialectChip next="/lessons" />
      <Link
        to={`/dialects/${dialectId}`}
        className="flex items-center gap-3 rounded-2xl border-2 border-sun-400 bg-white p-3 shadow-sm hover:border-sun-500"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sun-400/20 text-amber-700">
          <Sparkles className="h-5 w-5" aria-hidden />
        </span>
        <span className="min-w-0 flex-1 font-bold text-slate-900">{t('famousOf', { dialect: name(getDialect(dialectId)!) })}</span>
        <ChevronLeft className="h-4 w-4 text-slate-500 ltr:rotate-180" aria-hidden />
      </Link>
      <ul className="space-y-2.5">
        {categories.map((c) => {
          const list = phrasesInCategory(c.id)
          const done = list.filter((p) => learned.includes(p.id)).length
          return (
            <li key={c.id}>
              <Link
                to={`/lessons/${c.id}`}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm hover:border-brand-500"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sand-100 text-brand-700">
                  <CategoryIcon id={c.id} className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1 space-y-1.5">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="font-bold text-slate-900">{name(c)}</span>
                    <span className="text-xs text-slate-500">
                      {done}/{list.length}
                    </span>
                  </span>
                  <ProgressBar value={done} total={list.length} />
                </span>
                <ChevronLeft className="h-5 w-5 text-slate-400 ltr:rotate-180" aria-hidden />
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
