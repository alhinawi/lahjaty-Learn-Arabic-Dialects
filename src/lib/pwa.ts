import { useSyncExternalStore } from 'react'

/** The browser's install event (Chrome, Edge, Samsung Internet). Not in the DOM types yet. */
export interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

let started = false
let deferred: InstallPromptEvent | null = null
const listeners = new Set<() => void>()
const notify = () => listeners.forEach((l) => l())

export const isStandalone = () =>
  typeof window !== 'undefined' &&
  (window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true)

/** iPhone and iPad Safari have no install event: the visitor adds the site from the Share menu. */
export const isIos = () =>
  typeof navigator !== 'undefined' &&
  (/iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1))

/** Registers once after mount, including when the document has already loaded. */
export function setupPwa() {
  if (typeof window === 'undefined' || started) return
  started = true
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferred = e as InstallPromptEvent
    notify()
  })
  window.addEventListener('appinstalled', () => {
    deferred = null
    notify()
  })
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    const register = () => { void navigator.serviceWorker.register('/sw.js').catch(() => {}) }
    if (document.readyState === 'complete') register()
    else window.addEventListener('load', register, { once: true })
  }
}

/** Stable primitive snapshot. The server always renders no install controls. */
const installSnapshot = () => isStandalone() ? 1 : deferred ? 2 : isIos() ? 4 : 0
const subscribeInstall = (listener: () => void) => {
  listeners.add(listener)
  const media = window.matchMedia('(display-mode: standalone)')
  media.addEventListener('change', listener)
  return () => { listeners.delete(listener); media.removeEventListener('change', listener) }
}

/** Hydration-safe install availability, updated by install and display-mode events. */
export function useInstall() {
  const state = useSyncExternalStore(subscribeInstall, installSnapshot, () => 0)
  return {
    canPrompt: state === 2,
    iosHint: state === 4,
    installed: state === 1,
    install: async () => {
      if (!deferred) return false
      const e = deferred
      deferred = null
      notify()
      try {
        await e.prompt()
        const { outcome } = await e.userChoice
        return outcome === 'accepted'
      } catch {
        return false
      }
    },
  }
}
