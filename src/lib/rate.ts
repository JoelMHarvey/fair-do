import { prisma } from '@/lib/prisma'

export type RatePercentile = {
  ratePence: number
  cheaperThanPercent: number // % of active teachers who charge MORE than this rate
  percentileRank: number     // % of active teachers who charge this or less
  band: 'budget' | 'mid' | 'premium'
  sampleSize: number
  medianPence: number
}

/** Where a given rate sits among all ACTIVE teachers' standard rates. */
export async function getRatePercentile(ratePence: number): Promise<RatePercentile> {
  const rows = await prisma.teacher.findMany({
    where: { status: 'ACTIVE' },
    select: { sessionRatePence: true },
  })
  const rates = rows.map(r => r.sessionRatePence).sort((a, b) => a - b)
  const n = rates.length

  if (n === 0) {
    return { ratePence, cheaperThanPercent: 50, percentileRank: 50, band: 'mid', sampleSize: 0, medianPence: ratePence }
  }

  const cheaperCount = rates.filter(r => r > ratePence).length     // teachers more expensive than this
  const atOrBelow = rates.filter(r => r <= ratePence).length
  const cheaperThanPercent = Math.round((cheaperCount / n) * 100)
  const percentileRank = Math.round((atOrBelow / n) * 100)
  const median = rates[Math.floor(n / 2)]

  const band: RatePercentile['band'] = percentileRank <= 33 ? 'budget' : percentileRank >= 67 ? 'premium' : 'mid'

  return { ratePence, cheaperThanPercent, percentileRank, band, sampleSize: n, medianPence: median }
}
