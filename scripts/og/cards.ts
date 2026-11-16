/**
 * Social cards (Open Graph and Twitter, 1200×630) drawn as SVG and rendered to PNG with resvg.
 * resvg shapes Arabic with HarfBuzz, so joined letters and right-to-left order come out right. Text is
 * measured with resvg too, so long names shrink or wrap to fit instead of running off the card.
 */
import { Resvg } from '@resvg/resvg-js'
import sharp from 'sharp'
import { readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { MAP_H, MAP_W, project, regionColors, regionShapes, toPath } from '../../src/lib/geo'
import { EG_H, EG_W, egPath, egProject, egyptRegionColors, egyptShapes, nilePaths } from '../../src/lib/egypt'
import type { RegionId, WordGroup } from '../../src/lib/types'

import { esc, H, W } from './html'

export { esc, H, W }

const fontDir = join(dirname(fileURLToPath(import.meta.url)), 'fonts')
const fontFiles = readdirSync(fontDir).filter((f) => f.endsWith('.ttf')).map((f) => join(fontDir, f))
const fontOpts = { fontFiles, loadSystemFonts: false, defaultFontFamily: 'IBM Plex Sans Arabic' }

export const DISPLAY = 'El Messiri'
export const SANS = 'IBM Plex Sans Arabic'

const C = {
  ink: '#03201b',
  deep: '#08302a',
  green: '#0e4a3f',
  cream: '#fffaf0',
  cream2: '#f4ecd8',
  cream3: '#e4dbc4',
  gold: '#dcb565',
  goldDeep: '#b8862f',
}


// ---------- measuring ----------
const widthCache = new Map<string, number>()
/** The drawn width of one line of text, in pixels. */
export function measure(text: string, family: string, size: number, weight = 700): number {
  const key = `${family}|${weight}|${size}|${text}`
  const hit = widthCache.get(key)
  if (hit !== undefined) return hit
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="4000" height="${size * 3}"><text x="10" y="${size * 2}" font-family="${family}" font-weight="${weight}" font-size="${size}">${esc(text)}</text></svg>`
  const box = new Resvg(svg, { font: fontOpts }).getBBox()
  const w = box ? box.width : 0
  widthCache.set(key, w)
  return w
}

/** The largest size, up to max, at which the text fits on one line. */
export function fit(text: string, family: string, max: number, maxW: number, min = 20, weight = 700): number {
  let size = max
  while (size > min && measure(text, family, size, weight) > maxW) size -= 2
  return size
}

/** Breaks text into at most maxLines lines that fit maxW; the last line ends in an ellipsis when cut. */
export function wrap(text: string, family: string, size: number, maxW: number, maxLines: number, weight = 500): string[] {
  const words = text.split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let cur = ''
  for (let i = 0; i < words.length; i++) {
    const next = cur ? `${cur} ${words[i]}` : words[i]
    if (measure(next, family, size, weight) <= maxW || !cur) {
      cur = next
      continue
    }
    lines.push(cur)
    cur = words[i]
    if (lines.length === maxLines) {
      cur = ''
      let last = lines[maxLines - 1]
      while (last.includes(' ') && measure(`${last} …`, family, size, weight) > maxW) last = last.slice(0, last.lastIndexOf(' '))
      lines[maxLines - 1] = `${last.replace(/[،,.؛:]$/, '')} …`
      return lines
    }
  }
  if (cur) lines.push(cur)
  return lines
}

// ---------- shared pieces ----------
function text(x: number, y: number, s: string, o: { size: number; family?: string; weight?: number; fill?: string; anchor?: 'start' | 'middle' | 'end'; opacity?: number; spacing?: number }) {
  const fam = o.family ?? SANS
  return `<text x="${x}" y="${y}" font-family="${fam}" font-weight="${o.weight ?? 700}" font-size="${o.size}" fill="${o.fill ?? C.cream}" text-anchor="${o.anchor ?? 'end'}"${o.opacity !== undefined ? ` fill-opacity="${o.opacity}"` : ''}${o.spacing ? ` letter-spacing="${o.spacing}"` : ''}>${esc(s)}</text>`
}

const defs = `<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.green}"/><stop offset=".55" stop-color="${C.deep}"/><stop offset="1" stop-color="${C.ink}"/></linearGradient>
  <radialGradient id="glow" cx="0.86" cy="0.08" r="0.75"><stop offset="0" stop-color="${C.gold}" stop-opacity=".30"/><stop offset=".5" stop-color="${C.gold}" stop-opacity=".06"/><stop offset="1" stop-color="${C.gold}" stop-opacity="0"/></radialGradient>
  <radialGradient id="glow2" cx="0.1" cy="1" r="0.6"><stop offset="0" stop-color="#1f8467" stop-opacity=".35"/><stop offset="1" stop-color="#1f8467" stop-opacity="0"/></radialGradient>
  <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f8e7b0"/><stop offset=".55" stop-color="${C.gold}"/><stop offset="1" stop-color="${C.goldDeep}"/></linearGradient>
  <linearGradient id="goldH" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="${C.gold}" stop-opacity=".9"/><stop offset="1" stop-color="${C.gold}" stop-opacity="0"/></linearGradient>
  <pattern id="stars" width="96" height="96" patternUnits="userSpaceOnUse">
    <g fill="none" stroke="${C.gold}" stroke-opacity=".11" stroke-width="1.2">
      <path d="M48 18 L57 39 L78 48 L57 57 L48 78 L39 57 L18 48 L39 39 Z"/>
      <rect x="30" y="30" width="36" height="36" transform="rotate(45 48 48)"/>
      <rect x="30" y="30" width="36" height="36"/>
      <path d="M0 0 L18 18 M96 0 L78 18 M0 96 L18 78 M96 96 L78 78"/>
    </g>
  </pattern>
  <radialGradient id="fade" cx="0.62" cy="0.5" r="0.62"><stop offset=".25" stop-color="#000"/><stop offset="1" stop-color="#fff"/></radialGradient>
  <mask id="patMask"><rect width="${W}" height="${H}" fill="url(#fade)"/></mask>
  <filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="18"/></filter>
  <filter id="halo" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3.2"/></filter>
</defs>`

function background() {
  return `<rect width="${W}" height="${H}" fill="url(#bg)"/>
<rect width="${W}" height="${H}" fill="url(#glow2)"/>
<rect width="${W}" height="${H}" fill="url(#stars)" mask="url(#patMask)"/>
<rect width="${W}" height="${H}" fill="url(#glow)"/>`
}

/** The thin double gold frame with small diamonds at the corners. */
function frame() {
  const d = (x: number, y: number) => `<path d="M${x} ${y - 7} L${x + 7} ${y} L${x} ${y + 7} L${x - 7} ${y} Z" fill="${C.gold}"/>`
  return `<rect x="26" y="26" width="${W - 52}" height="${H - 52}" rx="28" fill="none" stroke="${C.gold}" stroke-opacity=".55" stroke-width="1.6"/>
<rect x="38" y="38" width="${W - 76}" height="${H - 76}" rx="20" fill="none" stroke="${C.gold}" stroke-opacity=".18" stroke-width="1"/>
${d(26 + 28, 26)}${d(W - 26 - 28, 26)}${d(26 + 28, H - 26)}${d(W - 26 - 28, H - 26)}`
}

/** The site's mark: a gold speech bubble with three dots, as in the favicon. */
function logo(x: number, y: number, s: number) {
  const k = s / 64
  return `<g transform="translate(${x} ${y}) scale(${k})"><rect width="64" height="64" rx="16" fill="${C.ink}" stroke="${C.gold}" stroke-opacity=".5" stroke-width="1.2"/><path d="M18 22h28a4 4 0 0 1 4 4v14a4 4 0 0 1-4 4H30l-8 7v-7h-4a4 4 0 0 1-4-4V26a4 4 0 0 1 4-4z" fill="url(#gold)"/><circle cx="25" cy="33" r="2.6" fill="${C.ink}"/><circle cx="32" cy="33" r="2.6" fill="${C.ink}"/><circle cx="39" cy="33" r="2.6" fill="${C.ink}"/></g>`
}

/** Small brand line for the bottom of inner cards: mark, name and address. */
function brandFooter(site: string) {
  const y = H - 74
  return `${logo(W - 90 - 44, y - 31, 44)}
${text(W - 90 - 58, y, 'لهجتي', { size: 34, family: DISPLAY, fill: 'url(#gold)' })}
${text(90, y - 2, site, { size: 22, weight: 500, fill: C.cream3, anchor: 'start' })}`
}

function divider(x1: number, x2: number, y: number) {
  return `<rect x="${Math.min(x1, x2)}" y="${y}" width="${Math.abs(x1 - x2)}" height="1.6" fill="url(#goldH)"/><path d="M${x1} ${y - 5} L${x1 + 6} ${y + 1} L${x1} ${y + 7} L${x1 - 6} ${y + 1} Z" fill="${C.gold}"/>`
}

/** A pill with centred text; returns its svg and width. */
function pill(xRight: number, y: number, label: string, o: { size?: number; fill?: string; stroke?: string; color?: string; family?: string } = {}) {
  const size = o.size ?? 26
  const fam = o.family ?? SANS
  const w = Math.ceil(measure(label, fam, size)) + size * 1.4
  const h = size * 1.75
  const x = xRight - w
  return {
    w,
    svg: `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="${o.fill ?? 'rgba(255,250,240,0.06)'}" stroke="${o.stroke ?? C.gold}" stroke-opacity=".55" stroke-width="1.3"/>${text(x + w / 2, y + h / 2 + size * 0.36, label, { size, anchor: 'middle', fill: o.color ?? C.cream2, family: fam })}`,
  }
}

/** The Arab-world map; one region can be lit in its own colour and a dot can mark a city. boost strengthens the faint map so text on it reads better. */
function arabMap(x: number, y: number, width: number, o: { active?: RegionId; dot?: [number, number]; faint?: boolean; boost?: boolean } = {}) {
  const k = width / MAP_W
  const shapes = (Object.keys(regionShapes) as RegionId[])
    .map((id) => {
      const on = o.active === id
      const fill = o.faint ? C.gold : on ? regionColors[id] : C.cream
      const fo = o.faint ? (o.boost ? 0.12 : 0.07) : on ? 0.95 : 0.1
      const so = on ? 0.95 : o.faint ? (o.boost ? 0.5 : 0.32) : 0.45
      return `<path d="${toPath(regionShapes[id]!)}" fill="${fill}" fill-opacity="${fo}" stroke="${C.gold}" stroke-opacity="${so}" stroke-width="${(on ? 1.4 : 0.8) / k}" stroke-linejoin="round"/>`
    })
    .join('')
  let dot = ''
  if (o.dot) {
    const [px, py] = project([o.dot[0], o.dot[1]])
    dot = `<circle cx="${px}" cy="${py}" r="${9 / k}" fill="${C.gold}" fill-opacity=".25"/><circle cx="${px}" cy="${py}" r="${4.2 / k}" fill="${C.cream}" stroke="${C.goldDeep}" stroke-width="${1.6 / k}"/>`
  }
  return `<g transform="translate(${x} ${y}) scale(${k})">${shapes}${dot}</g>`
}
export const arabMapHeight = (width: number) => (width / MAP_W) * MAP_H

/** The map of Egypt by region; the lit ids get their colours, the rest stay pale. */
function egyptMap(x: number, y: number, height: number, lit?: Set<string>) {
  const k = height / EG_H
  const shapes = Object.entries(egyptShapes)
    .map(([id, pts]) => {
      const on = !lit || lit.has(id)
      return `<path d="${egPath(pts)}" fill="${on ? egyptRegionColors[id] ?? '#1f8467' : C.cream}" fill-opacity="${on ? (lit ? 0.95 : 0.78) : 0.08}" stroke="${C.gold}" stroke-opacity="${on ? 0.9 : 0.4}" stroke-width="${1.1 / k}" stroke-linejoin="round"/>`
    })
    .join('')
  const nile = nilePaths.map((p, i) => `<path d="${egPath(p, false)}" fill="none" stroke="#7cc4f0" stroke-opacity=".9" stroke-width="${(i ? 1.4 : 2.2) / k}" stroke-linecap="round"/>`).join('')
  return `<g transform="translate(${x} ${y}) scale(${k})">${shapes}${nile}</g>`
}
export const egyptMapWidth = (height: number) => (height / EG_H) * EG_W
export { egProject }

function svgDoc(body: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${defs}${background()}${body}${frame()}</svg>`
}

