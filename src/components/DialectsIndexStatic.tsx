import { Search } from 'lucide-react'
import Link from 'next/link'
import { audioCount, dialects, dialectsByRegion, regions } from '../lib/content'
import { MAP_H, MAP_W, project, regionColors, regionLabels, regionShapes, regionShort, toPath } from '../lib/geo'
import { translate } from '../lib/i18n'
import { GROUP_KEY, REGION_HUBS } from '../lib/regionsMeta'
import type { RegionId } from '../lib/types'

const t = (key: Parameters<typeof translate>[1], vars?: Record<string, string | number>) => translate('ar', key, vars)
const mapped = regions.filter((r) => regionShapes[r.id])
const shapePaths = Object.fromEntries(mapped.map((r) => [r.id, toPath(regionShapes[r.id]!)])) as Record<RegionId, string>

/**
 * The /dialects index as static HTML: what crawlers and no-JS visitors get, and the Suspense
 * fallback while the interactive page hydrates. Mirrors DialectsPage's default state (Arabic,
 * nothing selected, no search query) with links instead of selection buttons.
 */
export default function DialectsIndexStatic() {
  const groups = dialectsByRegion()
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">{t('chooseDialect')}</h1>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm" aria-hidden>
        <div className="relative mt-2 bg-gradient-to-b from-sand-100 to-transparent px-2 pb-2">
          <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} className="block h-auto w-full">
            <defs>
              <pattern id="sea-static" width="8" height="8" patternUnits="userSpaceOnUse">
                <path d="M0 4h8" stroke="currentColor" strokeOpacity=".08" strokeWidth=".6" />
              </pattern>
            </defs>
            <rect width={MAP_W} height={MAP_H} fill="url(#sea-static)" className="text-brand-700" />
            {mapped.map((r) => (
              <path
                key={r.id}
                d={shapePaths[r.id]}
                fill={regionColors[r.id]}
                fillOpacity={0.28}
                stroke={regionColors[r.id]}
                strokeWidth={0.8}
                strokeLinejoin="round"
              />
            ))}
            {dialects.map((d) => {
              if (d.lat === undefined || d.lon === undefined) return null
              const [x, y] = project([d.lon, d.lat])
              return <circle key={d.id} cx={x} cy={y} r={1.6} fill="#ffffff" fillOpacity={0.75} stroke={regionColors[d.region]} strokeWidth={0.6} />
            })}
            {mapped.map((r) => {
              const at = regionLabels[r.id]
              if (!at) return null
              const [x, y] = project(at)
              return (
                <text key={r.id} x={x} y={y} textAnchor="middle" fontSize={7.5} fontWeight={700} fill="currentColor" className="pointer-events-none font-display text-slate-700">
                  {regionShort[r.id]?.[0] ?? r.name}
                </text>
              )
            })}
          </svg>
        </div>
      </section>

      <label className="relative block">
        <Search className="pointer-events-none absolute top-1/2 start-3 h-5 w-5 -translate-y-1/2 text-slate-500" aria-hidden />
        <input
          type="search"
          disabled
          placeholder={t('searchDialects')}
          aria-label={t('searchDialects')}
          className="w-full rounded-2xl border border-slate-200 bg-white py-3 ps-10 pe-3 shadow-sm outline-none focus:border-brand-500"
        />
      </label>

      {groups.map(({ region, dialects: ds }) => (
        <section key={region.id}>
          <h2 className="mb-2 flex items-baseline gap-2 text-sm font-bold text-slate-500">
            {(REGION_HUBS[region.id] ?? []).length === 1 ? (
              <Link href={`/regions/${REGION_HUBS[region.id]![0]}/`} className="underline-offset-2 hover:text-brand-700 hover:underline">
                {region.name}
              </Link>
            ) : (
              region.name
            )}
            {(REGION_HUBS[region.id] ?? []).length > 1 &&
              REGION_HUBS[region.id]!.map((g) => (
                <Link key={g} href={`/regions/${g}/`} className="text-xs font-semibold text-brand-700 underline-offset-2 hover:underline">
                  {t(GROUP_KEY[g])}
                </Link>
              ))}
          </h2>
          <ul className="grid grid-cols-2 gap-2">
            {ds.map((d) => {
              const audio = audioCount(d.id)
              return (
                <li key={d.id}>
                  <Link
                    href={`/dialects/${d.id}/`}
                    className="lift relative block w-full rounded-2xl border border-slate-200 bg-white p-3 text-start shadow-sm transition hover:border-sun-400"
                  >
                    <span className="block font-bold text-slate-900">{d.name}</span>
                    <span className="block text-xs text-slate-500">{d.country || ' '}</span>
                    {audio > 0 && <span className="mt-1 block text-[10px] text-brand-600">{t('audioCount', { n: audio })}</span>}
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}
