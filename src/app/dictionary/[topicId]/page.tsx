import type { Metadata } from 'next'
import JsonLd from '../../../components/JsonLd'
import DictTopicPage from '../../../screens/DictTopicPage'
import { metadataFor } from '../../../lib/seo'
import { topicEntries } from '../../../lib/dictionaryAll'
export const dynamicParams = false

export function generateStaticParams() {
  return [...topicEntries.keys()].map((topicId) => ({ topicId }))
}

interface Props {
  params: Promise<{ topicId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { topicId } = await params
  return metadataFor(`/dictionary/${topicId}`)
}

export default async function Page({ params }: Props) {
  const { topicId } = await params
  return (
    <>
      <JsonLd path={`/dictionary/${topicId}`} />
      <DictTopicPage topicId={topicId} />
    </>
  )
}
