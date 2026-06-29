import React from 'react'

/**
 * The Faresay surface. White, rounded-3xl (24px), 1px sand border, quiet shadow.
 * Set `interactive` for the hover-lift used on therapist/listing cards.
 */
export function Card({ children, interactive = false, padding = 'lg', as = 'div', style, ...rest }) {
  const pads = { none: 0, sm: '16px', md: '20px', lg: '24px', xl: '32px' }
  const El = as
  const base = {
    background: 'var(--surface-card)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-xl)',
    boxShadow: 'var(--shadow-sm)',
    padding: pads[padding] ?? padding,
    transition: 'border-color var(--dur-fast) ease, box-shadow var(--dur-fast) ease, transform var(--dur-fast) ease',
    display: 'block',
    ...style,
  }
  const handlers = interactive ? {
    onMouseEnter: (e) => {
      e.currentTarget.style.borderColor = 'var(--border-brand)'
      e.currentTarget.style.boxShadow = 'var(--shadow-md)'
    },
    onMouseLeave: (e) => {
      e.currentTarget.style.borderColor = 'var(--border-default)'
      e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
    },
  } : {}
  return <El style={base} {...handlers} {...rest}>{children}</El>
}
