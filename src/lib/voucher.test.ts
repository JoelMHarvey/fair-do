import { describe, it, expect } from 'vitest'
import { generateVoucherCode } from './voucher'

const CODE_REGEX = /^FARE-[A-Z2-9]{4}-[A-Z2-9]{4}$/

describe('generateVoucherCode', () => {
  it('matches FARE-XXXX-XXXX format', () => {
    for (let i = 0; i < 20; i++) {
      expect(generateVoucherCode()).toMatch(CODE_REGEX)
    }
  })

  it('contains no ambiguous characters (0, 1, I, L, O)', () => {
    const AMBIGUOUS = /[01ILO]/
    for (let i = 0; i < 50; i++) {
      const code = generateVoucherCode()
      expect(code.slice(5)).not.toMatch(AMBIGUOUS)
    }
  })

  it('generates unique codes (collision rate negligible at 100 samples)', () => {
    const codes = new Set(Array.from({ length: 100 }, generateVoucherCode))
    expect(codes.size).toBe(100)
  })

  it('is always 14 characters', () => {
    for (let i = 0; i < 20; i++) {
      expect(generateVoucherCode()).toHaveLength(14)
    }
  })
})
