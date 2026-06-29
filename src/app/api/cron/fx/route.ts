import { prisma } from '@/lib/prisma'
import { recordCronRun } from '@/lib/cron-run'
import { bearerOk } from '@/lib/bearer'
import { CURRENCIES } from '@/lib/currency'

// Daily: refresh GBP-based FX rates for display-only price localisation.
// Uses Frankfurter (free, no key, ECB data). Best-effort — the currency lib
// falls back to a static table if this hasn't run. Guarded by CRON_SECRET.
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  if (!bearerOk(req.headers.get('authorization'), process.env.CRON_SECRET)) {
    return new Response('Unauthorized', { status: 401 })
  }

  const symbols = Object.keys(CURRENCIES).filter(c => c !== 'GBP').join(',')
  try {
    const res = await fetch(`https://api.frankfurter.dev/v1/latest?base=GBP&symbols=${symbols}`, {
      signal: AbortSignal.timeout(8000), cache: 'no-store',
    })
    if (!res.ok) throw new Error(`frankfurter ${res.status}`)
    const data = (await res.json()) as { rates?: Record<string, number> }
    if (!data.rates || Object.keys(data.rates).length === 0) throw new Error('no rates')

    const rates = { GBP: 1, ...data.rates }
    await prisma.fxRate.upsert({
      where: { base: 'GBP' },
      create: { base: 'GBP', rates, fetchedAt: new Date() },
      update: { rates, fetchedAt: new Date() },
    })
    await recordCronRun('fx', true, undefined, JSON.stringify({ count: Object.keys(rates).length }))
    return Response.json({ ok: true, count: Object.keys(rates).length })
  } catch (e) {
    console.error('[cron/fx] failed', e)
    await recordCronRun('fx', false, undefined, 'fetch failed')
    return Response.json({ ok: false }, { status: 502 })
  }
}
