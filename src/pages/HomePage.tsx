import { ChevronLeft, Columns3, GraduationCap } from 'lucide-react'
import { Link } from 'react-router'
import CategoryIcon from '../components/CategoryIcon'
import DialectChip from '../components/DialectChip'
import FamousHighlight from '../components/FamousHighlight'
import ProgressBar from '../components/ProgressBar'
import { categories, phrases, phrasesInCategory } from '../lib/content'
import { useName, useT } from '../lib/i18n'
import { useApp } from '../lib/store'

export default function HomePage() {
  const t = useT()
  const name = useName()
  const dialectId = useApp((s) => s.dialectId)
  const learned = useApp((s) => s.learned)
  const quizzesTaken = useApp((s) => s.quizzesTaken)
  const resetProgress = useApp((s) => s.resetProgress)

  const learnedHere = (learned[dialectId] ?? []).length
  const learnedTotal = Object.values(learned).reduce((n, ids) => n + ids.length, 0)
  const dialectsStarted = Object.values(learned).filter((ids) => ids.length > 0).length

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 to-brand-900 p-5 text-white shadow">
        <div aria-hidden className="absolute -top-10 -end-10 h-40 w-40 rounded-full bg-sun-400/20" />
        <div aria-hidden className="absolute -bottom-12 -start-6 h-32 w-32 rounded-full bg-white/10" />
        <p className="relative text-xs font-semibold tracking-wide text-sun-400">{t('tagline')}</p>
        <h1 className="relative mt-1 text-2xl leading-snug font-bold">{t('heroTitle')}</h1>
        <p className="relative mt-2 text-sm text-brand-100">
          {t('heroBody')}
        </p>
        <Link
          to="/lessons"
          className="relative mt-4 inline-flex items-center gap-1 rounded-full bg-sun-400 px-4 py-2 text-sm font-bold text-brand-900 hover:bg-sun-500"
        >
          {t('startLearning')}
          <ChevronLeft className="h-4 w-4 ltr:rotate-180" aria-hidden />
        </Link>
      </section>

      <FamousHighlight />

      <section className="space-y-3">
        <DialectChip next="/" />
        <ProgressBar value={learnedHere} total={phrases.length} label={t('learnedOf', { n: learnedHere, total: phrases.length })} />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold">{t('situations')}</h2>
        <div className="grid grid-cols-3 gap-2.5">
          {categories.map((c) => (
            <Link
              key={c.id}
              to={`/lessons/${c.id}`}
              className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3 text-center shadow-sm hover:border-brand-500"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sand-100 text-brand-700">
                <CategoryIcon id={c.id} className="h-5 w-5" />
              </span>
              <span className="text-xs leading-tight font-semibold text-slate-800">{name(c)}</span>
              <span className="text-[10px] text-slate-400">{t('phrasesCount', { n: phrasesInCategory(c.id).length })}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <Link to="/compare" className="rounded-2xl bg-sand-100 p-4 hover:bg-sand-200">
          <Columns3 className="h-6 w-6 text-brand-700" aria-hidden />
          <h3 className="mt-2 font-bold">{t('compareTitle')}</h3>
          <p className="mt-1 text-xs text-slate-600">{t('compareBody')}</p>
        </Link>
        <Link to="/practice" className="rounded-2xl bg-brand-50 p-4 hover:bg-brand-100">
          <GraduationCap className="h-6 w-6 text-brand-700" aria-hidden />
          <h3 className="mt-2 font-bold">{t('practiceTitle')}</h3>
          <p className="mt-1 text-xs text-slate-600">{t('practiceBody')}</p>
        </Link>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="font-bold">{t('progressTitle')}</h2>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          {[
            [learnedTotal, t('progressLearned')],
            [dialectsStarted, t('progressDialects')],
            [quizzesTaken, t('progressQuizzes')],
          ].map(([n, label]) => (
            <div key={String(label)} className="rounded-xl bg-sand-50 p-2">
              <div className="text-xl font-bold text-brand-700">{n}</div>
              <div className="text-[11px] text-slate-500">{label}</div>
            </div>
          ))}
        </div>
        {(learnedTotal > 0 || quizzesTaken > 0) && (
          <button
            type="button"
            onClick={() => window.confirm(t('resetConfirm')) && resetProgress()}
            className="mt-3 text-xs text-slate-400 underline hover:text-slate-600"
          >
            {t('resetProgress')}
          </button>
        )}
      </section>
    </div>
  )
}
