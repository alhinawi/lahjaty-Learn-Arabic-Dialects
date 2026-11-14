import type { Metadata } from 'next'
import JsonLd from '../../components/JsonLd'
import LessonsPage from '../../screens/LessonsPage'
import { metadataFor } from '../../lib/seo'

export const metadata: Metadata = metadataFor('/lessons')

export default function Page() {
  return (
    <>
      <JsonLd path="/lessons" />
      <LessonsPage />
    </>
  )
}
