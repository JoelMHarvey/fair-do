import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const registerSchema = z.object({
  token: z.string().min(1).max(300),
  platform: z.enum(['ios', 'android']),
})

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const body = await req.json().catch(() => null)
  const parsed = registerSchema.safeParse(body)
  if (!parsed.success) return Response.json({ error: 'Invalid data' }, { status: 400 })

  await prisma.nativeDevice.upsert({
    where: { token: parsed.data.token },
    create: { clerkId: userId, token: parsed.data.token, platform: parsed.data.platform },
    update: { clerkId: userId, platform: parsed.data.platform },
  })

  return Response.json({ ok: true })
}

export async function DELETE(req: Request) {
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const body = await req.json().catch(() => null)
  const token: string | undefined = body?.token
  if (!token) return Response.json({ error: 'token required' }, { status: 400 })

  await prisma.nativeDevice.deleteMany({
    where: { token, clerkId: userId },
  })

  return Response.json({ ok: true })
}
