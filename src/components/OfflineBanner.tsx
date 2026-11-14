'use client'

import { WifiOff } from 'lucide-react'
import { useSyncExternalStore } from 'react'
import { useT } from '../lib/i18n'

const subscribe = (cb: () => void) => {
  window.addEventListener('online', cb)
  window.addEventListener('offline', cb)
  return () => {
    window.removeEventListener('online', cb)
    window.removeEventListener('offline', cb)
  }
}

/** A thin line under the header while the device is offline. */
export default function OfflineBanner() {
  const t = useT()
  // The server snapshot is "online" so the first client render matches the prerendered HTML.
  const offline = useSyncExternalStore(subscribe, () => !navigator.onLine, () => false)
  if (!offline) return null
  return (
    <p role="status" className="flex items-center justify-center gap-2 bg-sun-100 px-4 py-2 text-center text-xs font-medium text-brand-950">
      <WifiOff className="h-4 w-4 shrink-0" aria-hidden />
      {t('offline')}
    </p>
  )
}
