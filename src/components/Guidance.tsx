import Link from 'next/link'
import type { ReactNode } from 'react'

// Plain, consistent page header: title + one-line "what this page is for".
// Every therapist page should start with one so a non-technical user always
// knows where they are and what it does.
export function PageHeader({
  title,
  subtitle,
  help,
  action,
}: {
  title: string
  subtitle?: string
  help?: { href: string; label?: string }
  action?: ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-brand-900">{title}</h1>
        {subtitle && <p className="text-sand-600 mt-1 max-w-xl">{subtitle}</p>}
        {help && (
          <Link href={help.href} className="inline-flex items-center gap-1 text-sm text-brand-700 hover:underline mt-2">
            <span aria-hidden>📘</span> {help.label ?? 'How this works'}
          </Link>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

// Inline "tip" callout — gentle guidance in context (not an error).
export function HelpHint({ children, tone = 'tip' }: { children: ReactNode; tone?: 'tip' | 'note' }) {
  const styles = tone === 'note'
    ? 'bg-sand-100 border-sand-200 text-sand-700'
    : 'bg-brand-50 border-brand-200 text-brand-800'
  return (
    <div className={`rounded-xl border ${styles} px-4 py-3 text-sm flex gap-2 items-start`}>
      <span aria-hidden className="shrink-0">{tone === 'note' ? 'ℹ️' : '💡'}</span>
      <div className="leading-relaxed">{children}</div>
    </div>
  )
}

// Friendly empty state: what this is + what to do next + the one button to do it.
export function EmptyState({
  icon = '🌱',
  title,
  body,
  cta,
}: {
  icon?: string
  title: string
  body: string
  cta?: { href: string; label: string }
}) {
  return (
    <div className="bg-white rounded-3xl border border-sand-200 p-10 text-center shadow-sm">
      <div className="text-4xl mb-3" aria-hidden>{icon}</div>
      <h2 className="font-display text-xl font-semibold text-brand-900 mb-1">{title}</h2>
      <p className="text-sand-600 max-w-md mx-auto mb-6">{body}</p>
      {cta && (
        <Link href={cta.href} className="inline-block bg-brand-600 text-white px-6 py-3 rounded-full font-medium hover:bg-brand-700 transition shadow-sm">
          {cta.label}
        </Link>
      )}
    </div>
  )
}
