'use client'

import { ChevronLeft, Lightbulb, Search, X } from 'lucide-react'
import Link from 'next/link'
import { conceptDialectCount } from '../lib/conceptVariants'
import { useState } from 'react'
import { WORD_GROUPS } from '../lib/content'
import type { WordGroup } from '../lib/types'
import { useT } from '../lib/i18n'
import { conceptIndexEntries } from '../lib/conceptIndex'
import { GROUP_KEY } from './RegionsPage'

/** Every concept that at least one dialect has a famous phrase for, as an index of meaning-first pages. */
export default function ConceptsPage() {
  const t = useT()
  const [group, setGroup] = useState<WordGroup | 'all'>('all')
  const [query, setQuery] = useState('')
  const shown = conceptIndexEntries(query, group)

  return (
    <div className="space-y-4">
      <header className="pattern-stars relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-800 to-brand-950 p-5 text-white shadow-md">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sun-400/15 ring-1 ring-sun-400/40">
          <Lightbulb className="h-6 w-6 text-sun-300" aria-hidden />
        </span>
        <h1 className="mt-3 text-2xl font-bold">{t('conceptsTitle')}</h1>
        <p className="mt-1 text-sm text-cream-100">{t('conceptsBody')}</p>
      </header>

      <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3.5 py-3 shadow-sm focus-within:border-brand-500">
        <Search className="h-5 w-5 shrink-0 text-brand-700" aria-hidden />
        <span className="sr-only">{t('conceptsSearch')}</span>
        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('conceptsSearch')} autoComplete="off" className="min-w-0 flex-1 bg-transparent outline-none [&::-webkit-search-cancel-button]:hidden" />
        {query && <button type="button" onClick={() => setQuery('')} aria-label={t('searchClear')} className="rounded-full p-1 text-slate-500 hover:bg-slate-100"><X className="h-4 w-4" aria-hidden /></button>}
      </label>

      <div className="flex flex-wrap gap-1.5" role="group" aria-label={t('regionsTitle')}>
        <button
          type="button"
          onClick={() => setGroup('all')}
          aria-pressed={group === 'all'}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm transition ${group === 'all' ? 'bg-brand-700 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-sun-400'}`}
        >
          {t('conceptsFilterAll')}
        </button>
        {WORD_GROUPS.map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setGroup(g)}
            aria-pressed={group === g}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm transition ${group === g ? 'bg-brand-700 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-sun-400'}`}
          >
            {t(GROUP_KEY[g])}
          </button>
        ))}
      </div>

      {shown.length === 0 && <p role="status" className="py-6 text-center text-sm text-slate-500">{t('noResults')}</p>}
      <ul className="stagger grid grid-cols-2 gap-2.5">
        {shown.map(({ concept, variants }) => (
          <li key={concept.id}>
            <Link
              href={`/concepts/${concept.id}/`}
              className="lift flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-3 shadow-sm hover:border-sun-400"
            >
              <span dir="rtl" lang="ar" className="dialect-text text-xl font-bold text-brand-800">{concept.name}</span>
              <span dir="ltr" lang="en" className="text-start text-xs text-slate-500">{concept.nameEn}</span>
              {group !== 'all' && concept.words?.[group] && (
                <span dir="rtl" lang="ar" className="dialect-text mt-1 text-sm font-semibold text-amber-700">
                  {concept.words[group]}
                </span>
              )}
              <span className="mt-auto flex items-center justify-between pt-2 text-[11px] font-semibold text-brand-700">
                {t('conceptDialectCount', { n: conceptDialectCount(variants) })}
                <ChevronLeft className="h-3.5 w-3.5 ltr:rotate-180" aria-hidden />
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <p className="text-center">
        <Link href="/regions/" className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-brand-700">
          {t('regionsExplore')}
          <ChevronLeft className="h-3.5 w-3.5 ltr:rotate-180" aria-hidden />
        </Link>
      </p>
    </div>
  )
}
