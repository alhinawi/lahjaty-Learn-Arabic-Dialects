import type { Metadata } from 'next'
import JsonLd from '../../components/JsonLd'
import SettingsPage from '../../screens/SettingsPage'
import { metadataFor } from '../../lib/seo'

export const metadata: Metadata = metadataFor('/settings')

export default function Page() {
  return (
    <>
      <JsonLd path="/settings" />
      <SettingsPage />
    </>
  )
}
