'use client'

import { ArrowLeft, Check, Trophy, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import PlayButton from '../components/PlayButton'
import ProgressBar from '../components/ProgressBar'
import { allFamous, categories, dialects, getDialect, getPhrase, phrases, STANDARD_ID } from '../lib/content'
import { useName, useT } from '../lib/i18n'
import { buildGuessQuiz, buildMatchQuiz, buildMeaningQuiz } from '../lib/quiz'
import type { MatchQuestion, MeaningQuestion } from '../lib/quiz'
import { useApp } from '../lib/store'
import NotFoundPage from './NotFoundPage'

type Question = MeaningQuestion | MatchQuestion

export default function QuizPage({ mode }: { mode: string }) {
  const params = useSearchParams() ?? new URLSearchParams()
  if (mode !== 'meaning' && mode !== 'match' && mode !== 'guess') return <NotFoundPage />
  const category = mode === 'meaning' ? categories.find((c) => c.id === params.get('c'))?.id : undefined
  return <Quiz key={`${mode}|${category ?? ''}`} mode={mode} category={category} />
}

function Quiz({ mode, category }: { mode: 'meaning' | 'match' | 'guess'; category?: string }) {
  const t = useT()
  const name = useName()
  const lang = useApp((s) => s.lang)
  const dialectId = useApp((s) => s.dialectId)
  const recordQuiz = useApp((s) => s.recordQuiz)
  const markPracticed = useApp((s) => s.markPracticed)
  const [round, setRound] = useState(0)

  const questions: Question[] = useMemo(
    () =>
      mode === 'meaning'
        ? buildMeaningQuiz(category ? phrases.filter((p) => p.category === category) : phrases, dialectId)
        : mode === 'guess'
          ? buildGuessQuiz(allFamous, dialects, 10, Math.random, 4, phrases)
          : buildMatchQuiz(phrases, dialects),
    // a new round reshuffles
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mode, dialectId, round, category],
  )
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)

  const restart = () => {
    setRound((r) => r + 1)
    setIndex(0)
    setPicked(null)
    setScore(0)
    setDone(false)
  }

  const q = questions[index]
  const total = questions.length
  const cat = categories.find((c) => c.id === category)
  const categoryName = cat ? (lang === 'ar' ? cat.name : cat.nameEn) : ''

  const optionLabel = (id: string) => {
    if (mode !== 'meaning') {
      const d = getDialect(id)!
      return { main: name(d), sub: lang === 'ar' ? d.country : d.countryEn, rtl: lang === 'ar' }
    }
    const p = getPhrase(id)!
    if (lang === 'ar' && q.dialectId !== STANDARD_ID) {
      return { main: p.variants[STANDARD_ID].text, sub: p.english, rtl: true }
    }
    return { main: p.english, sub: '', rtl: false }
  }

  const choose = (id: string) => {
    if (picked) return
    setPicked(id)
    if (id === q.answer) setScore((s) => s + 1)
  }

  const next = () => {
    if (index + 1 >= total) {
      recordQuiz(mode, mode === 'meaning' ? (category ? `${dialectId}:${category}` : dialectId) : 'all', score, total)
      markPracticed()
      setDone(true)
    } else {
      setIndex((i) => i + 1)
      setPicked(null)
    }
  }

  const header = (
    <div className="flex items-center gap-2">
      <Link href="/practice" aria-label={t('back')} className="rounded-full p-2 text-slate-500 hover:bg-slate-100">
        <ArrowLeft className="h-5 w-5 rtl:rotate-180" aria-hidden />
      </Link>
      <h1 className="text-lg font-bold">{mode === 'meaning' ? (category ? `${t('modeMeaning')} · ${categoryName}` : t('modeMeaning')) : mode === 'guess' ? t('modeGuess') : t('modeMatch')}</h1>
    </div>
  )

  if (done || !q) {
    return (
      <div className="space-y-4">
        {header}
        <div className="rounded-3xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-200">
          <Trophy className="mx-auto h-12 w-12 text-sun-500" aria-hidden />
          <p className="mt-3 text-2xl font-bold">{t('resultTitle', { n: score, total })}</p>
          <div className="mt-5 flex justify-center gap-2">
            <button type="button" onClick={restart} className="rounded-full bg-brand-600 px-5 py-2 font-semibold text-white hover:bg-brand-700">
              {t('tryAgain')}
            </button>
            <Link href="/practice" className="rounded-full bg-slate-100 px-5 py-2 font-semibold text-slate-700 hover:bg-slate-200">
              {t('backToPractice')}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const shown = q.phrase.variants[q.dialectId]
  const answerLabel = optionLabel(q.answer)

  return (
    <div className="space-y-4">
      {header}
      <ProgressBar value={index} total={total} label={t('question', { n: index + 1, total })} />

      <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <p className="text-sm font-semibold text-slate-500">{mode === 'meaning' ? t('whatMeans') : t('whichDialect')}</p>
        {mode === 'meaning' && getDialect(q.dialectId) && (
          <p className="mt-0.5 text-xs text-brand-700">{name(getDialect(q.dialectId)!)}</p>
        )}
        <div className="mt-3 flex items-center gap-3">
          <p dir="rtl" lang="ar" className="dialect-text min-w-0 flex-1 text-3xl font-bold text-slate-900">
            {shown.text}
          </p>
          {mode !== 'guess' && <PlayButton dialectId={q.dialectId} phraseId={q.phrase.id} text={shown.text} size="lg" />}
        </div>
      </section>

      <ul className="space-y-2">
        {q.options.map((id) => {
          const label = optionLabel(id)
          const isAnswer = id === q.answer
          const isPicked = id === picked
          let style = 'border-slate-200 bg-white hover:border-brand-500'
          if (picked && isAnswer) style = 'border-emerald-500 bg-emerald-50'
          else if (picked && isPicked) style = 'border-rose-400 bg-rose-50'
          else if (picked) style = 'border-slate-200 bg-white opacity-60'
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => choose(id)}
                disabled={!!picked}
                className={`flex w-full items-center gap-3 rounded-2xl border-2 p-3 text-start transition ${style}`}
              >
                <span className="min-w-0 flex-1">
                  <span dir={label.rtl ? 'rtl' : 'ltr'} className={`block font-semibold text-slate-900 ${label.rtl ? 'dialect-text text-lg' : ''}`}>
                    {label.main}
                  </span>
                  {label.sub && (
                    <span dir={mode === 'meaning' ? 'ltr' : undefined} className="block text-xs text-slate-500">
                      {label.sub}
                    </span>
                  )}
                </span>
                {picked && isAnswer && <Check className="h-5 w-5 text-emerald-600" aria-hidden />}
                {picked && isPicked && !isAnswer && <X className="h-5 w-5 text-rose-500" aria-hidden />}
              </button>
            </li>
          )
        })}
      </ul>

      {picked && mode === 'guess' && (
        <p className="rounded-2xl bg-sand-50 px-4 py-2.5 text-sm text-slate-700">
          <span dir="rtl" lang="ar" className="dialect-text font-semibold">
            {t('standardEq')}: {q.phrase.variants[STANDARD_ID]?.text}
          </span>
          <span dir="ltr" lang="en" className="block">
            {q.phrase.english}
          </span>
        </p>
      )}

      {picked && (
        <div className="flex items-center gap-3">
          <p className={`flex-1 text-sm font-semibold ${picked === q.answer ? 'text-emerald-700' : 'text-rose-600'}`}>
            {picked === q.answer ? t('correct') : t('wrong', { answer: answerLabel.main })}
          </p>
          <button type="button" onClick={next} className="rounded-full bg-brand-600 px-5 py-2 font-semibold text-white hover:bg-brand-700">
            {index + 1 >= total ? t('finish') : t('next')}
          </button>
        </div>
      )}
    </div>
  )
}
