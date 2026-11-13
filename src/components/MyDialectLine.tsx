import { getDialect } from '../lib/content'
import { useName, useT } from '../lib/i18n'
import { useApp } from '../lib/store'

/** The meaning in the visitor's own dialect, shown first on a card. Arabic interface only. */
export default function MyDialectLine({ text }: { text: string | undefined }) {
  const t = useT()
  const name = useName()
  const lang = useApp((s) => s.lang)
  const mine = getDialect(useApp((s) => s.myDialectId) ?? undefined)
  if (!text || !mine || lang !== 'ar') return null
  return (
    <div className="mt-3 rounded-xl bg-sun-400/15 px-3 py-2">
      <div className="text-[11px] font-semibold text-amber-700">{t('inMyDialect', { dialect: name(mine) })}</div>
      <p dir="rtl" lang="ar" className="dialect-text text-lg font-bold text-slate-900">
        {text}
      </p>
    </div>
  )
}
