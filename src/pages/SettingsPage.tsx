import { Languages } from 'lucide-react'
import MyDialectList from '../components/MyDialectList'
import { getDialect } from '../lib/content'
import { useName, useT } from '../lib/i18n'
import { useApp } from '../lib/store'

export default function SettingsPage() {
  const t = useT()
  const name = useName()
  const lang = useApp((s) => s.lang)
  const toggleLang = useApp((s) => s.toggleLang)
  const mine = getDialect(useApp((s) => s.myDialectId) ?? undefined)
  const setMyDialect = useApp((s) => s.setMyDialect)

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">{t('settings')}</h1>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="font-bold">{t('interfaceLang')}</h2>
        <button
          type="button"
          onClick={toggleLang}
          className="mt-3 flex items-center gap-1.5 rounded-full bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-100"
        >
          <Languages className="h-4 w-4" aria-hidden />
          {lang === 'ar' ? 'العربية' : 'English'} → {t('langToggle')}
        </button>
      </section>

      <section id="my-dialect" className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="font-bold">{t('myDialect')}</h2>
            <p className="mt-0.5 text-sm text-slate-500">{t('myDialectSettingBody')}</p>
          </div>
          {mine && (
            <button type="button" onClick={() => setMyDialect(null)} className="shrink-0 text-xs text-slate-400 underline">
              {t('clearMyDialect')}
            </button>
          )}
        </div>
        <p className="text-sm font-semibold text-brand-700">{mine ? name(mine) : t('myDialectNone')}</p>
        <MyDialectList />
      </section>
    </div>
  )
}
