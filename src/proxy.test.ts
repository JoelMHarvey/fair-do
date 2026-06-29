import { describe, it, expect } from 'vitest'

// Internal helpers extracted for testing — they match what's in proxy.ts
const NON_EN_LOCALES = ['fr', 'de', 'it', 'es', 'pt'] as const
type NonEnLocale = typeof NON_EN_LOCALES[number]
type Locale = 'en' | NonEnLocale

function getPathLocale(pathname: string): NonEnLocale | null {
  const seg = pathname.split('/')[1] as string
  return (NON_EN_LOCALES as readonly string[]).includes(seg) ? (seg as NonEnLocale) : null
}

function negotiateLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return 'en'
  const supported: Locale[] = ['fr', 'de', 'it', 'es', 'pt', 'en']
  const prefs = acceptLanguage
    .split(',')
    .slice(0, 10)
    .map(part => {
      const [lang, q = '1'] = part.trim().split(';q=')
      const qVal = parseFloat(q)
      return { lang: lang.split('-')[0].toLowerCase(), q: isNaN(qVal) ? 1 : Math.min(Math.max(qVal, 0), 1) }
    })
    .filter(p => p.q > 0)
    .sort((a, b) => b.q - a.q)
  for (const { lang } of prefs) {
    const hit = supported.find(s => s === lang)
    if (hit) return hit
  }
  return 'en'
}

// ── getPathLocale ────────────────────────────────────────────────────────────

describe('getPathLocale', () => {
  it('returns null for root path', () => {
    expect(getPathLocale('/')).toBeNull()
  })

  it('returns locale for /fr', () => {
    expect(getPathLocale('/fr')).toBe('fr')
  })

  it('returns locale for /de/some/path', () => {
    expect(getPathLocale('/de/some/path')).toBe('de')
  })

  it('returns null for /en (English is root)', () => {
    expect(getPathLocale('/en')).toBeNull()
  })

  it('returns null for unrecognised segment', () => {
    expect(getPathLocale('/xyz')).toBeNull()
  })

  it('returns null for /api/foo', () => {
    expect(getPathLocale('/api/foo')).toBeNull()
  })

  it('handles all supported locales', () => {
    for (const l of NON_EN_LOCALES) {
      expect(getPathLocale(`/${l}`)).toBe(l)
    }
  })
})

// ── negotiateLocale ──────────────────────────────────────────────────────────

describe('negotiateLocale', () => {
  it('returns en for null header', () => {
    expect(negotiateLocale(null)).toBe('en')
  })

  it('returns en for empty string', () => {
    expect(negotiateLocale('')).toBe('en')
  })

  it('returns fr for Accept-Language: fr', () => {
    expect(negotiateLocale('fr')).toBe('fr')
  })

  it('returns fr for Accept-Language: fr-FR', () => {
    expect(negotiateLocale('fr-FR')).toBe('fr')
  })

  it('returns de for Accept-Language: de-DE,de;q=0.9,en;q=0.8', () => {
    expect(negotiateLocale('de-DE,de;q=0.9,en;q=0.8')).toBe('de')
  })

  it('respects q-values — picks higher-q locale', () => {
    expect(negotiateLocale('en;q=0.9,fr;q=1.0')).toBe('fr')
  })

  it('skips q=0 (not acceptable per RFC 7231)', () => {
    expect(negotiateLocale('fr;q=0,en;q=1')).toBe('en')
  })

  it('q=0 does not override fallback to en', () => {
    expect(negotiateLocale('fr;q=0')).toBe('en')
  })

  it('handles negative q (clamps to 0, excluded)', () => {
    expect(negotiateLocale('fr;q=-1,en;q=0.5')).toBe('en')
  })

  it('handles q > 1 (clamps to 1)', () => {
    // fr;q=2 clamped to 1, same as en;q=1 — first match (fr) wins
    expect(negotiateLocale('fr;q=2,en;q=1')).toBe('fr')
  })

  it('falls back to en for unknown locale', () => {
    expect(negotiateLocale('zh,ja')).toBe('en')
  })

  it('case-insensitive language tag', () => {
    expect(negotiateLocale('FR')).toBe('fr')
    expect(negotiateLocale('DE')).toBe('de')
  })

  it('only checks first 10 preferences (DoS guard)', () => {
    const manyLocales = Array.from({ length: 20 }, (_, i) => `xx${i};q=0.1`).join(',') + ',fr;q=0.9'
    // fr is at position 21 — beyond the slice(0,10) cap, should fall back to en
    expect(negotiateLocale(manyLocales)).toBe('en')
  })

  it('handles malformed q (treats as 1)', () => {
    expect(negotiateLocale('fr;q=abc')).toBe('fr')
  })
})
