import { afterEach, describe, expect, it, vi } from 'vitest'

const storage = new Map<string, string>()
const fixture = { lang: 'en', theme: 'dark', dialectId: 'dam', showTranslit: true, myDialectId: 'cai', myDialectAsked: true, goal: 'travel', favorites: ['cai|greetings.how_are_you'], learned: { cai: ['greetings.hello'] }, quizzesTaken: 7, bestScores: { 'meaning|cai': 90 }, cards: {}, streak: { count: 2, last: '2026-11-23' }, practiceDays: ['2026-11-23'], seenBadges: ['first_word'], installSnoozedUntil: '2026-12-01' }
const setup = async (saved = true) => {
  vi.resetModules()
  storage.clear()
  if (saved) storage.set('lahjaty:v1', JSON.stringify({ version: 1, state: fixture }))
  vi.stubGlobal('window', { localStorage: { getItem: (k: string) => storage.get(k) ?? null, setItem: (k: string, v: string) => storage.set(k, v), removeItem: (k: string) => storage.delete(k) } })
  return import('./store')
}
afterEach(() => { vi.unstubAllGlobals(); vi.resetModules() })

describe('saved progress restoration', () => {
  it('leaves server defaults until explicitly restored, then keeps every stored field', async () => {
    const { useApp, restoreSavedProgress } = await setup()
    expect(useApp.persist.hasHydrated()).toBe(false)
    expect(useApp.getState().lang).toBe('ar')
    await restoreSavedProgress()
    expect(useApp.persist.hasHydrated()).toBe(true)
    for (const [key, value] of Object.entries(fixture)) expect(useApp.getState()[key as keyof typeof fixture]).toEqual(value)
    expect(JSON.parse(storage.get('lahjaty:v1')!).state).toEqual(fixture)
  })
  it('shares concurrent restores and never reapplies old values over later edits', async () => {
    const { useApp, restoreSavedProgress } = await setup()
    const rehydrate = vi.spyOn(useApp.persist, 'rehydrate')
    await Promise.all([restoreSavedProgress(), restoreSavedProgress()])
    expect(rehydrate).toHaveBeenCalledTimes(1)
    useApp.getState().setLang('ar')
    await restoreSavedProgress()
    expect(useApp.getState().lang).toBe('ar')
    expect(rehydrate).toHaveBeenCalledTimes(1)
  })
  it('finishes normally for a new guest with no saved progress', async () => {
    const { useApp, restoreSavedProgress } = await setup(false)
    await restoreSavedProgress()
    expect(useApp.persist.hasHydrated()).toBe(true)
    expect(useApp.getState().favorites).toEqual([])
    expect(useApp.getState().learned).toEqual({})
    expect(storage.size).toBe(0)
  })
})
