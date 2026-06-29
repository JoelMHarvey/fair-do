import React from 'react'

/**
 * Headline stat tile — the "You pay £40–55", "Therapist keeps 90%" cards from
 * the homepage and dashboard. Big Fraunces value, small muted label + sub.
 */
export function Stat({ label, value, sub, accent = 'brand', align = 'center', style, ...rest }) {
  const accents = {
    brand: 'var(--color-brand-600)',
    coral: 'var(--color-coral-500)',
    dark: 'var(--color-sand-900)',
  }
  return (
    <div
      style={{
        background: 'var(--surface-card)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-sm)',
        padding: '24px 20px',
        textAlign: align,
        ...style,
      }}
      {...rest}
    >
      <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-subtle)' }}>{label}</p>
      <p style={{
        margin: '4px 0',
        fontFamily: 'var(--font-display)',
        fontWeight: 600,
        fontSize: '40px',
        lineHeight: 1.05,
        letterSpacing: '-0.02em',
        color: accents[accent] ?? accent,
      }}>{value}</p>
      {sub && <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-subtle)' }}>{sub}</p>}
    </div>
  )
}
