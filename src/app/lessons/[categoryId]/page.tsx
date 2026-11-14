import type { Metadata } from 'next'
import JsonLd from '../../../components/JsonLd'
import LessonPage from '../../../screens/LessonPage'
import { metadataFor } from '../../../lib/seo'
import { categories } from '../../../lib/content'
export const dynamicParams = false

export function generateStaticParams() {
  return categories.map((c) => ({ categoryId: c.id }))
}

interface Props {
  params: Promise<{ categoryId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categoryId } = await params
  return metadataFor(`/lessons/${categoryId}`)
}

export default async function Page({ params }: Props) {
  const { categoryId } = await params
  return (
    <>
      <JsonLd path={`/lessons/${categoryId}`} />
      <LessonPage categoryId={categoryId} />
    </>
  )
}
