'use client'

import { ChevronLeft, Search, Type } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import ComparePicker from '../components/ComparePicker'
import PlayButton from '../components/PlayButton'
import { comparableHits } from '../lib/search'
import {
  concepts,
  dialects,
  famousByConcept,
  getConcept,
  dialectsByRegion,
  getPhrase,
  phrases,
  searchDialects,
  STANDARD_ID,
} from '../lib/content'
import { useName, useT } from '../lib/i18n'
import { useApp } from '../lib/store'

export default function ComparePage() {
  const t = useT()
  const name = useName()
  const lang = useApp((s) => s.lang)
  const myDialect = useApp((s) => s.dialectId)
  const showTranslit = useApp((s) => s.showTranslit)
  const toggleTranslit = useApp((s) => s.toggleTranslit)
  const router = useRouter()
  const params = useSearchParams() ?? new URLSearchParams()
  // Same contract as react-router's setSearchParams: the object becomes the whole query string.
  const setParams = (updates: Record<string, string>, opts?: { replace?: boolean }) => {
    const qs = new URLSearchParams(updates).toString()
    router[opts?.replace ? 'replace' : 'push'](`/compare${qs ? `?${qs}` : ''}`)
  }
  const [query, setQuery] = useState('')
  // ?q= deep-links a search to a comparison: the best everyday phrase, else the best shared meaning.
  const qParam = params.get('q') ?? ''
  const qPhrase = qParam && !params.has('p') && !params.has('c') ? comparableHits(qParam, 'phrase', 1)[0] : undefined
  const qConcept = qParam && !qPhrase && !params.has('p') && !params.has('c') ? comparableHits(qParam, 'concept', 1)[0] : undefined
  const famousMode = params.has('c') || !!qConcept

  const tabs = (
    <div className="grid grid-cols-2 gap-1 rounded-full bg-slate-100 p-1" role="tablist">
      {[
        [false, t('compareTabEveryday')],
        [true, t('compareTabFamous')],
      ].map(([isFamous, label]) => (
        <button
          key={String(label)}
          type="button"
          role="tab"
          aria-selected={famousMode === isFamous}
          onClick={() => setParams(isFamous ? { c: concepts[0].id } : {}, { replace: true })}
          className={`rounded-full py-2 text-sm font-semibold ${famousMode === isFamous ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500'}`}
        >
          {label}
        </button>
      ))}
    </div>
  )

  if (famousMode) {
    const usedConcepts = concepts.filter((c) => famousByConcept(c.id).length > 0)
    const concept = getConcept(params.get('c') ?? qConcept?.id ?? '') ?? usedConcepts[0]
    const rows = famousByConcept(concept.id)
    const byDialect = new Map(rows.map((r) => [r.dialectId, r]))
    const conceptGroups = dialectsByRegion(searchDialects(query, dialects.filter((d) => byDialect.has(d.id))))
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-bold">{t('compareTitle')}</h1>
        {tabs}
        <ComparePicker kind="concept" current={concept.id} onPick={(id) => setParams({ c: id }, { replace: true })} />
        <section className="rounded-2xl bg-brand-700 p-4 text-white shadow">
          <p dir="ltr" lang="en" className="text-start text-lg font-semibold">
            {concept.nameEn}
          </p>
          <span className="text-xs text-cream-200">{t('standardEq')}</span>
          <p dir="rtl" lang="ar" className="dialect-text text-2xl font-bold">
            {concept.name}
          </p>
          <Link href={`/concepts/${concept.id}/`} className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-sun-300 hover:text-sun-400">
            {t('conceptInAll', { concept: concept.name })}
            <ChevronLeft className="h-3 w-3 ltr:rotate-180" aria-hidden />
          </Link>
        </section>
        <h2 className="text-sm font-bold text-slate-500">{t('dialectsThatHaveIt')}</h2>
        <label className="relative block">
          <Search className="pointer-events-none absolute top-1/2 start-3 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('filterDialects')}
            aria-label={t('filterDialects')}
            className="w-full rounded-full border border-slate-200 bg-white py-2 ps-9 pe-3 text-sm outline-none focus:border-brand-500"
          />
        </label>
        {conceptGroups.length === 0 && <p className="py-6 text-center text-slate-500">{t('noResults')}</p>}
        {conceptGroups.map(({ region, dialects: list }) => (
          <section key={region.id}>
            <h2 className="mb-2 text-sm font-bold text-slate-500">{name(region)}</h2>
            <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              {list.map((d) => {
                const f = byDialect.get(d.id)!.phrase
                return (
                  <li key={d.id} className={`flex items-center gap-3 px-3 py-2.5 ${d.id === myDialect ? 'bg-sun-400/15' : ''}`}>
                    <div className="w-24 shrink-0">
                      <div className="text-sm leading-tight font-semibold text-slate-800">{name(d)}</div>
                      <div className="text-[11px] text-slate-500">{lang === 'ar' ? d.country : d.countryEn}</div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p dir="rtl" lang="ar" className="dialect-text text-lg font-bold text-slate-900">
                        {f.text}
                      </p>
                      <p dir="ltr" lang="en" className="text-start text-xs text-slate-500">
                        {f.english}
                      </p>
                    </div>
                    <PlayButton dialectId={d.id} phraseId={f.id} text={f.text} size="sm" />
                  </li>
                )
              })}
            </ul>
          </section>
        ))}
      </div>
    )
  }

  const phrase = getPhrase(params.get('p') ?? qPhrase?.id ?? '') ?? phrases[0]
  const standard = phrase.variants[STANDARD_ID]
  const others = dialects.filter((d) => d.id !== STANDARD_ID)
  const groups = dialectsByRegion(searchDialects(query, others))
  const anyTranslit = Object.values(phrase.variants).some((v) => v.translit)

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">{t('compareTitle')}</h1>
      {tabs}

      <ComparePicker kind="phrase" current={phrase.id} onPick={(id) => setParams({ p: id }, { replace: true })} />

      <section className="rounded-2xl bg-brand-700 p-4 text-white shadow">
        <p dir="ltr" lang="en" className="text-start text-lg font-semibold">
          {phrase.english}
        </p>
        <div className="mt-2 flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <span className="text-xs text-cream-200">{t('standardEq')}</span>
            <p dir="rtl" lang="ar" className="dialect-text text-2xl font-bold">
              {standard.text}
            </p>
            {showTranslit && standard.translit && (
              <p dir="ltr" className="text-start text-sm italic text-sun-400">
                {standard.translit}
              </p>
            )}
          </div>
          <PlayButton dialectId={STANDARD_ID} phraseId={phrase.id} text={standard.text} />
        </div>
        {(lang === 'ar' ? phrase.noteAr : phrase.note) && (
          <p className="mt-2 text-xs text-cream-100">{lang === 'ar' ? phrase.noteAr : phrase.note}</p>
        )}
      </section>

      <div className="flex items-center gap-2">
        <label className="relative block flex-1">
          <Search className="pointer-events-none absolute top-1/2 start-3 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('filterDialects')}
            aria-label={t('filterDialects')}
            className="w-full rounded-full border border-slate-200 bg-white py-2 ps-9 pe-3 text-sm outline-none focus:border-brand-500"
          />
        </label>
        {anyTranslit && (
          <button
            type="button"
            onClick={toggleTranslit}
            aria-pressed={showTranslit}
            aria-label={t('translit')}
            className={`flex items-center gap-1 rounded-full px-3 py-2 text-xs font-semibold ${
              showTranslit ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200'
            }`}
          >
            <Type className="h-3.5 w-3.5" aria-hidden />
            {t('translitShort')}
          </button>
        )}
      </div>

      {groups.length === 0 && <p className="py-6 text-center text-slate-500">{t('noResults')}</p>}

      {groups.map(({ region, dialects: list }) => (
        <section key={region.id}>
          <h2 className="mb-2 text-sm font-bold text-slate-500">{name(region)}</h2>
          <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {list.map((d) => {
              const v = phrase.variants[d.id]
              const mine = d.id === myDialect
              return (
                <li key={d.id} className={`flex items-center gap-3 px-3 py-2.5 ${mine ? 'bg-sun-400/15' : ''}`}>
                  <div className="w-24 shrink-0">
                    <div className="text-sm leading-tight font-semibold text-slate-800">{name(d)}</div>
                    <div className="text-[11px] text-slate-500">{lang === 'ar' ? d.country : d.countryEn}</div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p dir="rtl" lang="ar" className="dialect-text text-lg font-bold text-slate-900">
                      {v?.text}
                    </p>
                    {showTranslit && v?.translit && (
                      <p dir="ltr" className="text-start text-xs italic text-brand-700">
                        {v.translit}
                      </p>
                    )}
                  </div>
                  <PlayButton dialectId={d.id} phraseId={phrase.id} text={v?.text} size="sm" />
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}
