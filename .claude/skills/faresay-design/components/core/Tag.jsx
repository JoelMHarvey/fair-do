import React from 'react'

/**
 * Specialism / approach chip — the small sand-tinted tags on therapist cards
 * ("Anxiety", "CBT", "EMDR"). Quieter than a Badge; meant to cluster.
 */
export function Tag({ children, style, ...rest }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        fontFamily: 'var(--font-sans)',
        fontSize: '12px',
        color: 'var(--text-muted)',
        background: 'var(--surface-muted)',
        padding: '3px 10px',
        borderRadius: 'var(--radius-pill)',
        whiteSpace: 'nowrap',
        ...style,
      }}
      {...rest}
    >
      {children}
    </span>
  )
}
