'use client'

import { BookA, ChevronLeft, MapPinned } from 'lucide-react'
import { KindBadge } from '../components/EgyptBits'
import { getEgyptNode } from '../lib/egypt'
import { useMemo } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import PlayButton from '../components/PlayButton'
import SearchBox from '../components/SearchBox'
import { dialectsByRegion, dialectsInGroup, famousByConcept, getConcept, getDialect, groupWords, STANDARD_ID } from '../lib/content'
import { useName, useT } from '../lib/i18n'
import { searchDictionary, useAllEntries } from '../lib/dictionary'
import type { DictHit } from '../lib/dictionary'
import { hitTitle, regionalMatchGroups, regionLabel, search } from '../lib/search'
import type { SearchHit } from '../lib/search'
import { useApp } from '../lib/store'
import type { Dialect } from '../lib/types'

interface Row {
  dialect: Dialect
  text: string
  phraseId: string
  href: string
}

function rowsFor(hit: SearchHit): Row[] {
  if (hit.kind === 'egypt' || hit.kind === 'region') return []
  if (hit.kind === 'phrase') {
    return Object.entries(hit.phrase.variants).flatMap(([id, v]) => {
      const d = id === STANDARD_ID ? undefined : getDialect(id)
      return d ? [{ dialect: d, text: v.text, phraseId: hit.phrase.id, href: `/compare?p=${encodeURIComponent(hit.phrase.id)}` }] : []
    })
  }
  if (hit.kind === 'concept') {
    return famousByConcept(hit.conceptId).flatMap(({ dialectId, phrase }) => {
      const d = getDialect(dialectId)
      return d ? [{ dialect: d, text: phrase.text, phraseId: phrase.id, href: `/dialects/${dialectId}` }] : []
    })
  }
  const d = getDialect(hit.dialectId)
  return d ? [{ dialect: d, text: hit.phrase.text, phraseId: hit.phrase.id, href: `/dialects/${d.id}` }] : []
}

/** One result: the meaning, then the same thing in every dialect, grouped by region, the visitor's dialect first. */
function EgyptResult({ hit }: { hit: Extract<SearchHit, { kind: 'egypt' }> }) {
  const t = useT()
  const lang = useApp((s) => s.lang)
  const n = hit.node
  const parent = getEgyptNode(n.parentId)
  return (
    <Link href={`/egypt/${n.id}`} className="lift flex items-center gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm hover:border-sun-400">
      <MapPinned className="h-5 w-5 shrink-0 text-sun-500" aria-hidden />
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="font-bold">{lang === 'ar' ? n.name : n.nameEn}</span>
          <KindBadge kind={n.kind} />
        </span>
        <span className="block text-xs text-slate-500">
          {t('egyptTitle')}
          {parent && ` · ${lang === 'ar' ? parent.name : parent.nameEn}`}
        </span>
      </span>
      <ChevronLeft className="h-4 w-4 shrink-0 text-slate-500 ltr:rotate-180" aria-hidden />
    </Link>
  )
}

function ResultCard({ hit }: { hit: SearchHit }) {
  const t = useT()
  const name = useName()
  const lang = useApp((s) => s.lang)
  const myDialectId = useApp((s) => s.myDialectId)
  const matchedRegions = regionalMatchGroups(hit)
  const rows = rowsFor(hit)
  const mine = rows.find((r) => r.dialect.id === myDialectId)
  const rest = rows.filter((r) => r !== mine)
  const groups = dialectsByRegion(rest.map((r) => r.dialect))
  const byId = new Map(rest.map((r) => [r.dialect.id, r]))
  const standard = hit.kind === 'phrase' ? hit.phrase.variants[STANDARD_ID]?.text : hit.kind === 'famous' ? hit.phrase.standard : undefined
  const english = hit.kind === 'phrase' ? hit.phrase.english : hit.kind === 'famous' ? hit.phrase.english : hit.kind === 'concept' ? getConcept(hit.conceptId)?.nameEn : undefined
  const compareHref = hit.kind === 'phrase' ? `/compare?p=${encodeURIComponent(hit.phrase.id)}` : hit.kind === 'concept' ? `/compare?c=${hit.conceptId}` : undefined

  const line = (r: Row, strong = false) => (
    <li key={r.dialect.id} className={`flex items-center gap-2 rounded-xl px-2.5 py-1.5 ${strong ? 'bg-brand-50 ring-1 ring-brand-200' : 'odd:bg-sand-50'}`}>
      <Link href={`/dialects/${r.dialect.id}`} className="w-24 shrink-0 truncate text-xs font-semibold text-slate-500 hover:text-brand-700">
        {name(r.dialect)}
      </Link>
      <Link href={r.href} dir="rtl" lang="ar" className={`dialect-text min-w-0 flex-1 text-[15px] ${strong ? 'font-bold text-brand-800' : 'font-semibold text-slate-900'}`}>
        {r.text}
      </Link>
      <PlayButton dialectId={r.dialect.id} phraseId={r.phraseId} text={r.text} size="sm" />
    </li>
  )

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <header className="mb-2">
        <h2 className="text-base font-bold text-slate-900">{hitTitle(hit, lang)}</h2>
        <p className="text-xs text-slate-500">
          {english && <span dir="ltr">{english}</span>}
          {standard && lang === 'en' && <span dir="rtl" lang="ar" className="ms-2">{standard}</span>}
        </p>
        {matchedRegions.length > 0 && (
          <p className="mt-2 rounded-xl bg-brand-50 px-2.5 py-2 text-xs text-brand-800">
            <bdi dir="rtl" lang="ar" className="dialect-text font-bold">{hit.matched}</bdi>
            <span className="ms-2">{matchedRegions.map((g) => regionLabel(g, lang)).join(' · ')}</span>
          </p>
        )}
      </header>
      {mine && <ul className="mb-2">{line(mine, true)}</ul>}
      {groups.map(({ region, dialects }) => (
        <section key={region.id} className="mt-2">
          <h3 className="mb-1 text-[11px] font-bold tracking-wide text-amber-700">{name(region)}</h3>
          <ul className="space-y-0.5">{dialects.map((d) => line(byId.get(d.id)!))}</ul>
        </section>
      ))}
      <div className="mt-3 flex flex-wrap items-center gap-4">
        {compareHref && (
          <Link href={compareHref} className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700">
            {t('searchCompare')}
            <ChevronLeft className="h-4 w-4 ltr:rotate-180" aria-hidden />
          </Link>
        )}
        {hit.kind === 'concept' && (
          <Link href={`/concepts/${hit.conceptId}/`} className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700">
            {t('conceptOpen')}
            <ChevronLeft className="h-4 w-4 ltr:rotate-180" aria-hidden />
          </Link>
        )}
      </div>
    </article>
  )
}

