import { useMemo } from 'react'
import { computeStats, evaluateBadges, levelFor } from './achievements'
import { useApp } from './store'

/** Stats, level and badges for the current visitor, recomputed when their saved progress changes. */
export function useProgress() {
  const learned = useApp((s) => s.learned)
  const cards = useApp((s) => s.cards)
  const quizzesTaken = useApp((s) => s.quizzesTaken)
  const bestScores = useApp((s) => s.bestScores)
  const favorites = useApp((s) => s.favorites)
  const streak = useApp((s) => s.streak)
  const practiceDays = useApp((s) => s.practiceDays)
  return useMemo(() => {
    const stats = computeStats({ learned, cards, quizzesTaken, bestScores, favorites, streak, practiceDays })
    return { stats, level: levelFor(stats.xp), badges: evaluateBadges(stats) }
  }, [learned, cards, quizzesTaken, bestScores, favorites, streak, practiceDays])
}