export function renderPng(svg: string): Buffer {
  return new Resvg(svg, { font: fontOpts, fitTo: { mode: 'original' } }).render().asPng()
}

/** JPEG keeps each card near 100 KB (the PNG is about four times that); full colour detail keeps the text crisp. */
export function renderJpeg(svg: string): Promise<Buffer> {
  return sharp(renderPng(svg)).jpeg({ quality: 86, chromaSubsampling: '4:4:4', mozjpeg: true }).toBuffer()
}

// ---------- the cards ----------
const R = W - 92 // right edge of text (RTL)

export interface HomeCard {
  slogan: string
  sloganEn: string
  greetings: string[]
  site: string
  /** Live counts shown under the divider: dialects, phrases, situations. */
  stats?: [string, string][]
  /** Famous sayings from many dialects for the collage. */
  phrases?: string[]
  /** For an inner section: its title above the brand. */
  section?: string
  sectionBody?: string
}

/** How many leading chips an inner-section card has room for (mirrors the layout loop in homeCard). */
export function fittingChips(chips: string[]): number {
  let x = R
  let n = 0
  for (const g of chips) {
    const p = pill(x, 0, g, { size: 27 })
    if (x - p.w < 640) break
    n++
    x -= p.w + 14
  }
  return n
}

/** Regions represented by the visible, deduplicated prefix of concept chips. */
export function conceptChipLayout(words: Partial<Record<WordGroup, string>>, order: WordGroup[]) {
  const present = order.filter((g) => words[g])
  const chips = [...new Set(present.map((g) => words[g]!))]
  const visible = chips.slice(0, fittingChips(chips))
  const shownGroups = present.filter((g) => visible.includes(words[g]!))
  return { chips, visible, shownGroups, hidden: present.length - shownGroups.length }
}

