import type { Metadata } from 'next'
import JsonLd from '../../../components/JsonLd'
import WordPage from '../../../screens/WordPage'
import { metadataFor } from '../../../lib/seo'
import { allDictEntries, dictEntryById } from '../../../lib/dictionaryAll'
export const dynamicParams = false

export function generateStaticParams() {
  return allDictEntries.map((e) => ({ entryId: e.id }))
}

interface Props {
  params: Promise<{ entryId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { entryId } = await params
  return metadataFor(`/word/${entryId}`)
}

export default async function Page({ params }: Props) {
  const { entryId } = await params
  return (
    <>
      <JsonLd path={`/word/${entryId}`} />
      <WordPage entryId={entryId} initialEntry={dictEntryById.get(entryId)} />
    </>
  )
}
