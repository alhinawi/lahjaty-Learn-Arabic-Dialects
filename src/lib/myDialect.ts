import { famousFor, getConcept, getDialect, getPhrase, STANDARD_ID, wordGroup } from './content'
import type { FamousPhrase, Phrase } from './types'

/**
 * "My dialect" is the visitor's own Arabic dialect. Cards show the meaning in it first.
 * Nothing is returned when the visitor has none, picked Standard Arabic, or is looking at their own dialect.
 */
const usable = (myId: string | null | undefined, shownId: string) =>
  !!myId && myId !== STANDARD_ID && myId !== shownId && !!getDialect(myId)

/** The same everyday phrase in the visitor's dialect. */
export function baseInMyDialect(phrase: Phrase, shownId: string, myId: string | null | undefined): string | undefined {
  if (!usable(myId, shownId)) return undefined
  return phrase.variants[myId!]?.text
}

/**
 * The meaning of a famous phrase in the visitor's dialect: their own famous phrase with the same meaning,
 * then the everyday phrase with that meaning, then the everyday word of their region.
 * Undefined means the card falls back to Standard Arabic.
 */
export function famousInMyDialect(f: FamousPhrase, shownId: string, myId: string | null | undefined): string | undefined {
  if (!usable(myId, shownId) || !f.concept) return undefined
  const own = famousFor(myId!).find((x) => x.concept === f.concept)
  if (own) return own.text
  const concept = getConcept(f.concept)
  if (!concept) return undefined
  const base = getPhrase(concept.base)?.variants[myId!]?.text
  if (base) return base
  const group = wordGroup(getDialect(myId!))
  return group ? concept.words?.[group] : undefined
}