/** The main card: the mark and name, the slogan, the counts, and a collage of greetings from across the dialects. */
export function homeCard(c: HomeCard): string {
  if (!c.section) return homeCollageCard(c)
  const mapW = 560
  const mapH = arabMapHeight(mapW)
  let body = arabMap(36, H - mapH - 40, mapW, { faint: true })
  const markS = 104
  body += logo(R - markS, 82, markS)
  const nameSize = fit('لهجتي', DISPLAY, 132, 520)
  body += `<g filter="url(#soft)" opacity=".45">${text(R - markS - 28, 178, 'لهجتي', { size: nameSize, family: DISPLAY, fill: C.gold })}</g>`
  body += text(R - markS - 28, 178, 'لهجتي', { size: nameSize, family: DISPLAY, fill: 'url(#gold)' })
  body += text(R - markS - 32, 218, 'LAHJATY', { size: 20, weight: 500, fill: C.gold, spacing: 7 })
  let y = 300
  if (c.section) {
    const s = fit(c.section, SANS, 58, 980)
    body += text(R, y, c.section, { size: s, fill: C.cream })
    y += 52
    const sub = c.sectionBody ?? c.slogan
    const ss = fit(sub, SANS, 32, 980, 22, 500)
    body += text(R, y, sub, { size: ss, weight: 500, fill: C.cream3 })
  } else {
    const s = fit(c.slogan, SANS, 56, 1000)
    body += text(R, y, c.slogan, { size: s, fill: C.cream })
    y += 50
    body += text(R, y, c.sloganEn, { size: fit(c.sloganEn, SANS, 28, 1000, 18, 500), weight: 500, fill: C.gold })
  }
  body += divider(R, R - 420, y + 34)
  // greetings, right to left
  let x = R
  const gy = y + 66
  for (const g of c.greetings.slice(0, fittingChips(c.greetings))) {
    const p = pill(x, gy, g, { size: 27 })
    body += p.svg
    x -= p.w + 14
  }
  body += text(R, H - 70, c.site, { size: 24, weight: 500, fill: C.cream3 })
  return svgDoc(body)
}

