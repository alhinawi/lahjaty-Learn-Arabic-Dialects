import type { Metadata } from 'next'
import JsonLd from '../../../../components/JsonLd'
import SharePage from '../../../../screens/SharePage'
import { allFamous, dialects, phrases, STANDARD_ID } from '../../../../lib/content'
import { metadataFor } from '../../../../lib/seo'

export const dynamicParams = false

export function generateStaticParams() {
  const famous = allFamous.map(({ dialectId, phrase }) => ({ dialectId, phraseId: phrase.id }))
  const everyday = phrases.flatMap((p) =>
    dialects.filter((d) => d.id !== STANDARD_ID && p.variants[d.id]).map((d) => ({ dialectId: d.id, phraseId: p.id })),
  )
  return [...famous, ...everyday]
}

interface Props {
  params: Promise<{ dialectId: string; phraseId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { dialectId, phraseId } = await params
  return metadataFor(`/share/${dialectId}/${phraseId}`)
}

export default async function Page({ params }: Props) {
  const { dialectId, phraseId } = await params
  return (
    <>
      <JsonLd path={`/share/${dialectId}/${phraseId}`} />
      <SharePage dialectId={dialectId} phraseId={phraseId} />
    </>
  )
}
