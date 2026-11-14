import type { Metadata } from 'next'
import JsonLd from '../../components/JsonLd'
import PracticePage from '../../screens/PracticePage'
import { metadataFor } from '../../lib/seo'

export const metadata: Metadata = metadataFor('/practice')

export default function Page() {
  return (
    <>
      <JsonLd path="/practice" />
      <PracticePage />
    </>
  )
}
