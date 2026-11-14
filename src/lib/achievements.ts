/**
 * Progress, levels and badges, computed from what the browser already stores. Nothing is sent anywhere.
 * A badge is a threshold on one number; adding one is a line in ACHIEVEMENTS plus its two messages.
 */
import { categories, phrasesInCategory } from './content'
import { addDays, MAX_BOX } from './srs'
import type { CardState, Streak } from './srs'

export interface ProgressSnapshot {
  learned: Record<string, string[]>
  cards: Record<string, CardState>
  quizzesTaken: number
  bestScores: Record<string, number>
  favorites: string[]
  streak: Streak
  practiceDays?: string[]
}

/** Every day with practice: the saved days, plus the days the saved streak implies (older saves had only the streak). */
export function practiceDaySet(s: Pick<ProgressSnapshot, 'practiceDays' | 'streak'>): Set<string> {
  const days = new Set(s.practiceDays ?? [])
  if (s.streak.last) for (let i = 0; i < s.streak.count; i++) days.add(addDays(s.streak.last, -i))
  return days
}

/** The longest run of consecutive days in the set. */
export function longestRun(days: Set<string>): number {
  let best = 0
  for (const d of days) {
    if (days.has(addDays(d, -1))) continue
    let n = 1
    while (days.has(addDays(d, n))) n++
    best = Math.max(best, n)
  }
  return best
}

/** Situations fully learned in one dialect: every phrase of the situation that the dialect has. */
export function masteredSituations(learned: Record<string, string[]>): { dialectId: string; categoryId: string }[] {
  const out: { dialectId: string; categoryId: string }[] = []
  for (const [dialectId, ids] of Object.entries(learned)) {
    if (ids.length === 0) continue
    const set = new Set(ids)
    for (const c of categories) {
      const list = phrasesInCategory(c.id).filter((p) => p.variants[dialectId])
      if (list.length > 0 && list.every((p) => set.has(p.id))) out.push({ dialectId, categoryId: c.id })
    }
  }
  return out
}

export interface ProgressStats {
  /** Phrases learned plus flashcards remembered at least once, each phrase in each dialect counted once. */
  known: number
  learnedTotal: number
  dialectsStarted: number
  quizzes: number
  perfectQuizzes: number
  favorites: number
  bestStreak: number
  practiceDays: number
  mastered: number
  cardsMastered: number
  xp: number
}

export function computeStats(s: ProgressSnapshot): ProgressStats {
  const known = new Set<string>()
  for (const [d, ids] of Object.entries(s.learned)) for (const id of ids) known.add(`${d}|${id}`)
  for (const [k, c] of Object.entries(s.cards)) if (c.box >= 1) known.add(k)
  const days = practiceDaySet(s)
  const learnedTotal = Object.values(s.learned).reduce((n, ids) => n + ids.length, 0)
  const stats = {
    known: known.size,
    learnedTotal,
    dialectsStarted: Object.values(s.learned).filter((ids) => ids.length > 0).length,
    quizzes: s.quizzesTaken,
    perfectQuizzes: Object.values(s.bestScores).filter((v) => v >= 100).length,
    favorites: s.favorites.length,
    bestStreak: Math.max(longestRun(days), s.streak.count),
    practiceDays: days.size,
    mastered: masteredSituations(s.learned).length,
    cardsMastered: Object.values(s.cards).filter((c) => c.box >= MAX_BOX).length,
  }
  return { ...stats, xp: stats.known * 10 + stats.quizzes * 20 + stats.practiceDays * 15 + stats.mastered * 50 }
}

/** Level L starts at 50·L·(L−1) points: 0, 100, 300, 600, 1000... */
export const levelStart = (level: number) => 50 * level * (level - 1)
export function levelFor(xp: number): { level: number; from: number; to: number } {
  let level = 1
  while (xp >= levelStart(level + 1)) level++
  return { level, from: levelStart(level), to: levelStart(level + 1) }
}

export type BadgeIcon = 'lesson' | 'words' | 'flame' | 'quiz' | 'star' | 'crown' | 'compass' | 'heart' | 'layers'

export interface Achievement {
  id: string
  icon: BadgeIcon
  goal: number
  value: (s: ProgressStats) => number
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_lesson', icon: 'lesson', goal: 1, value: (s) => s.learnedTotal },
  { id: 'words_25', icon: 'words', goal: 25, value: (s) => s.known },
  { id: 'words_100', icon: 'words', goal: 100, value: (s) => s.known },
  { id: 'words_250', icon: 'words', goal: 250, value: (s) => s.known },
  { id: 'streak_3', icon: 'flame', goal: 3, value: (s) => s.bestStreak },
  { id: 'streak_7', icon: 'flame', goal: 7, value: (s) => s.bestStreak },
  { id: 'streak_30', icon: 'flame', goal: 30, value: (s) => s.bestStreak },
  { id: 'first_quiz', icon: 'quiz', goal: 1, value: (s) => s.quizzes },
  { id: 'perfect_quiz', icon: 'star', goal: 1, value: (s) => s.perfectQuizzes },
  { id: 'master_situation', icon: 'crown', goal: 1, value: (s) => s.mastered },
  { id: 'master_5', icon: 'crown', goal: 5, value: (s) => s.mastered },
  { id: 'explorer_3', icon: 'compass', goal: 3, value: (s) => s.dialectsStarted },
  { id: 'explorer_8', icon: 'compass', goal: 8, value: (s) => s.dialectsStarted },
  { id: 'collector_10', icon: 'heart', goal: 10, value: (s) => s.favorites },
  { id: 'card_master', icon: 'layers', goal: 1, value: (s) => s.cardsMastered },
]

export interface BadgeState {
  id: string
  icon: BadgeIcon
  goal: number
  value: number
  unlocked: boolean
}

export function evaluateBadges(stats: ProgressStats): BadgeState[] {
  return ACHIEVEMENTS.map((a) => {
    const value = Math.min(a.value(stats), a.goal)
    return { id: a.id, icon: a.icon, goal: a.goal, value, unlocked: value >= a.goal }
  })
}

export const unlockedIds = (s: ProgressSnapshot) =>
  evaluateBadges(computeStats(s))
    .filter((b) => b.unlocked)
    .map((b) => b.id)
