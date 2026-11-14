'use client'

import { CheckCircle2, Download, Share, SquarePlus } from 'lucide-react'
import { useT } from '../lib/i18n'
import { useInstall } from '../lib/pwa'

/** The install section on the settings page: a button where the browser allows it, steps on iPhone. */
export default function InstallSettings() {
  const t = useT()
  const { canPrompt, iosHint, installed, install } = useInstall()
  if (!canPrompt && !iosHint && !installed) return null
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="font-bold">{t('installSettings')}</h2>
      {installed ? (
        <p className="mt-1 flex items-center gap-1.5 text-sm text-brand-700">
          <CheckCircle2 className="h-4 w-4" aria-hidden />
          {t('installDone')}
        </p>
      ) : (
        <>
          <p className="mt-0.5 text-sm text-slate-500">{t('installSettingsBody')}</p>
          {canPrompt ? (
            <button
              type="button"
              onClick={() => install()}
              className="mt-3 flex items-center gap-1.5 rounded-full bg-gradient-to-b from-sun-300 to-sun-500 px-4 py-2 text-sm font-bold text-brand-950 active:scale-95"
            >
              <Download className="h-4 w-4" aria-hidden />
              {t('installCta')}
            </button>
          ) : (
            <p className="mt-3 flex flex-wrap items-center gap-1 text-sm text-slate-700">
              {t('installIos1')}
              <Share className="inline h-4 w-4 text-brand-700" aria-label={t('installShare')} />
              {t('installIos2')}
              <SquarePlus className="inline h-4 w-4 text-brand-700" aria-hidden />
              <strong>{t('installIos3')}</strong>
            </p>
          )}
        </>
      )}
    </section>
  )
}
