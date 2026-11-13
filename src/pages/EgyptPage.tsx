import { BookMarked, ChevronLeft } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import EgyptMap from '../components/EgyptMap'
import { EgyptNodeCard, KindBadge } from '../components/EgyptBits'
import { useBi } from '../lib/useBi'
import { egyptContrasts, egyptRegionColors, egyptRegions, egyptSources, getEgyptNode, pointsFor } from '../lib/egypt'
import { useT } from '../lib/i18n'
import { usePageMeta } from '../lib/meta'

export default function EgyptPage() {
  const t = useT()
  const { bi, nodeName } = useBi()
  const [active, setActive] = useState<string | undefined>(undefined)
  const sel = getEgyptNode(active)
  usePageMeta(t('egyptTitle'), t('egyptBody'))

  return (
    <div className="space-y-6">
      <section className="pattern-stars relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-800 via-brand-900 to-brand-950 p-5 text-white shadow-lg">
        <div aria-hidden className="absolute -top-20 -end-16 h-52 w-52 rounded-full bg-sun-400/15 blur-2xl" />
        <p className="relative text-xs font-semibold text-sun-300">{t('egyptKicker')}</p>
        <h1 className="relative mt-1 text-2xl font-bold">
          <span className="gold-text">{t('egyptTitle')}</span>
        </h1>
        <p className="relative mt-2 text-sm leading-relaxed text-cream-100">{t('egyptBody')}</p>
      </section>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 pt-4">
          <h2 className="text-lg font-bold">{t('egyptMapTitle')}</h2>
          <div className="flex items-center gap-3 text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-4 rounded-sm bg-brand-400" aria-hidden />
              {t('egyptArabic')}
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-4 rounded-sm border border-dashed border-violet-500 bg-violet-200" aria-hidden />
              {t('egyptLanguage')}
            </span>
          </div>
        </div>
        <p className="px-4 text-xs text-slate-500">{t('egyptMapHint')}</p>
        <div className="mx-auto max-w-sm px-3 py-2">
          <EgyptMap label={t('egyptMapTitle')} active={active} onSelect={setActive} points={sel ? pointsFor(sel) : []} />
        </div>
        {sel && (
          <div key={sel.id} className="animate-rise border-t border-slate-100 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: egyptRegionColors[sel.id] }} aria-hidden />
              <h3 className="font-bold">{nodeName(sel)}</h3>
              <KindBadge kind={sel.kind} />
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{bi(sel.summary)}</p>
            <Link to={`/egypt/${sel.id}`} className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-brand-700">
              {t('egyptOpen')}
              <ChevronLeft className="h-4 w-4 ltr:rotate-180" aria-hidden />
            </Link>
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-1 text-lg font-bold">{t('egyptRegions')}</h2>
        <p className="mb-3 text-xs leading-relaxed text-slate-500">{t('egyptMethod')}</p>
        <div className="stagger space-y-2.5">
          {egyptRegions.map((r) => (
            <EgyptNodeCard key={r.id} node={r} />
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-bold">{t('egyptWordsTitle')}</h2>
        <p className="mb-3 text-xs text-slate-500">{t('egyptWordsBody')}</p>
        <div className="space-y-3">
          {egyptContrasts.map((c) => (
            <div key={c.id} className="rounded-2xl bg-sand-50 p-3 ring-1 ring-slate-100">
              <p className="text-sm font-bold">
                <span dir="rtl" lang="ar">{c.label.ar}</span>
                <span className="ms-2 text-xs font-normal text-slate-500" dir="ltr">{c.label.en}</span>
              </p>
              <ul className="mt-2 grid grid-cols-2 gap-1.5">
                {c.forms.map((f) => {
                  const n = getEgyptNode(f.node)
                  return (
                    <li key={f.node} className="rounded-xl bg-white px-2.5 py-1.5">
                      <Link to={`/egypt/${f.node}`} className="block text-[11px] font-semibold text-slate-500">
                        {n ? nodeName(n) : f.node}
                      </Link>
                      <span dir="rtl" lang="ar" className="dialect-text block text-base font-bold text-slate-900">{f.text}</span>
                      <span dir="ltr" className="block text-[11px] text-slate-500">{f.ipa}</span>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <details className="rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm">
        <summary className="flex cursor-pointer items-center gap-2 font-bold">
          <BookMarked className="h-4 w-4 text-brand-700" aria-hidden />
          {t('egyptSources')}
        </summary>
        <ul className="mt-3 space-y-1.5 text-xs leading-relaxed text-slate-600" dir="ltr">
          {egyptSources.map((s) => (
            <li key={s.id}>{s.text}</li>
          ))}
        </ul>
      </details>
    </div>
  )
}
