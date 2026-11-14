'use client'

import { Columns3, Quote } from 'lucide-react'
import Link from 'next/link'
import { STANDARD_ID } from '../lib/content'
import { dictAudioId, sameWordIn, wordIn } from '../lib/dictionary'
import { useName, useT } from '../lib/i18n'
import type { MessageKey } from '../lib/i18n'
import { getDialect } from '../lib/content'
import { useApp } from '../lib/store'
import type { DictEntry } from '../lib/types'
import PlayButton from './PlayButton'

interface Props {
  entry: DictEntry
  dialectId: string
}

const MAX_SAME = 6

export default function DictEntryCard({ entry, dialectId }: Props) {
  const t = useT()
  const name = useName()
  const myDialectId = useApp((s) => s.myDialectId)
  const word = wordIn(entry, dialectId)
  const same = sameWordIn(entry, dialectId)
  const example = entry.ex?.[dialectId]
  const mine = myDialectId && myDialectId !== dialectId && myDialectId !== STANDARD_ID ? entry.words[myDialectId] : undefined
  const myDialect = getDialect(myDialectId ?? undefined)

  return (
    <article id={entry.id} className="scroll-mt-20 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p dir="rtl" lang="ar" className={`dialect-text text-2xl font-bold ${word ? 'text-slate-900' : 'text-slate-400'}`}>
            {word ?? '—'}
          </p>
          <p className="mt-0.5 text-xs font-semibold text-sun-600">{t(`pos_${entry.pos}` as MessageKey)}</p>
        </div>
        {word && <PlayButton dialectId={dialectId} phraseId={dictAudioId(entry.id)} size="sm" />}
      </div>

      {mine && myDialect && (
        <p className="mt-2 rounded-xl bg-brand-50 px-3 py-1.5 text-sm text-brand-800">
          <span className="text-xs text-brand-600">{name(myDialect)}: </span>
          <span dir="rtl" lang="ar" className="dialect-text font-semibold">
            {mine}
          </span>
        </p>
      )}

      <dl className="mt-3 space-y-1.5 text-sm">
        <div className="flex gap-2">
          <dt className="shrink-0 text-slate-500">{t('meaning')}</dt>
          <dd dir="ltr" lang="en" className="text-slate-700">
            {entry.en}
          </dd>
        </div>
        {dialectId !== STANDARD_ID && (
          <div className="flex gap-2">
            <dt className="shrink-0 text-slate-500">{t('standardEq')}</dt>
            <dd dir="rtl" lang="ar" className="dialect-text text-slate-700">
              {entry.fs}
            </dd>
          </div>
        )}
      </dl>

      {example && (
        <p className="mt-2 flex items-start gap-1.5 rounded-xl bg-sand-50 px-3 py-2 text-sm text-slate-700">
          <Quote className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sun-500" aria-hidden />
          <span dir="rtl" lang="ar" className="dialect-text">
            {example}
          </span>
        </p>
      )}

      {same.length > 0 && (
        <p className="mt-2 text-xs leading-relaxed text-slate-500">
          <span className="font-semibold text-slate-600">{t('dictSameIn')}: </span>
          {same
            .slice(0, MAX_SAME)
            .map((id) => {
              const d = getDialect(id)
              return d ? name(d) : id
            })
            .join('، ')}
          {same.length > MAX_SAME && ` +${same.length - MAX_SAME}`}
        </p>
      )}

      <Link href={`/word/${entry.id}`}
        className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100"
      >
        <Columns3 className="h-3.5 w-3.5" aria-hidden />
        {t('dictWordInAll')}
      </Link>
    </article>
  )
}
