import { BookOpen, ChevronLeft, MapPinned, Sparkles } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router'
import FamousCard from '../components/FamousCard'
import { famousFor, getDialect, regions } from '../lib/content'
import { egyptNodeForDialect } from '../lib/egypt'
import { useName, useT } from '../lib/i18n'
import { useApp } from '../lib/store'
import NotFoundPage from './NotFoundPage'

export default function DialectPage() {
  const t = useT()
  const name = useName()
  const navigate = useNavigate()
  const { dialectId } = useParams()
  const lang = useApp((s) => s.lang)
  const learning = useApp((s) => s.dialectId)
  const setDialect = useApp((s) => s.setDialect)
  const dialect = getDialect(dialectId)
  if (!dialect) return <NotFoundPage />
  const region = regions.find((r) => r.id === dialect.region)
  const famous = famousFor(dialect.id)
  const isLearning = learning === dialect.id

  const egyptNode = egyptNodeForDialect(dialect.id)
  return (
    <div className="space-y-4">
      <section className="rounded-3xl bg-gradient-to-br from-brand-700 to-brand-900 p-5 text-white shadow">
        <p className="text-xs text-brand-200">
          {region && name(region)}
          {dialect.country && ` · ${lang === 'ar' ? dialect.country : dialect.countryEn}`}
        </p>
        <h1 className="mt-1 text-2xl font-bold">{name(dialect)}</h1>
        <button
          type="button"
          onClick={() => {
            setDialect(dialect.id)
            navigate('/lessons')
          }}
          className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-sun-400 px-4 py-2 text-sm font-bold text-brand-900 hover:bg-sun-500"
        >
          <BookOpen className="h-4 w-4" aria-hidden />
          {isLearning ? t('learningThis') : t('learnThisDialect')}
          <ChevronLeft className="h-4 w-4 ltr:rotate-180" aria-hidden />
        </button>
        {egyptNode && (
          <Link
            to={`/egypt/${egyptNode.id}`}
            className="ms-2 mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold ring-1 ring-white/20 hover:bg-white/15"
          >
            <MapPinned className="h-4 w-4 text-sun-300" aria-hidden />
            {t('egyptAbout')}
          </Link>
        )}
      </section>

      <section id="famous" className="space-y-3">
        <div>
          <h2 className="flex items-center gap-1.5 text-lg font-bold">
            <Sparkles className="h-5 w-5 text-sun-500" aria-hidden />
            {t('famousTitle')}
          </h2>
          <p className="text-sm text-slate-500">{t('famousBody')}</p>
        </div>
        {famous.map((f) => (
          <FamousCard key={f.id} phrase={f} dialectId={dialect.id} />
        ))}
      </section>

      <Link to="/dialects" className="block text-center text-sm font-semibold text-brand-700">
        {t('chooseDialect')}
      </Link>
    </div>
  )
}
