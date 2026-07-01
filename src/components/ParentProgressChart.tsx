// Dependency-free monthly-sessions bar chart for the parent dashboard.
// (recharts is not in the stack and the handoff says not to add a dependency,
// so this is a lightweight CSS chart — no client JS needed.)
type Point = { month: string; sessions: number }

export function ParentProgressChart({ data, emptyLabel }: { data: Point[]; emptyLabel: string }) {
  const max = Math.max(1, ...data.map(d => d.sessions))
  if (data.every(d => d.sessions === 0)) {
    return <p className="text-sm text-sand-400">{emptyLabel}</p>
  }
  return (
    <div className="flex items-end gap-2 h-32" role="img" aria-label="Lessons completed per month">
      {data.map(d => (
        <div key={d.month} className="flex-1 flex flex-col items-center justify-end gap-1">
          <span className="text-xs text-sand-500">{d.sessions}</span>
          <div
            className="w-full rounded-t bg-brand-600"
            style={{ height: `${Math.round((d.sessions / max) * 100)}%`, minHeight: d.sessions > 0 ? 4 : 0 }}
          />
          <span className="text-[10px] text-sand-400">{d.month}</span>
        </div>
      ))}
    </div>
  )
}
