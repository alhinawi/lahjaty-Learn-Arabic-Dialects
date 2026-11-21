'use client'

import { Check, Share2 } from 'lucide-react'
import { useState } from 'react'
import { useT } from '../lib/i18n'
import { sharePath, SITE_URL } from '../lib/og'

/** Shares a stable phrase link. The compact share shell uses a generic crawler preview. */
export default function ShareButton({ dialectId, phraseId, text, label = false }: { dialectId: string; phraseId: string; text: string; label?: boolean }) {
  const t = useT()
  const [copied, setCopied] = useState(false)
  const url = SITE_URL + sharePath(dialectId, phraseId)

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: text, text, url })
        return
      }
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      // The visitor closed the share sheet.
    }
  }

  return (
    <button
      type="button"
      onClick={share}
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
  )
}
