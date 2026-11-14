import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'

/** A friendly empty or not-found state: an icon in a gold ring, a line or two, and one way forward. */
export default function EmptyState({
  icon: Icon,
  title,
  body,
  action,
  children,
}: {
  icon: LucideIcon
  title: string
  body?: string
  action?: { to: string; label: string }
  children?: ReactNode
}) {
  return (
    <div className="animate-rise relative overflow-hidden rounded-3xl border border-dashed border-sun-400/60 bg-gradient-to-b from-white to-sand-50 px-6 py-10 text-center">
      <div aria-hidden className="pattern-stars absolute inset-0 opacity-40" />
      <div className="relative">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-b from-brand-700 to-brand-900 text-sun-300 shadow-lg ring-4 ring-sun-400/25">
          <Icon className="h-7 w-7" aria-hidden />
        </span>
        <h2 className="mt-4 text-lg font-bold text-slate-900">{title}</h2>
        {body && <p className="mx-auto mt-1 max-w-xs text-sm text-slate-600">{body}</p>}
        {children}
        {action && (
          <Link
            to={action.to}
            className="mt-5 inline-flex items-center rounded-full bg-gradient-to-b from-sun-300 to-sun-500 px-5 py-2.5 text-sm font-bold text-brand-950 shadow-md shadow-sun-500/20 transition active:scale-95"
          >
            {action.label}
          </Link>
        )}
      </div>
    </div>
  )
}
