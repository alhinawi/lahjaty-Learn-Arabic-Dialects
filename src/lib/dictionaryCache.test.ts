import { beforeEach, describe, expect, it, vi } from 'vitest'
const fixtures = vi.hoisted(() => ({ effects: [] as (() => unknown)[], load: vi.fn(), first: { id: 'test.first', fs: 'أول', en: 'first', pos: 'n', words: {} }, second: { id: 'test.second', fs: 'ثان', en: 'second', pos: 'n', words: {} } }))
vi.mock('react', async (original) => ({ ...await original<typeof import('react')>(), useEffect: (fn: () => unknown) => fixtures.effects.push(fn), useState: (initial: unknown) => [typeof initial === 'function' ? initial() : initial, vi.fn()] }))
vi.mock('./dictionaryLoaders', () => ({ topicLoaders: { test: fixtures.load } }))
beforeEach(() => { vi.resetModules(); fixtures.effects = []; fixtures.load.mockReset(); fixtures.load.mockResolvedValue({ entries: [fixtures.first, fixtures.second] }) })
describe('complete dictionary topic cache', () => {
  it('shows a prerendered detail without turning its one entry into a complete cached topic', async () => {
    const { useEntry, loadTopic } = await import('./dictionary')
    expect(useEntry('test.first', fixtures.first as never)).toEqual(fixtures.first)
    for (const effect of fixtures.effects) effect()
    const entries = await loadTopic('test')
    expect(entries).toEqual([fixtures.first, fixtures.second])
    expect(fixtures.load).toHaveBeenCalledTimes(1)
    expect(useEntry('test.second')).toEqual(fixtures.second)
  })
  it('still seeds the cache from a complete prerendered topic', async () => {
    const { useTopic, loadTopic } = await import('./dictionary')
    const full = [fixtures.first, fixtures.second] as never
    expect(useTopic('test', full)).toEqual(full)
    for (const effect of fixtures.effects) effect()
    expect(await loadTopic('test')).toEqual(full)
    expect(fixtures.load).not.toHaveBeenCalled()
  })
  it('does not show an unrelated initial entry while another entry loads', async () => {
    const { useEntry } = await import('./dictionary')
    expect(useEntry('test.second', fixtures.first as never)).toBeNull()
    expect(useEntry(undefined, fixtures.first as never)).toBeUndefined()
  })
})
