import type { Metadata } from 'next'
import JsonLd from '../../../components/JsonLd'
import ConceptPage from '../../../screens/ConceptPage'
import { concepts, famousByConcept, STANDARD_ID } from '../../../lib/content'
import { metadataFor } from '../../../lib/seo'

export const dynamicParams = false

export function generateStaticParams() {
  return concepts
    .filter((c) => famousByConcept(c.id).some((v) => v.dialectId !== STANDARD_ID))
    .map((c) => ({ conceptId: c.id }))
}

interface Props {
  params: Promise<{ conceptId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { conceptId } = await params
  return metadataFor(`/concepts/${conceptId}`)
}

export default async function Page({ params }: Props) {
  const { conceptId } = await params
  return (
    <>
      <JsonLd path={`/concepts/${conceptId}`} />
      <ConceptPage conceptId={conceptId} />
    </>
  )
}
