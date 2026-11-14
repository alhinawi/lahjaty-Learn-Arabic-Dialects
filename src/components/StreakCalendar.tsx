import { useMemo } from 'react'
import { practiceDaySet } from '../lib/achievements'
import { useT } from '../lib/i18n'
import { addDays, dayKey } from '../lib/srs'
import { useApp } from '../lib/store'

const WEEKS = 15

/** The last few months as a grid, one square a day, filled on days with practice. */
export default function StreakCalendar() {
  const t = useT()
  const lang = useApp((s) => s.lang)
  const streak = useApp((s) => s.streak)
  const practiceDays = useApp((s) => s.practiceDays)
  const today = dayKey()

  const { columns, active } = useMemo(() => {
    const days = practiceDaySet({ streak, practiceDays })
    // Columns are weeks, starting on Saturday, the first day of the week in most Arab countries.
    const dow = (new Date(`${today}T00:00:00`).getDay() + 1) % 7
    const start = addDays(today, -(dow + 7 * (WEEKS - 1)))
    const cols: { day: string; on: boolean; future: boolean }[][] = []
    let active = 0
    for (let w = 0; w < WEEKS; w++) {
      const col = []
      for (let d = 0; d < 7; d++) {
        const day = addDays(start, w * 7 + d)
        const on = days.has(day)
        if (on) active++
        col.push({ day, on, future: day > today })
      }
      cols.push(col)
    }
    return { columns: cols, active }
  }, [streak, practiceDays, today])

  const fmt = new Intl.DateTimeFormat(lang === 'ar' ? 'ar-EG' : 'en-GB', { day: 'numeric', month: 'short' })
  const label = (day: string) => fmt.format(new Date(`${day}T00:00:00`))

  return (
    <div>
      <div className="no-scrollbar overflow-x-auto" dir="ltr">
        <div className="flex min-w-max justify-end gap-1" role="img" aria-label={t('calendarLabel', { n: active })}>
          {columns.map((col, i) => (
            <div key={i} className="flex flex-col gap-1">
              {col.map(({ day, on, future }) => (
                <span
                  key={day}
                  title={label(day)}
                  className={`h-4 w-4 rounded-[5px] ${
                    future ? 'opacity-0' : on ? 'bg-gradient-to-br from-sun-300 to-sun-500 shadow-sm' : 'bg-slate-100 ring-1 ring-inset ring-slate-200'
                  } ${day === today ? 'outline outline-2 outline-offset-1 outline-brand-600' : ''}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
        <span>{t('calendarActive', { n: active })}</span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-slate-100 ring-1 ring-inset ring-slate-200" />
          {t('calendarNone')}
          <span className="ms-2 h-3 w-3 rounded bg-sun-400" />
          {t('calendarDone')}
        </span>
      </div>
    </div>
  )
}
