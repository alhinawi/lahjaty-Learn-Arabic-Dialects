'use client'

import { ChevronLeft, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { dialects, famousFor, getDialect, phraseOfTheDay, STANDARD_ID } from '../lib/content'
import { useName, useT } from '../lib/i18n'
import { famousInMyDialect } from '../lib/myDialect'
import { useApp } from '../lib/store'
import MyDialectLine from './MyDialectLine'
import PlayButton from './PlayButton'

/**
 * The encyclopedia's front door: today's famous phrase, then the most famous phrase of every
 * dialect, in the first rows of the home page, each card opening its dialect's page.
 */
export default function FamousGrid() {
  const t = useT()
  const name = useName()
  const lang = useApp((s) => s.lang)
  const myDialectId = useApp((s) => s.myDialectId)
  // Front grid: two distinctive dialects per country (owner request), in a curated order,
  // so the home page fronts countries instead of every governorate-level dialect.
  const FRONT_ORDER = [
    'cai', 'sai', 'naj', 'hij', 'dam', 'alp', 'leb', 'psu', 'psr', 'jor', 'bag', 'mos',
    'kuw', 'emi', 'qat', 'bah', 'oma', 'dho', 'san', 'ade', 'sud', 'chd', 'mar', 'jeb',
    'alg', 'tun', 'tri', 'ben', 'has',
  ]
  const byCountry = new Map<string, typeof dialects>()
  for (const d of dialects) {
    if (d.id === STANDARD_ID || famousFor(d.id).length === 0) continue
    const key = d.countryEn ?? d.country ?? ''
    const arr = byCountry.get(key) ?? []
    arr.push(d)
    byCountry.set(key, arr)
  }
  const list = [...byCountry.values()].flatMap((arr) =>
    arr
      .slice()
      .sort((a, b) => {
        const ia = FRONT_ORDER.indexOf(a.id)
        const ib = FRONT_ORDER.indexOf(b.id)
        return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib)
      })
      .slice(0, 2),
  )
  const today = phraseOfTheDay()
  const todayDialect = getDialect(today.dialectId)!
  const note = lang === 'ar' ? today.phrase.noteAr ?? today.phrase.note : today.phrase.note

  return (
    <section aria-labelledby="famous-grid" className="space-y-3">
      <div className="rounded-3xl border-2 border-sun-400 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1 text-xs font-bold text-amber-700">
            <Sparkles className="h-4 w-4" aria-hidden />
            {t('phraseOfDay')}
          </span>
          <Link href={`/dialects/${todayDialect.id}`} className="text-xs font-semibold text-brand-700">
            {name(todayDialect)}
            {todayDialect.country && <span className="font-normal text-slate-500"> · {lang === 'ar' ? todayDialect.country : todayDialect.countryEn}</span>}
          </Link>
        </div>
        <div className="mt-2 flex items-start gap-3">
          <p dir="rtl" lang="ar" className="dialect-text min-w-0 flex-1 text-3xl font-bold text-slate-900">
            {today.phrase.text}
          </p>
          <PlayButton dialectId={today.dialectId} phraseId={today.phrase.id} text={today.phrase.text} />
        </div>
        <MyDialectLine text={famousInMyDialect(today.phrase, today.dialectId, myDialectId)} />
        <p dir="ltr" lang="en" className="mt-2 text-start text-sm text-slate-700">
          {today.phrase.english}
        </p>
        {lang === 'ar' && (
          <p dir="rtl" lang="ar" className="dialect-text text-sm text-slate-500">
            {t('standardEq')}: {today.phrase.standard}
          </p>
        )}
        {note && <p className="mt-1 text-xs text-slate-500">{note}</p>}
      </div>

      <div className="flex items-end justify-between gap-2 pt-1">
        <div>
          <h2 id="famous-grid" className="text-lg font-bold">
            {t('famousGridTitle')}
          </h2>
          <p className="text-xs text-slate-500">{t('famousGridBody')}</p>
        </div>
        <span className="flex shrink-0 flex-col items-end gap-1">
          <Link href="/dialects" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700">
            {t('seeAllFamous')}
            <ChevronLeft className="h-4 w-4 ltr:rotate-180" aria-hidden />
          </Link>
          <Link href="/concepts/" className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-brand-700">
            {t('browseConcepts')}
            <ChevronLeft className="h-3.5 w-3.5 ltr:rotate-180" aria-hidden />
          </Link>
          <Link href="/regions/" className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-brand-700">
            {t('regionsExplore')}
            <ChevronLeft className="h-3.5 w-3.5 ltr:rotate-180" aria-hidden />
          </Link>
        </span>
      </div>
      <ul className="stagger grid grid-cols-2 gap-2.5">
        {list.map((d) => {
          const phrase = famousFor(d.id)[0]
          return (
            <li key={d.id}>
              <Link
                href={`/dialects/${d.id}`}
                className="lift relative flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-3 shadow-sm hover:border-sun-400"
              >
                <span className="flex items-center justify-between gap-1">
                  <span className="text-[11px] font-bold text-amber-700">
                    {name(d)}
                    {d.country && <span className="font-normal text-slate-500"> · {lang === 'ar' ? d.country : d.countryEn}</span>}
                  </span>
                  <PlayButton dialectId={d.id} phraseId={phrase.id} text={phrase.text} size="sm" />
                </span>
                <span dir="rtl" lang="ar" className="dialect-text mt-1.5 text-xl leading-snug font-bold text-brand-800">
                  {phrase.text}
                </span>
                <span dir="ltr" lang="en" className="mt-auto pt-2 text-start text-xs text-slate-500">
                  {phrase.english}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
