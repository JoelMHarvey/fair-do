import React from 'react'

/**
 * Text field with a calm label. White surface, sand border, brand focus ring.
 * Works for input or textarea (`multiline`). Supports a small hint line.
 */
export function Input({
  label,
  hint,
  multiline = false,
  rows = 4,
  id,
  style,
  ...rest
}) {
  const fieldId = id || (label ? `f-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined)
  const field = {
    width: '100%',
    fontFamily: 'var(--font-sans)',
    fontSize: '15px',
    color: 'var(--text-body)',
    background: 'var(--surface-card)',
    border: '1px solid var(--border-strong)',
    borderRadius: 'var(--radius-md)',
    padding: '11px 14px',
    outline: 'none',
    transition: 'border-color var(--dur-fast) ease, box-shadow var(--dur-fast) ease',
    boxSizing: 'border-box',
    resize: multiline ? 'vertical' : undefined,
    ...style,
  }
  const focus = {
    onFocus: (e) => {
      e.currentTarget.style.borderColor = 'var(--accent)'
      e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-soft)'
    },
    onBlur: (e) => {
      e.currentTarget.style.borderColor = 'var(--border-strong)'
      e.currentTarget.style.boxShadow = 'none'
    },
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && (
        <label htmlFor={fieldId} style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 500, color: 'var(--text-strong)' }}>
          {label}
        </label>
      )}
      {multiline
        ? <textarea id={fieldId} rows={rows} style={field} {...focus} {...rest} />
        : <input id={fieldId} style={field} {...focus} {...rest} />}
      {hint && <span style={{ fontSize: '12px', color: 'var(--text-subtle)' }}>{hint}</span>}
    </div>
  )
}