export interface DialectCard {
  name: string
  nameEn: string
  kicker: string
  region: RegionId
  lonLat?: [number, number]
  sample?: { text: string; standard: string; english: string }
  site: string
}

/** One dialect: its name, where it is on the map, and one of its famous phrases. */
export function dialectCard(c: DialectCard): string {
  const mapW = 470
  const mapH = arabMapHeight(mapW)
  let body = `<rect x="62" y="${(H - mapH) / 2 - 40}" width="${mapW + 30}" height="${mapH + 60}" rx="26" fill="#000" fill-opacity=".16" stroke="${C.gold}" stroke-opacity=".18"/>`
  body += arabMap(77, (H - mapH) / 2 - 10, mapW, { active: c.region, dot: c.lonLat })
  const colW = 510
  body += text(R, 118, c.kicker, { size: fit(c.kicker, SANS, 28, colW, 18), fill: C.gold })
  const ns = fit(c.name, DISPLAY, 112, colW, 48)
  body += text(R, 118 + ns * 1.02, c.name, { size: ns, family: DISPLAY, fill: 'url(#gold)' })
  let y = 118 + ns * 1.02 + 46
  body += text(R, y, c.nameEn, { size: fit(c.nameEn, SANS, 34, colW, 20, 500), weight: 500, fill: C.cream3 })
  if (c.sample) {
    y += 34
    const boxH = 132
    body += `<rect x="${R - colW}" y="${y}" width="${colW + 6}" height="${boxH}" rx="22" fill="#fffaf0" fill-opacity=".07" stroke="${C.gold}" stroke-opacity=".35"/>`
    const ts = fit(`«${c.sample.text}»`, SANS, 46, colW - 48, 24)
    body += text(R - 24, y + 58, `«${c.sample.text}»`, { size: ts, fill: C.cream })
    const meaning = `${c.sample.standard} · ${c.sample.english}`
    body += text(R - 24, y + 104, meaning, { size: fit(meaning, SANS, 24, colW - 48, 16, 500), weight: 500, fill: C.gold })
  }
  body += brandFooter(c.site)
  return svgDoc(body)
}

