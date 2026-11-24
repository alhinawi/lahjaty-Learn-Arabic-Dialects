import { getConcept, STANDARD_ID } from './content'
import type { FamousPhrase, Dialect, Phrase } from './types'

export type Rng = () => number

/** Conservative comparison for quiz ambiguity, never a claim about dialect ownership. */
export function quizTextKey(text: string): string {
  return text.normalize('NFKC')
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/[\p{P}\p{S}]/gu, ' ')
    .replace(/\s+/g, ' ').trim()
}

export function shuffle<T>(items: readonly T[], rng: Rng = Math.random): T[] {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export interface MeaningQuestion {
  kind: 'meaning'
  phrase: Phrase
  dialectId: string
  /** phrase ids, one of them is the answer */
  options: string[]
  answer: string
}

/** "Read or listen, then pick the meaning". */
export function buildMeaningQuiz(
  allPhrases: Phrase[],
  dialectId: string,
  count = 10,
  rng: Rng = Math.random,
  optionCount = 4,
): MeaningQuestion[] {
  return shuffle(allPhrases, rng)
    .slice(0, count)
    .map((phrase) => {
      const sameCategory = allPhrases.filter((p) => p.id !== phrase.id && p.category === phrase.category)
      const others = allPhrases.filter((p) => p.id !== phrase.id && p.category !== phrase.category)
      // Mix one or two from the same situation (harder) with random others.
      const pool = [...shuffle(sameCategory, rng).slice(0, 2), ...shuffle(others, rng)]
      const distractors: string[] = []
      for (const p of pool) {
        if (distractors.length >= optionCount - 1) break
        if (p.english !== phrase.english && !distractors.includes(p.id)) distractors.push(p.id)
      }
      return {
        kind: 'meaning' as const,
        phrase,
        dialectId,
        options: shuffle([phrase.id, ...distractors], rng),
        answer: phrase.id,
      }
    })
}

export interface MatchQuestion {
  kind: 'match'
  phrase: Phrase
  /** dialect whose sentence is shown */
  dialectId: string
  /** dialect ids, one of them is the answer */
  options: string[]
  answer: string
}

/**
 * "Which dialect is this sentence?". Wrong options exclude dialects with the same
 * normalized written phrase, so there is always exactly one right answer.
 */
export function buildMatchQuiz(
  allPhrases: Phrase[],
  pool: Dialect[],
  count = 10,
  rng: Rng = Math.random,
  optionCount = 4,
): MatchQuestion[] {
  const questions: MatchQuestion[] = []
  const ids = pool.map((d) => d.id)
  for (const phrase of shuffle(allPhrases, rng)) {
    if (questions.length >= count) break
    const dialectId = shuffle(ids, rng)[0]
    const text = phrase.variants[dialectId]?.text
    if (!text) continue
    const distractors: string[] = []
    for (const other of shuffle(ids, rng)) {
      if (distractors.length >= optionCount - 1) break
      const t = phrase.variants[other]?.text
      if (other === dialectId || !t || quizTextKey(t) === quizTextKey(text)) continue
      distractors.push(other)
    }
    if (distractors.length < 1) continue
    questions.push({
      kind: 'match',
      phrase,
      dialectId,
      options: shuffle([dialectId, ...distractors], rng),
      answer: dialectId,
    })
  }
  return questions
}

/** Small deterministic RNG for tests. */
export function seededRng(seed: number): Rng {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Guess from expressions already mapped to a recognized comparison concept, not
 * place names or other cultural encyclopedia entries. Full-corpus spelling
 * exclusions reduce ambiguity, but do not establish exclusive dialect ownership.
 */
export function buildGuessQuiz(
  famous: { dialectId: string; phrase: FamousPhrase }[],
  pool: Dialect[],
  count = 10,
  rng: Rng = Math.random,
  optionCount = 4,
  everyday: Phrase[] = [],
): MatchQuestion[] {
  const ids = pool.map((d) => d.id).filter((id) => id !== STANDARD_ID)

  // Words said the same way in many places («مرحبا») make a guess impossible, so a phrase is asked only
  // when no other dialect has the same words, among its famous phrases or its everyday ones.
  const owners = new Map<string, Set<string>>()
  const own = (text: string, id: string) => {
    const k = quizTextKey(text)
    if (!owners.has(k)) owners.set(k, new Set())
    owners.get(k)!.add(id)
  }
  for (const { dialectId, phrase } of famous) own(phrase.text, dialectId)
  for (const p of everyday) for (const [id, v] of Object.entries(p.variants)) if (id !== STANDARD_ID && v) own(v.text, id)
  const textsOf = new Map<string, Set<string>>()
  for (const { dialectId, phrase } of famous) {
    if (!textsOf.has(dialectId)) textsOf.set(dialectId, new Set())
    textsOf.get(dialectId)!.add(phrase.text)
  }
  const questions: MatchQuestion[] = []
  const usedDialects = new Set<string>()
  for (const { dialectId, phrase } of shuffle(famous, rng)) {
    if (questions.length >= count) break
    // one question per dialect in a round, so a round travels across the map
    if (usedDialects.has(dialectId) || !ids.includes(dialectId)) continue
    if (!phrase.concept || !getConcept(phrase.concept)) continue
    if ((owners.get(quizTextKey(phrase.text))?.size ?? 0) > 1) continue
    const distractors = shuffle(ids, rng)
      .filter((o) => o !== dialectId && !textsOf.get(o)?.has(phrase.text))
      .slice(0, optionCount - 1)
    if (distractors.length < optionCount - 1) continue
    usedDialects.add(dialectId)
    const asPhrase: Phrase = {
      id: phrase.id,
      category: 'famous',
      english: phrase.english,
      variants: { [dialectId]: { text: phrase.text }, [STANDARD_ID]: { text: phrase.standard } },
    } as Phrase
    questions.push({ kind: 'match', phrase: asPhrase, dialectId, options: shuffle([dialectId, ...distractors], rng), answer: dialectId })
  }
  return questions
}
