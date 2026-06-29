import { describe, it, expect } from 'vitest'
import {
  FALLBACK_RATES,
  currencyForCountry,
  isSupportedCurrency,
  convertMinor,
  formatMinor,
  CURRENCIES,
} from './currency'

describe('currencyForCountry', () => {
  it('GB → GBP', () => expect(currencyForCountry('GB')).toBe('GBP'))
  it('US → USD', () => expect(currencyForCountry('US')).toBe('USD'))
  it('JP → JPY', () => expect(currencyForCountry('JP')).toBe('JPY'))
  it('DE → EUR (Eurozone)', () => expect(currencyForCountry('DE')).toBe('EUR'))
  it('FR → EUR (Eurozone)', () => expect(currencyForCountry('FR')).toBe('EUR'))
  it('unknown country → GBP', () => {
    expect(currencyForCountry('XX')).toBe('GBP')
    expect(currencyForCountry(null)).toBe('GBP')
    expect(currencyForCountry(undefined)).toBe('GBP')
    expect(currencyForCountry('')).toBe('GBP')
  })
  it('lowercase input normalised', () => expect(currencyForCountry('gb')).toBe('GBP'))
})

describe('isSupportedCurrency', () => {
  it('returns true for known currencies', () => {
    expect(isSupportedCurrency('GBP')).toBe(true)
    expect(isSupportedCurrency('USD')).toBe(true)
    expect(isSupportedCurrency('JPY')).toBe(true)
  })
  it('case-insensitive', () => {
    expect(isSupportedCurrency('gbp')).toBe(true)
    expect(isSupportedCurrency('usd')).toBe(true)
  })
  it('returns false for null/undefined/unknown', () => {
    expect(isSupportedCurrency(null)).toBe(false)
    expect(isSupportedCurrency(undefined)).toBe(false)
    expect(isSupportedCurrency('XYZ')).toBe(false)
  })
})

describe('convertMinor', () => {
  const rates = FALLBACK_RATES

  it('GBP → GBP is identity', () => {
    expect(convertMinor(5000, 'GBP', 'GBP', rates)).toBe(5000)
  })

  it('GBP → USD uses rate', () => {
    // 5000p = £50; £50 × 1.27 = $63.50 = 6350c
    const expected = Math.round(50 * rates.USD * 100)
    expect(convertMinor(5000, 'GBP', 'USD', rates)).toBe(expected)
  })

  it('USD → GBP round-trips within 1p', () => {
    const usdMinor = 6350 // $63.50
    const gbp = convertMinor(usdMinor, 'USD', 'GBP', rates)
    // Should be close to 5000p, allow rounding
    expect(gbp).toBeGreaterThanOrEqual(4990)
    expect(gbp).toBeLessThanOrEqual(5010)
  })

  it('JPY (zero-decimal) → GBP', () => {
    // 1000 JPY; rate 1 GBP = 190 JPY → 1000/190 ≈ 5.26 GBP = 526p
    const result = convertMinor(1000, 'JPY', 'GBP', rates)
    expect(result).toBeCloseTo(526, -1)
  })

  it('GBP → JPY (zero-decimal output, no ×100)', () => {
    // 5000p = £50; £50 × 190 = 9500 JPY (zero-decimal, not 950000)
    const result = convertMinor(5000, 'GBP', 'JPY', rates)
    expect(result).toBe(Math.round(50 * rates.JPY))
  })

  it('output is always an integer', () => {
    const r = convertMinor(1234, 'GBP', 'EUR', rates)
    expect(Number.isInteger(r)).toBe(true)
  })

  // Regression: GBP-credit therapist vs USD-rate shouldn't silently use wrong base
  it('EUR → USD uses GBP as bridge', () => {
    const eurMinor = 1000 // €10
    const eurRate = rates.EUR   // EUR per GBP
    const usdRate = rates.USD
    const expected = Math.round((10 / eurRate) * usdRate * 100)
    expect(convertMinor(eurMinor, 'EUR', 'USD', rates)).toBe(expected)
  })
})

describe('formatMinor', () => {
  it('GBP formats with £ symbol', () => {
    expect(formatMinor(5000, 'GBP')).toMatch(/£50/)
  })

  it('JPY formats without decimal', () => {
    const formatted = formatMinor(1000, 'JPY')
    expect(formatted).not.toMatch(/\./)
  })

  it('whole=true drops decimals for non-zero-decimal currencies', () => {
    const formatted = formatMinor(5000, 'GBP', true)
    expect(formatted).not.toMatch(/\./)
    expect(formatted).toMatch(/50/)
  })

  it('falls back gracefully for unknown currency code', () => {
    // Should not throw; falls back to GBP info
    expect(() => formatMinor(1000, 'XXX')).not.toThrow()
  })
})
