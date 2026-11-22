import { translate } from '../lib/i18n'
import { isSafeSourceUrl } from '../lib/noteSources'
import type { Lang } from '../lib/store'
import type { NoteSource } from '../lib/types'

/** This disclosure never labels a whole phrase, example or pronunciation as verified. */
export default function NoteSources({ sources, lang }: { sources?: NoteSource[]; lang: Lang }) {
  const items = sources?.filter((s) => isSafeSourceUrl(s?.url) && s.title?.trim() && s.titleAr?.trim())
  if (!items?.length) return null
  return (
    <details className="mt-2 rounded-xl bg-sand-50 px-3 text-xs text-slate-600">
      <summary className="min-h-11 cursor-pointer content-center rounded-md py-3 font-semibold text-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700">
        {translate(lang, 'noteSources')}
      </summary>
      <div className="space-y-2 pb-3 pt-2">
        <p>{translate(lang, 'noteSourcesScope')}</p>
        <ul className="list-disc space-y-1 ps-4">
          {items.map((source) => (
            <li key={source.url}>
              <a href={source.url} target="_blank" rel="noopener noreferrer" className="inline-block break-words py-1 font-medium text-brand-700 underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700">
                {lang === 'ar' ? source.titleAr : source.title}
                <span className="sr-only"> ({translate(lang, 'sourceNewTab')})</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </details>
  )
}
