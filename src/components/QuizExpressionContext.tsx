'use client'

import { BookOpen } from 'lucide-react'
import Link from 'next/link'
import { getFamous } from '../lib/content'
import { useT } from '../lib/i18n'

/** Reveal the exact encyclopedia entry only after a guess has been answered. */
export default function QuizExpressionContext({ answered, dialectId, phraseId }: { answered: boolean; dialectId: string; phraseId: string }) {
  const t = useT()
  if (!answered || !getFamous(dialectId, phraseId)) return null
  const query = new URLSearchParams({ dialect: dialectId, phrase: phraseId })
  return (
    <Link href={`/share/?${query}`} data-quiz-expression-context className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-100">
      <BookOpen className="h-4 w-4 shrink-0" aria-hidden />
      {t('phraseContext')}
    </Link>
  )
}
