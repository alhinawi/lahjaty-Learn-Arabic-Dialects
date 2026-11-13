import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { DEFAULT_DIALECT } from './content'

export type Lang = 'ar' | 'en'
export type QuizMode = 'meaning' | 'match'
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
  favorites: string[]
  /** dialectId -> phrase ids marked as learned */
  learned: Record<string, string[]>
  /** best score per quiz, key "<mode>|<dialectId or all>" -> percent */
  bestScores: Record<string, number>
  quizzesTaken: number

  setLang: (lang: Lang) => void
  toggleLang: () => void
  setTheme: (theme: Theme) => void
  setDialect: (id: string) => void
  toggleTranslit: () => void
  setMyDialect: (id: string | null) => void
  skipMyDialect: () => void
  toggleFavorite: (dialectId: string, phraseId: string) => void
  toggleLearned: (dialectId: string, phraseId: string) => void
  recordQuiz: (mode: QuizMode, scope: string, correct: number, total: number) => void
  resetProgress: () => void
}

export const initialState = {
  lang: 'ar' as Lang,
  theme: 'system' as Theme,
  dialectId: DEFAULT_DIALECT,
  showTranslit: false,
  myDialectId: null as string | null,
  myDialectAsked: false,
  favorites: [] as string[],
  learned: {} as Record<string, string[]>,
  bestScores: {} as Record<string, number>,
  quizzesTaken: 0,
}

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
      toggleFavorite: (dialectId, phraseId) =>
        set((s) => ({ favorites: toggleIn(s.favorites, favKey(dialectId, phraseId)) })),
      toggleLearned: (dialectId, phraseId) =>
        set((s) => ({ learned: { ...s.learned, [dialectId]: toggleIn(s.learned[dialectId] ?? [], phraseId) } })),
      recordQuiz: (mode, scope, correct, total) =>
        set((s) => {
          const key = `${mode}|${scope}`
          const pct = total > 0 ? Math.round((correct / total) * 100) : 0
          return {
            quizzesTaken: s.quizzesTaken + 1,
            bestScores: { ...s.bestScores, [key]: Math.max(s.bestScores[key] ?? 0, pct) },
          }
        }),
      resetProgress: () => set({ learned: {}, bestScores: {}, quizzesTaken: 0 }),
    }),
    {
      name: 'lahjaty:v1',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        lang: s.lang,
        theme: s.theme,
        dialectId: s.dialectId,
        showTranslit: s.showTranslit,
        myDialectId: s.myDialectId,
        myDialectAsked: s.myDialectAsked,
        favorites: s.favorites,
        learned: s.learned,
        bestScores: s.bestScores,
        quizzesTaken: s.quizzesTaken,
      }),
    },
  ),
)
