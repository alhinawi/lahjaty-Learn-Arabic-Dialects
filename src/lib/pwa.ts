import { useEffect, useState } from 'react'

/** The browser's install event (Chrome, Edge, Samsung Internet). Not in the DOM types yet. */
export interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

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

/** Registers the service worker and keeps the install event for later. Called once from main.tsx. */
export function setupPwa() {
  if (typeof window === 'undefined') return
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
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    })
  }
}

/** Whether the site can be installed now, and the function that asks the browser. */
export function useInstall() {
  const [, force] = useState(0)
  useEffect(() => {
    const l = () => force((n) => n + 1)
    listeners.add(l)
    return () => {
      listeners.delete(l)
    }
  }, [])
  const standalone = isStandalone()
  return {
    canPrompt: !!deferred && !standalone,
    iosHint: !deferred && !standalone && isIos(),
    installed: standalone,
    install: async () => {
      if (!deferred) return false
      const e = deferred
      deferred = null
      await e.prompt()
      const { outcome } = await e.userChoice
      notify()
      return outcome === 'accepted'
    },
  }
}
