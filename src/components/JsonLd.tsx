import { jsonLdFor } from '../lib/seo'

/** Server component: the page's JSON-LD graph (website, breadcrumbs, plus per-page data). */
export default function JsonLd({ path }: { path: string }) {
  const json = jsonLdFor(path)
  if (!json) return null
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
}
