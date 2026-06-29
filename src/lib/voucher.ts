import { randomBytes } from 'crypto'

// Human-friendly voucher code: FARE-XXXX-XXXX (no ambiguous chars)
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

export function generateVoucherCode(): string {
  const bytes = randomBytes(8)
  let body = ''
  for (let i = 0; i < 8; i++) {
    body += ALPHABET[bytes[i] % ALPHABET.length]
    if (i === 3) body += '-'
  }
  return `FARE-${body}`
}
