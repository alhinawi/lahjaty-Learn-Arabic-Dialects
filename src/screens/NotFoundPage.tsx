'use client'

import { Compass } from 'lucide-react'
import EmptyState from '../components/EmptyState'
import { useT } from '../lib/i18n'

export default function NotFoundPage() {
  const t = useT()
  return (
    <div className="py-8">
      <EmptyState icon={Compass} title={t('notFound')} body={t('notFoundBody')} action={{ to: '/', label: t('goHome') }} />
    </div>
  )
}
