import { ChevronLeft, MapPin } from 'lucide-react'
import { Link } from 'react-router'
import { getDialect } from '../lib/content'
import { useName, useT } from '../lib/i18n'
import { useApp } from '../lib/store'

/** Shows the dialect being learned with a link to change it, then come back here. */
export default function DialectChip({ next }: { next: string }) {
  const t = useT()
  const name = useName()
  const lang = useApp((s) => s.lang)
  const dialect = getDialect(useApp((s) => s.dialectId))
  if (!dialect) return null
  return (
    <Link
      to={`/dialects?next=${encodeURIComponent(next)}`}
      className="flex items-center gap-3 rounded-2xl border border-brand-200 bg-white p-3 shadow-sm hover:border-brand-500"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
        <MapPin className="h-5 w-5" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs text-slate-500">{t('learningNow')}</span>
        <span className="block font-bold text-slate-900">
          {name(dialect)}
          {dialect.country && (
            <span className="font-normal text-slate-400"> · {lang === 'ar' ? dialect.country : dialect.countryEn}</span>
          )}
        </span>
      </span>
      <span className="flex items-center text-sm font-semibold text-brand-700">
        {t('change')}
        <ChevronLeft className="h-4 w-4 ltr:rotate-180" aria-hidden />
      </span>
    </Link>
  )
}
