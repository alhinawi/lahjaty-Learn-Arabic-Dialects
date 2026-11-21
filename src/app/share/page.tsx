import type { Metadata } from 'next'
import { Suspense } from 'react'
import ShareQueryPage from '../../screens/ShareQueryPage'
import { metadataFor } from '../../lib/seo'

// One static shell replaces tens of thousands of thin share exports.
// Social crawlers get generic metadata; the browser resolves the requested phrase.
export const metadata: Metadata = metadataFor('/share')

export default function Page() {
  return <Suspense><ShareQueryPage /></Suspense>
}
