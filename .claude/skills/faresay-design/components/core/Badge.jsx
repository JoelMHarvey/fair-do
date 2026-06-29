import React from 'react'

/**
 * Small pill label. Used for credential badges, "Founding", ratings, status.
 * Faresay badges are soft-tinted with a matching border — never loud.
 */
export function Badge({ children, tone = 'neutral', icon, style, ...rest }) {
  const tones = {
    neutral: { background: 'var(--surface-muted)', color: 'var(--text-muted)', borderColor: 'transparent' },
    brand:   { background: 'var(--accent-soft)', color: 'var(--color-brand-700)', borderColor: 'var(--border-brand)' },
    solid:   { background: 'var(--accent)', color: '#fff', borderColor: 'transparent' },
    coral:   { background: 'var(--color-coral-50)', color: 'var(--color-coral-600)', borderColor: 'var(--color-coral-200)' },
    amber:   { background: 'var(--color-amber-50)', color: 'var(--color-amber-700)', borderColor: 'var(--color-amber-200)' },
    outline: { background: 'var(--surface-card)', color: 'var(--text-muted)', borderColor: 'var(--border-default)' },
  }
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        fontFamily: 'var(--font-sans)',
        fontSize: '12px',
        fontWeight: 500,
        lineHeight: 1,
        padding: '5px 11px',
        borderRadius: 'var(--radius-pill)',
        border: '1px solid',
        whiteSpace: 'nowrap',
        ...tones[tone],
        ...style,
      }}
      {...rest}
    >
      {icon && <span aria-hidden="true">{icon}</span>}
      {children}
    </span>
  )
}
