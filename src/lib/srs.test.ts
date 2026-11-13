import { describe, expect, it } from 'vitest'
import { addDays, bumpStreak, currentStreak, dueCount, MAX_BOX, review, sessionCards } from './srs'

describe('spaced repetition', () => {
  it('moves a remembered card up a box and further out in time', () => {
    const a = review(undefined, true, '2026-11-14')
    expect(a).toEqual({ box: 1, due: '2026-11-15' })
    const b = review(a, true, '2026-11-15')
    expect(b).toEqual({ box: 2, due: '2026-11-18' })
  })

  it('sends a forgotten card back to the start, due today', () => {
    expect(review({ box: 4, due: '2026-11-14' }, false, '2026-11-14')).toEqual({ box: 0, due: '2026-11-14' })
  })

  it('never goes past the last box', () => {
    let c = review(undefined, true, '2026-01-01')
    for (let i = 0; i < 20; i++) c = review(c, true, '2026-01-01')
    expect(c.box).toBe(MAX_BOX)
  })

  it('crosses months and years', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
    expect(addDays('2026-02-28', 1)).toBe('2026-03-01')
  })

  it('puts due cards first, then a few new ones', () => {
    const cards = { a: { box: 1, due: '2026-11-10' }, b: { box: 2, due: '2026-11-20' }, c: { box: 0, due: '2026-11-14' } }
    const s = sessionCards(['a', 'b', 'c', 'n1', 'n2', 'n3'], cards, '2026-11-14', 4, 2)
    expect(s).toEqual(['a', 'c', 'n1', 'n2'])
    expect(dueCount(['a', 'b', 'c'], cards, '2026-11-14')).toBe(2)
  })
})

describe('daily streak', () => {
  it('counts days in a row and starts over after a gap', () => {
    let s = bumpStreak({ count: 0, last: '' }, '2026-11-14')
    expect(s).toEqual({ count: 1, last: '2026-11-14' })
    s = bumpStreak(s, '2026-11-14')
    expect(s.count).toBe(1)
    s = bumpStreak(s, '2026-11-15')
    expect(s.count).toBe(2)
    expect(currentStreak(s, '2026-11-16')).toBe(2)
    expect(currentStreak(s, '2026-11-17')).toBe(0)
    expect(bumpStreak(s, '2026-11-18')).toEqual({ count: 1, last: '2026-11-18' })
  })
})
