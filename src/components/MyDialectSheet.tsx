import { useT } from '../lib/i18n'
import { useApp } from '../lib/store'
import MyDialectList from './MyDialectList'

/** First visit on the Arabic interface: ask the visitor which dialect they speak. */
export default function MyDialectSheet() {
  const t = useT()
  const lang = useApp((s) => s.lang)
  const asked = useApp((s) => s.myDialectAsked)
  const skip = useApp((s) => s.skipMyDialect)
  if (asked || lang !== 'ar') return null

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-slate-900/50" role="dialog" aria-modal="true" aria-labelledby="my-dialect-title">
      <div className="pb-safe flex max-h-[85dvh] w-full max-w-2xl flex-col rounded-t-3xl bg-sand-50 shadow-xl">
        <div className="px-5 pt-5 pb-3">
          <h2 id="my-dialect-title" className="text-lg font-bold">
            {t('myDialectQuestion')}
          </h2>
          <p className="mt-1 text-sm text-slate-600">{t('myDialectBody')}</p>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-3">
          <MyDialectList />
        </div>
        <div className="border-t border-slate-200 px-5 py-3">
          <button type="button" onClick={skip} className="w-full rounded-full bg-white py-2.5 text-sm font-semibold text-slate-600 ring-1 ring-slate-200">
            {t('skip')}
          </button>
        </div>
      </div>
    </div>
  )
}
