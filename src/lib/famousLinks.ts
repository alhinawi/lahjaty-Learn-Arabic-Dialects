import { STANDARD_ID } from './content'

/** One stable target per famous entry on its dialect page. IDs are never derived from labels. */
export const famousEntryAnchor = (phraseId: string) => `entry-${phraseId}`

export const famousEntryHref = (dialectId: string, phraseId: string) =>
  dialectId === STANDARD_ID
    ? `/share/?dialect=${encodeURIComponent(dialectId)}&phrase=${encodeURIComponent(phraseId)}`
    : `/dialects/${encodeURIComponent(dialectId)}/#${encodeURIComponent(famousEntryAnchor(phraseId))}`
