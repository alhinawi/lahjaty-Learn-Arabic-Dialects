import type { Metadata } from 'next'
import { Suspense } from 'react'
import JsonLd from '../../components/JsonLd'
import DialectsPage from '../../screens/DialectsPage'
import { metadataFor } from '../../lib/seo'

export const metadata: Metadata = metadataFor('/dialects')

export default function Page() {
  return (
    <>
      <JsonLd path="/dialects" />
      <Suspense><DialectsPage /></Suspense>
    </>
  )
}
