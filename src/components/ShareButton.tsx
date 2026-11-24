'use client'

import { Check, Share2 } from 'lucide-react'
import { useState } from 'react'
import { useT } from '../lib/i18n'
import { sharePath, SITE_URL } from '../lib/og'
import { shareOrCopy } from '../lib/share'

/** Shares a stable phrase link. The compact share shell uses a generic crawler preview. */
export default function ShareButton({ dialectId, phraseId, text, label = false }: { dialectId: string; phraseId: string; text: string; label?: boolean }) {
  const t = useT()
  const [copied, setCopied] = useState(false)
  const [manual, setManual] = useState(false)
  const [busy, setBusy] = useState(false)
  const url = SITE_URL + sharePath(dialectId, phraseId)

  const share = async () => {
    if (busy) return
    setBusy(true)
    setCopied(false)
    setManual(false)
    const result = await shareOrCopy(text, url, {
      share: navigator.share ? (data) => navigator.share(data) : undefined,
      copy: navigator.clipboard?.writeText ? (value) => navigator.clipboard.writeText(value) : undefined,
    })
    setBusy(false)
    if (result === 'copied') {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    }
    if (result === 'manual') setManual(true)
  }

  return (
    <span className="inline-flex max-w-full flex-wrap items-center gap-2">
    <button
      type="button"
      onClick={share}
      disabled={busy}
      aria-label={label ? undefined : t('sharePhrase')}
      className={
        label
          ? 'flex items-center gap-1.5 rounded-full bg-sun-300 px-4 py-2 text-sm font-bold text-brand-900 hover:bg-sun-200'
          : 'rounded-full p-2 text-brand-700 hover:bg-brand-50'
      }
    >
      {copied ? <Check className="h-5 w-5" aria-hidden /> : <Share2 className={label ? 'h-4 w-4' : 'h-5 w-5'} aria-hidden />}
      {label && (copied ? t('linkCopied') : t('sharePhrase'))}
      {!label && copied && <span className="sr-only">{t('linkCopied')}</span>}
    </button>
    {manual && (
      <span className="block w-full min-w-0 rounded-xl border border-brand-200 bg-white p-3 text-start text-sm text-slate-700" role="status">
        <label className="block space-y-2">
          <span>{t('shareCopyManually')}</span>
          <input type="text" readOnly value={url} dir="ltr" aria-label={t('shareLink')} onFocus={(e) => { const input = e.currentTarget; requestAnimationFrame(() => input.select()) }} onClick={(e) => e.currentTarget.select()} className="block w-full min-w-0 rounded-lg border border-slate-300 bg-white p-2 text-sm text-slate-900" />
        </label>
      </span>
    )}
    </span>
  )
}
