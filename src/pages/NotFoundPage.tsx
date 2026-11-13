import { Link } from 'react-router'
import { useT } from '../lib/i18n'

export default function NotFoundPage() {
  const t = useT()
  return (
    <div className="py-16 text-center">
      <p className="text-5xl" aria-hidden>
        ؟
      </p>
      <h1 className="mt-4 text-xl font-bold">{t('notFound')}</h1>
      <Link to="/" className="mt-4 inline-block rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white">
        {t('goHome')}
      </Link>
    </div>
  )
}
