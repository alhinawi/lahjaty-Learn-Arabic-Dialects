'use client'

import { EG_H, EG_W, egPath, egProject, egyptRegionColors, egyptRegions, egyptShapes, nilePaths } from '../lib/egypt'
import type { EgyptPoint } from '../lib/egypt'
import { useApp } from '../lib/store'

const paths = Object.fromEntries(Object.entries(egyptShapes).map(([id, pts]) => [id, egPath(pts)]))
const nile = nilePaths.map((p) => egPath(p, false))

interface Props {
  /** The region to highlight; the others fade. */
  active?: string
  /** Places to mark and name. */
  points?: EgyptPoint[]
  onSelect?: (regionId: string) => void
  label: string
}

/** An illustrated map of Egypt by dialect region. */
export default function EgyptMap({ active, points = [], onSelect, label }: Props) {
  const lang = useApp((s) => s.lang)
  return (
    <svg viewBox={`0 0 ${EG_W} ${EG_H}`} className="block h-auto w-full" role="group" aria-label={label}>
      <defs>
        <pattern id="eg-sea" width="7" height="7" patternUnits="userSpaceOnUse">
          <path d="M0 3.5h7" stroke="#2f6f9f" strokeOpacity=".12" strokeWidth=".7" />
        </pattern>
      </defs>
      <rect x="0" y="0" width={EG_W} height="22" fill="url(#eg-sea)" />
      {egyptRegions.map((r) => {
        const on = !active || r.id === active
        const color = egyptRegionColors[r.id] ?? '#1f8467'
        return (
          <path
            key={r.id}
            d={paths[r.id]}
            fill={color}
            fillOpacity={active ? (r.id === active ? 0.8 : 0.16) : 0.55}
            stroke={r.id === active ? '#dcb565' : color}
            strokeWidth={r.id === active ? 1.8 : 0.8}
            strokeDasharray={r.kind === 'language' ? '3 2' : undefined}
            strokeLinejoin="round"
            className={onSelect ? 'map-region cursor-pointer transition-[fill-opacity] duration-300' : 'transition-[fill-opacity] duration-300'}
            onClick={onSelect ? () => onSelect(r.id) : undefined}
            role={onSelect ? 'button' : undefined}
            tabIndex={onSelect ? 0 : undefined}
            aria-label={lang === 'ar' ? r.name : r.nameEn}
            aria-pressed={onSelect ? r.id === active : undefined}
            onKeyDown={onSelect ? (e) => (e.key === 'Enter' || e.key === ' ') && onSelect(r.id) : undefined}
            opacity={on ? 1 : 0.9}
          />
        )
      })}
      {nile.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="#2f7fbf" strokeWidth={i ? 1.2 : 1.8} strokeLinecap="round" strokeOpacity=".85" pointerEvents="none" />
      ))}
      {points.map(([lon, lat, ar, en]) => {
        const [x, y] = egProject([lon, lat])
        const left = x > EG_W - 70
        return (
          <g key={`${ar}-${lon}`} pointerEvents="none">
            <circle cx={x} cy={y} r="3.4" fill="#fff8e6" stroke="#08302a" strokeWidth="1.2" />
            <text
              x={left ? x - 6 : x + 6}
              y={y + 3.5}
              textAnchor={left ? 'end' : 'start'}
              fontSize="10"
              fontWeight="700"
              fill="#ffffff"
              stroke="#08302a"
              strokeWidth="2.6"
              paintOrder="stroke"
              className="font-sans"
            >
              {lang === 'ar' ? ar : en}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
