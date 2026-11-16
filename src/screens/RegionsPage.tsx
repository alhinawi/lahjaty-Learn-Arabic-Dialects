'use client'

import { ChevronLeft, Map } from 'lucide-react'
import Link from 'next/link'
import { dialectsInGroup, groupWords, WORD_GROUPS } from '../lib/content'
import type { WordGroup } from '../lib/types'
import { useT, type MessageKey } from '../lib/i18n'

export const GROUP_KEY: Record<WordGroup, MessageKey> = {
  egypt: 'groupEgypt',
  sudan: 'groupSudan',
  levant: 'groupLevant',
  iraq: 'groupIraq',
  gulf: 'groupGulf',
  yemen: 'groupYemen',
  maghreb: 'groupMaghreb',
}

/** The macro-regions of the Arabic dialect world, each with its dialects and signature words. */
export default function RegionsPage() {
  const t = useT()
  const groups = WORD_GROUPS.map((group) => ({
    group,
    dialects: dialectsInGroup(group),
    words: groupWords(group),
  }))

  return (
    <div className="space-y-4">
      <header className="pattern-stars relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-800 to-brand-950 p-5 text-white shadow-md">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sun-400/15 ring-1 ring-sun-400/40">
          <Map className="h-6 w-6 text-sun-300" aria-hidden />
        </span>
        <h1 className="mt-3 text-2xl font-bold">{t('regionsTitle')}</h1>
        <p className="mt-1 text-sm text-cream-100">{t('regionsBody')}</p>
      </header>

      <ul className="stagger grid grid-cols-2 gap-2.5">
        {groups.map(({ group, dialects, words }) => (
          <li key={group}>
            <Link
              href={`/regions/${group}/`}
              className="lift flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-3 shadow-sm hover:border-sun-400"
            >
              <span dir="rtl" lang="ar" className="dialect-text text-xl font-bold text-brand-800">{t(GROUP_KEY[group])}</span>
              <span className="mt-auto flex items-center justify-between pt-2 text-[11px] font-semibold text-brand-700">
                <span>
                  {t('regionDialectCount', { n: dialects.length })} · {t('regionWordCount', { n: words.length })}
                </span>
                <ChevronLeft className="h-3.5 w-3.5 ltr:rotate-180" aria-hidden />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
