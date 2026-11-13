import rawEgypt from '../content/egypt.json'
import type { LonLat } from './geo'

/** Whether a node is an Arabic dialect or a language of its own (Nubian, Siwi). */
export type EgyptKind = 'arabic' | 'language'
export type EgyptLevel = 'region' | 'variety' | 'sub'

export interface Bilingual {
  ar: string
  en: string
}
export interface BilingualList {
  ar: string[]
  en: string[]
}

/** [longitude, latitude, Arabic place name, English place name] */
export type EgyptPoint = [number, number, string, string]

export interface EgyptNodeData {
  id: string
  kind: EgyptKind
  name: string
  nameEn: string
  /** The id of the dialect in phrases.json whose phrases and audio this node uses. */
  dialectId?: string
  family?: Bilingual
  area?: Bilingual
  governorates?: BilingualList
  summary?: Bilingual
  history?: Bilingual
  features?: Bilingual[]
  sources?: string[]
  points?: EgyptPoint[]
  seeAlso?: string[]
  varieties?: EgyptNodeData[]
  subVarieties?: EgyptNodeData[]
}

export interface EgyptContrast {
  id: string
  label: Bilingual
  forms: { node: string; text: string; ipa: string }[]
}

export interface EgyptContent {
  version: number
  sources: { id: string; text: string }[]
  contrasts: EgyptContrast[]
  regions: EgyptNodeData[]
}

export interface EgyptNode extends EgyptNodeData {
  level: EgyptLevel
  parentId?: string
  regionId: string
  children: string[]
}

export const egyptContent = rawEgypt as EgyptContent
export const egyptSources = egyptContent.sources
export const egyptContrasts = egyptContent.contrasts

const nodes = new Map<string, EgyptNode>()

function add(data: EgyptNodeData, level: EgyptLevel, regionId: string, parentId?: string) {
  const kids = level === 'region' ? data.varieties : data.subVarieties
  const node: EgyptNode = { ...data, level, parentId, regionId, children: (kids ?? []).map((k) => k.id) }
  nodes.set(data.id, node)
  const next: EgyptLevel = level === 'region' ? 'variety' : 'sub'
  for (const k of kids ?? []) add(k, next, regionId, data.id)
}
for (const r of egyptContent.regions) add(r, 'region', r.id)

export const egyptRegions: EgyptNode[] = egyptContent.regions.map((r) => nodes.get(r.id)!)
export const allEgyptNodes = (): EgyptNode[] => [...nodes.values()]
export const getEgyptNode = (id: string | undefined) => (id ? nodes.get(id) : undefined)
export const egyptChildren = (n: EgyptNode) => n.children.map((id) => nodes.get(id)!)

export function egyptAncestors(n: EgyptNode): EgyptNode[] {
  const out: EgyptNode[] = []
  let p = getEgyptNode(n.parentId)
  while (p) {
    out.unshift(p)
    p = getEgyptNode(p.parentId)
  }
  return out
}

function descendants(n: EgyptNode): EgyptNode[] {
  return egyptChildren(n).flatMap((c) => [c, ...descendants(c)])
}

/** The node a dialect from the main list belongs to, so its pages can link to each other. */
export function egyptNodeForDialect(dialectId: string): EgyptNode | undefined {
  let best: EgyptNode | undefined
  for (const n of nodes.values()) {
    if (n.dialectId === dialectId && (!best || n.level !== 'region')) best = n
  }
  return best
}

/** The dialect whose phrases illustrate a node: its own, else the closest ancestor's. */
export function exampleDialectFor(n: EgyptNode): { dialectId: string; inherited: boolean } | undefined {
  if (n.kind === 'language') return undefined
  if (n.dialectId) return { dialectId: n.dialectId, inherited: false }
  if (n.regionId === 'cairo') return { dialectId: 'cai', inherited: true }
  const up = egyptAncestors(n).reverse().find((a) => a.dialectId)
  return up?.dialectId ? { dialectId: up.dialectId, inherited: true } : undefined
}

/** Every point to mark on the map for a node: its own, its children's, else its region's. */
export function pointsFor(n: EgyptNode): EgyptPoint[] {
  if (n.points?.length) return n.points
  const below = descendants(n).flatMap((d) => d.points ?? [])
  if (below.length) return below
  return getEgyptNode(n.regionId)?.points ?? []
}

/** Sources for a node, falling back to its region's. */
export function sourcesFor(n: EgyptNode) {
  const ids = n.sources ?? getEgyptNode(n.regionId)?.sources ?? []
  return ids.map((id) => egyptSources.find((s) => s.id === id)).filter((s) => !!s)
}

/** Contrasts that say something about this node, its ancestors or its descendants. */
export function contrastsFor(n: EgyptNode): EgyptContrast[] {
  const related = new Set([n.id, ...egyptAncestors(n).map((a) => a.id), ...descendants(n).map((d) => d.id)])
  return egyptContrasts.filter((c) => c.forms.some((f) => related.has(f.node) && f.node !== 'cairo'))
}

