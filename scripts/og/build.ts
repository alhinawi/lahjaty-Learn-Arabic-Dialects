/**
 * After `next build`: draws the social cards into out/og. The prerendered pages (Next static export)
 * already carry their own title, description, Open Graph and Twitter tags, JSON-LD, sitemap.xml and
 * robots.txt; this script only draws the images they point at. Any card that fails to draw is replaced
 * by a copy of public/og-default.jpg, so no page ever points at a missing image.
 *
 *   npx tsx scripts/og/build.ts            (the build runs it)
 *   npx tsx scripts/og/build.ts --only home,dialects/cai --out /tmp/og   (draw a few cards to look at)
 */
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { allFamous, categories, dialects, famousFor, getDialect, getPhrase, phrases, regions, STANDARD_ID } from '../../src/lib/content'
import { allEgyptNodes, egyptAncestors, egyptRegions } from '../../src/lib/egypt'
import { translate } from '../../src/lib/i18n'
import { famousSlug, ogImageFor, SITE_URL } from '../../src/lib/og'
import { seoCatalog } from '../../src/lib/seo'
import { readDictionary } from '../lib/dictionary'

/**
 * The card renderer needs native packages (resvg, sharp). When a build image cannot load them, or OG_SKIP=1,
 * every card slot gets a copy of the prebuilt card committed in public/og-default.jpg instead.
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
const DIST = outIdx >= 0 ? args[outIdx + 1] : 'out'
const SITE = SITE_URL.replace(/^https?:\/\//, '')
const t = (k: Parameters<typeof translate>[1]) => translate('ar', k)

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

// The most famous phrase of each country, from its flagship dialect in famous.json. If a phrase text
// ever disappears from the content, the dialect's first famous phrase takes its place, so the card
// always builds and always matches the site.
const COUNTRY_PICKS: [string, string][] = [
  ['cai', 'يا عم'],
  ['sud', 'يا زول'],
  ['chd', 'لافي'],
  ['dam', 'شو؟'],
  ['leb', 'يا عيني'],
  ['psu', 'على راسي'],
  ['jor', 'نشمي'],
  ['bag', 'شلونك؟'],
  ['naj', 'أبشر'],
  ['kuw', 'صج؟'],
  ['emi', 'حيّاك'],
  ['qat', 'إشحالك؟'],
  ['bah', 'يا حلاته'],
  ['oma', 'واجد'],
  ['san', 'ما بش'],
  ['mar', 'واخا'],
  ['alg', 'واش راك؟'],
  ['tun', 'عسلامة'],
  ['tri', 'هلبة'],
  ['has', 'شتاري؟'],
]
const countryPicks = COUNTRY_PICKS.map(([dialectId, wanted]) => {
  const d = getDialect(dialectId)!
  const fam = famousFor(dialectId)
  const f = fam.find((x) => x.text === wanted) ?? fam[0]!
  return { country: d.country ?? d.name, phrase: f.text, lonLat: [d.lon ?? 0, d.lat ?? 0] as [number, number] }
})
draw('/og/home.jpg', (c) => c.homeMapCard({ slogan, sloganEn, picks: countryPicks }))
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
  ['concepts', t('conceptsTitle'), t('conceptsBody')],
  ['profile', t('profileTitle'), t('profilePrivate')],
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

// ---------- verification ----------
// Every page's metadata points at a card (src/lib/seo.ts + src/lib/og.ts); the card must exist.
// A slot whose card failed to draw gets a copy of the prebuilt default card instead.
if (!only) {
  const needed = [...new Set(seoCatalog().map((e) => ogImageFor(e.path)))]
  let filled = 0
  for (const rel of needed) {
    if (!existsSync(join(DIST, rel))) {
      const file = join(DIST, rel)
      mkdirSync(dirname(file), { recursive: true })
      copyFileSync('public/og-default.jpg', file)
      filled++
    }
  }
  console.log(
    `og: ${drawn} cards in ${((Date.now() - started) / 1000).toFixed(1)}s, ${needed.length} slots checked` +
      (filled ? `, ${filled} filled with ${FALLBACK_IMAGE}` : '') +
      (failed.size ? ` (${failed.size} failed)` : ''),
  )
} else {
  console.log(`og: ${drawn} cards`)
}
