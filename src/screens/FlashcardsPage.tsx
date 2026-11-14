'use client'

import { Check, Flame, RotateCcw, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import Link from 'next/link'
import DialectChip from '../components/DialectChip'
import MyDialectLine from '../components/MyDialectLine'
import PlayButton from '../components/PlayButton'
import { getDialect, getPhrase, phrases, STANDARD_ID } from '../lib/content'
import { useName, useT } from '../lib/i18n'
import { baseInMyDialect } from '../lib/myDialect'
import { currentStreak, dayKey, sessionCards } from '../lib/srs'
import { useApp } from '../lib/store'

const keyOf = (dialectId: string, phraseId: string) => `${dialectId}|${phraseId}`

/** Flashcards for the chosen dialect: read the phrase, think of its meaning, flip, say if you knew it. */
export default function FlashcardsPage() {
  const t = useT()
  const name = useName()
  const dialectId = useApp((s) => s.dialectId)
  const myDialectId = useApp((s) => s.myDialectId)
  const cards = useApp((s) => s.cards)
  const streak = useApp((s) => s.streak)
  const reviewCard = useApp((s) => s.reviewCard)
  const dialect = getDialect(dialectId)

  const [round, setRound] = useState(0)
  // The session is fixed when it starts, so answering a card does not reshuffle the rest.
  const session = useMemo(() => {
    const keys = phrases.filter((p) => p.variants[dialectId]).map((p) => keyOf(dialectId, p.id))
    return sessionCards(keys, useApp.getState().cards, dayKey())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dialectId, round])
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [knew, setKnew] = useState(0)

  const restart = () => {
    setRound((r) => r + 1)
    setIndex(0)
    setKnew(0)
    setFlipped(false)
  }

  const key = session[index]
  const phrase = key ? getPhrase(key.split('|')[1]) : undefined
  const variant = phrase?.variants[dialectId]
  const days = currentStreak(streak, dayKey())

  const answer = (remembered: boolean) => {
    if (!key) return
    reviewCard(key, remembered)
    if (remembered) setKnew((n) => n + 1)
    setFlipped(false)
    setIndex((i) => i + 1)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold">{t('modeCards')}</h1>
        <span className="inline-flex items-center gap-1 rounded-full bg-sun-100 px-3 py-1 text-sm font-bold text-amber-800" title={t('streakTitle')}>
          <Flame className="h-4 w-4" aria-hidden />
          {t('streakDays', { n: days })}
        </span>
      </div>
      <DialectChip next="/practice/cards" />

      {session.length === 0 && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <p className="font-bold text-slate-900">{t('cardsAllDone')}</p>
          <p className="mt-1 text-sm text-slate-600">{t('cardsComeBack')}</p>
          <Link href="/practice" className="mt-4 inline-block rounded-full bg-brand-700 px-5 py-2 text-sm font-bold text-white">
            {t('backToPractice')}
          </Link>
        </div>
      )}

      {session.length > 0 && index >= session.length && (
        <div className="pattern-stars overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-800 to-brand-900 p-6 text-center text-white shadow-lg">
          <p className="text-2xl font-bold text-cream-50">{t('cardsDone', { n: knew, total: session.length })}</p>
          <p className="mt-2 text-sm text-cream-100">{t('cardsComeBack')}</p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <button type="button" onClick={restart} className="flex items-center gap-1.5 rounded-full bg-sun-300 px-4 py-2 text-sm font-bold text-brand-900">
              <RotateCcw className="h-4 w-4" aria-hidden />
              {t('cardsMore')}
            </button>
            <Link href="/practice" className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-cream-50 ring-1 ring-white/20">
              {t('backToPractice')}
            </Link>
          </div>
        </div>
      )}

      {phrase && variant && (
        <>
          <p className="text-center text-xs font-semibold text-slate-600">
            {t('cardsProgress', { n: index + 1, total: session.length })}
            {cards[key] ? ` · ${t('cardsReview')}` : ` · ${t('cardsNew')}`}
          </p>
          <button
            type="button"
            onClick={() => setFlipped((f) => !f)}
            aria-expanded={flipped}
            className="block min-h-64 w-full rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-md transition hover:border-brand-300"
          >
            <span className="block text-xs font-semibold text-brand-700">{dialect ? name(dialect) : ''}</span>
            <span dir="rtl" lang="ar" className="dialect-text mt-4 block text-3xl font-bold leading-snug text-slate-900">
              {variant.text}
            </span>
            {!flipped && <span className="mt-6 block text-sm text-slate-600">{t('cardsTapToFlip')}</span>}
            {flipped && (
              <span className="animate-rise mt-5 block space-y-1.5 border-t border-slate-100 pt-4">
                <span dir="rtl" lang="ar" className="dialect-text block text-lg font-semibold text-slate-800">
                  {t('standardEq')}: {phrase.variants[STANDARD_ID]?.text}
                </span>
                <span dir="ltr" lang="en" className="block text-base text-slate-700">
                  {phrase.english}
                </span>
              </span>
            )}
          </button>
          {flipped && (
            <>
              <MyDialectLine text={baseInMyDialect(phrase, dialectId, myDialectId)} />
              <div className="flex justify-center">
                <PlayButton dialectId={dialectId} phraseId={phrase.id} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => answer(false)} className="flex items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 py-3 font-bold text-rose-800">
                  <X className="h-5 w-5" aria-hidden />
                  {t('cardsForgot')}
                </button>
                <button type="button" onClick={() => answer(true)} className="flex items-center justify-center gap-2 rounded-2xl bg-brand-700 py-3 font-bold text-white">
                  <Check className="h-5 w-5" aria-hidden />
                  {t('cardsKnew')}
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
