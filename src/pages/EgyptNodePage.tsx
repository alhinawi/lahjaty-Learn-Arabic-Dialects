import { BookMarked, ChevronLeft, MapPin } from 'lucide-react'
import { Link, useParams } from 'react-router'
import EgyptMap from '../components/EgyptMap'
import { EgyptNodeCard, KindBadge } from '../components/EgyptBits'
import { useBi } from '../lib/useBi'
import FamousCard from '../components/FamousCard'
import PhraseCard from '../components/PhraseCard'
import { categories, famousFor, getDialect, phrases } from '../lib/content'
import {
  contrastsFor,
  egyptAncestors,
  egyptChildren,
  egyptRegionColors,
  exampleDialectFor,
  formFor,
  getEgyptNode,
  pointsFor,
  sourcesFor,
} from '../lib/egypt'
import { useName, useT } from '../lib/i18n'
import { usePageMeta } from '../lib/meta'

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
    <h2 className="mb-2 text-base font-bold">{title}</h2>
    {children}
  </section>
)

export default function EgyptNodePage() {
  const { nodeId } = useParams()
  const t = useT()
  const name = useName()
  const { bi, list, nodeName, lang } = useBi()
  const node = getEgyptNode(nodeId)
  usePageMeta(node ? `${node.name} – ${node.nameEn}` : t('egyptTitle'), node?.summary?.ar ?? t('egyptBody'))

  if (!node) {
    return (
      <div className="space-y-3 text-center">
        <p className="text-slate-600">{t('notFound')}</p>
        <Link to="/egypt" className="font-semibold text-brand-700">{t('egyptTitle')}</Link>
      </div>
    )
  }

  const trail = egyptAncestors(node)
  const kids = egyptChildren(node)
  const color = egyptRegionColors[node.regionId]
  const ex = exampleDialectFor(node)
  const exDialect = getDialect(ex?.dialectId)
  const famous = exDialect ? famousFor(exDialect.id).slice(0, 8) : []
  const everyday = exDialect
    ? categories
        .map((c) => phrases.find((p) => p.category === c.id && p.variants[exDialect.id]))
        .filter((p) => !!p)
        .slice(0, 6)
    : []
  const cai = getDialect('cai')
  const vsCairo =
    exDialect && exDialect.id !== 'cai'
      ? phrases.filter((p) => p.variants[exDialect.id] && p.variants.cai && p.variants[exDialect.id].text !== p.variants.cai.text).slice(0, 6)
      : []
  const contrasts = contrastsFor(node).filter((c) => {
    const mine = formFor(c, node)
    const cairo = c.forms.find((f) => f.node === 'cairo')
    return mine && cairo && mine.text !== cairo.text
  })
  const sources = sourcesFor(node)
  const govs = list(node.governorates)

  return (
    <div className="space-y-4">
      <nav aria-label={t('egyptTitle')} className="flex flex-wrap items-center gap-1 text-xs text-slate-500">
        <Link to="/egypt" className="font-semibold text-brand-700">{t('egyptTitle')}</Link>
        {trail.map((a) => (
          <span key={a.id} className="flex items-center gap-1">
            <ChevronLeft className="h-3 w-3 ltr:rotate-180" aria-hidden />
            <Link to={`/egypt/${a.id}`} className="font-semibold text-brand-700">{nodeName(a)}</Link>
          </span>
        ))}
      </nav>

      <section className="pattern-stars relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-800 via-brand-900 to-brand-950 p-5 text-white shadow-lg">
        <div aria-hidden className="absolute inset-y-0 start-0 w-1.5" style={{ backgroundColor: color }} />
        <div className="flex flex-wrap items-center gap-2">
          <KindBadge kind={node.kind} />
          <span className="text-[11px] text-cream-200">{t(node.level === 'region' ? 'egyptLevelRegion' : node.kind === 'language' ? 'egyptLevelLanguage' : node.level === 'variety' ? 'egyptLevelVariety' : 'egyptLevelSub')}</span>
        </div>
        <h1 className="mt-2 text-2xl font-bold">{nodeName(node)}</h1>
        <p className="text-sm text-sun-300" dir={lang === 'ar' ? 'ltr' : 'rtl'}>{lang === 'ar' ? node.nameEn : node.name}</p>
        {node.family && <p className="mt-1 text-xs text-cream-100">{bi(node.family)}</p>}
        {node.summary && <p className="mt-3 text-sm leading-relaxed text-brand-50/90">{bi(node.summary)}</p>}
      </section>

      <Section title={t('egyptRange')}>
        <div className="mx-auto max-w-xs">
          <EgyptMap label={t('egyptRange')} active={node.regionId} points={pointsFor(node)} />
        </div>
        {node.area && (
          <p className="mt-2 flex items-start gap-1.5 text-sm text-slate-700">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
            {bi(node.area)}
          </p>
        )}
        {govs.length > 0 && (
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {govs.map((g) => (
              <li key={g} className="rounded-full bg-sand-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{g}</li>
            ))}
          </ul>
        )}
      </Section>

      {node.history && (
        <Section title={t('egyptHistory')}>
          <p className="text-sm leading-relaxed text-slate-700">{bi(node.history)}</p>
        </Section>
      )}

      {node.features && node.features.length > 0 && (
        <Section title={t('egyptFeatures')}>
          <ul className="space-y-2">
            {node.features.map((f) => (
              <li key={f.en} className="flex gap-2 text-sm leading-relaxed text-slate-700">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sun-500" aria-hidden />
                {bi(f)}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {(contrasts.length > 0 || vsCairo.length > 0) && node.id !== 'cai' && node.regionId !== 'cairo' && (
        <Section title={t('egyptVsCairo')}>
          {contrasts.length > 0 && (
            <ul className="space-y-1.5">
              {contrasts.map((c) => {
                const mine = formFor(c, node)
                const cairo = c.forms.find((f) => f.node === 'cairo')
                if (!mine || !cairo) return null
                return (
                  <li key={c.id} className="grid grid-cols-3 items-center gap-2 rounded-xl bg-sand-50 px-3 py-2 text-sm">
                    <span className="text-xs text-slate-500">{bi(c.label)}</span>
                    <span className="text-center">
                      <span className="block text-[10px] text-slate-500">{cai ? name(cai) : ''}</span>
                      <span dir="rtl" lang="ar" className="dialect-text font-bold">{cairo.text}</span>
                    </span>
                    <span className="text-center">
                      <span className="block text-[10px] text-slate-500">{nodeName(node)}</span>
                      <span dir="rtl" lang="ar" className="dialect-text font-bold text-brand-700">{mine.text}</span>
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
          {vsCairo.length > 0 && exDialect && cai && (
            <ul className="mt-3 space-y-1.5">
              {vsCairo.map((p) => (
                <li key={p.id} className="rounded-xl border border-slate-100 px-3 py-2">
                  <p className="text-[11px] text-slate-500" dir="ltr">{p.english}</p>
                  <p className="mt-0.5 flex flex-wrap items-baseline gap-x-2 text-sm">
                    <span className="text-[11px] text-slate-500">{name(cai)}</span>
                    <span dir="rtl" lang="ar" className="dialect-text font-semibold">{p.variants.cai.text}</span>
                  </p>
                  <p className="flex flex-wrap items-baseline gap-x-2 text-sm">
                    <span className="text-[11px] text-slate-500">{name(exDialect)}</span>
                    <span dir="rtl" lang="ar" className="dialect-text font-bold text-brand-700">{p.variants[exDialect.id].text}</span>
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Section>
      )}

      {exDialect && famous.length > 0 && (
        <Section title={t('egyptFamous')}>
          {ex?.inherited && <p className="mb-2 text-xs text-slate-500">{t('egyptFromDialect', { dialect: name(exDialect) })}</p>}
          <div className="space-y-2.5">
            {famous.map((f) => (
              <FamousCard key={f.id} phrase={f} dialectId={exDialect.id} />
            ))}
          </div>
        </Section>
      )}

      {exDialect && everyday.length > 0 && (
        <Section title={t('egyptEveryday')}>
          {ex?.inherited && <p className="mb-2 text-xs text-slate-500">{t('egyptFromDialect', { dialect: name(exDialect) })}</p>}
          <div className="space-y-2.5">
            {everyday.map((p) => (
              <PhraseCard key={p.id} phrase={p} dialectId={exDialect.id} />
            ))}
          </div>
          <Link to={`/dialects/${exDialect.id}`} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-700">
            {t('egyptMoreIn', { dialect: name(exDialect) })}
            <ChevronLeft className="h-4 w-4 ltr:rotate-180" aria-hidden />
          </Link>
        </Section>
      )}

      {kids.length > 0 && (
        <section>
          <h2 className="mb-2 text-base font-bold">{t(node.level === 'region' ? 'egyptChildVarieties' : 'egyptChildSubs')}</h2>
          <div className="stagger space-y-2.5">
            {kids.map((k) => (
              <EgyptNodeCard key={k.id} node={k} />
            ))}
          </div>
        </section>
      )}

      {node.seeAlso && node.seeAlso.length > 0 && (
        <section>
          <h2 className="mb-2 text-base font-bold">{t('egyptSeeAlso')}</h2>
          <div className="space-y-2.5">
            {node.seeAlso.map((id) => getEgyptNode(id)).filter((n) => !!n).map((n) => <EgyptNodeCard key={n.id} node={n} />)}
          </div>
        </section>
      )}

      {sources.length > 0 && (
        <details className="rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm">
          <summary className="flex cursor-pointer items-center gap-2 font-bold">
            <BookMarked className="h-4 w-4 text-brand-700" aria-hidden />
            {t('egyptSources')}
          </summary>
          <ul className="mt-3 space-y-1.5 text-xs leading-relaxed text-slate-600" dir="ltr">
            {sources.map((s) => (
              <li key={s.id}>{s.text}</li>
            ))}
          </ul>
        </details>
      )}
    </div>
  )
}
