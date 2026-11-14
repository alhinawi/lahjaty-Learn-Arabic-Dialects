import type { Metadata } from 'next'
import JsonLd from '../../components/JsonLd'
import EgyptPage from '../../screens/EgyptPage'
import { metadataFor } from '../../lib/seo'

export const metadata: Metadata = metadataFor('/egypt')

export default function Page() {
  return (
    <>
      <JsonLd path="/egypt" />
      <EgyptPage />
    </>
  )
}
