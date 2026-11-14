import { describe, expect, it } from 'vitest'
import { ACHIEVEMENTS, computeStats, evaluateBadges, levelFor, longestRun, masteredSituations, practiceDaySet, unlockedIds } from './achievements'
import { phrasesInCategory } from './content'
import { messages } from './i18n'
import type { ProgressSnapshot } from './achievements'

const empty: ProgressSnapshot = { learned: {}, cards: {}, quizzesTaken: 0, bestScores: {}, favorites: [], streak: { count: 0, last: '' }, practiceDays: [] }

describe('achievements', () => {
  it('nothing is unlocked at the start', () => {
    expect(unlockedIds(empty)).toEqual([])
    expect(levelFor(computeStats(empty).xp).level).toBe(1)
  })

  it('every badge has unique id and messages in both languages', () => {
    const ids = ACHIEVEMENTS.map((a) => a.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids)
      for (const lang of ['ar', 'en'] as const) {
        const m = messages[lang] as Record<string, string>
        expect(m[`badge_${id}`], `${lang} badge_${id}`).toBeTruthy()
        expect(m[`badge_${id}Body`], `${lang} badge_${id}Body`).toBeTruthy()
      }
  })

  it('counts streaks from saved days and from an older saved streak', () => {
    const days = practiceDaySet({ streak: { count: 3, last: '2026-11-14' }, practiceDays: ['2026-11-01', '2026-11-02'] })
    expect(days.has('2026-11-12')).toBe(true)
    expect(longestRun(days)).toBe(3)
    expect(longestRun(new Set(['2026-12-30', '2026-12-31', '2027-01-01']))).toBe(3)
  })

  it('a situation is mastered when every phrase the dialect has is learned', () => {
    const ids = phrasesInCategory('greetings').filter((p) => p.variants.cai).map((p) => p.id)
    expect(masteredSituations({ cai: ids.slice(1) })).toEqual([])
    expect(masteredSituations({ cai: ids })).toEqual([{ dialectId: 'cai', categoryId: 'greetings' }])
    const s = { ...empty, learned: { cai: ids } }
    expect(unlockedIds(s)).toContain('master_situation')
    expect(unlockedIds(s)).toContain('first_lesson')
  })

  it('known words count a phrase once even when learned and on a card', () => {
    const s = { ...empty, learned: { cai: ['greetings.hello'] }, cards: { 'cai|greetings.hello': { box: 2, due: '2026-11-20' }, 'tun|greetings.hello': { box: 0, due: '2026-11-14' } } }
    expect(computeStats(s).known).toBe(1)
    const b = evaluateBadges(computeStats(s)).find((x) => x.id === 'words_25')!
    expect(b).toMatchObject({ value: 1, goal: 25, unlocked: false })
  })

  it('levels grow with points', () => {
    expect(levelFor(99).level).toBe(1)
    expect(levelFor(100)).toEqual({ level: 2, from: 100, to: 300 })
    expect(levelFor(650).level).toBe(4)
  })
})
