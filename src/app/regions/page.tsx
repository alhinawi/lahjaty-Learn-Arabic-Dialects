import type { Metadata } from 'next'
import JsonLd from '../../components/JsonLd'
import RegionsPage from '../../screens/RegionsPage'
import { metadataFor } from '../../lib/seo'

export const metadata: Metadata = metadataFor('/regions')

export default function Page() {
  return (
    <>
      <JsonLd path="/regions" />
      <RegionsPage />
    </>
  )
}
