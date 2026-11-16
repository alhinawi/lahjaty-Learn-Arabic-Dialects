'use client'

import { BookA, ChevronLeft, Columns3, GraduationCap, MapPinned } from 'lucide-react'
import Link from 'next/link'
import CategoryIcon from '../components/CategoryIcon'
import DialectMap from '../components/DialectMap'
import Hero from '../components/Hero'
import SearchBox from '../components/SearchBox'
import DialectChip from '../components/DialectChip'
import FamousGrid from '../components/FamousGrid'
import RegionsStrip from '../components/RegionsStrip'
import GoalSuggestions from '../components/GoalSuggestions'
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
      <Hero />

      <FamousGrid />

      <RegionsStrip />

      <SearchBox />

      <GoalSuggestions />

      <section className="space-y-3">
        <DialectChip next="/" />
        <ProgressBar value={learnedHere} total={phrases.length} label={t('learnedOf', { n: learnedHere, total: phrases.length })} />
      </section>

      <DialectMap />

      <Link href="/egypt"
        className="lift pattern-stars relative flex items-center gap-3 overflow-hidden rounded-3xl bg-gradient-to-br from-brand-800 to-brand-950 p-4 text-white shadow-md"
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sun-400/15 ring-1 ring-sun-400/40">
          <MapPinned className="h-6 w-6 text-sun-300" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-bold"><span className="gold-text">{t('egyptCta')}</span></span>
          <span className="block text-xs text-cream-100">{t('egyptCtaBody')}</span>
        </span>
        <ChevronLeft className="h-5 w-5 shrink-0 text-sun-300 ltr:rotate-180" aria-hidden />
      </Link>

      <section>
        <h2 className="mb-3 text-lg font-bold">{t('situations')}</h2>
        <div className="stagger grid grid-cols-3 gap-2.5">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/lessons/${c.id}`}
              className="lift flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3 text-center shadow-sm hover:border-sun-400"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-50 to-sand-100 text-brand-700 ring-1 ring-sun-400/30">
                <CategoryIcon id={c.id} className="h-5 w-5" />
              </span>
              <span className="text-xs leading-tight font-semibold text-slate-800">{name(c)}</span>
              <span className="text-[10px] text-slate-500">{t('phrasesCount', { n: phrasesInCategory(c.id).length })}</span>
            </Link>
          ))}
        </div>
      </section>

      <Link href="/dictionary" className="lift flex items-center gap-3 rounded-2xl border border-sun-300 bg-white p-4 shadow-sm">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-700 text-sun-300">
          <BookA className="h-6 w-6" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-bold">{t('dictCta')}</span>
          <span className="block text-xs text-slate-600">{t('dictCtaBody')}</span>
        </span>
        <ChevronLeft className="h-5 w-5 shrink-0 text-slate-400 ltr:rotate-180" aria-hidden />
      </Link>

      <section className="grid grid-cols-2 gap-3">
        <Link href="/compare" className="lift rounded-2xl bg-sand-100 p-4 ring-1 ring-sun-400/25">
          <Columns3 className="h-6 w-6 text-brand-700" aria-hidden />
          <h3 className="mt-2 font-bold">{t('compareTitle')}</h3>
          <p className="mt-1 text-xs text-slate-600">{t('compareBody')}</p>
        </Link>
        <Link href="/practice" className="lift rounded-2xl bg-brand-50 p-4 ring-1 ring-brand-200">
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
            className="mt-3 text-xs text-slate-500 underline hover:text-slate-600"
          >
            {t('resetProgress')}
          </button>
        )}
      </section>
    </div>
  )
}
