import { getDialect, getFamous, isFamousId } from './content'
import { getEgyptNode } from './egypt'

/**
 * Where the site lives. Open Graph and Twitter need absolute links. Set VITE_SITE_URL (or SITE_URL) in the
 * host's build settings to change it, e.g. for a Cloudflare Pages domain.
 */
const viteEnv = (import.meta as { env?: Record<string, string | undefined> }).env
const nodeEnv = typeof process !== 'undefined' ? process.env : undefined
export const SITE_URL = (viteEnv?.VITE_SITE_URL || nodeEnv?.VITE_SITE_URL || nodeEnv?.SITE_URL || 'https://lahjaty.vercel.app').replace(/\/+$/, '')
export const SITE_NAME = 'لهجتي – Lahjaty'

/** The file name of a famous phrase's card: its id without the shared prefix. */
export const famousSlug = (id: string) => id.replace(/^famous\./, '')

const SECTIONS = new Set(['dialects', 'lessons', 'compare', 'practice', 'search', 'favorites', 'settings'])

/**
 * The social card for a page, as a path under the site. The build writes one PNG for each of these
 * (scripts/og), and the page's HTML and the running app both point at it.
 */
export function ogImageFor(pathname: string): string {
  const parts = pathname.replace(/\/+$/, '').split('/').filter(Boolean).map(decodeURIComponent)
  const [a, b, c] = parts
  if (a === 'dialects' && b && getDialect(b)) return `/og/dialects/${b}.jpg`
  if (a === 'egypt' && !b) return '/og/egypt.jpg'
  if (a === 'egypt' && b && getEgyptNode(b)) return `/og/egypt/${b}.jpg`
  if (a === 'share' && b && c && getDialect(b)) {
    if (isFamousId(c) && getFamous(b, c)) return `/og/p/${b}/${famousSlug(c)}.jpg`
    return `/og/dialects/${b}.jpg`
  }
  if (a === 'lessons' && b) return `/og/lessons/${b}.jpg`
  if (a && !b && SECTIONS.has(a)) return `/og/${a}.jpg`
  return '/og/home.jpg'
}

/** The link to share one phrase in one dialect. Its page carries the phrase's own card. */
export const sharePath = (dialectId: string, phraseId: string) => `/share/${dialectId}/${phraseId}`