export interface PhraseCard {
  text: string
  dialect: string
  dialectEn: string
  standard: string
  english: string
  region: RegionId
  site: string
}

/** One phrase in one dialect, big, with its meaning: the card behind a shared phrase link. */
export function phraseCard(c: PhraseCard): string {
  let body = ''
  const chip = pill(R, 70, `${c.dialect} · ${c.dialectEn}`, { size: 26, fill: regionColors[c.region], color: C.cream })
  body += chip.svg
  body += text(90, 112, 'أشهر الجمل', { size: 26, fill: C.gold, anchor: 'start' })
  const quote = `«${c.text}»`
  const ts = fit(quote, SANS, 124, W - 200, 44)
  let lines = [quote]
  let size = ts
  if (ts < 64) {
    size = 64
    lines = wrap(quote, SANS, size, W - 200, 2, 700)
  }
  const cy = 300 - ((lines.length - 1) * size * 1.15) / 2
  lines.forEach((l, i) => {
    body += `<g filter="url(#soft)" opacity=".35">${text(W / 2, cy + i * size * 1.15 + size * 0.3, l, { size, anchor: 'middle', fill: C.gold })}</g>`
    body += text(W / 2, cy + i * size * 1.15 + size * 0.3, l, { size, anchor: 'middle', fill: C.cream })
  })
  let y = cy + (lines.length - 1) * size * 1.15 + size * 0.3 + 78
  body += divider(W / 2 + 160, W / 2 - 160, y - 40)
  const std = `بالفصحى: ${c.standard}`
  body += text(W / 2, y + 8, std, { size: fit(std, SANS, 38, W - 220, 20, 500), weight: 500, anchor: 'middle', fill: C.cream2 })
  y += 56
  body += text(W / 2, y, c.english, { size: fit(c.english, SANS, 30, W - 220, 18, 500), weight: 500, anchor: 'middle', fill: C.gold })
  body += brandFooter(c.site)
  return svgDoc(body)
}

