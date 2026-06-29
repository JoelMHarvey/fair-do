import { auth } from '@clerk/nextjs/server'
import { getRatePercentile } from '@/lib/rate'

export async function GET(req: Request) {
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const url = new URL(req.url)
  const rate = Number(url.searchParams.get('rate'))
  if (!Number.isFinite(rate) || rate < 1000 || rate > 50000) {
    return Response.json({ error: 'Invalid rate' }, { status: 400 })
  }

  const result = await getRatePercentile(Math.round(rate))
  return Response.json(result)
}
