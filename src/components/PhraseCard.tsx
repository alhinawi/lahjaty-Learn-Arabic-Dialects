import { Check, Columns3, Heart } from 'lucide-react'
import { Link } from 'react-router'
import { getDialect, hasAudio, STANDARD_ID, voiceFor } from '../lib/content'
import { useName, useT } from '../lib/i18n'
import { baseInMyDialect } from '../lib/myDialect'
import { favKey, useApp } from '../lib/store'
import type { Phrase } from '../lib/types'
import MyDialectLine from './MyDialectLine'
import PlayButton from './PlayButton'

interface Props {
  phrase: Phrase
  dialectId: string
  showDialect?: boolean
}

export default function PhraseCard({ phrase, dialectId, showDialect = false }: Props) {
  const t = useT()
  const name = useName()
  const lang = useApp((s) => s.lang)
  const showTranslit = useApp((s) => s.showTranslit)
  const isFav = useApp((s) => s.favorites.includes(favKey(dialectId, phrase.id)))
  const isLearned = useApp((s) => (s.learned[dialectId] ?? []).includes(phrase.id))
  const toggleFavorite = useApp((s) => s.toggleFavorite)
  const toggleLearned = useApp((s) => s.toggleLearned)
  const myDialectId = useApp((s) => s.myDialectId)

  const variant = phrase.variants[dialectId]
  const standard = phrase.variants[STANDARD_ID]
  const dialect = getDialect(dialectId)
  if (!variant || !dialect) return null
  const voice = hasAudio(dialectId, phrase.id) ? voiceFor(dialectId, phrase.id) : undefined
  const note = lang === 'ar' ? phrase.noteAr ?? phrase.note : phrase.note

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      {showDialect && (
        <div className="mb-2 text-xs font-semibold text-brand-700">
          {name(dialect)}
          {dialect.country && <span className="font-normal text-slate-500"> · {lang === 'ar' ? dialect.country : dialect.countryEn}</span>}
        </div>
      )}

      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p dir="rtl" lang="ar" className="dialect-text text-2xl font-bold text-slate-900">
            {variant.text}
          </p>
          {showTranslit && variant.translit && (
            <p dir="ltr" className="mt-0.5 text-start text-sm italic text-brand-700">
              {variant.translit}
            </p>
          )}
        </div>
        <PlayButton dialectId={dialectId} phraseId={phrase.id} />
      </div>

      <MyDialectLine text={baseInMyDialect(phrase, dialectId, myDialectId)} />

      <dl className="mt-3 space-y-1.5 text-sm">
        <div className="flex gap-2">
          <dt className="shrink-0 text-slate-500">{t('meaning')}</dt>
          <dd dir="ltr" lang="en" className="text-slate-700">
            {phrase.english}
          </dd>
        </div>
        {dialectId !== STANDARD_ID && standard && (
          <div className="flex gap-2">
            <dt className="shrink-0 text-slate-500">{t('standardEq')}</dt>
            <dd dir="rtl" lang="ar" className="dialect-text text-slate-700">
              {standard.text}
            </dd>
          </div>
        )}
      </dl>

      {(note || voice) && (
        <p className="mt-2 text-xs text-slate-500">
          {note}
          {note && voice && ' · '}
          {voice && t('voice', { name: voice.name })}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
        <button
          type="button"
          onClick={() => toggleLearned(dialectId, phrase.id)}
          aria-pressed={isLearned}
          className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold ${
            isLearned ? 'bg-brand-600 text-white' : 'bg-brand-50 text-brand-700 hover:bg-brand-100'
          }`}
        >
          <Check className="h-3.5 w-3.5" aria-hidden />
          {isLearned ? t('learned') : t('markLearned')}
        </button>
        <Link
          to={`/compare?p=${encodeURIComponent(phrase.id)}`}
          className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200"
        >
          <Columns3 className="h-3.5 w-3.5" aria-hidden />
          {t('compareThis')}
        </Link>
        <button
          type="button"
          onClick={() => toggleFavorite(dialectId, phrase.id)}
          aria-pressed={isFav}
          aria-label={isFav ? t('removeFavorite') : t('addFavorite')}
          className="ms-auto rounded-full p-2 text-rose-500 hover:bg-rose-50"
        >
          <Heart className="h-5 w-5" fill={isFav ? 'currentColor' : 'none'} aria-hidden />
        </button>
      </div>
    </article>
  )
}
