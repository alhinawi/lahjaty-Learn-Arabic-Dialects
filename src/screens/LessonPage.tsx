'use client'

import { ArrowLeft, Type } from 'lucide-react'
import Link from 'next/link'
import CategoryIcon from '../components/CategoryIcon'
import DialectChip from '../components/DialectChip'
import PhraseCard from '../components/PhraseCard'
import { getCategory, phrasesInCategory } from '../lib/content'
import { useName, useT } from '../lib/i18n'
import { useApp } from '../lib/store'
import NotFoundPage from './NotFoundPage'

export default function LessonPage({ categoryId }: { categoryId: string }) {
  const t = useT()
  const name = useName()
  const dialectId = useApp((s) => s.dialectId)
  const showTranslit = useApp((s) => s.showTranslit)
  const toggleTranslit = useApp((s) => s.toggleTranslit)
  const category = getCategory(categoryId)
  if (!category) return <NotFoundPage />

  const list = phrasesInCategory(category.id)
  const anyTranslit = list.some((p) => p.variants[dialectId]?.translit)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/lessons" aria-label={t('back')} className="rounded-full p-2 text-slate-500 hover:bg-slate-100">
          <ArrowLeft className="h-5 w-5 rtl:rotate-180" aria-hidden />
        </Link>
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sand-100 text-brand-700">
          <CategoryIcon id={category.id} className="h-5 w-5" />
        </span>
        <h1 className="flex-1 text-xl font-bold">{name(category)}</h1>
      </div>

      <DialectChip next={`/lessons/${category.id}`} />

      {anyTranslit && (
        <button
          type="button"
          onClick={toggleTranslit}
          aria-pressed={showTranslit}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
            showTranslit ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200'
          }`}
        >
          <Type className="h-3.5 w-3.5" aria-hidden />
          {t('translit')}
        </button>
      )}

      <div className="space-y-3">
        {list.map((p) => (
          <PhraseCard key={p.id} phrase={p} dialectId={dialectId} />
        ))}
      </div>
    </div>
  )
}
