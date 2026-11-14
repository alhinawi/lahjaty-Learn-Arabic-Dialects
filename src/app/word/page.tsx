import type { Metadata } from 'next'
import JsonLd from '../../components/JsonLd'
import WordPage from '../../screens/WordPage'
import { metadataFor } from '../../lib/seo'

export const metadata: Metadata = metadataFor('/word')

export default function Page() {
  return (
    <>
      <JsonLd path="/word" />
      <WordPage />
    </>
  )
}
