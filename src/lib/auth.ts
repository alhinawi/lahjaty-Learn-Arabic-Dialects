'use client'

// ==============================================================================
// Account session state + progress sync for the Lahjaty backend (see api.ts).
// The token lives in localStorage (api.ts); this module tracks who is signed in
// and mirrors the app's persisted progress blob to the account while signed in.
// ==============================================================================

import { create } from 'zustand'
import { restoreSavedProgress, useApp } from './store'
import {
  apiGetMe,
  apiGetProgress,
  apiLogout,
  apiPutProgress,
  clearApiToken,
  getApiToken,
  type ApiUser,
} from './api'

interface AuthState {
  /** The signed-in account, or null for a guest. */
  user: ApiUser | null
  setUser: (user: ApiUser | null) => void
}

export const useAuth = create<AuthState>()((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}))

// The progress fields mirrored to the account: the same list the store persists.
const PROGRESS_KEYS = [
  'lang',
  'theme',
  'dialectId',
  'showTranslit',
  'myDialectId',
  'myDialectAsked',
  'goal',
  'favorites',
  'learned',
  'bestScores',
  'quizzesTaken',
  'cards',
  'streak',
  'practiceDays',
  'seenBadges',
  'installSnoozedUntil',
] as const

type ProgressSnapshot = Record<string, unknown>

export function snapshotProgress(): ProgressSnapshot {
  const s = useApp.getState() as unknown as Record<string, unknown>
  const out: ProgressSnapshot = {}
  for (const k of PROGRESS_KEYS) out[k] = s[k]
  return out
}

function applyProgress(progress: unknown): void {
  if (typeof progress !== 'object' || progress === null || Array.isArray(progress)) return
  const incoming = progress as Record<string, unknown>
  const clean: Record<string, unknown> = {}
  for (const k of PROGRESS_KEYS) if (k in incoming) clean[k] = incoming[k]
  useApp.setState(clean)
}

// ---------- sync plumbing ----------

let unsubscribe: (() => void) | null = null
let pushTimer: ReturnType<typeof setTimeout> | null = null
// True while a remote snapshot is being applied, so it is not pushed straight back.
let applyingRemote = false

function startSync() {
  stopSync()
  unsubscribe = useApp.subscribe(() => {
    if (applyingRemote || !getApiToken()) return
    if (pushTimer) clearTimeout(pushTimer)
    pushTimer = setTimeout(() => {
      const token = getApiToken()
      if (token) void apiPutProgress(token, snapshotProgress())
    }, 2500)
  })
}

function stopSync() {
  if (unsubscribe) unsubscribe()
  unsubscribe = null
  if (pushTimer) clearTimeout(pushTimer)
  pushTimer = null
}

/**
 * First sync after login/register: an account with no stored progress adopts the
 * device's local progress; otherwise the account's progress wins and replaces local.
 */
async function initialSync(token: string) {
  const remote = await apiGetProgress(token)
  if (!remote || !remote.progress) {
    await apiPutProgress(token, snapshotProgress())
  } else {
    applyingRemote = true
    applyProgress(remote.progress)
    applyingRemote = false
  }
  startSync()
}

/** Call after a successful login/register/Google callback: fetch the account and start syncing. */
export async function completeSignIn(token: string): Promise<ApiUser | null> {
  await restoreSavedProgress()
  const me = await apiGetMe(token)
  if (!me) {
    clearApiToken()
    return null
  }
  useAuth.getState().setUser(me.user)
  await initialSync(token)
  return me.user
}

/** Restores a saved session on app start. Silent when there is none or it expired. */
export async function initAuth(): Promise<void> {
  const token = getApiToken()
  if (!token) return
  await completeSignIn(token)
}

export async function signOut(): Promise<void> {
  stopSync()
  useAuth.getState().setUser(null)
  await apiLogout()
}
