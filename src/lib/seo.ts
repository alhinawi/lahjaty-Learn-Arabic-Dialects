import type { Metadata } from 'next'
import {
  categories,
  concepts,
  dialects,
  dialectsInGroup,
  famousByConcept,
  famousFor,
  getDialect,
  groupWords,
  STANDARD_ID,
  WORD_GROUPS,
} from './content'
import { allDictEntries, topicEntries } from './dictionaryAll'
import { allEgyptNodes } from './egypt'
import { translate, type MessageKey } from './i18n'
import type { WordGroup } from './types'
import { ogImageFor, SITE_NAME, SITE_URL } from './og'

/** The social cards are drawn 1200x630 (scripts/og). */
const OG_W = 1200
const OG_H = 630

const t = (k: Parameters<typeof translate>[1]) => translate('ar', k)
const slogan = t('heroTitle')

/** Arabic labels for the region hub pages, keyed like the client screens. */
const GROUP_SEO_KEY: Record<WordGroup, MessageKey> = {
  egypt: 'groupEgypt',
  sudan: 'groupSudan',
  levant: 'groupLevant',
  iraq: 'groupIraq',
  gulf: 'groupGulf',
  yemen: 'groupYemen',
  maghreb: 'groupMaghreb',
}

export interface SeoEntry {
  /** Site-relative path without a trailing slash; '/' for the home page. */
  path: string
  /** '' for the home page (its title is the site name and slogan). */
  title: string
  description: string
  imageAlt: string
  /**
   * Explicit indexing intent, decided per route type on its content:
   * true = canonical content page, listed in the sitemap and indexable;
   * false = interactive shell, personal page or share target, kept out of
   * the sitemap and served with robots noindex,follow. Required so a new
   * route cannot silently default either way; the coverage test in
   * seo.test.ts fails when a route type has no catalog entry at all.
   */
  sitemap: boolean
  /** Extra schema.org data for the page, added to its JSON-LD graph. */
  jsonLd?: Record<string, unknown>
}

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
  ['regions', t('regionsTitle'), t('regionsBody')],
  ['profile', t('profileTitle'), t('profilePrivate')],
]

