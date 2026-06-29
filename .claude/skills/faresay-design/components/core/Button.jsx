import React from 'react'

/**
 * Faresay primary action. Pill-shaped, calm, with a brand-tinted shadow on
 * the primary variant. Hovers lift gently (-1px) — never bounce.
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  href,
  type = 'button',
  disabled = false,
  fullWidth = false,
  onClick,
  style,
  ...rest
}) {
  const sizes = {
    sm: { padding: '8px 18px', fontSize: '14px' },
    md: { padding: '12px 26px', fontSize: '15px' },
    lg: { padding: '16px 32px', fontSize: '16px' },
  }

  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontFamily: 'var(--font-sans)',
    fontWeight: 500,
    lineHeight: 1,
    borderRadius: 'var(--radius-pill)',
    border: '1px solid transparent',
    cursor: disabled ? 'not-allowed' : 'pointer',
    textDecoration: 'none',
    transition: 'background var(--dur-fast) ease, color var(--dur-fast) ease, border-color var(--dur-fast) ease, transform var(--dur-fast) ease, box-shadow var(--dur-fast) ease',
    width: fullWidth ? '100%' : 'auto',
    opacity: disabled ? 0.5 : 1,
    whiteSpace: 'nowrap',
    ...sizes[size],
  }

  const variants = {
    primary: {
      background: 'var(--accent)',
      color: 'var(--text-on-brand)',
      boxShadow: 'var(--shadow-cta)',
    },
    secondary: {
      background: 'var(--surface-card)',
      color: 'var(--color-brand-800)',
      borderColor: 'var(--border-strong)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--color-brand-700)',
      borderColor: 'var(--border-brand)',
    },
    inverse: {
      background: 'var(--surface-card)',
      color: 'var(--color-brand-900)',
    },
    coral: {
      background: 'var(--highlight)',
      color: 'var(--text-on-brand)',
    },
  }

  const hoverFor = {
    primary: (el, on) => {
      el.style.background = on ? 'var(--accent-hover)' : 'var(--accent)'
      el.style.transform = on ? 'translateY(-1px)' : 'none'
    },
    secondary: (el, on) => {
      el.style.borderColor = on ? 'var(--border-brand)' : 'var(--border-strong)'
      el.style.background = on ? 'var(--accent-soft)' : 'var(--surface-card)'
    },
    ghost: (el, on) => { el.style.background = on ? 'var(--accent-soft)' : 'transparent' },
    inverse: (el, on) => { el.style.background = on ? 'var(--color-brand-50)' : 'var(--surface-card)' },
    coral: (el, on) => { el.style.background = on ? 'var(--color-coral-600)' : 'var(--highlight)' },
  }

  const handlers = disabled ? {} : {
    onMouseEnter: (e) => hoverFor[variant]?.(e.currentTarget, true),
    onMouseLeave: (e) => hoverFor[variant]?.(e.currentTarget, false),
  }

  const props = { style: { ...base, ...variants[variant], ...style }, ...handlers, ...rest }

  if (href && !disabled) {
    return <a href={href} {...props}>{children}</a>
  }
  return <button type={type} disabled={disabled} onClick={onClick} {...props}>{children}</button>
}
