import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const body = await req.json().catch(() => null)
  const endpoint: string | undefined = body?.endpoint
  if (!endpoint) return new Response('Invalid', { status: 400 })

  // Only delete the caller's own subscription.
  await prisma.pushSubscription.deleteMany({ where: { endpoint, clerkId: userId } })
  return Response.json({ ok: true })
}
