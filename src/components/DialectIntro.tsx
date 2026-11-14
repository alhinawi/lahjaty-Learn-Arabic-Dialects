import { MapPin, Sparkles } from 'lucide-react'
import intros from '../content/dialect-intros.json'
import { useBi } from '../lib/useBi'

type Bi = { ar: string; en: string }
type Intro = { where: Bi; summary: Bi; features: Bi[] }

const INTROS = intros as Record<string, Intro>

/** Short "about this dialect" card for dialects that have no Egypt-section page. */
export default function DialectIntro({ dialectId }: { dialectId: string }) {
  const { bi, lang } = useBi()
  const intro = INTROS[dialectId]
  if (!intro) return null
  return (
    <section aria-labelledby="dialect-intro" className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5 dark:bg-slate-800 dark:ring-white/10">
      <h2 id="dialect-intro" className="text-lg font-bold">
        {lang === 'ar' ? 'عن اللهجة' : 'About this dialect'}
      </h2>
      <p className="mt-2 flex items-start gap-2 text-sm text-slate-500 dark:text-slate-400">
        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-700 dark:text-sun-300" aria-hidden />
        <span>{bi(intro.where)}</span>
      </p>
      <p className="mt-3 leading-relaxed">{bi(intro.summary)}</p>
      {intro.features.length > 0 && (
        <>
          <h3 className="mt-4 text-sm font-semibold text-slate-600 dark:text-slate-300">
            {lang === 'ar' ? 'أهم ما يميّزها' : 'What makes it stand out'}
          </h3>
          <ul className="mt-2 space-y-2">
            {intro.features.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                <Sparkles className="mt-1 h-3.5 w-3.5 shrink-0 text-sun-500" aria-hidden />
                <span>{bi(f)}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}
