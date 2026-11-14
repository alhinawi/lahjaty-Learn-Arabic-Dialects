import { categories } from './content'

/** Why the visitor is learning. Picked in the welcome steps; it decides which situations the home page suggests first. */
export type GoalId = 'travel' | 'work' | 'friends' | 'media' | 'curious'

export const GOALS: { id: GoalId; categories: string[] }[] = [
  { id: 'travel', categories: ['travel', 'hotel', 'taxi', 'directions', 'emergency'] },
  { id: 'work', categories: ['work', 'phone', 'introductions', 'numbers'] },
  { id: 'friends', categories: ['greetings', 'family', 'compliments', 'occasions'] },
  { id: 'media', categories: ['slang', 'expressions', 'feelings', 'arguing'] },
  { id: 'curious', categories: ['greetings', 'food', 'weather', 'religious'] },
]

export const isGoal = (id: unknown): id is GoalId => GOALS.some((g) => g.id === id)

/** The situations to suggest for a goal, only the ones that exist in the content. */
export function goalCategories(goal: GoalId | null | undefined) {
  const ids = GOALS.find((g) => g.id === goal)?.categories ?? []
  return ids.map((id) => categories.find((c) => c.id === id)).filter((c): c is (typeof categories)[number] => !!c)
}

/** Dialects offered first in the "which dialect do you want to learn" step. */
export const SUGGESTED_TO_LEARN = ['cai', 'dam', 'leb', 'naj', 'kuw', 'bag', 'mar', 'tun']
