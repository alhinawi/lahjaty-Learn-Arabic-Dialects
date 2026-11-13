import type { Dialect, Phrase } from './types'

export type Rng = () => number

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
 * "Which dialect is this sentence?". Wrong options are only dialects that say the
 * phrase differently, so there is always exactly one right answer.
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
      if (other === dialectId || !t || t === text) continue
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
