import { Search, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { getDialect } from '../lib/content'
import { searchDictionary, useAllEntries } from '../lib/dictionary'
import { useName, useT } from '../lib/i18n'

/** A search box over every dictionary topic; each result opens the word in every dialect. */
export default function DictSearch() {
  const t = useT()
  const name = useName()
  const [q, setQ] = useState('')
  const [touched, setTouched] = useState(false)
  const entries = useAllEntries(touched)
  const hits = useMemo(() => (entries && q.trim() ? searchDictionary(entries, q, 10) : []), [entries, q])

  return (
    <div className="space-y-2">
      <label className="relative block">
        <span className="sr-only">{t('dictSearchLabel')}</span>
        <Search className="pointer-events-none absolute start-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden />
        <input
          type="search"
          value={q}
          onFocus={() => setTouched(true)}
          onChange={(e) => {
            setTouched(true)
            setQ(e.target.value)
          }}
          placeholder={t('dictSearchPlaceholder')}
          className="w-full rounded-2xl border border-slate-200 bg-white py-3 ps-10 pe-10 text-base shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
        />
        {q && (
          <button
            type="button"
            onClick={() => setQ('')}
            aria-label="×"
            className="absolute end-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        )}
      </label>
      {q.trim() && entries === null && <p className="px-1 text-sm text-slate-500">{t('dictLoading')}</p>}
      {q.trim() && entries && hits.length === 0 && <p className="px-1 text-sm text-slate-500">{t('dictNotFound')}</p>}
      {hits.length > 0 && (
        <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {hits.map((h) => {
            const d = h.dialectId ? getDialect(h.dialectId) : undefined
            return (
              <li key={h.entry.id}>
                <Link to={`/word/${h.entry.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-brand-50">
                  <span className="min-w-0 flex-1">
                    <span dir="rtl" lang="ar" className="dialect-text block font-bold text-slate-900">
                      {h.entry.fs}
                      {h.matched && h.matched !== h.entry.fs && h.matched !== h.entry.en && (
                        <span className="font-normal text-slate-500"> · {h.matched}</span>
                      )}
                    </span>
                    <span dir="ltr" lang="en" className="block truncate text-xs text-slate-500">
                      {h.entry.en}
                    </span>
                  </span>
                  {d && <span className="shrink-0 rounded-full bg-sand-50 px-2 py-0.5 text-xs text-slate-600">{name(d)}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
