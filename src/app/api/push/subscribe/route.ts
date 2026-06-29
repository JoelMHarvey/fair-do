import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const body = await req.json().catch(() => null)
  const sub = body?.subscription
  const endpoint: string | undefined = sub?.endpoint
  const p256dh: string | undefined = sub?.keys?.p256dh
  const auth_: string | undefined = sub?.keys?.auth
  if (!endpoint || !p256dh || !auth_) return new Response('Invalid subscription', { status: 400 })

  await prisma.pushSubscription.upsert({
    where: { endpoint },
    create: { clerkId: userId, endpoint, p256dh, auth: auth_ },
    update: { clerkId: userId, p256dh, auth: auth_ },
  })
  return Response.json({ ok: true })
}
