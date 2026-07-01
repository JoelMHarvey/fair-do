import { auth, clerkClient } from '@clerk/nextjs/server'
import { headers } from 'next/headers'
import { z } from 'zod'
import { eraseUserByClerkId } from '@/lib/erasure'
import { checkRateLimit, rateLimitResponse } from '@/lib/ratelimit'

// Self-service GDPR erasure (Art. 17). Requires an explicit typed confirmation to
// avoid accidental deletion. Pseudonymises the user's data, then removes the Clerk
// identity (which also fires user.deleted → erasure, idempotently).
const schema = z.object({ confirm: z.literal('DELETE') })

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const ip = (await headers()).get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  const rl = await checkRateLimit(`account-delete:${userId}:${ip}`, { limit: 5, windowMs: 60_000 })
  if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs)

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return Response.json({ error: 'Type DELETE to confirm.' }, { status: 400 })

  try {
    await eraseUserByClerkId(userId)
  } catch (e) {
    console.error('[account/delete] erasure failed for', userId, e)
    return Response.json({ error: 'Could not delete your data. Please contact support.' }, { status: 500 })
  }

  // Remove the Clerk identity last. Best-effort: the local data is already scrubbed,
  // and the user.deleted webhook is a backstop.
  try {
    const clerk = await clerkClient()
    await clerk.users.deleteUser(userId)
  } catch (e) {
    console.error('[account/delete] Clerk user deletion failed for', userId, e)
  }

  return Response.json({ ok: true }, { status: 200 })
}
