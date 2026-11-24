import { beforeEach, describe, expect, it, vi } from 'vitest'
const mocks = vi.hoisted(() => ({ restore: vi.fn(), getMe: vi.fn(), getProgress: vi.fn(), putProgress: vi.fn(), snapshot: { lang: 'en', favorites: ['cai|greetings.hello'] }, state: vi.fn(), subscribe: vi.fn(() => vi.fn()) }))
vi.mock('./store', () => ({ restoreSavedProgress: mocks.restore, useApp: { getState: () => mocks.snapshot, setState: mocks.state, subscribe: mocks.subscribe } }))
vi.mock('./api', () => ({ apiGetMe: mocks.getMe, apiGetProgress: mocks.getProgress, apiPutProgress: mocks.putProgress, apiLogout: vi.fn(), clearApiToken: vi.fn(), getApiToken: vi.fn() }))
import { completeSignIn } from './auth'
beforeEach(() => { vi.clearAllMocks(); mocks.getMe.mockResolvedValue({ user: { id: 'test' } }); mocks.putProgress.mockResolvedValue(undefined) })
describe('account sync after local restore', () => {
  it('waits for local restore before reading the account or uploading device progress', async () => {
    let release!: () => void
    mocks.restore.mockImplementationOnce(() => new Promise<void>((r) => { release = r }))
    mocks.getProgress.mockResolvedValueOnce(null)
    const signingIn = completeSignIn('test-token')
    expect(mocks.getMe).not.toHaveBeenCalled()
    expect(mocks.putProgress).not.toHaveBeenCalled()
    release()
    await signingIn
    expect(mocks.putProgress).toHaveBeenCalledWith('test-token', expect.objectContaining(mocks.snapshot))
  })
  it('retains the existing account-wins policy without uploading local data back', async () => {
    mocks.restore.mockResolvedValueOnce(undefined)
    mocks.getProgress.mockResolvedValueOnce({ progress: { lang: 'ar' } })
    await completeSignIn('test-token')
    expect(mocks.state).toHaveBeenCalledWith({ lang: 'ar' })
    expect(mocks.putProgress).not.toHaveBeenCalled()
  })
})