/** A macro-region: its name and a taste of what's on its hub page. */
function RegionResult({ hit }: { hit: Extract<SearchHit, { kind: 'region' }> }) {
  const t = useT()
  const lang = useApp((s) => s.lang)
  const dialects = dialectsInGroup(hit.group)
  const words = groupWords(hit.group)
  return (
    <Link href={`/regions/${hit.group}/`} className="lift flex items-center gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm hover:border-sun-400">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 ring-1 ring-brand-100">
        <MapPinned className="h-5 w-5" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span dir={lang === 'ar' ? 'rtl' : 'ltr'} className="dialect-text block truncate text-base font-bold text-slate-900">{regionLabel(hit.group, lang)}</span>
        <span className="text-xs text-slate-500">
          {t('regionDialectCount', { n: dialects.length })} · {t('regionWordCount', { n: words.length })}
        </span>
      </span>
      <ChevronLeft className="h-4 w-4 shrink-0 text-slate-500 ltr:rotate-180" aria-hidden />
    </Link>
  )
}

/** A dictionary word: Standard Arabic, English and a few dialects, the visitor's first. */
function DictResult({ hit }: { hit: DictHit }) {
  const t = useT()
  const name = useName()
  const myDialectId = useApp((s) => s.myDialectId)
  const e = hit.entry
  const order = dialectsByRegion().flatMap((g) => g.dialects.map((d) => d.id))
  const ids = order.filter((id) => id !== STANDARD_ID && e.words[id])
  const first = [...(myDialectId && e.words[myDialectId] ? [myDialectId] : []), ...(hit.dialectId && hit.dialectId !== myDialectId ? [hit.dialectId] : [])]
  const shown = [...first, ...ids.filter((id) => !first.includes(id))].slice(0, 5)
  return (
    <Link href={`/word/${e.id}`} className="lift block rounded-3xl border border-slate-200 bg-white p-4 shadow-sm hover:border-sun-400">
      <span className="flex items-center gap-2 text-[11px] font-bold text-sun-600">
        <BookA className="h-3.5 w-3.5" aria-hidden />
        {t('dictFromDictionary')}
      </span>
      <span dir="rtl" lang="ar" className="dialect-text mt-1 block text-lg font-bold text-slate-900">
        {e.fs}
      </span>
      <span dir="ltr" lang="en" className="block text-xs text-slate-500">
        {e.en}
      </span>
      <span className="mt-2 block space-y-0.5 text-sm">
        {shown.map((id) => {
          const d = getDialect(id)
          return (
            <span key={id} className="flex gap-2">
              <span className="w-24 shrink-0 text-xs leading-6 text-slate-500">{d ? name(d) : id}</span>
              <span dir="rtl" lang="ar" className="dialect-text font-semibold text-slate-800">
                {e.words[id]}
              </span>
            </span>
          )
        })}
      </span>
      <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-brand-700">
        {t('dictWordInAll')}
        <ChevronLeft className="h-4 w-4 ltr:rotate-180" aria-hidden />
      </span>
    </Link>
  )
}

export default function SearchPage() {
  const t = useT()
  const router = useRouter()
  const params = useSearchParams() ?? new URLSearchParams()
  const q = params.get('q') ?? ''
  const hits = useMemo(() => search(q, 20), [q])
  const entries = useAllEntries(!!q.trim())
  const dictHits = useMemo(() => (entries && q.trim() ? searchDictionary(entries, q, 8) : []), [entries, q])

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">{t('searchTitle')}</h1>
        <p className="text-xs text-slate-500">{t('searchBody')}</p>
      </div>
      <SearchBox key={q} initial={q} autoFocus={!q} onSubmit={(v) => router.push(`/search?q=${encodeURIComponent(v)}`)} />
      {q && (
        <p className="text-sm text-slate-600" aria-live="polite">
          {hits.length + dictHits.length ? t('searchCount', { n: hits.length + dictHits.length, q }) : entries ? t('searchNone', { q }) : t('dictLoading')}
        </p>
      )}
      <div className="space-y-3">
        {hits.map((h) => (h.kind === 'egypt' ? <EgyptResult key={h.key} hit={h} /> : h.kind === 'region' ? <RegionResult key={h.key} hit={h} /> : <ResultCard key={h.key} hit={h} />))}
      </div>
      {dictHits.length > 0 && (
        <section className="space-y-3">
          <h2 className="flex items-center gap-1.5 text-lg font-bold">
            <BookA className="h-5 w-5 text-sun-500" aria-hidden />
            {t('dictTitle')}
          </h2>
          {dictHits.map((h) => (
            <DictResult key={h.entry.id} hit={h} />
          ))}
        </section>
      )}
    </div>
  )
}
