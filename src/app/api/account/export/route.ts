import { auth } from '@clerk/nextjs/server'
import { headers } from 'next/headers'
import { exportUserByClerkId } from '@/lib/data-export'
import { checkRateLimit, rateLimitResponse } from '@/lib/ratelimit'

// Self-service GDPR data portability (Art. 20). Returns the signed-in user's own
// personal data as a downloadable JSON bundle.
export async function GET() {
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const ip = (await headers()).get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  const rl = await checkRateLimit(`account-export:${userId}:${ip}`, { limit: 5, windowMs: 60_000 })
  if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs)

  const bundle = await exportUserByClerkId(userId)
  if (!bundle) return new Response('Not found', { status: 404 })
  bundle.exportedAt = new Date().toISOString()

  return new Response(JSON.stringify(bundle, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="fair-do-data-export.json"',
    },
  })
}
