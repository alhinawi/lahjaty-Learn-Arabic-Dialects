import { describe, expect, it } from 'vitest'
import { dialects, phrases } from './content'
import { buildMatchQuiz, buildMeaningQuiz, seededRng, shuffle } from './quiz'

describe('shuffle', () => {
  it('keeps every item', () => {
    const out = shuffle([1, 2, 3, 4, 5], seededRng(1))
    expect([...out].sort()).toEqual([1, 2, 3, 4, 5])
  })
})

describe('meaning quiz', () => {
  it('builds 10 questions with 4 distinct options including the answer', () => {
    for (let seed = 1; seed <= 20; seed++) {
      const quiz = buildMeaningQuiz(phrases, 'cai', 10, seededRng(seed))
      expect(quiz).toHaveLength(10)
      expect(new Set(quiz.map((q) => q.phrase.id)).size).toBe(10)
      for (const q of quiz) {
        expect(q.options).toHaveLength(4)
        expect(new Set(q.options).size).toBe(4)
        expect(q.options).toContain(q.answer)
      }
    }
  })
})

describe('match quiz', () => {
  it('only offers wrong dialects that say the phrase differently', () => {
    for (let seed = 1; seed <= 20; seed++) {
      const quiz = buildMatchQuiz(phrases, dialects, 10, seededRng(seed))
      expect(quiz).toHaveLength(10)
      for (const q of quiz) {
        expect(q.options).toContain(q.answer)
        expect(new Set(q.options).size).toBe(q.options.length)
        const shown = q.phrase.variants[q.dialectId].text
        for (const other of q.options.filter((o) => o !== q.answer)) {
          expect(q.phrase.variants[other].text).not.toBe(shown)
        }
      }
    }
  })
})
