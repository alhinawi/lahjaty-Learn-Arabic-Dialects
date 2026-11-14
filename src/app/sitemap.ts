import type { MetadataRoute } from 'next'
import { SITE_URL } from '../lib/og'
import { seoCatalog } from '../lib/seo'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const today = new Date().toISOString().slice(0, 10)
  return seoCatalog()
    .filter((e) => e.sitemap)
    .map((e) => ({ url: SITE_URL + (e.path === '/' ? '/' : e.path), lastModified: today }))
}
