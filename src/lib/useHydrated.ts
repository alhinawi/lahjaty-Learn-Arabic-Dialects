'use client'

import { useSyncExternalStore } from 'react'
import { useApp } from './store'

/** True after the saved state has been read from localStorage (never during prerender or first client paint). */
export function useHydrated() {
  return useSyncExternalStore(
    (cb) => useApp.persist.onFinishHydration(cb),
    () => useApp.persist.hasHydrated(),
    () => false,
  )
}
