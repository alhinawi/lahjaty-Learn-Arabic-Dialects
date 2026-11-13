import { ChevronLeft, Map } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { allFamous, categories, dialects, getDialect, getPhrase, phrases, STANDARD_ID } from '../lib/content'
import { useName, useT } from '../lib/i18n'

function buildGreetings() {
  const p = getPhrase('greetings.how_are_you')
  if (!p) return []
  const seen = new Set<string>()
  return dialects
    .filter((d) => d.id !== STANDARD_ID)
    .flatMap((d) => {
      const text = p.variants[d.id]?.text
      if (!text || seen.has(text)) return []
      seen.add(text)
      return [{ dialectId: d.id, text }]
    })
}
const greetings = buildGreetings()

/** The home page hero: the promise, a greeting that changes dialect every few seconds, and live counts. */
export default function Hero() {
  const t = useT()
  const name = useName()
  const [i, setI] = useState(0)
  useEffect(() => {
    if (greetings.length < 2) return
    const id = window.setInterval(() => setI((n) => (n + 1) % greetings.length), 2600)
    return () => window.clearInterval(id)
  }, [])
  const g = greetings[i]
  const d = g && getDialect(g.dialectId)

  const stats = [
    [dialects.filter((x) => x.id !== STANDARD_ID).length, t('statDialects')],
    [phrases.length + allFamous.length, t('statPhrases')],
    [categories.length, t('statSituations')],
  ] as const

  return (
    <section className="pattern-stars relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-800 via-brand-900 to-brand-950 p-5 pb-4 text-white shadow-lg">
      <div aria-hidden className="absolute -top-24 -end-20 h-64 w-64 rounded-full bg-sun-400/15 blur-2xl" />
      <div aria-hidden className="absolute -bottom-24 -start-16 h-56 w-56 rounded-full bg-brand-400/20 blur-2xl" />
      <p className="relative text-xs font-semibold tracking-wide text-sun-300">{t('tagline')}</p>
      <h1 className="relative mt-2 text-[1.7rem] leading-snug font-bold">{t('heroTitle')}</h1>
      <p className="lead relative mt-3 text-[0.95rem] text-cream-100">{t('heroBody')}</p>

      {g && d && (
        <div className="relative mt-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 rounded-2xl bg-white/[0.07] p-3 ring-1 ring-sun-400/30 backdrop-blur-sm">
          <div className="min-w-0 flex-1 basis-48">
            <p className="text-[11px] text-cream-200">{t('heroAsk')}</p>
            <p
              key={g.text}
              dir="rtl"
              lang="ar"
              className={`dialect-text animate-rise break-words text-balance font-bold leading-snug ${
                g.text.length > 18 ? 'text-xl' : g.text.length > 12 ? 'text-2xl' : 'text-3xl'
              }`}
            >
              <span className="gold-text">{g.text}</span>
            </p>
          </div>
          <Link
            key={d.id}
            to={`/dialects/${d.id}`}
            className="animate-fade shrink-0 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-sun-300 ring-1 ring-white/15"
          >
            {t('heroIn', { dialect: name(d) })}
          </Link>
        </div>
      )}

      <div className="relative mt-4 flex flex-wrap gap-2">
        <Link
          to="/lessons"
          className="inline-flex items-center gap-1 rounded-full bg-gradient-to-b from-sun-300 to-sun-500 px-5 py-2.5 text-sm font-bold text-brand-950 shadow-lg shadow-sun-500/20 transition hover:brightness-105 active:scale-95"
        >
          {t('startLearning')}
          <ChevronLeft className="h-4 w-4 ltr:rotate-180" aria-hidden />
        </Link>
        <Link
          to="/dialects"
          className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2.5 text-sm font-semibold ring-1 ring-white/20 transition hover:bg-white/15 active:scale-95"
        >
          <Map className="h-4 w-4" aria-hidden />
          {t('exploreMap')}
        </Link>
      </div>

      <dl className="relative mt-5 grid grid-cols-3 divide-x divide-white/10 border-t border-white/10 pt-3 text-center rtl:divide-x-reverse">
        {stats.map(([n, label]) => (
          <div key={label}>
            <dt className="sr-only">{label}</dt>
            <dd className="font-display text-2xl font-bold text-sun-300">{n}</dd>
            <dd className="text-[11px] text-cream-200">{label}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
