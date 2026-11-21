'use client'

import { useSearchParams } from 'next/navigation'
import SharePage from './SharePage'

/** Legacy /share/dialect/phrase URLs redirect here with the same identifiers. */
export default function ShareQueryPage() {
  const params = useSearchParams()
  return <SharePage dialectId={params.get('dialect') ?? ''} phraseId={params.get('phrase') ?? ''} />
}
