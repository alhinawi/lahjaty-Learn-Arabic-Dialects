import type { Metadata } from 'next'
import JsonLd from '../components/JsonLd'
import HomePage from '../screens/HomePage'
import { metadataFor } from '../lib/seo'

export const metadata: Metadata = metadataFor('/')

export default function Page() {
  return (
    <>
      <JsonLd path="/" />
      <HomePage />
    </>
  )
}
