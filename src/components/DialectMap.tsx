'use client'

import { ChevronLeft, MapPin } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import { dialects, getDialect, regions } from '../lib/content'
import { MAP_H, MAP_W, project, regionColors, regionLabels, regionShapes, regionShort, toPath } from '../lib/geo'
import { useName, useT } from '../lib/i18n'
import { useApp } from '../lib/store'
import type { RegionId } from '../lib/types'

const mapped = regions.filter((r) => regionShapes[r.id])
const shapePaths = Object.fromEntries(mapped.map((r) => [r.id, toPath(regionShapes[r.id]!)])) as Record<RegionId, string>

/** An illustrated map of the Arab world: tap a region to see its dialects. */
export default function DialectMap({ compact = false }: { compact?: boolean }) {
  const t = useT()
  const name = useName()
  const lang = useApp((s) => s.lang)
  const learning = getDialect(useApp((s) => s.dialectId))
  const [active, setActive] = useState<RegionId>(
    learning && regionShapes[learning.region] ? learning.region : 'nile',
  )
  const activeRegion = regions.find((r) => r.id === active)!
  const inRegion = dialects.filter((d) => d.region === active)
  const color = regionColors[active]

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      {!compact && (
        <div className="px-4 pt-4">
          <h2 className="text-lg font-bold">{t('mapTitle')}</h2>
          <p className="text-xs text-slate-500">{t('mapBody')}</p>
        </div>
      )}
      <div className="relative mt-2 bg-gradient-to-b from-sand-100 to-transparent px-2">
        <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} className="block h-auto w-full" role="group" aria-label={t('mapTitle')}>
          <defs>
            <pattern id="sea" width="8" height="8" patternUnits="userSpaceOnUse">
              <path d="M0 4h8" stroke="currentColor" strokeOpacity=".08" strokeWidth=".6" />
            </pattern>
          </defs>
          <rect width={MAP_W} height={MAP_H} fill="url(#sea)" className="text-brand-700" />
          {mapped.map((r) => {
            const on = r.id === active
            return (
              <path
                key={r.id}
                d={shapePaths[r.id]}
                fill={regionColors[r.id]}
                fillOpacity={on ? 0.85 : 0.28}
                stroke={on ? '#dcb565' : regionColors[r.id]}
                strokeWidth={on ? 1.6 : 0.8}
                strokeLinejoin="round"
                className="map-region cursor-pointer transition-[fill-opacity] duration-300 hover:fill-opacity-60"
                onClick={() => setActive(r.id)}
                role="button"
                aria-label={name(r)}
                aria-pressed={on}
                tabIndex={0}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setActive(r.id)}
              />
            )
          })}
          {dialects.map((d) => {
            if (d.lat === undefined || d.lon === undefined) return null
            const [x, y] = project([d.lon, d.lat])
            const on = d.region === active
            return (
              <circle
                key={d.id}
                cx={x}
                cy={y}
                r={on ? 2.6 : 1.6}
                fill={on ? '#fff8e6' : '#ffffff'}
                fillOpacity={on ? 1 : 0.75}
                stroke={on ? '#08302a' : regionColors[d.region]}
                strokeWidth={on ? 0.9 : 0.6}
                pointerEvents="none"
              >
                <title>{name(d)}</title>
              </circle>
            )
          })}
          {mapped.map((r) => {
            const at = regionLabels[r.id]
            if (!at) return null
            const [x, y] = project(at)
            const on = r.id === active
            return (
              <text
                key={r.id}
                x={x}
                y={y}
                textAnchor="middle"
                fontSize={on ? 9 : 7.5}
                fontWeight={700}
                fill={on ? '#ffffff' : 'currentColor'}
                stroke={on ? '#08302a' : 'none'}
                strokeWidth={on ? 2.4 : 0}
                paintOrder="stroke"
                className="pointer-events-none font-display text-slate-700"
              >
                {regionShort[r.id]?.[lang === 'ar' ? 0 : 1] ?? name(r)}
              </text>
            )
          })}
        </svg>
      </div>

      <div className="no-scrollbar flex gap-1.5 overflow-x-auto px-4 py-2">
        {mapped.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setActive(r.id)}
            aria-pressed={r.id === active}
            className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold transition ${
              r.id === active ? 'border-transparent text-white shadow-sm' : 'border-slate-200 text-slate-600'
            }`}
            style={
              r.id === active
                ? { backgroundColor: regionColors[r.id], backgroundImage: 'linear-gradient(rgb(0 0 0 / 0.3), rgb(0 0 0 / 0.3))' }
                : undefined
            }
          >
            {name(r)}
          </button>
        ))}
      </div>

      <div key={active} className="animate-rise border-t border-slate-100 p-4">
        <div className="mb-2 flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
          <h3 className="font-bold">{name(activeRegion)}</h3>
          <span className="text-xs text-slate-500">{t('mapDialects', { n: inRegion.length })}</span>
        </div>
        <ul className="flex flex-wrap gap-1.5">
          {inRegion.map((d) => (
            <li key={d.id}>
              <Link href={`/dialects/${d.id}`}
                className="lift inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-sand-50 px-2.5 py-1.5 text-sm font-semibold text-slate-800"
              >
                <MapPin className="h-3.5 w-3.5" style={{ color }} aria-hidden />
                {name(d)}
              </Link>
            </li>
          ))}
        </ul>
        {compact || (
          <Link href="/dialects" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-700">
            {t('allDialects')}
            <ChevronLeft className="h-4 w-4 ltr:rotate-180" aria-hidden />
          </Link>
        )}
      </div>
    </section>
  )
}
