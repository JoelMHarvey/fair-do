import React from 'react'

/**
 * Therapist / user avatar. Square-rounded (rounded-2xl) tile with brand-tinted
 * background and Fraunces initials, matching the product's therapist cards.
 * Pass `src` for a photo; otherwise initials from `name` are shown.
 */
export function Avatar({ name = '', src, size = 56, style, ...rest }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('')

  return (
    <div
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: 'var(--radius-lg)',
        background: 'var(--color-brand-100)',
        color: 'var(--color-brand-700)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        fontFamily: 'var(--font-display)',
        fontWeight: 600,
        fontSize: Math.round(size * 0.34),
        ...style,
      }}
      {...rest}
    >
      {src
        ? <img src={src} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : <span aria-hidden="true">{initials}</span>}
    </div>
  )
}
