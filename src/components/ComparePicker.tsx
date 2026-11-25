'use client'

import { Search, X } from 'lucide-react'
import { useDeferredValue, useId, useMemo, useRef, useState } from 'react'
import { getConcept, getDialect } from '../lib/content'
import { useName, useT } from '../lib/i18n'
import { comparableHits } from '../lib/search'
import { isComposingKey } from '../lib/composition'
import { movePickerIndex } from '../lib/pickerNavigation'
import type { ComparableHit } from '../lib/search'
import { useApp } from '../lib/store'

/**
 * The search box at the top of the comparison page. It looks through every dialect, Standard Arabic and
 * English (same matching as the global search) and offers only things that can be compared: everyday
 * phrases on the first tab, shared meanings of famous phrases on the second.
 */
export default function ComparePicker({
  kind,
  current,
  onPick,
}: {
  kind: 'phrase' | 'concept'
  current: string
  onPick: (id: string) => void
}) {
  const t = useT()
  const name = useName()
  const lang = useApp((s) => s.lang)
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const deferred = useDeferredValue(q)
  const composing = useRef(false)
  const listId = useId()
  const suggestions = useMemo(() => (open && deferred.trim() ? comparableHits(deferred, kind, 8) : []), [deferred, kind, open])

  const pick = (h: ComparableHit) => {
    onPick(h.id)
    setQ('')
    setActiveIndex(-1)
    setOpen(false)
  }

  const titleOf = (h: ComparableHit) => {
    if (h.kind === 'phrase') return lang === 'ar' ? `${h.standard} · ${h.english}` : h.english
    const c = getConcept(h.id)!
    return lang === 'ar' ? `${c.name} · ${c.nameEn}` : c.nameEn
  }

  return (
    <form
      role="search"
      className="relative"
      onSubmit={(e) => {
        e.preventDefault()
        if (composing.current) return
        const active = open && activeIndex >= 0 ? suggestions[activeIndex] : undefined
        const chosen = active ?? comparableHits(q, kind, 1)[0]
        if (chosen) pick(chosen)
      }}
    >
      <span className="mb-1 block text-xs font-semibold text-slate-600">{t('compareSearchLabel')}</span>
      <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3.5 py-3 shadow-sm ring-sun-400/40 focus-within:border-sun-400 focus-within:ring-4">
        <Search className="h-5 w-5 shrink-0 text-brand-700" aria-hidden />
        <span className="sr-only">{t('compareSearchLabel')}</span>
        <input
          type="search"
          value={q}
          onChange={(e) => {
            setQ(e.target.value)
            setActiveIndex(-1)
            setOpen(true)
          }}
          onFocus={() => { setActiveIndex(-1); setOpen(true) }}
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
              const hits = comparableHits(q, kind, 8)
              const next = movePickerIndex(open ? activeIndex : -1, e.key === 'ArrowDown' ? 1 : -1, hits.length)
              setOpen(true)
              setActiveIndex(next)
              if (next >= 0) requestAnimationFrame(() => document.getElementById(`${listId}-option-${hits[next].id}`)?.scrollIntoView({ block: 'nearest' }))
            }
          }}
          onBlur={() => { composing.current = false; window.setTimeout(() => setOpen(false), 150) }}
          placeholder={t('compareSearchPlaceholder')}
          enterKeyHint="search"
          autoComplete="off"
          role="combobox"
          aria-autocomplete="list"
          aria-activedescendant={open && suggestions[activeIndex] ? `${listId}-option-${suggestions[activeIndex].id}` : undefined}
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
      {open && q.trim() !== '' && (
        <ul id={listId} role="listbox" className="animate-rise absolute inset-x-0 top-full z-30 mt-1.5 max-h-80 overflow-auto rounded-2xl border border-slate-200 bg-white shadow-lg">
          {suggestions.length === 0 && <li className="px-3.5 py-3 text-sm text-slate-500">{t('noResults')}</li>}
          {suggestions.map((h, index) => {
            const d = getDialect(h.dialectId)
            return (
              <li key={h.id} id={`${listId}-option-${h.id}`} role="option" aria-selected={activeIndex >= 0 ? index === activeIndex : h.id === current}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pick(h)}
                  className={`flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-start hover:bg-sand-50 ${index === activeIndex ? 'bg-sand-100 ring-2 ring-inset ring-brand-600' : ''}`}
                >
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-slate-900">{h.matched}</span>
                    <span className="block truncate text-xs text-slate-500">{titleOf(h)}</span>
                  </span>
                  {d && <span className="shrink-0 rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700">{name(d)}</span>}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </form>
  )
}
