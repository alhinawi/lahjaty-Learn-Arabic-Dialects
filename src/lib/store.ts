import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { StateStorage } from 'zustand/middleware'
import { bumpStreak, dayKey, review } from './srs'
import type { CardState, Streak } from './srs'
import { DEFAULT_DIALECT } from './content'
import type { GoalId } from './goals'

export type Lang = 'ar' | 'en'
export type QuizMode = 'meaning' | 'match' | 'guess'
export type Theme = 'light' | 'dark' | 'system'

/** A favorite is one phrase in one dialect: "<dialectId>|<phraseId>". */
export const favKey = (dialectId: string, phraseId: string) => `${dialectId}|${phraseId}`
export const parseFavKey = (key: string) => {
  const [dialectId, phraseId] = key.split('|')
  return { dialectId, phraseId }
}

export interface AppState {
  lang: Lang
  theme: Theme
  dialectId: string
  showTranslit: boolean
  /** The visitor's own dialect; cards show meanings in it first. Null when not picked. */
  myDialectId: string | null
  /** True once the first-visit question about the visitor's dialect was answered or skipped. */
  myDialectAsked: boolean
  /** Why the visitor is learning, from the welcome steps. */
  goal: GoalId | null
  favorites: string[]
  /** dialectId -> phrase ids marked as learned */
  learned: Record<string, string[]>
  /** best score per quiz, key "<mode>|<dialectId or all>" -> percent */
  bestScores: Record<string, number>
  quizzesTaken: number
  /** Flashcards: "<dialectId>|<phraseId>" -> box and due day. */
  cards: Record<string, CardState>
  streak: Streak
  /** Days with any practice (YYYY-MM-DD), for the calendar on the profile page. */
  practiceDays: string[]
  /** Badges the visitor was already told about. Null until the first check, which tells nothing. */
  seenBadges: string[] | null
  /** The install card stays away until this day (YYYY-MM-DD) after "not now". */
  installSnoozedUntil: string

  setLang: (lang: Lang) => void
  toggleLang: () => void
  setTheme: (theme: Theme) => void
  setDialect: (id: string) => void
  toggleTranslit: () => void
  setMyDialect: (id: string | null) => void
  skipMyDialect: () => void
  /** Ends the welcome steps with the visitor's answers. */
  finishOnboarding: (answers: { myDialectId: string | null; goal: GoalId | null; dialectId: string }) => void
  /** Shows the welcome steps again. */
  restartOnboarding: () => void
  toggleFavorite: (dialectId: string, phraseId: string) => void
  toggleLearned: (dialectId: string, phraseId: string) => void
  recordQuiz: (mode: QuizMode, scope: string, correct: number, total: number) => void
  resetProgress: () => void
  reviewCard: (key: string, remembered: boolean) => void
  /** Counts today as a practice day. */
  markPracticed: () => void
  markBadgesSeen: (ids: string[]) => void
  snoozeInstall: (until: string) => void
}

/** Keeps a short history of practice days: enough for a year of calendar. */
const MAX_DAYS = 400
export const withDay = (days: string[], today: string) => (days.includes(today) ? days : [...days, today].slice(-MAX_DAYS))
/** One practice today: the streak and the calendar both count it. */
const practised = (s: Pick<AppState, 'streak' | 'practiceDays'>, today = dayKey()) => ({
  streak: bumpStreak(s.streak, today),
  practiceDays: withDay(s.practiceDays, today),
})

export const initialState = {
  lang: 'ar' as Lang,
  theme: 'system' as Theme,
  dialectId: DEFAULT_DIALECT,
  showTranslit: false,
  myDialectId: null as string | null,
  myDialectAsked: false,
  goal: null as GoalId | null,
  favorites: [] as string[],
  learned: {} as Record<string, string[]>,
  bestScores: {} as Record<string, number>,
  quizzesTaken: 0,
  cards: {} as Record<string, CardState>,
  streak: { count: 0, last: '' } as Streak,
  practiceDays: [] as string[],
  seenBadges: null as string[] | null,
  installSnoozedUntil: '',
}

