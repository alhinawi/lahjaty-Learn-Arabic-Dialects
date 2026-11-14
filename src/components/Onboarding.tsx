'use client'

import { Briefcase, Check, ChevronLeft, Clapperboard, Languages, Plane, Sparkles, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { getDialect } from '../lib/content'
import { GOALS, SUGGESTED_TO_LEARN } from '../lib/goals'
import type { GoalId } from '../lib/goals'
import { useName, useT } from '../lib/i18n'
import { useApp } from '../lib/store'
import MyDialectList from './MyDialectList'

const GOAL_ICONS: Record<GoalId, LucideIcon> = {
  travel: Plane,
  work: Briefcase,
  friends: Users,
  media: Clapperboard,
  curious: Sparkles,
}

const STEPS = 3

/**
 * First visit: three short steps (your dialect, why you are learning, the dialect to learn).
 * Every step can be skipped. Nothing is saved until the last step, except a skip, which only stops asking.
 */
export default function Onboarding() {
  const asked = useApp((s) => s.myDialectAsked)
  const pathname = usePathname() ?? '/'
  // A shared phrase link opens straight on the phrase; the welcome steps wait for the next visit.
  if (asked || pathname.startsWith('/share/')) return null
  return <Steps />
}

function Steps() {
  const t = useT()
  const name = useName()
  const lang = useApp((s) => s.lang)
  const toggleLang = useApp((s) => s.toggleLang)
  const skip = useApp((s) => s.skipMyDialect)
  const finish = useApp((s) => s.finishOnboarding)
  const [step, setStep] = useState(0)
  const [mine, setMine] = useState<string | null>(useApp.getState().myDialectId)
  const [goal, setGoal] = useState<GoalId | null>(useApp.getState().goal)
  const [learn, setLearn] = useState<string>(useApp.getState().dialectId)
  const [showAll, setShowAll] = useState(false)
  const titleRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    titleRef.current?.focus()
  }, [step])

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && skip()
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [skip])

  const done = () => finish({ myDialectId: mine, goal, dialectId: learn })
  const next = () => (step < STEPS - 1 ? setStep(step + 1) : done())

  const titles = [t('myDialectQuestion'), t('obGoalTitle'), t('obLearnTitle')]
  const bodies = [t('myDialectBody'), t('obGoalBody'), t('obLearnBody')]
  const chip = (on: boolean) =>
    `flex items-center gap-1 rounded-full px-3.5 py-2 text-sm font-semibold transition active:scale-95 ${
      on ? 'bg-brand-600 text-white shadow-sm' : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:ring-brand-500'
    }`

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-sand-50 animate-fade" role="dialog" aria-modal="true" aria-labelledby="ob-title">
      <div className="pattern-stars relative shrink-0 overflow-hidden bg-gradient-to-br from-brand-800 to-brand-950 px-5 pt-[max(env(safe-area-inset-top),1rem)] pb-5 text-white">
        <div aria-hidden className="absolute -top-20 -end-16 h-52 w-52 rounded-full bg-sun-400/15 blur-2xl" />
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <img src="/favicon.svg" alt="" className="h-9 w-9 rounded-xl ring-1 ring-sun-400/60" />
            <span className="font-display text-lg font-bold">
              <span className="gold-text">{t('appName')}</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={toggleLang}
              aria-label={t('langToggleLabel')}
              className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-sm font-medium ring-1 ring-white/15 hover:bg-white/20"
            >
              <Languages className="h-4 w-4" aria-hidden />
              {t('langToggle')}
            </button>
            <button type="button" onClick={skip} className="rounded-full px-3 py-1.5 text-sm font-medium text-cream-100 hover:bg-white/10">
              {t('skip')}
            </button>
          </div>
        </div>
        <div className="mx-auto mt-4 max-w-2xl">
          <p className="text-sm text-cream-100">{t('obWelcome')}</p>
          <p className="font-display text-xl font-bold">{t('heroTitle')}</p>
          <div className="mt-4 flex gap-1.5" aria-hidden>
            {Array.from({ length: STEPS }, (_, i) => (
              <span key={i} className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${i <= step ? 'bg-sun-400' : 'bg-white/20'}`} />
            ))}
          </div>
          <p className="mt-1.5 text-xs text-cream-200">{t('obStepOf', { n: step + 1, total: STEPS })}</p>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div key={step} className="mx-auto max-w-2xl animate-rise px-5 py-5">
          <h2 id="ob-title" ref={titleRef} tabIndex={-1} className="text-xl font-bold outline-none">
            {titles[step]}
          </h2>
          <p className="mt-1 text-sm text-slate-600">{bodies[step]}</p>

          <div className="mt-4">
            {step === 0 && (
              <div className="space-y-4">
                <button type="button" aria-pressed={mine === null} onClick={() => setMine(null)} className={chip(mine === null)}>
                  {mine === null && <Check className="h-3.5 w-3.5" aria-hidden />}
                  {t('obNoDialect')}
                </button>
                <MyDialectList value={mine} onChange={setMine} />
              </div>
            )}

            {step === 1 && (
              <div className="stagger grid grid-cols-2 gap-2.5">
                {GOALS.map((g) => {
                  const Icon = GOAL_ICONS[g.id]
                  const on = goal === g.id
                  return (
                    <button
                      key={g.id}
                      type="button"
                      aria-pressed={on}
                      onClick={() => setGoal(g.id)}
                      className={`lift relative flex flex-col items-start gap-2 rounded-2xl border p-3.5 text-start transition ${
                        on ? 'border-brand-600 bg-brand-50 ring-2 ring-brand-600/30' : 'border-slate-200 bg-white hover:border-sun-400'
                      } ${g.id === 'curious' ? 'col-span-2' : ''}`}
                    >
                      <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${on ? 'bg-brand-700 text-sun-300' : 'bg-sand-100 text-brand-700 ring-1 ring-sun-400/30'}`}>
                        <Icon className="h-5 w-5" aria-hidden />
                      </span>
                      <span className="font-bold text-slate-900">{t(`goal_${g.id}`)}</span>
                      <span className="text-xs text-slate-600">{t(`goal_${g.id}Body`)}</span>
                      {on && <Check className="absolute top-3 end-3 h-4 w-4 text-brand-700" aria-hidden />}
                    </button>
                  )
                })}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <section>
                  <h3 className="mb-2 text-xs font-bold text-slate-500">{t('obSuggested')}</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGESTED_TO_LEARN.filter((id) => id !== mine).map((id) => {
                      const d = getDialect(id)
                      if (!d) return null
                      const on = learn === id
                      return (
                        <button key={id} type="button" aria-pressed={on} onClick={() => setLearn(id)} className={chip(on)}>
                          {on && <Check className="h-3.5 w-3.5" aria-hidden />}
                          {name(d)}
                          <span className={on ? 'text-cream-100' : 'text-slate-500'}>· {lang === 'ar' ? d.country : d.countryEn}</span>
                        </button>
                      )
                    })}
                  </div>
                </section>
                {showAll ? (
                  <MyDialectList value={learn} onChange={setLearn} />
                ) : (
                  <button type="button" onClick={() => setShowAll(true)} className="text-sm font-semibold text-brand-700 underline underline-offset-4">
                    {t('obAllDialects')}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="pb-safe shrink-0 border-t border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center gap-2 px-5 py-3">
          {step > 0 && (
            <button type="button" onClick={() => setStep(step - 1)} className="rounded-full px-4 py-2.5 text-sm font-semibold text-slate-600 ring-1 ring-slate-200 active:scale-95">
              {t('obBack')}
            </button>
          )}
          <button
            type="button"
            onClick={next}
            className="flex flex-1 items-center justify-center gap-1 rounded-full bg-gradient-to-b from-sun-300 to-sun-500 py-2.5 text-sm font-bold text-brand-950 shadow-lg shadow-sun-500/20 transition hover:brightness-105 active:scale-95"
          >
            {step < STEPS - 1 ? t('obNext') : t('obStart')}
            <ChevronLeft className="h-4 w-4 ltr:rotate-180" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  )
}
