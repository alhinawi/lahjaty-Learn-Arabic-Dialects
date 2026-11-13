/**
 * Flashcards with spaced repetition (Leitner boxes) and the daily practice streak.
 * Days are local calendar days as YYYY-MM-DD, so a review late at night still counts for that day.
 */

export interface CardState {
  /** 0 = new or forgotten; each right answer moves it up one box. */
  box: number
  /** The day it is due again. */
  due: string
}

export interface Streak {
  count: number
  /** The last day with practice, or '' before the first. */
  last: string
}

/** Days until the next review for each box. */
export const BOX_DAYS = [0, 1, 3, 7, 14, 30]
export const MAX_BOX = BOX_DAYS.length - 1

export function dayKey(d: Date = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function addDays(day: string, n: number): string {
  const [y, m, d] = day.split('-').map(Number)
  return dayKey(new Date(y, m - 1, d + n))
}

/** The card after one answer: up a box when remembered, back to the start when not. */
export function review(card: CardState | undefined, remembered: boolean, today: string): CardState {
  if (!remembered) return { box: 0, due: today }
  const box = Math.min((card?.box ?? 0) + 1, MAX_BOX)
  return { box, due: addDays(today, BOX_DAYS[box]) }
}

/** Cards for one session: the due ones first (most overdue first), then new ones, up to size. */
export function sessionCards(keys: string[], cards: Record<string, CardState>, today: string, size = 12, newLimit = 6): string[] {
  const due = keys.filter((k) => cards[k] && cards[k].due <= today).sort((a, b) => (cards[a].due < cards[b].due ? -1 : cards[a].due > cards[b].due ? 1 : cards[a].box - cards[b].box))
  const fresh = keys.filter((k) => !cards[k])
  const out = due.slice(0, size)
  for (const k of fresh) {
    if (out.length >= size || out.length - Math.min(due.length, size) >= newLimit) break
    out.push(k)
  }
  return out
}

/** How many cards are due today among keys. */
export const dueCount = (keys: string[], cards: Record<string, CardState>, today: string) => keys.filter((k) => cards[k] && cards[k].due <= today).length

/** The streak after practising today: same day keeps it, the next day adds one, a gap starts over. */
export function bumpStreak(s: Streak, today: string): Streak {
  if (s.last === today) return s
  if (s.last && addDays(s.last, 1) === today) return { count: s.count + 1, last: today }
  return { count: 1, last: today }
}

/** The streak as it stands today: it is lost once a whole day went by with no practice. */
export function currentStreak(s: Streak, today: string): number {
  if (!s.last) return 0
  if (s.last === today || addDays(s.last, 1) === today) return s.count
  return 0
}
