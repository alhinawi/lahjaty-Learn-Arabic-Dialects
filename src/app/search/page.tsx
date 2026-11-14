import type { Metadata } from 'next'
import { Suspense } from 'react'
import JsonLd from '../../components/JsonLd'
import SearchPage from '../../screens/SearchPage'
import { metadataFor } from '../../lib/seo'

export const metadata: Metadata = metadataFor('/search')

export default function Page() {
  return (
    <>
      <JsonLd path="/search" />
      <Suspense><SearchPage /></Suspense>
    </>
  )
}
