import type { Metadata } from 'next'
import JsonLd from '../../../components/JsonLd'
import EgyptNodePage from '../../../screens/EgyptNodePage'
import { metadataFor } from '../../../lib/seo'
import { allEgyptNodes } from '../../../lib/egypt'
export const dynamicParams = false

export function generateStaticParams() {
  return allEgyptNodes().map((n) => ({ nodeId: n.id }))
}

interface Props {
  params: Promise<{ nodeId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { nodeId } = await params
  return metadataFor(`/egypt/${nodeId}`)
}

export default async function Page({ params }: Props) {
  const { nodeId } = await params
  return (
    <>
      <JsonLd path={`/egypt/${nodeId}`} />
      <EgyptNodePage nodeId={nodeId} />
    </>
  )
}
