'use client'

import { Columns3, Download, MapPin } from 'lucide-react'
import Link from 'next/link'
import PlayButton from '../components/PlayButton'
import NoteSources from '../components/NoteSources'
import ShareButton from '../components/ShareButton'
import { getDialect, getFamous, getPhrase, isFamousId, STANDARD_ID } from '../lib/content'
import { useName, useT } from '../lib/i18n'
import { ogImageFor } from '../lib/og'
import { useApp } from '../lib/store'
import NotFoundPage from './NotFoundPage'

/** The page behind a shared phrase link: the phrase big, its meaning, and the way to the rest. */
export default function SharePage({ dialectId = '', phraseId = '' }: { dialectId?: string; phraseId?: string }) {
  const t = useT()
  const name = useName()
  const lang = useApp((s) => s.lang)
  const dialect = getDialect(dialectId)
  const famous = isFamousId(phraseId) ? getFamous(dialectId, phraseId) : undefined
  const base = famous ? undefined : getPhrase(phraseId)
  const text = famous?.text ?? base?.variants[dialectId]?.text
  const standard = famous?.standard ?? base?.variants[STANDARD_ID]?.text
  const english = famous?.english ?? base?.english
  if (!dialect || !text) return <NotFoundPage />
  const compareTo = famous ? (famous.concept ? `/compare?c=${encodeURIComponent(famous.concept)}` : undefined) : `/compare?p=${encodeURIComponent(phraseId)}`
  const note = famous ? (lang === 'ar' ? famous.noteAr ?? famous.note : famous.note) : undefined
  const image = ogImageFor(`/share/${dialectId}/${phraseId}`)

  return (
    <div className="space-y-4">
      <section className="pattern-stars overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-800 to-brand-900 p-6 text-center text-white shadow-lg">
        <p className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-cream-100 ring-1 ring-sun-300/40">
          <MapPin className="h-3.5 w-3.5" aria-hidden />
          {name(dialect)}
          {dialect.country && <span> · {lang === 'ar' ? dialect.country : dialect.countryEn}</span>}
        </p>
        <p dir="rtl" lang="ar" className="dialect-text mt-5 text-4xl font-bold leading-snug text-cream-50">
          «{text}»
        </p>
        <div className="mt-3 flex justify-center">
          <PlayButton dialectId={dialectId} phraseId={phraseId} text={text} />
        </div>
        <dl className="mt-4 space-y-1 text-sm">
          {standard && (
            <div>
              <dt className="inline text-cream-200">{t('standardEq')}: </dt>
              <dd dir="rtl" lang="ar" className="dialect-text inline font-semibold text-cream-50">
                {standard}
              </dd>
            </div>
          )}
          {english && (
            <dd dir="ltr" lang="en" className="font-semibold text-sun-200">
              {english}
            </dd>
          )}
        </dl>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <ShareButton dialectId={dialectId} phraseId={phraseId} text={text} label />
          {famous && (
            <a href={image} download className="flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-cream-50 ring-1 ring-white/20 hover:bg-white/15">
              <Download className="h-4 w-4" aria-hidden />
              {t('downloadCard')}
            </a>
          )}
        </div>
      </section>
      {note && (
        <section aria-labelledby="shared-note-title" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h1 id="shared-note-title" className="text-base font-bold text-slate-900">{t('phraseContext')}</h1>
          <p className="mt-2 text-sm text-slate-600">{note}</p>
          <NoteSources sources={famous?.noteSources} lang={lang} />
        </section>
      )}
      <div className="grid gap-2 sm:grid-cols-2">
        {dialectId !== STANDARD_ID && <Link href={`/dialects/${dialectId}`} className="rounded-2xl border border-slate-200 bg-white p-4 font-semibold text-brand-700 shadow-sm hover:border-brand-300">
          {t('moreFromDialect', { name: name(dialect) })}
        </Link>}
        {compareTo && (
          <Link href={compareTo} className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 font-semibold text-brand-700 shadow-sm hover:border-brand-300">
            <Columns3 className="h-4 w-4" aria-hidden />
            {t('compareThis')}
          </Link>
        )}
      </div>
    </div>
  )
}
