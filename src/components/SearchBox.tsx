'use client'

import { Search, X } from 'lucide-react'
import { useDeferredValue, useId, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getDialect } from '../lib/content'
import { useName, useT } from '../lib/i18n'
import { hitTitle, search } from '../lib/search'
import { movePickerIndex } from '../lib/pickerNavigation'
import { useApp } from '../lib/store'


/** A search field with live suggestions. Enter opens the full results. */
export default function SearchBox({ initial = '', autoFocus = false, onSubmit }: { initial?: string; autoFocus?: boolean; onSubmit?: (q: string) => void }) {
  const t = useT()
  const name = useName()
  const lang = useApp((s) => s.lang)
  const router = useRouter()
  const [q, setQ] = useState(initial)
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const deferred = useDeferredValue(q)
  const suggestions = useMemo(() => {
    if (!open) return []
    const seen = new Set<string>()
    return search(deferred, 12)
      .filter((h) => !seen.has(h.matched) && !!seen.add(h.matched))
      .slice(0, 6)
  }, [deferred, open])
  const listId = useId()

  const go = (value: string) => {
    const v = value.trim()
    if (!v) return
    setOpen(false)
    setActiveIndex(-1)
    if (onSubmit) onSubmit(v)
    else router.push(`/search?q=${encodeURIComponent(v)}`)
  }

  return (
    <form
      role="search"
      className="relative"
      onSubmit={(e) => {
        e.preventDefault()
        go(open && suggestions[activeIndex] ? suggestions[activeIndex].matched : q)
      }}
    >
      <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3.5 py-3 shadow-sm ring-sun-400/40 focus-within:border-sun-400 focus-within:ring-4">
        <Search className="h-5 w-5 shrink-0 text-brand-700" aria-hidden />
        <span className="sr-only">{t('searchLabel')}</span>
        <input
          type="search"
          value={q}
          autoFocus={autoFocus}
          onChange={(e) => {
            setQ(e.target.value)
            setActiveIndex(-1)
            setOpen(true)
          }}
          onFocus={() => { setActiveIndex(-1); setOpen(true) }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.preventDefault()
              setOpen(false)
              setActiveIndex(-1)
            } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
              e.preventDefault()
              const seen = new Set<string>()
              const hits = search(q, 12).filter((h) => !seen.has(h.matched) && !!seen.add(h.matched)).slice(0, 6)
              const next = movePickerIndex(open ? activeIndex : -1, e.key === 'ArrowDown' ? 1 : -1, hits.length)
              setOpen(true)
              setActiveIndex(next)
              if (next >= 0) requestAnimationFrame(() => document.getElementById(`${listId}-option-${hits[next].key}`)?.scrollIntoView({ block: 'nearest' }))
            }
          }}
          onBlur={() => window.setTimeout(() => setOpen(false), 150)}
          placeholder={t('searchPlaceholder')}
          enterKeyHint="search"
          autoComplete="off"
          role="combobox"
          aria-autocomplete="list"
          aria-activedescendant={open && suggestions[activeIndex] ? `${listId}-option-${suggestions[activeIndex].key}` : undefined}
          aria-controls={listId}
          aria-expanded={open && suggestions.length > 0}
          className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-slate-500 [&::-webkit-search-cancel-button]:hidden"
        />
        {q && (
          <button type="button" onClick={() => { setQ(''); setActiveIndex(-1) }} aria-label={t('searchClear')} className="rounded-full p-1 text-slate-500 hover:bg-slate-100">
            <X className="h-4 w-4" aria-hidden />
          </button>
        )}
      </label>
      {open && suggestions.length > 0 && (
        <ul id={listId} role="listbox" className="animate-rise absolute inset-x-0 top-full z-30 mt-1.5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
          {suggestions.map((h, index) => {
            const d = getDialect(h.dialectId)
            return (
              <li key={h.key} id={`${listId}-option-${h.key}`} role="option" aria-selected={index === activeIndex}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => go(h.matched)}
                  className={`flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-start hover:bg-sand-50 ${index === activeIndex ? 'bg-sand-100 ring-2 ring-inset ring-brand-600' : ''}`}
                >
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-slate-900">{h.matched}</span>
                    <span className="block truncate text-xs text-slate-500">{hitTitle(h, lang)}</span>
                  </span>
                  {d && <span className="shrink-0 rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700">{name(d)}</span>}
                </button>
              </li>
            )
          })}
          <li>
            <button type="button" onClick={() => go(q)} className="w-full border-t border-slate-100 px-3.5 py-2.5 text-start text-sm font-semibold text-brand-700 hover:bg-sand-50">
              {t('searchAll', { q })}
            </button>
          </li>
        </ul>
      )}
    </form>
  )
}
