'use client'

import { BookA, ChevronLeft, ChevronRight, Lightbulb, Share2 } from 'lucide-react'
import Link from 'next/link'
import { conceptDialectCount } from '../lib/conceptVariants'
import { concepts, famousByConcept, getConcept, getDialect, STANDARD_ID, WORD_GROUPS } from '../lib/content'
import { entryForConcept } from '../lib/conceptDict'
import { sharePath } from '../lib/og'
import { useName, useT } from '../lib/i18n'
import { useApp } from '../lib/store'
import { regionLabel } from '../lib/search'
import type { WordGroup } from '../lib/types'
import NoteSources from '../components/NoteSources'
import NotFoundPage from './NotFoundPage'

/** One meaning across every dialect: the encyclopedia page for a concept like «دلوقتي». */
export default function ConceptPage({ conceptId }: { conceptId: string }) {
  const t = useT()
  const name = useName()
  const lang = useApp((s) => s.lang)
  const concept = getConcept(conceptId)
  if (!concept) return <NotFoundPage />

  const variants = famousByConcept(concept.id).filter(({ dialectId }) => dialectId !== STANDARD_ID)
  const index = concepts.filter((c) => famousByConcept(c.id).some((v) => v.dialectId !== STANDARD_ID))
  const i = index.findIndex((c) => c.id === concept.id)
  const prev = i > 0 ? index[i - 1] : undefined
  const next = i >= 0 && i < index.length - 1 ? index[i + 1] : undefined
  const regionWords = Object.entries(concept.words ?? {})
  const dictEntry = entryForConcept(concept)

  return (
    <div className="space-y-4">
      <nav className="flex items-center justify-between text-sm font-semibold text-brand-700">
        <Link href="/concepts/" className="inline-flex items-center gap-1">
          <ChevronRight className="h-4 w-4 ltr:rotate-180" aria-hidden />
          {t('conceptsTitle')}
        </Link>
        <span className="flex gap-3">
          {prev && (
            <Link href={`/concepts/${prev.id}/`} className="inline-flex items-center gap-0.5">
              <ChevronRight className="h-4 w-4 ltr:rotate-180" aria-hidden />
              {name(prev)}
            </Link>
          )}
          {next && (
            <Link href={`/concepts/${next.id}/`} className="inline-flex items-center gap-0.5">
              {name(next)}
              <ChevronLeft className="h-4 w-4 ltr:rotate-180" aria-hidden />
            </Link>
          )}
        </span>
      </nav>

      <header className="pattern-stars relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-800 to-brand-950 p-5 text-white shadow-md">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sun-400/15 ring-1 ring-sun-400/40">
          <Lightbulb className="h-6 w-6 text-sun-300" aria-hidden />
        </span>
        <h1 dir={lang === 'ar' ? 'rtl' : 'ltr'} className="dialect-text mt-3 text-3xl font-bold">«{name(concept)}»</h1>
        <p dir={lang === 'ar' ? 'ltr' : 'rtl'} lang={lang === 'ar' ? 'en' : 'ar'} className="mt-1 text-end text-sm text-cream-100">{lang === 'ar' ? concept.nameEn : concept.name}</p>
        <p className="mt-2 text-sm text-cream-100">{t('conceptInAllBody')}</p>
        <p className="mt-1 text-xs font-semibold text-sun-300">{t('conceptDialectCount', { n: conceptDialectCount(variants) })}</p>
        {dictEntry && (
          <Link href={`/word/${dictEntry.id}/`} className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-cream-100 ring-1 ring-white/20 hover:bg-white/15">
            <BookA className="h-3.5 w-3.5 text-sun-300" aria-hidden />
            {t('conceptSeeDict', { word: dictEntry.fs })}
          </Link>
        )}
      </header>

      {regionWords.length > 0 && (
        <section className="rounded-2xl border border-sun-300 bg-white p-4 shadow-sm">
          <h2 className="mb-2 text-sm font-bold">{t('conceptByRegion')}</h2>
          <dl className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
            {regionWords.map(([group, word]) => (
              <div key={group} className="flex items-baseline gap-1.5">
                <dt className="text-slate-500">
                  <Link href={`/regions/${group}/`} className="underline-offset-2 hover:text-brand-700 hover:underline">
                    {WORD_GROUPS.includes(group as WordGroup) ? regionLabel(group as WordGroup, lang) : group}
                  </Link>
                  :
                </dt>
                <dd dir="rtl" lang="ar" className="dialect-text font-bold text-brand-800">{word}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <ul className="stagger space-y-3">
        {variants.map(({ dialectId, phrase }) => {
          const d = getDialect(dialectId)
          if (!d) return null
          const note = lang === 'ar' ? phrase.noteAr ?? phrase.note : phrase.note
          return (
            <li key={`${dialectId}|${phrase.id}`} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <Link href={`/dialects/${dialectId}/`} className="text-xs font-bold text-amber-700 hover:text-brand-700">
                  {name(d)}
                  {d.country ? <span className="font-normal text-slate-500"> · {lang === 'ar' ? d.country : d.countryEn}</span> : null}
                </Link>
                <Link
                  href={`${sharePath(dialectId, phrase.id)}/`}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-brand-700"
                  aria-label={`${t('sharePhrase')} - ${phrase.text}`}
                >
                  <Share2 className="h-3.5 w-3.5" aria-hidden />
                </Link>
              </div>
              <p dir="rtl" lang="ar" className="dialect-text mt-2 text-2xl leading-snug font-bold text-brand-900">{phrase.text}</p>
              <p className="mt-1.5 text-sm text-slate-600">
                <span className="font-semibold">{t('conceptStandard')}:</span> {phrase.standard}
              </p>
              <p dir="ltr" lang="en" className="text-start text-sm text-slate-500">{phrase.english}</p>
              {note && <p className="mt-1 text-xs text-slate-500">{note}</p>}
              {note && <NoteSources sources={phrase.noteSources} lang={lang} />}
              {phrase.example && (
                <p className="mt-2 rounded-xl bg-sand-100 px-3 py-2 text-sm text-slate-700">
                  <span className="font-semibold">{t('example')}:</span> {phrase.example}
                </p>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
