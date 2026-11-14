'use client'

import { BookA, ChevronLeft, Columns3 } from 'lucide-react'
import Link from 'next/link'
import DialectChip from '../components/DialectChip'
import DictSearch from '../components/DictSearch'
import TopicIcon from '../components/TopicIcon'
import { dictTopics } from '../lib/dictionary'
import { useName, useT } from '../lib/i18n'

export default function DictionaryPage() {
  const t = useT()
  const name = useName()
  return (
    <div className="space-y-4">
      <section className="rounded-3xl bg-gradient-to-br from-brand-700 to-brand-900 p-5 text-white shadow">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <BookA className="h-6 w-6 text-sun-300" aria-hidden />
          {t('dictTitle')}
        </h1>
        <p className="mt-1 text-sm text-cream-200">{t('dictBody')}</p>
      </section>

      <DictSearch />

      <DialectChip next="/dictionary" />

      <section className="space-y-2">
        <h2 className="text-lg font-bold">{t('dictTopics')}</h2>
        <div className="grid grid-cols-2 gap-3">
          {dictTopics.map((topic) => (
            <Link
              key={topic.id}
              href={`/dictionary/${topic.id}`}
              className="flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm hover:border-brand-500"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                <TopicIcon icon={topic.icon} />
              </span>
              <span className="min-w-0 text-sm font-bold leading-snug text-slate-900">{name(topic)}</span>
            </Link>
          ))}
        </div>
      </section>

      <Link href="/word"
        className="flex items-center gap-3 rounded-2xl border border-sun-300 bg-sand-50 p-4 shadow-sm hover:border-sun-500"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sun-400 text-brand-900">
          <Columns3 className="h-5 w-5" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-bold text-slate-900">{t('dictWordInAll')}</span>
          <span className="block text-xs text-slate-500">{t('dictWordInAllBody')}</span>
        </span>
        <ChevronLeft className="h-5 w-5 text-slate-400 ltr:rotate-180" aria-hidden />
      </Link>
    </div>
  )
}
