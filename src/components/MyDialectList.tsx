'use client'

import { Check, Search } from 'lucide-react'
import { useState } from 'react'
import { dialects, dialectsByRegion, searchDialects, STANDARD_ID } from '../lib/content'
import { useName, useT } from '../lib/i18n'
import { useApp } from '../lib/store'

/**
 * Searchable list of dialects. By default it picks the visitor's own dialect in the store;
 * pass value and onChange to pick something else (the welcome steps keep their answers locally).
 */
export default function MyDialectList({
  onPick,
  value,
  onChange,
}: {
  onPick?: () => void
  value?: string | null
  onChange?: (id: string) => void
}) {
  const t = useT()
  const name = useName()
  const stored = useApp((s) => s.myDialectId)
  const storeSet = useApp((s) => s.setMyDialect)
  const selected = value !== undefined ? value : stored
  const setMyDialect = onChange ?? storeSet
  const [query, setQuery] = useState('')
  const groups = dialectsByRegion(searchDialects(query, dialects.filter((d) => d.id !== STANDARD_ID)))

  return (
    <div className="space-y-3">
      <label className="relative block">
        <Search className="pointer-events-none absolute top-1/2 start-3 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('searchDialects')}
          aria-label={t('searchDialects')}
          className="w-full rounded-full border border-slate-200 bg-white py-2 ps-9 pe-3 text-sm outline-none focus:border-brand-500"
        />
      </label>
      {groups.length === 0 && <p className="py-4 text-center text-sm text-slate-500">{t('noResults')}</p>}
      {groups.map(({ region, dialects: list }) => (
        <section key={region.id}>
          <h3 className="mb-1.5 text-xs font-bold text-slate-500">{name(region)}</h3>
          <div className="flex flex-wrap gap-1.5">
            {list.map((d) => {
              const on = d.id === selected
              return (
                <button
                  key={d.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => {
                    setMyDialect(d.id)
                    onPick?.()
                  }}
                  className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold ${
                    on ? 'bg-brand-600 text-white' : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:ring-brand-500'
                  }`}
                >
                  {on && <Check className="h-3.5 w-3.5" aria-hidden />}
                  {name(d)}
                </button>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
