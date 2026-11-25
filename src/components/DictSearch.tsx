'use client'

import DictionaryLoadError from './DictionaryLoadError'

import { Search, X } from 'lucide-react'
import { useId, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { isComposingKey } from '../lib/composition'
import { movePickerIndex } from '../lib/pickerNavigation'
import { getDialect } from '../lib/content'
import { searchDictionary, useAllEntries } from '../lib/dictionary'
import { useName, useT } from '../lib/i18n'

/** A search box over every dictionary topic; each result opens the word in every dialect. */
export default function DictSearch() {
  const t = useT()
  const name = useName()
  const router = useRouter()
  const composing = useRef(false)
  const listId = useId()
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [q, setQ] = useState('')
  const [touched, setTouched] = useState(false)
  const { entries, failed, retry } = useAllEntries(touched)
  const hits = useMemo(() => (entries && q.trim() ? searchDictionary(entries, q, 10) : []), [entries, q])

  return (
    <div className="space-y-2">
      <label className="relative block">
        <span className="sr-only">{t('dictSearchLabel')}</span>
        <Search className="pointer-events-none absolute start-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden />
        <input
          type="search"
          value={q}
          onFocus={() => { setTouched(true); setOpen(true); setActiveIndex(-1) }}
          onBlur={() => { composing.current = false; window.setTimeout(() => setOpen(false), 150) }}
          onCompositionStart={() => { composing.current = true }}
          onCompositionEnd={() => { composing.current = false }}
          onKeyDown={(e) => {
            if (isComposingKey(e.nativeEvent, composing.current)) return
            if (e.key === 'Escape') {
              e.preventDefault()
              setOpen(false)
              setActiveIndex(-1)
            } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
              e.preventDefault()
              const next = movePickerIndex(open ? activeIndex : -1, e.key === 'ArrowDown' ? 1 : -1, hits.length)
              setOpen(true)
              setActiveIndex(next)
              if (next >= 0) requestAnimationFrame(() => document.getElementById(`${listId}-${hits[next].entry.id}`)?.scrollIntoView({ block: 'nearest' }))
            } else if (e.key === 'Enter' && open && hits[activeIndex]) {
              e.preventDefault()
              setOpen(false)
              router.push(`/word/${hits[activeIndex].entry.id}`)
            }
          }}
          role="combobox"
          aria-autocomplete="list"
          aria-controls={listId}
          aria-expanded={open && hits.length > 0}
          aria-activedescendant={open && hits[activeIndex] ? `${listId}-${hits[activeIndex].entry.id}` : undefined}
          autoComplete="off"
          onChange={(e) => {
            setTouched(true)
            setQ(e.target.value)
            setOpen(true)
            setActiveIndex(-1)
          }}
          placeholder={t('dictSearchPlaceholder')}
          className="w-full rounded-2xl border border-slate-200 bg-white py-3 ps-10 pe-10 text-base shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 [&::-webkit-search-cancel-button]:hidden"
        />
        {q && (
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => { setQ(''); setActiveIndex(-1) }}
            aria-label={t('searchClear')}
            className="absolute end-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        )}
      </label>
      {q.trim() && failed && <DictionaryLoadError onRetry={retry} />}
      {q.trim() && !failed && entries === null && <p className="px-1 text-sm text-slate-500">{t('dictLoading')}</p>}
      {q.trim() && entries && hits.length === 0 && <p className="px-1 text-sm text-slate-500">{t('dictNotFound')}</p>}
      {open && hits.length > 0 && (
        <ul id={listId} role="listbox" className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {hits.map((h, index) => {
            const d = h.dialectId ? getDialect(h.dialectId) : undefined
            return (
              <li key={h.entry.id} id={`${listId}-${h.entry.id}`} role="option" aria-selected={index === activeIndex}>
                <Link href={`/word/${h.entry.id}`} onMouseDown={(e) => e.preventDefault()} className={`flex items-center gap-3 px-4 py-3 hover:bg-brand-50 ${index === activeIndex ? 'bg-sand-100 ring-2 ring-inset ring-brand-600' : ''}`}>
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