/** schema.org ItemList for one index page, listing exactly the child pages that index links to. */
const itemList = (name: string, paths: string[]): Record<string, unknown> => ({
  '@type': 'ItemList',
  name,
  numberOfItems: paths.length,
  itemListElement: paths.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE_URL}${p}` })),
})

/** Concept pages the catalog actually ships: those with at least one dialect variant. */
const conceptPaths = concepts
  .filter((c) => famousByConcept(c.id).some((v) => v.dialectId !== STANDARD_ID))
  .map((c) => `/concepts/${c.id}`)

/** Index sections whose visible content is a list of child pages, as structured data. */
const sectionItemLists: Record<string, Record<string, unknown>> = {
  lessons: itemList(t('lessonsTitle'), categories.map((c) => `/lessons/${c.id}`)),
  dialects: itemList(t('allDialects'), dialects.filter((d) => d.id !== STANDARD_ID).map((d) => `/dialects/${d.id}`)),
  dictionary: itemList(t('dictTitle'), [...topicEntries.keys()].map((id) => `/dictionary/${id}`)),
  word: itemList(t('dictWordInAll'), allDictEntries.map((e) => `/word/${e.id}`)),
  concepts: itemList(t('conceptsTitle'), conceptPaths),
  regions: itemList(t('regionsTitle'), WORD_GROUPS.map((g) => `/regions/${g}`)),
}

/** Every prerendered page with its title, description and card: one catalog for metadata, sitemap and the og build. */
export function seoCatalog(): SeoEntry[] {
  return [
    { path: '/', title: '', description: `${slogan}. ${t('heroBody')}`, imageAlt: `لهجتي: ${slogan}`, sitemap: true },
    ...sections.map(([id, title, body]) => ({
      path: `/${id}`,
      title,
      description: `${body}. ${slogan}.`,
      imageAlt: `${title} – لهجتي`,
      // Interactive shells (pickers, personal pages, client-only tools) stay out of the sitemap and get noindex below.
      sitemap: !['favorites', 'settings', 'search', 'profile', 'compare'].includes(id),
      jsonLd: sectionItemLists[id],
    })),
    // Interactive drill modes: client-rendered shells, discoverable through the /practice landing.
    { path: '/practice/cards', title: t('modeCards'), description: `${t('modeCardsBody')}. ${slogan}.`, imageAlt: `${t('modeCards')} – لهجتي`, sitemap: false },
    ...(['meaning', 'match', 'guess'] as const).map((mode) => ({
      path: `/practice/${mode}`,
      title: t('practiceTitle'),
      description: `${t('practiceBody')}. ${slogan}.`,
      imageAlt: `${t('practiceTitle')} – لهجتي`,
      sitemap: false,
    })),
    ...categories.map((c) => ({
      path: `/lessons/${c.id}`,
      title: `${c.name} – ${t('lessonsTitle')}`,
      description: `جمل «${c.name}» بكل اللهجات العربية، مع المعنى بالفصحى والإنجليزي. ${slogan}.`,
      imageAlt: `${c.name} – لهجتي`,
      sitemap: true,
    })),
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
    ...[...topicEntries.keys()].map((id) => {
      const x = rawTopic(id)!
      return {
        path: `/dictionary/${id}`,
        title: `${x.name} – ${t('dictTitle')}`,
        description: `كلمات «${x.name}» بكل اللهجات العربية، مع المقابل بالفصحى والمعنى بالإنجليزي. ${slogan}.`,
        imageAlt: `${x.name} – قاموس لهجتي`,
        sitemap: true,
      }
    }),
    ...allDictEntries.map((e) => {
      const sample = Object.entries(e.words)
        .slice(0, 6)
        .map(([id, w]) => `${getDialect(id)?.name ?? id}: ${w}`)
        .join('، ')
      return {
        path: `/word/${e.id}`,
        title: `«${e.fs}» في كل لهجة`,
        description: `«${e.fs}» (${e.en}) بلهجات العرب: ${sample}.`,
        imageAlt: `«${e.fs}» في كل لهجة – لهجتي`,
        sitemap: true,
        jsonLd: {
          '@type': 'DefinedTerm',
          name: e.fs,
          alternateName: [...new Set(Object.values(e.words))].slice(0, 20),
          description: e.en,
          inDefinedTermSet: { '@type': 'DefinedTermSet', name: t('dictTitle'), url: `${SITE_URL}/dictionary` },
        },
      }
    }),
    { path: '/egypt', title: t('egyptTitle'), description: t('egyptBody'), imageAlt: 'خريطة لهجات مصر', sitemap: true },
    ...allEgyptNodes().map((n) => ({
      path: `/egypt/${n.id}`,
      title: `${n.name} – ${n.nameEn}`,
      description: n.summary?.ar ?? t('egyptBody'),
      imageAlt: `${n.name} على خريطة مصر`,
      sitemap: true,
    })),
    ...concepts
      .map((c) => ({ concept: c, variants: famousByConcept(c.id).filter((v) => v.dialectId !== STANDARD_ID) }))
      .filter((x) => x.variants.length > 0)
      .flatMap(({ concept, variants }) => {
        const sample = variants
          .slice(0, 6)
          .map((v) => `${getDialect(v.dialectId)?.name ?? v.dialectId}: ${v.phrase.text}`)
          .join('، ')
        const entry: SeoEntry = {
          path: `/concepts/${concept.id}`,
          title: `«${concept.name}» في كل اللهجات`,
          description: `معنى «${concept.name}» (${concept.nameEn}) بلهجات العرب: ${sample}.`,
          imageAlt: `«${concept.name}» في كل اللهجات – لهجتي`,
          sitemap: true,
          jsonLd: {
            '@type': 'DefinedTerm',
            name: concept.name,
            alternateName: [concept.nameEn, ...new Set(variants.map((v) => v.phrase.text))].slice(0, 20),
            inDefinedTermSet: { '@type': 'DefinedTermSet', name: t('conceptsTitle'), url: `${SITE_URL}/concepts` },
          },
        }
        return [entry]
      }),
    ...WORD_GROUPS.map((group) => {
      const label = t(GROUP_SEO_KEY[group])
      const groupDialects = dialectsInGroup(group)
      const words = groupWords(group)
      return {
        path: `/regions/${group}`,
        title: `لهجات ${label}`,
        description: `${groupDialects.length} لهجة في ${label}: ${groupDialects.map((d) => d.name).join('، ')}. والكلمة المميزة لـ${words.length} معنى.`,
        imageAlt: `لهجات ${label} – لهجتي`,
        sitemap: true,
        jsonLd: {
          '@type': 'CollectionPage',
          name: `لهجات ${label}`,
          about: label,
          isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
        },
      }
    }),
    {
      path: '/share',
      title: 'مشاركة جملة',
      description: 'جملة ومعناها من موسوعة لهجتي. افتح الرابط لعرض الجملة واللهجة.',
      imageAlt: 'لهجتي',
      sitemap: false,
    },
  ]
}

// Topic names come from the dictionary index; kept in one place with the eager entries.
import rawDictIndex from '../content/dictionary/index.json'
import type { DictIndex } from './types'
const dictTopicIndex = (rawDictIndex as DictIndex).topics
const rawTopic = (id: string) => dictTopicIndex.find((x) => x.id === id)

export const seoByPath = new Map(seoCatalog().map((e) => [e.path, e]))
export const seoFor = (path: string): SeoEntry => seoByPath.get(path) ?? seoByPath.get('/')!

export const fullTitle = (e: SeoEntry) => (e.title ? `${e.title} | ${SITE_NAME}` : `${SITE_NAME} | ${slogan}`)

/** The Next metadata for one prerendered page, mirroring the tags the og build used to inject. */
export function metadataFor(path: string): Metadata {
  const e = seoFor(path)
  const title = fullTitle(e)
  const description = e.description.replace(/\s+/g, ' ').slice(0, 300)
  const url = path === '/' ? '/' : path
  const image = SITE_URL + ogImageFor(path)
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    // Out-of-sitemap pages are interactive shells or share targets: keep them findable through links, out of the index.
    robots: e.sitemap ? undefined : { index: false, follow: true },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      locale: 'ar_AR',
      alternateLocale: 'en_US',
      title,
      description,
      url,
      images: [{ url: image, secureUrl: image, type: 'image/jpeg', width: OG_W, height: OG_H, alt: e.imageAlt }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [{ url: image, alt: e.imageAlt }] },
  }
}

const website = {
  '@type': 'WebSite',
  name: SITE_NAME,
  alternateName: 'Lahjaty',
  url: `${SITE_URL}/`,
  description: `${slogan}. ${translate('en', 'heroTitle')}.`,
  inLanguage: ['ar', 'en'],
  potentialAction: { '@type': 'SearchAction', target: `${SITE_URL}/search?q={search_term_string}`, 'query-input': 'required name=search_term_string' },
}

/** Home > section > page, from the pages that exist at each step of the path. */
function breadcrumbs(path: string) {
  const parts = path.split('/').filter(Boolean)
  if (parts.length < 2 || path.startsWith('/share/')) return null
  const items = [{ name: SITE_NAME, url: `${SITE_URL}/` }]
  for (let i = 1; i <= parts.length; i++) {
    const sub = '/' + parts.slice(0, i).join('/')
    const name = seoByPath.get(sub)?.title
    if (name) items.push({ name, url: SITE_URL + sub })
  }
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((x, i) => ({ '@type': 'ListItem', position: i + 1, name: x.name, item: x.url })),
  }
}

/** The JSON-LD script body for one page ('' escaped so no text can close the tag), or null. */
export function jsonLdFor(path: string): string | null {
  const e = seoFor(path)
  const graph = [path === '/' ? website : null, breadcrumbs(path), e.jsonLd ?? null].filter(Boolean)
  if (!graph.length) return null
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c')
}
