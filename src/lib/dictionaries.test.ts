import { describe, it, expect } from 'vitest'
import { LOCALES, NON_EN_LOCALES, isValidLocale } from './locale-config'
import en from '../messages/en.json'
import fr from '../messages/fr.json'
import de from '../messages/de.json'
import itDict from '../messages/it.json'
import esDict from '../messages/es.json'
import ptDict from '../messages/pt.json'

function leafKeys(obj: unknown, prefix = ''): string[] {
  if (Array.isArray(obj)) {
    return obj.flatMap((v, i) => leafKeys(v, `${prefix}[${i}]`))
  }
  if (typeof obj === 'object' && obj !== null) {
    return Object.entries(obj).flatMap(([k, v]) =>
      leafKeys(v, prefix ? `${prefix}.${k}` : k),
    )
  }
  return [prefix]
}

const enKeys = leafKeys(en).sort()

// ── locale-config ────────────────────────────────────────────────────────────

describe('isValidLocale', () => {
  it('accepts all LOCALES entries', () => {
    for (const l of LOCALES) expect(isValidLocale(l)).toBe(true)
  })

  it('rejects unknown code', () => {
    expect(isValidLocale('xx')).toBe(false)
  })

  it('is case-sensitive (uppercase rejected)', () => {
    expect(isValidLocale('EN')).toBe(false)
    expect(isValidLocale('FR')).toBe(false)
  })

  it('NON_EN_LOCALES does not contain en', () => {
    expect((NON_EN_LOCALES as readonly string[]).includes('en')).toBe(false)
  })

  it('LOCALES contains en', () => {
    expect((LOCALES as readonly string[]).includes('en')).toBe(true)
  })
})

// ── message key parity ───────────────────────────────────────────────────────

describe('message key parity', () => {
  const cases: [string, typeof en][] = [
    ['fr', fr as typeof en],
    ['de', de as typeof en],
    ['it', itDict as typeof en],
    ['es', esDict as typeof en],
    ['pt', ptDict as typeof en],
  ]
  for (const [locale, dict] of cases) {
    it(`${locale} has all keys from en`, () => {
      const localeKeys = leafKeys(dict).sort()
      expect(localeKeys).toEqual(enKeys)
    })
  }
})
