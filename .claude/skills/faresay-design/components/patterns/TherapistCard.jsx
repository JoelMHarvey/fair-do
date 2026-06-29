import React from 'react'
import { Avatar } from '../core/Avatar.jsx'
import { Badge } from '../core/Badge.jsx'
import { Tag } from '../core/Tag.jsx'
import { Button } from '../core/Button.jsx'

/**
 * Therapist listing card — the core marketplace object. Composes Avatar, Badge,
 * Tag and Button. Mirrors the product's /therapists results row.
 */
export function TherapistCard({
  name,
  credential,
  tagline,
  bio,
  photo,
  price,
  priceCaption = 'per session',
  rating,
  ratingCount,
  founding = false,
  bestMatch = false,
  specialisms = [],
  nextAvailable,
  onBook,
  onView,
  style,
  ...rest
}) {
  return (
    <div
      style={{
        background: 'var(--surface-card)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-sm)',
        padding: '24px',
        transition: 'border-color var(--dur-fast) ease, box-shadow var(--dur-fast) ease',
        ...style,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-brand)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)' }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)' }}
      {...rest}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
        <Avatar name={name} src={photo} size={56} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 600, color: 'var(--text-heading)' }}>{name}</p>
            {bestMatch && <Badge tone="solid">Best match</Badge>}
            {rating != null && <Badge tone="amber" icon="★">{rating}{ratingCount != null ? ` (${ratingCount})` : ''}</Badge>}
            {founding && <Badge tone="coral" icon="★">Founding</Badge>}
          </div>
          <p style={{ margin: '3px 0 0', fontSize: '14px', color: 'var(--text-subtle)' }}>
            {credential}{tagline ? ` · ${tagline}` : ''}
          </p>
          {bio && <p style={{ margin: '10px 0 0', fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.5 }}>{bio}</p>}
          {specialisms.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px' }}>
              {specialisms.slice(0, 4).map((s) => <Tag key={s}>{s}</Tag>)}
            </div>
          )}
          {nextAvailable && (
            <p style={{ margin: '10px 0 0', fontSize: '12px', fontWeight: 500, color: 'var(--color-brand-600)' }}>⏱ Next: {nextAvailable}</p>
          )}
        </div>
        {price && (
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 600, color: 'var(--text-heading)' }}>{price}</p>
            <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-subtle)' }}>{priceCaption}</p>
          </div>
        )}
      </div>
      {(onBook || onView) && (
        <div style={{ display: 'flex', gap: '12px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--color-sand-100)' }}>
          {onBook && <Button onClick={onBook} fullWidth>Book session</Button>}
          {onView && <Button onClick={onView} variant="secondary">View profile</Button>}
        </div>
      )}
    </div>
  )
}
