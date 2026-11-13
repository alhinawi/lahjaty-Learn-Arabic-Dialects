import { ChevronLeft, Languages, MessagesSquare } from 'lucide-react'
import { Link } from 'react-router'
import type { EgyptNode, EgyptKind } from '../lib/egypt'
import { egyptChildren, egyptRegionColors } from '../lib/egypt'
import { useT } from '../lib/i18n'
import { useBi } from '../lib/useBi'

/** Says plainly whether something is an Arabic dialect or a separate language. */
export function KindBadge({ kind }: { kind: EgyptKind }) {
  const t = useT()
  return kind === 'language' ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-bold text-violet-800 dark:bg-violet-500/20 dark:text-violet-200">
      <Languages className="h-3 w-3" aria-hidden />
      {t('egyptLanguage')}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-2 py-0.5 text-[11px] font-bold text-brand-800">
      <MessagesSquare className="h-3 w-3" aria-hidden />
      {t('egyptArabic')}
    </span>
  )
}


/** A tappable card for a region, variety or sub-variety. */
export function EgyptNodeCard({ node }: { node: EgyptNode }) {
  const t = useT()
  const { bi, list, nodeName, lang } = useBi()
  const kids = egyptChildren(node)
  const where = node.area ? bi(node.area) : list(node.governorates).join(lang === 'ar' ? '، ' : ', ')
  return (
    <Link
      to={`/egypt/${node.id}`}
      className="lift flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm hover:border-sun-400"
    >
      <span
        className="mt-1 h-3 w-3 shrink-0 rounded-full ring-2 ring-white"
        style={{ backgroundColor: egyptRegionColors[node.regionId] }}
        aria-hidden
      />
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-bold text-slate-900">{nodeName(node)}</span>
          {lang === 'ar' && <span className="text-xs text-slate-400" dir="ltr">{node.nameEn}</span>}
          {node.kind === 'language' && <KindBadge kind="language" />}
        </span>
        {where && <span className="mt-0.5 block text-xs leading-relaxed text-slate-500">{where}</span>}
        {kids.length > 0 && (
          <span className="mt-1 block text-[11px] font-semibold text-brand-700">{t('egyptVarieties', { n: kids.length })}</span>
        )}
      </span>
      <ChevronLeft className="mt-1 h-4 w-4 shrink-0 text-slate-400 ltr:rotate-180" aria-hidden />
    </Link>
  )
}
