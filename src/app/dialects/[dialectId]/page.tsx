import type { Metadata } from 'next'
import JsonLd from '../../../components/JsonLd'
import DialectPage from '../../../screens/DialectPage'
import { metadataFor } from '../../../lib/seo'
import { dialects, STANDARD_ID } from '../../../lib/content'
export const dynamicParams = false

export function generateStaticParams() {
  return dialects.filter((d) => d.id !== STANDARD_ID).map((d) => ({ dialectId: d.id }))
}

interface Props {
  params: Promise<{ dialectId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { dialectId } = await params
  return metadataFor(`/dialects/${dialectId}`)
}

export default async function Page({ params }: Props) {
  const { dialectId } = await params
  return (
    <>
      <JsonLd path={`/dialects/${dialectId}`} />
      <DialectPage dialectId={dialectId} />
    </>
  )
}
