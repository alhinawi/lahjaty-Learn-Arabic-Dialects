'use client'

import { ChevronLeft, Map } from 'lucide-react'
import Link from 'next/link'
import { dialectsInGroup, WORD_GROUPS } from '../lib/content'
import { useT } from '../lib/i18n'
import { GROUP_KEY } from '../screens/RegionsPage'

/** A compact home-page strip into the seven region hubs. */
export default function RegionsStrip() {
  const t = useT()
  return (
    <section>
      <div className="mb-3 flex items-end justify-between gap-2">
        <h2 className="flex items-center gap-1.5 text-lg font-bold">
          <Map className="h-5 w-5 text-sun-500" aria-hidden />
          {t('regionsTitle')}
        </h2>
        <Link href="/regions/" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700">
          {t('regionsExplore')}
          <ChevronLeft className="h-4 w-4 ltr:rotate-180" aria-hidden />
        </Link>
      </div>
      <ul className="stagger flex gap-2 overflow-x-auto pb-1">
        {WORD_GROUPS.map((group) => (
          <li key={group} className="shrink-0">
            <Link
              href={`/regions/${group}/`}
              className="lift block rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-center shadow-sm hover:border-sun-400"
            >
              <span dir="rtl" lang="ar" className="dialect-text block text-base font-bold text-brand-800">{t(GROUP_KEY[group])}</span>
              <span className="block text-[11px] font-semibold text-slate-500">{t('regionDialectCount', { n: dialectsInGroup(group).length })}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
