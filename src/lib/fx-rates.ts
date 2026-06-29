import { prisma } from '@/lib/prisma'
import { FALLBACK_RATES } from '@/lib/currency'

// Server-only: read the daily-refreshed FX rates (GBP base), falling back to the
// static table. Kept separate from currency.ts so the pure formatting helpers
// stay importable from client components without pulling in Prisma.
let memo: { rates: Record<string, number>; expires: number } | null = null

export async function getRates(): Promise<Record<string, number>> {
  if (memo && Date.now() < memo.expires) return memo.rates
  let rates = FALLBACK_RATES
  try {
    const row = await prisma.fxRate.findUnique({ where: { base: 'GBP' } })
    if (row?.rates && typeof row.rates === 'object') {
      rates = { ...FALLBACK_RATES, ...(row.rates as Record<string, number>) }
    }
  } catch { /* fall back to static */ }
  memo = { rates, expires: Date.now() + 60 * 60 * 1000 }
  return rates
}
