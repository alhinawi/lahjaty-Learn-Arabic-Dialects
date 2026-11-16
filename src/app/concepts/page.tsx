import type { Metadata } from 'next'
import JsonLd from '../../components/JsonLd'
import ConceptsPage from '../../screens/ConceptsPage'
import { metadataFor } from '../../lib/seo'

export const metadata: Metadata = metadataFor('/concepts')

export default function Page() {
  return (
    <>
      <JsonLd path="/concepts" />
      <ConceptsPage />
    </>
  )
}
