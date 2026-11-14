import type { Metadata } from 'next'
import { Suspense } from 'react'
import JsonLd from '../../components/JsonLd'
import ComparePage from '../../screens/ComparePage'
import { metadataFor } from '../../lib/seo'

export const metadata: Metadata = metadataFor('/compare')

export default function Page() {
  return (
    <>
      <JsonLd path="/compare" />
      <Suspense><ComparePage /></Suspense>
    </>
  )
}
