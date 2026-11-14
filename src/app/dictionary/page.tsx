import type { Metadata } from 'next'
import JsonLd from '../../components/JsonLd'
import DictionaryPage from '../../screens/DictionaryPage'
import { metadataFor } from '../../lib/seo'

export const metadata: Metadata = metadataFor('/dictionary')

export default function Page() {
  return (
    <>
      <JsonLd path="/dictionary" />
      <DictionaryPage />
    </>
  )
}
