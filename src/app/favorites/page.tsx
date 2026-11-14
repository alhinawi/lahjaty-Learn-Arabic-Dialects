import type { Metadata } from 'next'
import JsonLd from '../../components/JsonLd'
import FavoritesPage from '../../screens/FavoritesPage'
import { metadataFor } from '../../lib/seo'

export const metadata: Metadata = metadataFor('/favorites')

export default function Page() {
  return (
    <>
      <JsonLd path="/favorites" />
      <FavoritesPage />
    </>
  )
}
