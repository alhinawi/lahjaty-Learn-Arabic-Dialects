import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect } from 'react'
import { Link, useLocation, useParams } from 'react-router'
import DialectChip from '../components/DialectChip'
import DictEntryCard from '../components/DictEntryCard'
import TopicIcon from '../components/TopicIcon'
import { getDialect } from '../lib/content'
import { dictTopics, getTopic, useTopic } from '../lib/dictionary'
import { useName, useT } from '../lib/i18n'
import { usePageMeta } from '../lib/meta'
import { useApp } from '../lib/store'
import NotFoundPage from './NotFoundPage'

export default function DictTopicPage() {
  const t = useT()
  const name = useName()
  const { topicId } = useParams()
  const topic = getTopic(topicId)
  const dialect = getDialect(useApp((s) => s.dialectId))
  const entries = useTopic(topic?.id)
  const { hash } = useLocation()
  const loaded = entries !== null
  useEffect(() => {
    if (loaded && hash) document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView({ block: 'start' })
  }, [loaded, hash])
  usePageMeta(topic ? `${name(topic)} – ${t('dictTitle')}` : t('dictTitle'), t('dictBody'))
  if (!topic) return <NotFoundPage />

  const i = dictTopics.indexOf(topic)
  const prev = dictTopics[i - 1]
  const next = dictTopics[i + 1]
  const dialectId = dialect?.id ?? 'cai'
  const withWord = entries?.filter((e) => dialectId === 'fs' || e.words[dialectId]) ?? []
  const without = entries?.filter((e) => dialectId !== 'fs' && !e.words[dialectId]) ?? []

  return (
    <div className="space-y-4">
      <Link to="/dictionary" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700">
        <ChevronRight className="h-4 w-4 ltr:rotate-180" aria-hidden />
        {t('dictAllTopics')}
      </Link>
      <section className="flex items-center gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-700 text-sun-300 shadow">
          <TopicIcon icon={topic.icon} className="h-6 w-6" />
        </span>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold">{name(topic)}</h1>
          {dialect && <p className="text-sm text-slate-500">{t('dictWordsIn', { dialect: name(dialect) })}</p>}
        </div>
      </section>

      <DialectChip next={`/dictionary/${topic.id}`} />

      {entries === null ? (
        <p className="py-8 text-center text-sm text-slate-500">{t('dictLoading')}</p>
      ) : (
        <div className="space-y-3">
          {[...withWord, ...without].map((e) => (
            <DictEntryCard key={e.id} entry={e} dialectId={dialectId} />
          ))}
        </div>
      )}

      <nav className="flex items-center justify-between gap-3 pt-2 text-sm font-semibold">
        {prev ? (
          <Link to={`/dictionary/${prev.id}`} className="inline-flex min-w-0 items-center gap-1 text-brand-700">
            <ChevronRight className="h-4 w-4 shrink-0 ltr:rotate-180" aria-hidden />
            <span className="truncate">{name(prev)}</span>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link to={`/dictionary/${next.id}`} className="inline-flex min-w-0 items-center gap-1 text-brand-700">
            <span className="truncate">{name(next)}</span>
            <ChevronLeft className="h-4 w-4 shrink-0 ltr:rotate-180" aria-hidden />
          </Link>
        )}
      </nav>
    </div>
  )
}
