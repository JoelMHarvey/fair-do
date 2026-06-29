import React from 'react'

/**
 * Faresay logo — teal disc with the calm "smile" mark + lowercase Fraunces
 * wordmark. Set `tone="light"` for use on dark (brand-900) surfaces.
 */
export function Logo({ tone = 'dark', size = 28, showWord = true, style, ...rest }) {
  const light = tone === 'light'
  const disc = light ? '#ffffff' : '#217567'
  const stroke = light ? '#217567' : '#ffffff'
  const word = light ? '#ffffff' : 'var(--color-brand-900)'
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', ...style }} {...rest}>
      <svg viewBox="0 0 28 28" width={size} height={size} aria-hidden="true">
        <circle cx="14" cy="14" r="14" fill={disc} />
        <path
          d="M9 18c0-3 2-5 5-5s5 2 5 5M9.5 11.5c.8-1.2 2.3-2 4.5-2s3.7.8 4.5 2"
          fill="none"
          stroke={stroke}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
      {showWord && (
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: `${Math.round(size * 0.72)}px`,
          fontWeight: 600,
          letterSpacing: '-0.02em',
          color: word,
        }}>faresay</span>
      )}
    </span>
  )
}