export interface EgyptCard {
  title: string
  titleEn: string
  kicker: string
  summary?: string
  lit?: Set<string>
  chips?: string[]
  site: string
}

/** The Egypt section and each of its regions and dialects, on the map of Egypt. */
export function egyptCard(c: EgyptCard): string {
  const mapH = 440
  const mapW = egyptMapWidth(mapH)
  let body = `<ellipse cx="${70 + mapW / 2}" cy="${H / 2}" rx="${mapW / 2 + 30}" ry="${mapH / 2 + 10}" fill="#000" fill-opacity=".14"/>`
  body += egyptMap(70, (H - mapH) / 2 - 4, mapH, c.lit)
  const colW = 550
  body += text(R, 118, c.kicker, { size: fit(c.kicker, SANS, 28, colW, 18), fill: C.gold })
  const ns = fit(c.title, DISPLAY, 100, colW, 44)
  body += text(R, 118 + ns * 1.02, c.title, { size: ns, family: DISPLAY, fill: 'url(#gold)' })
  let y = 118 + ns * 1.02 + 44
  body += text(R, y, c.titleEn, { size: fit(c.titleEn, SANS, 32, colW, 18, 500), weight: 500, fill: C.cream3 })
  if (c.summary) {
    const lines = wrap(c.summary, SANS, 27, colW, 3, 500)
    y += 30
    lines.forEach((l) => {
      y += 42
      body += text(R, y, l, { size: 27, weight: 500, fill: C.cream2 })
    })
  }
  if (c.chips?.length) {
    y += 34
    let x = R
    let row = 0
    for (const ch of c.chips) {
      const p = pill(x, y, ch, { size: 22 })
      if (x - p.w < R - colW) {
        row++
        if (row > 1) break
        x = R
        y += 52
      }
      const q = pill(x, y, ch, { size: 22 })
      body += q.svg
      x -= q.w + 10
    }
  }
  body += brandFooter(c.site)
  return svgDoc(body)
}

/** The home card: the brand and the slogan over a scatter of famous sayings from across the dialects. */
function homeCollageCard(c: HomeCard): string {
  const R = W - 92
  let body = logo(R - 72, 60, 72)
  const nameSize = fit('لهجتي', DISPLAY, 92, 400)
  const nameX = R - 72 - 26
  body += `<g filter="url(#soft)" opacity=".5">${text(nameX, 158, 'لهجتي', { size: nameSize, family: DISPLAY, fill: C.gold })}</g>`
  body += text(nameX, 158, 'لهجتي', { size: nameSize, family: DISPLAY, fill: 'url(#gold)' })
  body += text(nameX - 4, 198, 'LAHJATY', { size: 17, weight: 500, fill: C.gold, spacing: 7 })
  body += text(R, 274, c.slogan, { size: fit(c.slogan, SANS, 38, 980), fill: C.cream })
  body += text(R, 312, c.sloganEn, { size: fit(c.sloganEn, SANS, 20, 980, 16, 500), weight: 500, fill: C.gold })
  body += divider(R, R - 360, 348)
  const fills = ['url(#gold)', C.cream, C.cream2, C.gold, C.cream3]
  const spots: [number, number, number, number, number][] = [
    [170, 122, 34, -4, 250],
    [450, 118, 30, 3, 260],
    [140, 210, 28, 5, 200],
    [400, 215, 38, -3, 330],
    [180, 305, 30, 3, 260],
    [470, 300, 26, -5, 220],
    [330, 392, 34, -3, 380],
    [850, 398, 28, 4, 330],
    [180, 480, 40, -3, 300],
    [520, 486, 30, 4, 280],
    [900, 484, 34, -4, 360],
    [170, 566, 28, 3, 240],
    [450, 566, 32, -3, 280],
    [790, 568, 26, 4, 260],
    [1060, 564, 30, -3, 220],
  ]
  const ps = c.phrases ?? []
  spots.forEach(([x, y, size, rot, maxW], i) => {
    const p = ps[i % ps.length]
    if (!p) return
    const fs = fit(p, SANS, size, maxW, 15)
    body += `<g transform="translate(${x} ${y}) rotate(${rot})"><text x="0" y="0" font-family="${SANS}" font-weight="700" font-size="${fs}" fill="${fills[i % fills.length]}" text-anchor="middle">${esc(p)}</text></g>`
  })
  return svgDoc(body)
}

