import type { Metadata } from 'next'
import JsonLd from '../../../components/JsonLd'
import FlashcardsPage from '../../../screens/FlashcardsPage'
import { metadataFor } from '../../../lib/seo'

export const metadata: Metadata = metadataFor('/practice/cards')

export default function Page() {
  return (
    <>
      <JsonLd path="/practice/cards" />
      <FlashcardsPage />
    </>
  )
}
