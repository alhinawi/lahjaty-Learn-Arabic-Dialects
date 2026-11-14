/**
 * After `vite build`: draws the social cards into dist/og and writes one HTML file per page with its own
 * title, description, Open Graph and Twitter tags, so links shared on WhatsApp, Facebook or X show the
 * right card without a server. Also writes sitemap.xml and robots.txt.
 *
 *   npx tsx scripts/og/build.ts            (the build runs it)
 *   npx tsx scripts/og/build.ts --only home,dialects/cai --out /tmp/og   (draw a few cards to look at)
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { allFamous, categories, dialects, famousFor, getDialect, getPhrase, phrases, regions, STANDARD_ID } from '../../src/lib/content'
import { allEgyptNodes, egyptAncestors, egyptRegions } from '../../src/lib/egypt'
import { translate } from '../../src/lib/i18n'
import { famousSlug, ogImageFor, SITE_NAME, SITE_URL, sharePath } from '../../src/lib/og'
import { esc, H, W } from './html'
import { readDictionary } from '../lib/dictionary'

/**
 * The card renderer needs native packages (resvg, sharp). When a build image cannot load them, or OG_SKIP=1,
 * every page points at the prebuilt card committed in public/og-default.jpg instead, and the build goes on.
 */
type Cards = typeof import('./cards')
let cards: Cards | undefined
if (process.env.OG_SKIP !== '1') {
  try {
    cards = await import('./cards')
  } catch (err) {
    console.warn(`og: card renderer unavailable, using public/og-default.jpg (${(err as Error).message})`)
  }
}
const FALLBACK_IMAGE = '/og-default.jpg'
const failed = new Set<string>()

