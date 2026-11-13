import { ChevronLeft, Sparkles } from 'lucide-react'
import { Link } from 'react-router'
import { famousStrip, getDialect, phraseOfTheDay } from '../lib/content'
import { useName, useT } from '../lib/i18n'
import { famousInMyDialect } from '../lib/myDialect'
import { useApp } from '../lib/store'
import MyDialectLine from './MyDialectLine'
import PlayButton from './PlayButton'

/** Home page hook: today's famous phrase, then a strip with one famous phrase from each dialect. */
export default function FamousHighlight() {
  const t = useT()
  const name = useName()
  const lang = useApp((s) => s.lang)
  const myDialectId = useApp((s) => s.myDialectId)
  const today = phraseOfTheDay()
  const strip = famousStrip()
  const todayDialect = getDialect(today.dialectId)!
  const note = lang === 'ar' ? today.phrase.noteAr ?? today.phrase.note : today.phrase.note

  return (
    <section className="space-y-3">
      <div className="rounded-3xl border-2 border-sun-400 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1 text-xs font-bold text-amber-700">
            <Sparkles className="h-4 w-4" aria-hidden />
            {t('phraseOfDay')}
          </span>
          <Link to={`/dialects/${todayDialect.id}`} className="text-xs font-semibold text-brand-700">
            {name(todayDialect)}
            {todayDialect.country && <span className="font-normal text-slate-500"> · {lang === 'ar' ? todayDialect.country : todayDialect.countryEn}</span>}
          </Link>
        </div>
        <div className="mt-2 flex items-start gap-3">
          <p dir="rtl" lang="ar" className="dialect-text min-w-0 flex-1 text-3xl font-bold text-slate-900">
            {today.phrase.text}
          </p>
          <PlayButton dialectId={today.dialectId} phraseId={today.phrase.id} />
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

      <div>
        <h2 className="mb-2 text-lg font-bold">{t('famousStrip')}</h2>
        <ul className="-mx-4 flex snap-x gap-2.5 overflow-x-auto px-4 pb-2">
          {strip.map(({ dialectId, phrase }) => {
            const d = getDialect(dialectId)!
            return (
              <li key={dialectId} className="w-40 shrink-0 snap-start">
                <Link
                  to={`/dialects/${dialectId}`}
                  className="flex h-full flex-col rounded-2xl bg-brand-700 p-3 text-white shadow-sm hover:bg-brand-800"
                >
                  <span className="text-[11px] text-cream-200">{name(d)}</span>
                  <span dir="rtl" lang="ar" className="dialect-text mt-1 text-xl font-bold">
                    {phrase.text}
                  </span>
                  <span dir="ltr" lang="en" className="mt-auto pt-2 text-start text-xs text-cream-100">
                    {phrase.english}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
        <Link to="/dialects" className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-brand-700">
          {t('seeAllFamous')}
          <ChevronLeft className="h-4 w-4 ltr:rotate-180" aria-hidden />
        </Link>
      </div>
    </section>
  )
}
