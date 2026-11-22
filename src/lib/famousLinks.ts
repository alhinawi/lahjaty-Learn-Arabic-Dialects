/** One stable target per famous entry on its dialect page. IDs are never derived from labels. */
export const famousEntryAnchor = (phraseId: string) => `entry-${phraseId}`

export const famousEntryHref = (dialectId: string, phraseId: string) =>
  `/dialects/${encodeURIComponent(dialectId)}/#${encodeURIComponent(famousEntryAnchor(phraseId))}`
