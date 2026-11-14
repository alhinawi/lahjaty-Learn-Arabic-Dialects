import type { Metadata } from 'next'
import { Suspense } from 'react'
import JsonLd from '../../../components/JsonLd'
import QuizPage from '../../../screens/QuizPage'
import { metadataFor } from '../../../lib/seo'

export const dynamicParams = false

export function generateStaticParams() {
  return ['meaning', 'match', 'guess'].map((mode) => ({ mode }))
}

interface Props {
  params: Promise<{ mode: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { mode } = await params
  return metadataFor(`/practice/${mode}`)
}

export default async function Page({ params }: Props) {
  const { mode } = await params
  return (
    <>
      <JsonLd path={`/practice/${mode}`} />
      <Suspense><QuizPage mode={mode} /></Suspense>
    </>
  )
}
