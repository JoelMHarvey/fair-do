/** Email i18n plumbing: recipient-locale resolution + template interpolation. */
import { describe, it, expect } from 'vitest'
import { emailLocale, interpolate } from '@/lib/email'

describe('emailLocale', () => {
  it('maps a full language tag to its subtag', () => {
    expect(emailLocale('en-GB')).toBe('en')
    expect(emailLocale('fr-FR')).toBe('fr')
    expect(emailLocale('pt-BR')).toBe('pt')
  })
  it('accepts a bare supported locale', () => {
    expect(emailLocale('de')).toBe('de')
  })
  it('falls back to en for missing or unsupported locales', () => {
    expect(emailLocale(undefined)).toBe('en')
    expect(emailLocale('zz')).toBe('en')
    expect(emailLocale('ja-JP')).toBe('en')
  })
})

describe('interpolate', () => {
  it('replaces named placeholders', () => {
    expect(interpolate('Hi {name}, you paid {amount}', { name: 'Alex', amount: '£29' }))
      .toBe('Hi Alex, you paid £29')
  })
  it('substitutes an empty string for a missing var (no leftover braces)', () => {
    expect(interpolate('Hi {name}', {})).toBe('Hi ')
  })
  it('leaves text without placeholders untouched and coerces numbers', () => {
    expect(interpolate('{n} days', { n: 3 })).toBe('3 days')
    expect(interpolate('no tokens', { x: 'y' })).toBe('no tokens')
  })
})
