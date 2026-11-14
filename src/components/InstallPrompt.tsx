import { Download, Share, SquarePlus, WifiOff, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useT } from '../lib/i18n'
import { useInstall } from '../lib/pwa'
import { addDays, dayKey } from '../lib/srs'
import { useApp } from '../lib/store'

/**
 * A quiet card offering to install the app. It waits until the visitor has practised or come back
 * on another day, and after "not now" it stays away for two weeks.
 */
export default function InstallPrompt() {
  const t = useT()
  const { canPrompt, iosHint, install } = useInstall()
  const asked = useApp((s) => s.myDialectAsked)
  const practised = useApp((s) => s.practiceDays.length > 0)
  const snoozed = useApp((s) => s.installSnoozedUntil)
  const snooze = useApp((s) => s.snoozeInstall)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const id = window.setTimeout(() => setReady(true), 20000)
    return () => window.clearTimeout(id)
  }, [])

  const today = dayKey()
  if (!asked || !(canPrompt || iosHint) || (snoozed && snoozed > today) || !(ready || practised)) return null

  const later = () => snooze(addDays(today, 14))

  return (
    <div role="dialog" aria-labelledby="install-title" className="fixed inset-x-0 bottom-24 z-40 flex justify-center px-4">
      <div className="animate-pop w-full max-w-sm overflow-hidden rounded-3xl bg-gradient-to-br from-brand-800 to-brand-950 p-4 text-white shadow-2xl ring-1 ring-sun-400/50">
        <div className="flex items-start gap-3">
          <img src="/icons/icon-192.png" alt="" width={48} height={48} className="h-12 w-12 rounded-2xl ring-1 ring-sun-400/60" />
          <div className="min-w-0 flex-1">
            <p id="install-title" className="font-bold">
              {t('installTitle')}
            </p>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-cream-100">
              <WifiOff className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {t('installBody')}
            </p>
          </div>
          <button type="button" onClick={later} aria-label={t('close')} className="-m-1 rounded-full p-1.5 text-cream-100 hover:bg-white/10">
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
        {canPrompt ? (
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={later} className="rounded-full px-4 py-2 text-sm font-semibold text-cream-100 ring-1 ring-white/20 hover:bg-white/10">
              {t('installLater')}
            </button>
            <button
              type="button"
              onClick={() => install().then((ok) => !ok && later())}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-gradient-to-b from-sun-300 to-sun-500 py-2 text-sm font-bold text-brand-950 active:scale-95"
            >
              <Download className="h-4 w-4" aria-hidden />
              {t('installCta')}
            </button>
          </div>
        ) : (
          <p className="mt-3 flex flex-wrap items-center gap-1 rounded-2xl bg-white/10 p-2.5 text-xs leading-relaxed text-cream-50">
            {t('installIos1')}
            <Share className="inline h-4 w-4 text-sun-300" aria-label={t('installShare')} />
            {t('installIos2')}
            <SquarePlus className="inline h-4 w-4 text-sun-300" aria-hidden />
            <strong>{t('installIos3')}</strong>
          </p>
        )}
      </div>
    </div>
  )
}
