/** Soft placeholders shown while a page or a dictionary topic loads. */
export function SkeletonBlock({ className = '' }: { className?: string }) {
  return <div aria-hidden className={`skeleton rounded-2xl ${className}`} />
}

/** A list of card-shaped placeholders. */
export function SkeletonCards({ count = 4, label }: { count?: number; label?: string }) {
  return (
    <div role="status" aria-live="polite" className="space-y-3">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" style={{ opacity: 1 - i * 0.15 }}>
          <SkeletonBlock className="h-5 w-2/3" />
          <SkeletonBlock className="mt-3 h-3.5 w-1/2" />
          <SkeletonBlock className="mt-2 h-3.5 w-1/3" />
        </div>
      ))}
      {label && <span className="sr-only">{label}</span>}
    </div>
  )
}

/** The whole page while its code loads: a title, a banner and a few cards. */
export function PageSkeleton({ label }: { label?: string }) {
  return (
    <div className="space-y-4">
      <SkeletonBlock className="h-7 w-40" />
      <SkeletonBlock className="h-28 w-full rounded-3xl" />
      <SkeletonCards count={3} label={label} />
    </div>
  )
}