const args = process.argv.slice(2)
const only = args.includes('--only') ? new Set(args[args.indexOf('--only') + 1].split(',')) : undefined
const outIdx = args.indexOf('--out')
const DIST = outIdx >= 0 ? args[outIdx + 1] : 'dist'
const SITE = SITE_URL.replace(/^https?:\/\//, '')
const t = (k: Parameters<typeof translate>[1]) => translate('ar', k)

interface Page {
  path: string
  title: string
  description: string
  imageAlt: string
  /** Pages that only exist to be shared stay out of the sitemap. */
  sitemap?: boolean
}

// ---------- cards ----------
let drawn = 0
const jobs: (() => Promise<void>)[] = []
function draw(rel: string, svg: (c: Cards) => string) {
  const key = rel.replace(/^\/og\//, '').replace(/\.jpg$/, '')
  if (only && !only.has(key)) return
  jobs.push(async () => {
    if (!cards) return void failed.add(rel)
    try {
      const file = join(DIST, rel)
      mkdirSync(dirname(file), { recursive: true })
      writeFileSync(file, await cards.renderJpeg(svg(cards)))
      drawn++
    } catch (err) {
      failed.add(rel)
      console.warn(`og: could not draw ${rel}: ${(err as Error).message}`)
    }
  })
}

const greetingIds = ['cai', 'bag', 'dam', 'kuw', 'sud', 'tun', 'mar', 'alg']
const how = getPhrase('greetings.how_are_you')
const greetings = [...new Set(greetingIds.map((id) => how?.variants[id]?.text).filter((x): x is string => !!x))]
const slogan = t('heroTitle')
const sloganEn = translate('en', 'heroTitle')

draw('/og/home.jpg', (c) => c.homeCard({ slogan, sloganEn, greetings, site: SITE }))
const sections: [string, string, string][] = [
  ['dialects', t('allDialects'), t('tagline')],
  ['lessons', t('lessonsTitle'), t('heroBody').split('،')[0]],
  ['compare', t('compareTitle'), t('compareBody')],
  ['practice', t('practiceTitle'), t('practiceBody')],
  ['search', t('searchTitle'), t('searchBody')],
  ['favorites', t('favoritesTitle'), slogan],
  ['settings', t('settings'), slogan],
  ['dictionary', t('dictTitle'), t('dictBody')],
  ['word', t('dictWordInAll'), t('dictWordInAllBody')],
]
for (const [id, title, body] of sections) draw(`/og/${id}.jpg`, (c) => c.homeCard({ slogan, sloganEn, greetings, site: SITE, section: title, sectionBody: body }))
for (const cat of categories) {
  const sample = phrases.find((p) => p.category === cat.id)
  const body = sample ? `${sample.variants[STANDARD_ID]?.text ?? ''} · ${sample.english}` : slogan
  draw(`/og/lessons/${cat.id}.jpg`, (c) => c.homeCard({ slogan, sloganEn, greetings, site: SITE, section: `${cat.name} · ${cat.nameEn}`, sectionBody: body }))
}

const dict = readDictionary(process.cwd())
for (const f of dict.files) {
  const topic = dict.index.topics.find((x) => x.id === f.id)!
  const body = f.entries.slice(0, 4).map((e) => e.fs).join(' · ')
  draw(`/og/dictionary/${topic.id}.jpg`, (c) => c.homeCard({ slogan, sloganEn, greetings, site: SITE, section: `${topic.name} · ${topic.nameEn}`, sectionBody: body }))
}

const regionName = (id: string) => regions.find((r) => r.id === id)?.name ?? ''
for (const d of dialects) {
  if (d.id === STANDARD_ID) continue
  const f = famousFor(d.id)[0]
  draw(`/og/dialects/${d.id}.jpg`, (c) =>
    c.dialectCard({
      name: d.name,
      nameEn: d.nameEn,
      kicker: `لهجة · ${d.country ?? regionName(d.region)}`,
      region: d.region,
      lonLat: d.lon !== undefined && d.lat !== undefined ? [d.lon, d.lat] : undefined,
      sample: f ? { text: f.text, standard: f.standard, english: f.english } : undefined,
      site: SITE,
    }),
  )
}

for (const { dialectId, phrase } of allFamous) {
  const d = getDialect(dialectId)!
  draw(`/og/p/${dialectId}/${famousSlug(phrase.id)}.jpg`, (c) =>
    c.phraseCard({ text: phrase.text, dialect: d.name, dialectEn: d.nameEn, standard: phrase.standard, english: phrase.english, region: d.region, site: SITE }),
  )
}

draw('/og/egypt.jpg', (c) => c.egyptCard({ title: t('egyptTitle'), titleEn: translate('en', 'egyptTitle'), kicker: 'لهجتي · قسم مصر', summary: t('egyptCtaBody'), chips: egyptRegions.map((r) => r.name), site: SITE }))
for (const n of allEgyptNodes()) {
  const chain = egyptAncestors(n)
  const lit = new Set([n.id, ...chain.map((a) => a.id)])
  const kicker = [t('egyptTitle'), ...chain.map((a) => a.name)].join(' · ')
  const chips = n.kind === 'language' ? [t('egyptLanguage')] : (n.governorates?.ar ?? []).slice(0, 6)
  draw(`/og/egypt/${n.id}.jpg`, (c) => c.egyptCard({ title: n.name, titleEn: n.nameEn, kicker, summary: n.summary?.ar, lit, chips, site: SITE }))
}

// resvg draws one card at a time; sharp encodes on its own threads while the next card is drawn.
const started = Date.now()
const pending: Promise<void>[] = []
for (const job of jobs) {
  pending.push(job())
  if (pending.length >= 4) await pending.shift()
}
await Promise.all(pending)

// A card that could not be drawn falls back to the prebuilt default card.
const imageFor = (path: string) => {
  const rel = ogImageFor(path)
  return failed.has(rel) ? FALLBACK_IMAGE : rel
}

// ---------- pages ----------
const pages: Page[] = [
  { path: '/', title: '', description: `${slogan}. ${t('heroBody')}`, imageAlt: `لهجتي: ${slogan}`, sitemap: true },
  ...sections.map(([id, title, body]) => ({ path: `/${id}`, title, description: `${body}. ${slogan}.`, imageAlt: `${title} – لهجتي`, sitemap: !['favorites', 'settings', 'search'].includes(id) })),
  ...categories.map((c) => ({ path: `/lessons/${c.id}`, title: `${c.name} – ${t('lessonsTitle')}`, description: `جمل «${c.name}» بكل اللهجات العربية، مع المعنى بالفصحى والإنجليزي. ${slogan}.`, imageAlt: `${c.name} – لهجتي`, sitemap: true })),
  ...dialects
    .filter((d) => d.id !== STANDARD_ID)
    .map((d) => {
      const f = famousFor(d.id)[0]
      return {
        path: `/dialects/${d.id}`,
        title: `لهجة ${d.name} (${d.nameEn})`,
        description: `جمل الحياة اليومية بلهجة ${d.name}، وأشهر ما يقوله أهلها، مع المعنى بالفصحى والإنجليزي.${f ? ` «${f.text}»: ${f.standard}.` : ''}`,
        imageAlt: `لهجة ${d.name} على الخريطة`,
        sitemap: true,
      }
    }),
  ...dict.index.topics.map((x) => ({ path: `/dictionary/${x.id}`, title: `${x.name} – ${t('dictTitle')}`, description: `كلمات «${x.name}» بكل اللهجات العربية، مع المقابل بالفصحى والمعنى بالإنجليزي. ${slogan}.`, imageAlt: `${x.name} – قاموس لهجتي`, sitemap: true })),
  ...dict.entries.map((e) => {
    const sample = Object.entries(e.words).slice(0, 6).map(([id, w]) => `${getDialect(id)?.name ?? id}: ${w}`).join('، ')
    return { path: `/word/${e.id}`, title: `«${e.fs}» في كل لهجة`, description: `«${e.fs}» (${e.en}) بلهجات العرب: ${sample}.`, imageAlt: `«${e.fs}» في كل لهجة – لهجتي`, sitemap: true }
  }),
  { path: '/egypt', title: t('egyptTitle'), description: t('egyptBody'), imageAlt: 'خريطة لهجات مصر', sitemap: true },
  ...allEgyptNodes().map((n) => ({ path: `/egypt/${n.id}`, title: `${n.name} – ${n.nameEn}`, description: n.summary?.ar ?? t('egyptBody'), imageAlt: `${n.name} على خريطة مصر`, sitemap: true })),
  ...allFamous.map(({ dialectId, phrase }) => {
    const d = getDialect(dialectId)!
    return { path: sharePath(dialectId, phrase.id), title: `«${phrase.text}» بلهجة ${d.name}`, description: `بالفصحى: ${phrase.standard}. ${phrase.english}. ${phrase.noteAr ?? ''}`.trim(), imageAlt: `«${phrase.text}» بلهجة ${d.name}` }
  }),
  ...phrases.flatMap((p) =>
    dialects
      .filter((d) => d.id !== STANDARD_ID && p.variants[d.id])
      .map((d) => ({ path: sharePath(d.id, p.id), title: `«${p.variants[d.id]!.text}» بلهجة ${d.name}`, description: `بالفصحى: ${p.variants[STANDARD_ID]?.text ?? ''}. ${p.english}.`, imageAlt: `لهجة ${d.name} على الخريطة` })),
  ),
]

function headFor(p: Page) {
  const title = p.title ? `${p.title} | ${SITE_NAME}` : `${SITE_NAME} | ${slogan}`
  const url = SITE_URL + (p.path === '/' ? '/' : p.path)
  const image = SITE_URL + imageFor(p.path)
  const desc = p.description.replace(/\s+/g, ' ').slice(0, 300)
  const m = (k: string, v: string, attr = 'property') => `<meta ${attr}="${k}" content="${esc(v)}" />`
  return [
    `<title>${esc(title)}</title>`,
    m('description', desc, 'name'),
    `<link rel="canonical" href="${esc(url)}" />`,
    m('og:type', 'website'),
    m('og:site_name', SITE_NAME),
    m('og:locale', 'ar_AR'),
    m('og:locale:alternate', 'en_US'),
    m('og:title', title),
    m('og:description', desc),
    m('og:url', url),
    m('og:image', image),
    m('og:image:secure_url', image),
    m('og:image:type', 'image/jpeg'),
    m('og:image:width', String(W)),
    m('og:image:height', String(H)),
    m('og:image:alt', p.imageAlt),
    m('twitter:card', 'summary_large_image', 'name'),
    m('twitter:title', title, 'name'),
    m('twitter:description', desc, 'name'),
    m('twitter:image', image, 'name'),
    m('twitter:image:alt', p.imageAlt, 'name'),
  ].join('\n    ')
}

if (!only) {
  const template = readFileSync(join(DIST, 'index.html'), 'utf8')
    .replace(/\s*<title>[\s\S]*?<\/title>/, '')
    .replace(/\s*<meta name="description"[^>]*>/, '')
    .replace(/\s*<meta (property|name)="(og|twitter):[^>]*>/g, '')
  if (!template.includes('</head>')) throw new Error('dist/index.html has no </head>')
  for (const p of pages) {
    const html = template.replace('</head>', `  ${headFor(p)}\n  </head>`)
    const file = p.path === '/' ? join(DIST, 'index.html') : join(DIST, p.path, 'index.html')
    mkdirSync(dirname(file), { recursive: true })
    writeFileSync(file, html)
  }
  const today = new Date().toISOString().slice(0, 10)
  const urls = pages.filter((p) => p.sitemap).map((p) => `  <url><loc>${esc(SITE_URL + p.path)}</loc><lastmod>${today}</lastmod></url>`)
  writeFileSync(join(DIST, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`)
  writeFileSync(join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`)
  // Every card a page points at must exist.
  const missing = [...new Set(pages.map((p) => imageFor(p.path)))].filter((rel) => {
    try {
      readFileSync(join(DIST, rel))
      return false
    } catch {
      return true
    }
  })
  if (missing.length) throw new Error(`Pages point at cards that were not drawn: ${missing.slice(0, 5).join(', ')}`)
  console.log(`og: ${drawn} cards${failed.size ? ` (${failed.size} fell back to ${FALLBACK_IMAGE})` : ''} in ${((Date.now() - started) / 1000).toFixed(1)}s, ${pages.length} pages, ${urls.length} in the sitemap`)
} else {
  console.log(`og: ${drawn} cards`)
}