export interface MapPick {
  /** Country name in Arabic, e.g. مصر. */
  country: string
  /** The country's most famous phrase, from famous.json. */
  phrase: string
  /** Anchor point for the label on the map. */
  lonLat: [number, number]
}

/** The home card: the brand, and the most famous phrase of each country sitting on its place on the map. */
export function homeMapCard(c: { slogan: string; sloganEn: string; picks: MapPick[] }): string {
  const R = W - 92
  let body = logo(R - 72, 60, 72)
  const nameSize = fit('لهجتي', DISPLAY, 76, 340)
  const nameX = R - 72 - 20
  body += `<g filter="url(#soft)" opacity=".5">${text(nameX, 140, 'لهجتي', { size: nameSize, family: DISPLAY, fill: C.gold })}</g>`
  body += text(nameX, 140, 'لهجتي', { size: nameSize, family: DISPLAY, fill: 'url(#gold)' })
  body += text(nameX - 2, 170, 'LAHJATY', { size: 15, weight: 500, fill: C.gold, spacing: 6 })
  body += divider(R, R - 300, 452)
  body += text(R, 508, c.slogan, { size: fit(c.slogan, SANS, 30, 420), fill: C.cream })
  body += text(R, 546, c.sloganEn, { size: 16, weight: 500, fill: C.gold })
  const mw = 890
  const mh = arabMapHeight(mw)
  const mx = 14
  const my = (H - mh) / 2 + 20
  body += arabMap(mx, my, mw, { faint: true, boost: true })
  const k = mw / MAP_W
  // Hand-tuned label offsets so crowded neighbours (the Levant, the Gulf) never overlap.
  const nudges: Record<string, [number, number]> = {
    'سوريا': [6, -46], 'لبنان': [-92, -16], 'فلسطين': [-110, 10], 'الأردن': [42, 62],
    'العراق': [30, -14], 'الكويت': [30, 70], 'البحرين': [-60, 66], 'قطر': [30, 44],
    'الإمارات': [96, 62], 'عُمان': [96, 14], 'السعودية': [-120, 52], 'اليمن': [30, 44],
    'مصر': [-30, 70], 'السودان': [-16, 38], 'تشاد': [-6, 34],
    'المغرب': [-20, 8], 'الجزائر': [-24, 44], 'تونس': [36, -44], 'ليبيا': [16, 34], 'موريتانيا': [30, 30],
  }
  const GOLD_BRIGHT = '#f2d98c'
  for (const p of c.picks) {
    const [px, py] = project(p.lonLat)
    const [dx, dy] = nudges[p.country] ?? [0, 0]
    const x = mx + px * k + dx
    const y = my + py * k + dy
    const s = fit(p.phrase, SANS, 27, 154, 12)
    const label = text(x, y - s * 0.68, p.country, { size: 14.5, weight: 500, fill: C.gold, anchor: 'middle' })
    const phrase = text(x, y, p.phrase, { size: s, anchor: 'middle', fill: GOLD_BRIGHT })
    body += `<g filter="url(#halo)" opacity=".8">${text(x, y - s * 0.68, p.country, { size: 14.5, weight: 500, fill: C.ink, anchor: 'middle' })}${text(x, y, p.phrase, { size: s, anchor: 'middle', fill: C.ink })}</g>`
    body += label + phrase
  }
  return svgDoc(body)
}
