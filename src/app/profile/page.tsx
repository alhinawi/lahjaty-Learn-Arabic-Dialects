import type { Metadata } from 'next'
import JsonLd from '../../components/JsonLd'
import ProfilePage from '../../screens/ProfilePage'
import { metadataFor } from '../../lib/seo'

export const metadata: Metadata = metadataFor('/profile')

export default function Page() {
  return (
    <>
      <JsonLd path="/profile" />
      <ProfilePage />
    </>
  )
}
