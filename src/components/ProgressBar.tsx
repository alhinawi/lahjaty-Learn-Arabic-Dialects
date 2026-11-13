export default function ProgressBar({ value, total, label }: { value: number; total: number; label?: string }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div>
      {label && <div className="mb-1 text-xs text-slate-500">{label}</div>}
      <div
        className="h-2 overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={value}
      >
        <div className="h-full rounded-full bg-sun-500 transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
