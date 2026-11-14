import { ChevronRight, Columns3, Quote } from 'lucide-react'
import { Link, useParams } from 'react-router'
import DictSearch from '../components/DictSearch'
import PlayButton from '../components/PlayButton'
import { dialectsByRegion, getDialect, STANDARD_ID } from '../lib/content'
import { dictAudioId, getTopic, topicOf, useEntry } from '../lib/dictionary'
import { useName, useT } from '../lib/i18n'
import type { MessageKey } from '../lib/i18n'
import { usePageMeta } from '../lib/meta'
import { useApp } from '../lib/store'
import NotFoundPage from './NotFoundPage'

/** /word: search for a word. /word/:entryId: that word in every dialect, grouped by region. */
export default function WordPage() {
  const t = useT()
  const name = useName()
  const { entryId } = useParams()
  const entry = useEntry(entryId)
  const myDialectId = useApp((s) => s.myDialectId)
  const lang = useApp((s) => s.lang)
  usePageMeta(entry ? `${entry.fs} – ${t('dictWordInAll')}` : t('dictWordInAll'), entry ? `${entry.fs} · ${entry.en}` : t('dictWordInAllBody'))

  if (!entryId) {
    return (
      <div className="space-y-4">
        <section className="rounded-3xl bg-gradient-to-br from-brand-700 to-brand-900 p-5 text-white shadow">
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Columns3 className="h-6 w-6 text-sun-300" aria-hidden />
            {t('dictWordInAll')}
          </h1>
          <p className="mt-1 text-sm text-cream-200">{t('dictWordInAllBody')}</p>
        </section>
        <DictSearch />
        <Link to="/dictionary" className="block text-center text-sm font-semibold text-brand-700">
          {t('dictAllTopics')}
        </Link>
      </div>
    )
  }
  if (entry === null) return <p className="py-10 text-center text-sm text-slate-500">{t('dictLoading')}</p>
  if (!entry) return <NotFoundPage />

  const topic = getTopic(topicOf(entry.id))
  const groups = dialectsByRegion()
    .map((g) => ({ region: g.region, dialects: g.dialects.filter((d) => d.id !== STANDARD_ID && entry.words[d.id]) }))
    .filter((g) => g.dialects.length)
  const mine = myDialectId && myDialectId !== STANDARD_ID ? getDialect(myDialectId) : undefined

  return (
    <div className="space-y-4">
      {topic && (
        <Link to={`/dictionary/${topic.id}#${entry.id}`} className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700">
          <ChevronRight className="h-4 w-4 ltr:rotate-180" aria-hidden />
          {t('dictBackToTopic', { topic: name(topic) })}
        </Link>
      )}

      <section className="rounded-3xl bg-gradient-to-br from-brand-700 to-brand-900 p-5 text-white shadow">
        <p className="text-xs text-cream-200">
          {t('dictWordInAll')} · {t(`pos_${entry.pos}` as MessageKey)}
        </p>
        <div className="mt-1 flex items-start gap-3">
          <h1 dir="rtl" lang="ar" className="dialect-text min-w-0 flex-1 text-3xl font-bold">
            {entry.fs}
          </h1>
          <PlayButton dialectId={STANDARD_ID} phraseId={dictAudioId(entry.id)} size="sm" />
        </div>
        <p dir="ltr" lang="en" className="mt-1 text-sm text-cream-200">
          {entry.en}
        </p>
        {entry.ex?.fs && (
          <p className="mt-3 flex items-start gap-1.5 text-sm text-cream-100">
            <Quote className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sun-300" aria-hidden />
            <span dir="rtl" lang="ar" className="dialect-text">
              {entry.ex.fs}
            </span>
          </p>
        )}
      </section>

      {mine && entry.words[mine.id] && (
        <section className="rounded-2xl border border-sun-300 bg-sand-50 p-4">
          <p className="text-xs font-semibold text-sun-600">
            {t('dictYours')} · {name(mine)}
          </p>
          <p dir="rtl" lang="ar" className="dialect-text mt-1 text-2xl font-bold text-slate-900">
            {entry.words[mine.id]}
          </p>
        </section>
      )}

      {groups.map(({ region, dialects }) => (
        <section key={region.id} className="space-y-2">
          <h2 className="text-sm font-bold text-slate-500">{name(region)}</h2>
          <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {dialects.map((d) => (
              <li key={d.id} id={`w-${d.id}`} className={`px-4 py-3 ${d.id === mine?.id ? 'bg-brand-50' : ''}`}>
                <div className="flex items-center gap-3">
                  <Link to={`/dialects/${d.id}`} className="w-28 shrink-0 text-xs font-semibold leading-snug text-brand-700">
                    {name(d)}
                    {d.country && (
                      <span className="block font-normal text-slate-500">{lang === 'ar' ? d.country : d.countryEn}</span>
                    )}
                  </Link>
                  <p dir="rtl" lang="ar" className="dialect-text min-w-0 flex-1 text-lg font-bold text-slate-900">
                    {entry.words[d.id]}
                  </p>
                  <PlayButton dialectId={d.id} phraseId={dictAudioId(entry.id)} size="sm" />
                </div>
                {entry.ex?.[d.id] && (
                  <p dir="rtl" lang="ar" className="dialect-text mt-1 ps-[7.75rem] text-sm text-slate-600">
                    {entry.ex[d.id]}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}

      <DictSearch />
    </div>
  )
}
