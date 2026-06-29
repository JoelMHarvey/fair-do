import Link from 'next/link'

export type GuideStep = { label: string; href: string; done: boolean; hint?: string }

// First-run checklist for the therapist dashboard. Shows the exact next steps to a
// brand-new (non-technical) therapist, with a tick as each is completed. Hides itself
// once everything's done so it doesn't nag established users.
export function GettingStarted({ steps }: { steps: GuideStep[] }) {
  const done = steps.filter(s => s.done).length
  if (done === steps.length) return null
  const pct = Math.round((done / steps.length) * 100)
  const next = steps.find(s => !s.done)

  return (
    <section className="bg-white rounded-3xl border border-sand-200 shadow-sm p-6 mb-8">
      <div className="flex items-center justify-between gap-3 mb-1">
        <h2 className="font-display text-lg font-semibold text-brand-900">Getting started</h2>
        <span className="text-sm text-sand-500">{done} of {steps.length} done</span>
      </div>
      <p className="text-sand-600 text-sm mb-4">A few quick steps and you&apos;re ready to see clients. We&apos;ll guide you through each one.</p>

      <div className="h-2 rounded-full bg-sand-100 overflow-hidden mb-5">
        <div className="h-full bg-brand-500 transition-all" style={{ width: `${pct}%` }} />
      </div>

      <ol className="space-y-2">
        {steps.map((s, i) => {
          const isNext = s === next
          return (
            <li key={s.label}>
              <Link
                href={s.href}
                className={`flex items-start gap-3 rounded-xl px-3 py-3 transition border ${
                  s.done ? 'border-transparent opacity-70'
                  : isNext ? 'border-brand-300 bg-brand-50 hover:bg-brand-100'
                  : 'border-transparent hover:bg-sand-50'
                }`}
              >
                <span
                  className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-semibold ${
                    s.done ? 'bg-brand-500 text-white' : 'bg-sand-200 text-sand-600'
                  }`}
                  aria-hidden
                >
                  {s.done ? '✓' : i + 1}
                </span>
                <span className="min-w-0">
                  <span className={`font-medium ${s.done ? 'text-sand-500 line-through' : 'text-sand-800'}`}>{s.label}</span>
                  {s.hint && !s.done && <span className="block text-xs text-sand-500 mt-0.5">{s.hint}</span>}
                </span>
                {isNext && <span className="ml-auto shrink-0 text-sm font-medium text-brand-700 self-center">Start →</span>}
              </Link>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
