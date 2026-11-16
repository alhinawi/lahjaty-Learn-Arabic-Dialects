'use client'

import { ChevronLeft, ChevronRight, Lightbulb, Map } from 'lucide-react'
import Link from 'next/link'
import { dialectsInGroup, groupWords } from '../lib/content'
import type { WordGroup } from '../lib/types'
import { useName, useT } from '../lib/i18n'
import { GROUP_KEY } from './RegionsPage'

/** One macro-region: its dialects and the signature word it uses for each meaning. */
export default function RegionPage({ group }: { group: WordGroup }) {
  const t = useT()
  const name = useName()
  const groupDialects = dialectsInGroup(group)
  const words = groupWords(group)

  return (
    <div className="space-y-4">
      <nav className="text-sm font-semibold text-brand-700">
        <Link href="/regions/" className="inline-flex items-center gap-1">
          <ChevronRight className="h-4 w-4 ltr:rotate-180" aria-hidden />
          {t('regionsTitle')}
        </Link>
      </nav>

      <header className="pattern-stars relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-800 to-brand-950 p-5 text-white shadow-md">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sun-400/15 ring-1 ring-sun-400/40">
          <Map className="h-6 w-6 text-sun-300" aria-hidden />
        </span>
        <h1 className="dialect-text mt-3 text-3xl font-bold">{t(GROUP_KEY[group])}</h1>
        <p className="mt-2 text-xs font-semibold text-sun-300">
          {t('regionDialectCount', { n: groupDialects.length })} · {t('regionWordCount', { n: words.length })}
        </p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-2 text-sm font-bold">{t('regionDialectsTitle')}</h2>
        <ul className="grid grid-cols-2 gap-2">
          {groupDialects.map((d) => (
            <li key={d.id}>
              <Link
                href={`/dialects/${d.id}/`}
                className="lift block rounded-2xl border border-slate-200 bg-cream-50 p-3 shadow-sm hover:border-sun-400"
              >
                <span className="block text-sm font-bold text-brand-800">{name(d)}</span>
                {d.country ? <span className="block text-[11px] text-slate-500">{d.country}</span> : null}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-sun-300 bg-white p-4 shadow-sm">
        <h2 className="mb-2 flex items-center gap-1.5 text-sm font-bold">
          <Lightbulb className="h-4 w-4 text-sun-500" aria-hidden />
          {t('regionWordsTitle')}
        </h2>
        <ul className="stagger divide-y divide-slate-100">
          {words.map(({ concept, word }) => (
            <li key={concept.id}>
              <Link href={`/concepts/${concept.id}/`} className="flex items-baseline justify-between gap-3 py-2 hover:bg-cream-50">
                <span dir="rtl" lang="ar" className="dialect-text text-lg font-bold text-brand-800">{word}</span>
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  {t('conceptInAll', { concept: concept.name })}
                  <ChevronLeft className="h-3 w-3 ltr:rotate-180" aria-hidden />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