const noopStorage: StateStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} }

const toggleIn = (list: string[], item: string) =>
  list.includes(item) ? list.filter((x) => x !== item) : [...list, item]

export const useApp = create<AppState>()(
  persist(
    (set) => ({
      ...initialState,
      setLang: (lang) => set({ lang }),
      toggleLang: () => set((s) => ({ lang: s.lang === 'ar' ? 'en' : 'ar' })),
      setTheme: (theme) => set({ theme }),
      setDialect: (dialectId) => set({ dialectId }),
      toggleTranslit: () => set((s) => ({ showTranslit: !s.showTranslit })),
      setMyDialect: (myDialectId) => set({ myDialectId, myDialectAsked: true }),
      skipMyDialect: () => set({ myDialectAsked: true }),
      finishOnboarding: ({ myDialectId, goal, dialectId }) => set({ myDialectId, goal, dialectId, myDialectAsked: true }),
      restartOnboarding: () => set({ myDialectAsked: false }),
      toggleFavorite: (dialectId, phraseId) =>
        set((s) => ({ favorites: toggleIn(s.favorites, favKey(dialectId, phraseId)) })),
      toggleLearned: (dialectId, phraseId) =>
        set((s) => {
          const list = s.learned[dialectId] ?? []
          const adding = !list.includes(phraseId)
          return { learned: { ...s.learned, [dialectId]: toggleIn(list, phraseId) }, ...(adding ? practised(s) : {}) }
        }),
      recordQuiz: (mode, scope, correct, total) =>
        set((s) => {
          const key = `${mode}|${scope}`
          const pct = total > 0 ? Math.round((correct / total) * 100) : 0
          return {
            ...practised(s),
            quizzesTaken: s.quizzesTaken + 1,
            bestScores: { ...s.bestScores, [key]: Math.max(s.bestScores[key] ?? 0, pct) },
          }
        }),
      resetProgress: () =>
        set({ learned: {}, bestScores: {}, quizzesTaken: 0, cards: {}, streak: { count: 0, last: '' }, practiceDays: [], seenBadges: [] }),
      reviewCard: (key, remembered) =>
        set((s) => {
          const today = dayKey()
          return { cards: { ...s.cards, [key]: review(s.cards[key], remembered, today) }, ...practised(s, today) }
        }),
      markPracticed: () => set((s) => practised(s)),
      snoozeInstall: (until) => set({ installSnoozedUntil: until }),
      markBadgesSeen: (ids) => set((s) => ({ seenBadges: [...new Set([...(s.seenBadges ?? []), ...ids])] })),
    }),
    {
      name: 'lahjaty:v1',
      version: 1,
      // Pages are prerendered with the default state; rehydrating synchronously on the client would make the
      // first client render differ from the served HTML and React would discard the whole prerendered tree.
      // AppShell calls useApp.persist.rehydrate() after mount instead, and store-driven UI fills in then.
      skipHydration: true,
      // On the server (build-time prerender) there is no localStorage: persist nothing, rehydrate on the client.
      storage: createJSONStorage(() => (typeof window === 'undefined' ? noopStorage : window.localStorage)),
      partialize: (s) => ({
        lang: s.lang,
        theme: s.theme,
        dialectId: s.dialectId,
        showTranslit: s.showTranslit,
        myDialectId: s.myDialectId,
        myDialectAsked: s.myDialectAsked,
        goal: s.goal,
        favorites: s.favorites,
        learned: s.learned,
        bestScores: s.bestScores,
        quizzesTaken: s.quizzesTaken,
        cards: s.cards,
        streak: s.streak,
        practiceDays: s.practiceDays,
        seenBadges: s.seenBadges,
        installSnoozedUntil: s.installSnoozedUntil,
      }),
    },
  ),
)

