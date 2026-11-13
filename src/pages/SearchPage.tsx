import { ChevronLeft, MapPinned } from 'lucide-react'
import { KindBadge } from '../components/EgyptBits'
import { getEgyptNode } from '../lib/egypt'
import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router'
import PlayButton from '../components/PlayButton'
import SearchBox from '../components/SearchBox'
import { dialectsByRegion, famousByConcept, getConcept, getDialect, STANDARD_ID } from '../lib/content'
import { useName, useT } from '../lib/i18n'
import { usePageMeta } from '../lib/meta'
import { hitTitle, search } from '../lib/search'
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
  if (hit.kind === 'egypt') return []
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
    <Link to={`/egypt/${n.id}`} className="lift flex items-center gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm hover:border-sun-400">
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
      <ChevronLeft className="h-4 w-4 shrink-0 text-slate-400 ltr:rotate-180" aria-hidden />
    </Link>
  )
}

function ResultCard({ hit }: { hit: SearchHit }) {
  const t = useT()
  const name = useName()
  const lang = useApp((s) => s.lang)
  const myDialectId = useApp((s) => s.myDialectId)
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
      <Link to={`/dialects/${r.dialect.id}`} className="w-24 shrink-0 truncate text-xs font-semibold text-slate-500 hover:text-brand-700">
        {name(r.dialect)}
      </Link>
      <Link to={r.href} dir="rtl" lang="ar" className={`dialect-text min-w-0 flex-1 text-[15px] ${strong ? 'font-bold text-brand-800' : 'font-semibold text-slate-900'}`}>
        {r.text}
      </Link>
      <PlayButton dialectId={r.dialect.id} phraseId={r.phraseId} size="sm" />
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
      </header>
      {mine && <ul className="mb-2">{line(mine, true)}</ul>}
      {groups.map(({ region, dialects }) => (
        <section key={region.id} className="mt-2">
          <h3 className="mb-1 text-[11px] font-bold tracking-wide text-sun-600">{name(region)}</h3>
          <ul className="space-y-0.5">{dialects.map((d) => line(byId.get(d.id)!))}</ul>
        </section>
      ))}
      {compareHref && (
        <Link to={compareHref} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-700">
          {t('searchCompare')}
          <ChevronLeft className="h-4 w-4 ltr:rotate-180" aria-hidden />
        </Link>
      )}
    </article>
  )
}

export default function SearchPage() {
  const t = useT()
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const hits = useMemo(() => search(q, 20), [q])
  usePageMeta(q ? `${q} – ${t('searchTitle')}` : t('searchTitle'), t('searchBody'))

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">{t('searchTitle')}</h1>
        <p className="text-xs text-slate-500">{t('searchBody')}</p>
      </div>
      <SearchBox key={q} initial={q} autoFocus={!q} onSubmit={(v) => setParams({ q: v })} />
      {q && (
        <p className="text-sm text-slate-600" aria-live="polite">
          {hits.length ? t('searchCount', { n: hits.length, q }) : t('searchNone', { q })}
        </p>
      )}
      <div className="space-y-3">
        {hits.map((h) => (h.kind === 'egypt' ? <EgyptResult key={h.key} hit={h} /> : <ResultCard key={h.key} hit={h} />))}
      </div>
    </div>
  )
}
