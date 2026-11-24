'use client'

import { useT } from '../lib/i18n'

export default function DictionaryLoadError({ onRetry }: { onRetry: () => void }) {
  const t = useT()
  return (
    <div className="space-y-2 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-slate-700" role="status">
      <p>{t('dictLoadFailed')}</p>
      <button type="button" onClick={onRetry} className="rounded-xl border border-brand-200 bg-white px-4 py-2 font-semibold text-brand-700 hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-brand-600">
        {t('dictRetry')}
      </button>
    </div>
  )
}
