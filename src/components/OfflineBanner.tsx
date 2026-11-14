import { WifiOff } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useT } from '../lib/i18n'

/** A thin line under the header while the device is offline. */
export default function OfflineBanner() {
  const t = useT()
  const [offline, setOffline] = useState(() => typeof navigator !== 'undefined' && navigator.onLine === false)
  useEffect(() => {
    const on = () => setOffline(false)
    const off = () => setOffline(true)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])
  if (!offline) return null
  return (
    <p role="status" className="flex items-center justify-center gap-2 bg-sun-100 px-4 py-2 text-center text-xs font-medium text-brand-950">
      <WifiOff className="h-4 w-4 shrink-0" aria-hidden />
      {t('offline')}
    </p>
  )
}
