'use client'

import { ChevronLeft, Lightbulb } from 'lucide-react'
import Link from 'next/link'
import { concepts, famousByConcept, STANDARD_ID } from '../lib/content'
import { useT } from '../lib/i18n'

/** Every concept that at least one dialect has a famous phrase for, as an index of meaning-first pages. */
export default function ConceptsPage() {
  const t = useT()
  // Standard Arabic is the reference, not a dialect: count real dialect variants only.
  const used = concepts
    .map((c) => ({ concept: c, variants: famousByConcept(c.id).filter((v) => v.dialectId !== STANDARD_ID) }))
    .filter((x) => x.variants.length > 0)

  return (
    <div className="space-y-4">
      <header className="pattern-stars relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-800 to-brand-950 p-5 text-white shadow-md">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sun-400/15 ring-1 ring-sun-400/40">
          <Lightbulb className="h-6 w-6 text-sun-300" aria-hidden />
        </span>
        <h1 className="mt-3 text-2xl font-bold">{t('conceptsTitle')}</h1>
        <p className="mt-1 text-sm text-cream-100">{t('conceptsBody')}</p>
      </header>

      <ul className="stagger grid grid-cols-2 gap-2.5">
        {used.map(({ concept, variants }) => (
          <li key={concept.id}>
            <Link
              href={`/concepts/${concept.id}/`}
              className="lift flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-3 shadow-sm hover:border-sun-400"
            >
              <span dir="rtl" lang="ar" className="dialect-text text-xl font-bold text-brand-800">{concept.name}</span>
              <span dir="ltr" lang="en" className="text-start text-xs text-slate-500">{concept.nameEn}</span>
              <span className="mt-auto flex items-center justify-between pt-2 text-[11px] font-semibold text-brand-700">
                {t('conceptDialectCount', { n: variants.length })}
                <ChevronLeft className="h-3.5 w-3.5 ltr:rotate-180" aria-hidden />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
