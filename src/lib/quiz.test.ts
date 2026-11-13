import { describe, expect, it } from 'vitest'
import { allFamous, dialects, famousFor, phrases, STANDARD_ID } from './content'
import { buildGuessQuiz, buildMatchQuiz, buildMeaningQuiz, seededRng, shuffle } from './quiz'

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

describe('buildGuessQuiz', () => {
  it('asks one famous phrase per dialect with one right answer', () => {
    const qs = buildGuessQuiz(allFamous, dialects, 10, seededRng(7), 4, phrases)
    expect(qs.length).toBe(10)
    expect(new Set(qs.map((q) => q.dialectId)).size).toBe(10)
    for (const q of qs) {
      expect(q.options).toContain(q.answer)
      expect(new Set(q.options).size).toBe(4)
      expect(q.options).not.toContain(STANDARD_ID)
      const text = q.phrase.variants[q.answer]!.text
      for (const o of q.options.filter((x) => x !== q.answer)) {
        expect(famousFor(o).some((f) => f.text === text)).toBe(false)
        expect(phrases.some((p) => p.variants[o]?.text === text)).toBe(false)
      }
    }
  })
})
