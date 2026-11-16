import type { Metadata } from 'next'
import JsonLd from '../../../components/JsonLd'
import RegionPage from '../../../screens/RegionPage'
import { WORD_GROUPS } from '../../../lib/content'
import type { WordGroup } from '../../../lib/types'
import { metadataFor } from '../../../lib/seo'

export const dynamicParams = false

export function generateStaticParams() {
  return WORD_GROUPS.map((group) => ({ group }))
}

interface Props {
  params: Promise<{ group: WordGroup }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { group } = await params
  return metadataFor(`/regions/${group}`)
}

export default async function Page({ params }: Props) {
  const { group } = await params
  return (
    <>
      <JsonLd path={`/regions/${group}`} />
      <RegionPage group={group} />
    </>
  )
}
