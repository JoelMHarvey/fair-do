/** Locale SEO helpers: URL building + hreflang gating. */
import { describe, it, expect } from 'vitest'
import { localeUrl, hreflangLanguages } from '@/lib/i18n-seo'

describe('localeUrl', () => {
  it('puts English at the root (no prefix)', () => {
    expect(localeUrl('/pricing', 'en')).toBe('https://fair-do.com/pricing')
    expect(localeUrl('', 'en')).toBe('https://fair-do.com')
    expect(localeUrl('/', 'en')).toBe('https://fair-do.com')
  })
  it('prefixes non-English locales', () => {
    expect(localeUrl('/pricing', 'es')).toBe('https://fair-do.com/es/pricing')
    expect(localeUrl('/', 'fr')).toBe('https://fair-do.com/fr')
    expect(localeUrl('', 'de')).toBe('https://fair-do.com/de')
  })
})

describe('hreflangLanguages', () => {
  // I18N_ENABLED defaults off in the test env → no alternates advertised, so we
  // never point search engines at /es URLs that would 404 while dark-launched.
  it('returns undefined while i18n is disabled', () => {
    expect(hreflangLanguages('/pricing')).toBeUndefined()
  })
})
