import { ChevronLeft } from 'lucide-react'
import { Link } from 'react-router'
import { goalCategories } from '../lib/goals'
import { useName, useT } from '../lib/i18n'
import { useApp } from '../lib/store'
import CategoryIcon from './CategoryIcon'

/** The situations that fit the goal picked in the welcome steps, as a row to swipe. */
export default function GoalSuggestions() {
  const t = useT()
  const name = useName()
  const goal = useApp((s) => s.goal)
  const restart = useApp((s) => s.restartOnboarding)
  const list = goalCategories(goal)
  if (!goal || list.length === 0) return null

  return (
    <section className="rounded-3xl border border-sun-300/70 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="font-bold">{t('forYourGoal')}</h2>
          <p className="text-xs text-slate-600">{t('forYourGoalBody', { goal: t(`goal_${goal}`) })}</p>
        </div>
        <button type="button" onClick={restart} className="shrink-0 text-xs font-semibold text-brand-700 underline underline-offset-4">
          {t('changeGoal')}
        </button>
      </div>
      <div className="no-scrollbar stagger -mx-4 mt-3 flex gap-2.5 overflow-x-auto px-4 pb-1">
        {list.map((c) => (
          <Link
            key={c.id}
            to={`/lessons/${c.id}`}
            className="lift flex w-32 shrink-0 flex-col gap-2 rounded-2xl bg-gradient-to-br from-brand-50 to-sand-100 p-3 ring-1 ring-sun-400/30"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-700 text-sun-300">
              <CategoryIcon id={c.id} className="h-5 w-5" />
            </span>
            <span className="flex items-center justify-between gap-1 text-sm font-semibold text-slate-800">
              {name(c)}
              <ChevronLeft className="h-4 w-4 shrink-0 text-slate-400 ltr:rotate-180" aria-hidden />
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