/** The form a contrast gives for a node, looking up through its ancestors. */
export function formFor(c: EgyptContrast, n: EgyptNode) {
  const chain = [n, ...egyptAncestors(n).reverse()]
  for (const x of chain) {
    const f = c.forms.find((f) => f.node === x.id)
    if (f) return f
  }
  return undefined
}

export const egyptRegionColors: Record<string, string> = {
  cairo: '#c99a3e',
  delta: '#3f9f80',
  'alex-coast': '#2f6f9f',
  canal: '#5b7fbf',
  saeed: '#c7783a',
  sinai: '#a8433a',
  'west-desert': '#b8892f',
  nubia: '#7a4f9f',
}

/** Simplified hand-drawn outlines for the illustrated map of Egypt, not for navigation. */
export const egyptShapes: Record<string, LonLat[]> = {
  'alex-coast': [
    [25.1, 31.6], [27.3, 31.4], [28.9, 30.9], [29.9, 31.3], [30.1, 31.2], [30.0, 30.9], [29.0, 30.5], [27.2, 30.8], [25.1, 30.9],
  ],
  delta: [
    [30.1, 31.2], [30.4, 31.5], [31.0, 31.6], [31.6, 31.55], [31.9, 31.5], [32.1, 31.2], [32.0, 30.8], [31.85, 30.3],
    [31.4, 30.2], [31.25, 30.15], [30.95, 30.2], [30.6, 30.3], [30.0, 30.9],
  ],
  cairo: [
    [30.95, 30.2], [31.25, 30.15], [31.4, 30.2], [31.55, 29.95], [31.45, 29.75], [31.2, 29.7], [31.0, 29.85], [30.85, 30.05],
  ],
  canal: [
    [31.9, 31.5], [32.4, 31.3], [32.45, 30.6], [32.65, 29.9], [32.4, 29.85], [31.85, 30.3], [32.0, 30.8], [32.1, 31.2],
  ],
  sinai: [
    [32.4, 31.3], [33.2, 31.1], [34.2, 31.3], [34.9, 29.5], [34.3, 27.8], [33.6, 28.3], [32.7, 29.85], [32.45, 30.6],
  ],
  saeed: [
    [31.2, 29.7], [31.45, 29.75], [31.6, 29.4], [31.2, 28.2], [31.6, 27.3], [32.3, 26.6], [32.95, 26.2], [33.1, 25.4],
    [33.2, 24.6], [33.0, 23.9], [32.7, 23.9], [32.5, 24.6], [32.4, 25.5], [31.8, 26.2], [31.1, 26.9], [30.6, 27.8],
    [30.4, 28.6], [30.3, 29.3], [30.6, 29.6], [31.0, 29.85],
  ],
  'west-desert': [
    [25.1, 30.9], [27.2, 30.8], [29.0, 30.5], [30.0, 30.9], [30.6, 30.3], [30.85, 30.05], [31.0, 29.85], [30.6, 29.6],
    [30.3, 29.3], [30.4, 28.6], [30.6, 27.8], [31.1, 26.9], [31.8, 26.2], [32.4, 25.5], [32.5, 24.6], [31.5, 23.6],
    [31.4, 22.0], [25.0, 22.0],
  ],
  nubia: [
    [32.5, 24.6], [32.7, 23.9], [33.0, 23.9], [33.3, 23.2], [32.9, 22.0], [31.4, 22.0], [31.5, 23.6],
  ],
}

/** The Nile from Aswan to the Delta apex, then its two branches. */
export const nilePaths: LonLat[][] = [
  [
    [31.4, 22.0], [31.9, 22.6], [32.6, 23.4], [32.9, 24.1], [32.9, 24.5], [32.7, 25.2], [32.6, 25.7], [32.75, 26.1],
    [32.2, 26.15], [31.7, 26.55], [31.4, 26.9], [31.2, 27.2], [30.85, 27.7], [30.75, 28.1], [30.9, 28.7], [31.1, 29.1],
    [31.25, 29.6], [31.22, 30.05], [31.15, 30.2],
  ],
  [[31.15, 30.2], [30.95, 30.6], [30.7, 31.0], [30.4, 31.45]],
  [[31.15, 30.2], [31.25, 30.6], [31.4, 31.05], [31.8, 31.5]],
]

export const EG_W = 340
export const EG_H = 330

export function egProject([lon, lat]: LonLat): [number, number] {
  return [Math.round((lon - 24.7) * 32 * 10) / 10 + 6, Math.round((31.9 - lat) * 33 * 10) / 10]
}

export const egPath = (pts: LonLat[], close = true) =>
  pts.map((p, i) => `${i ? 'L' : 'M'}${egProject(p).join(' ')}`).join('') + (close ? 'Z' : '')
