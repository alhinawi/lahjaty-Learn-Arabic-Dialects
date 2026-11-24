import { describe, expect, it } from 'vitest'
import { allFamous, dialects, famousFor, phrases, STANDARD_ID } from './content'
import { buildGuessQuiz, buildMatchQuiz, buildMeaningQuiz, seededRng, shuffle, quizTextKey } from './quiz'

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
          expect(quizTextKey(q.phrase.variants[other].text)).not.toBe(quizTextKey(shown))
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


describe('quiz spelling ambiguity', () => {
  it('ignores optional marks, alef spellings, spacing and punctuation but retains different consonants', () => {
    for (const [a, b] of [['قدمت استقالتي', 'قدّمت استقالتي'], ['عندكم آيس كريم؟', 'عندكم أيس كريم؟'], ['معك حق', 'معك حقّ'], ['أهلًا،  يا عم!', 'اهلا يا عم'], ['أَهْلًا', 'أهلا']]) expect(quizTextKey(a)).toBe(quizTextKey(b))
    expect(quizTextKey('قلب')).not.toBe(quizTextKey('كلب'))
    expect(quizTextKey('روّق')).not.toBe(quizTextKey('روح'))
  })
  it('excludes normalized matching wrong answers across100 deterministic corpus rounds', () => {
    for (let seed = 1; seed <= 100; seed++) for (const q of buildMatchQuiz(phrases, dialects, 10, seededRng(seed))) {
      const key = quizTextKey(q.phrase.variants[q.answer].text)
      for (const option of q.options.filter((id) => id !== q.answer)) expect(quizTextKey(q.phrase.variants[option].text)).not.toBe(key)
    }
  })
  it('does not offer an indistinguishable dialect even when every candidate matches', () => {
    const phrase = { ...phrases[0], variants: { a: { text: 'قدّمت استقالتي' }, b: { text: 'قدمت استقالتي' } } }
    expect(buildMatchQuiz([phrase], [{ ...dialects[0], id: 'a' }, { ...dialects[0], id: 'b' }], 10, seededRng(1))).toEqual([])
  })
})


describe('guess quiz normalized ownership', () => {
  it('checks normalized everyday and famous spellings across100 rounds', () => {
    const owners = new Map<string, Set<string>>()
    const add = (text: string, id: string) => { const key = quizTextKey(text); if (!owners.has(key)) owners.set(key, new Set()); owners.get(key)!.add(id) }
    for (const { dialectId, phrase } of allFamous) add(phrase.text, dialectId)
    for (const p of phrases) for (const [id, v] of Object.entries(p.variants)) if (id !== STANDARD_ID) add(v.text, id)
    for (let seed = 1; seed <= 100; seed++) {
      const qs = buildGuessQuiz(allFamous, dialects, 10, seededRng(seed), 4, phrases)
      expect(qs).toHaveLength(10)
      for (const q of qs) expect(owners.get(quizTextKey(q.phrase.variants[q.answer].text))).toEqual(new Set([q.answer]))
    }
  })
})
