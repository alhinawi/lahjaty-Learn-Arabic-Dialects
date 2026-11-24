'use client'

import { Check, Search } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { audioCount, dialectsByRegion, searchDialects } from '../lib/content'
import { useName, useT } from '../lib/i18n'
import { useApp } from '../lib/store'
import { dialectReturnPath } from '../lib/dialectReturn'
import DialectMap from '../components/DialectMap'
import { GROUP_KEY, REGION_HUBS } from '../lib/regionsMeta'

export default function DialectsPage() {
  const t = useT()
  const name = useName()
  const router = useRouter()
  const params = useSearchParams() ?? new URLSearchParams()
  const next = dialectReturnPath(params.get('next'))
  const lang = useApp((s) => s.lang)
  const selected = useApp((s) => s.dialectId)
  const setDialect = useApp((s) => s.setDialect)
  const [query, setQuery] = useState('')

  const groups = dialectsByRegion(searchDialects(query))

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">{t('chooseDialect')}</h1>
      {!next && !query && <DialectMap compact />}
      <label className="relative block">
        <Search className="pointer-events-none absolute top-1/2 start-3 h-5 w-5 -translate-y-1/2 text-slate-500" aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('searchDialects')}
          aria-label={t('searchDialects')}
          className="w-full rounded-2xl border border-slate-200 bg-white py-3 ps-10 pe-3 shadow-sm outline-none focus:border-brand-500"
        />
      </label>

      {groups.length === 0 && <p className="py-8 text-center text-slate-500">{t('noResults')}</p>}

      {groups.map(({ region, dialects }) => (
        <section key={region.id}>
          <h2 className="mb-2 flex items-baseline gap-2 text-sm font-bold text-slate-500">
            {(REGION_HUBS[region.id] ?? []).length === 1 ? (
              <Link href={`/regions/${REGION_HUBS[region.id]![0]}/`} className="underline-offset-2 hover:text-brand-700 hover:underline">
                {name(region)}
              </Link>
            ) : (
              name(region)
            )}
            {(REGION_HUBS[region.id] ?? []).length > 1 &&
              REGION_HUBS[region.id]!.map((g) => (
                <Link key={g} href={`/regions/${g}/`} className="text-xs font-semibold text-brand-700 underline-offset-2 hover:underline">
                  {t(GROUP_KEY[g])}
                </Link>
              ))}
          </h2>
          <ul className="grid grid-cols-2 gap-2">
            {dialects.map((d) => {
              const isSelected = d.id === selected
              const audio = audioCount(d.id)
              return (
                <li key={d.id}>
                  <button
                    type="button"
                    onClick={() => {
                      if (next) {
                        setDialect(d.id)
                        router.push(next)
                      } else router.push(`/dialects/${d.id}`)
                    }}
                    aria-pressed={isSelected}
                    className={`relative w-full rounded-2xl border p-3 text-start shadow-sm transition ${
                      isSelected ? 'border-brand-600 bg-brand-50' : 'lift border-slate-200 bg-white hover:border-sun-400'
                    }`}
                  >
                    <span className="block font-bold text-slate-900">{name(d)}</span>
                    <span className="block text-xs text-slate-500">
                      {(lang === 'ar' ? d.country : d.countryEn) || '\u00a0'}
                    </span>
                    {audio > 0 && <span className="mt-1 block text-[10px] text-brand-600">{t('audioCount', { n: audio })}</span>}
                    {isSelected && (
                      <span className="absolute top-2 end-2 rounded-full bg-brand-600 p-0.5 text-white" title={t('selected')}>
                        <Check className="h-3.5 w-3.5" aria-hidden />
                      </span>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}
