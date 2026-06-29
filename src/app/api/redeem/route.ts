import { auth } from '@clerk/nextjs/server'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { checkRateLimit, rateLimitResponse } from '@/lib/ratelimit'
import { z } from 'zod'

const schema = z.object({ code: z.string().min(4).max(40) })

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  const rl = await checkRateLimit(`redeem:${userId}:${ip}`, { limit: 8, windowMs: 60_000 })
  if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs)

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return Response.json({ error: 'Invalid code' }, { status: 400 })

  const code = parsed.data.code.trim().toUpperCase()

  const user = await prisma.user.findUnique({ where: { clerkId: userId }, include: { student: true } })
  if (!user?.student) return Response.json({ error: 'Only students can redeem vouchers' }, { status: 403 })

  const voucher = await prisma.giftVoucher.findUnique({ where: { code } })
  if (!voucher) return Response.json({ error: 'Voucher not found' }, { status: 404 })
  if (voucher.redeemed) return Response.json({ error: 'This voucher has already been redeemed' }, { status: 409 })

  // Atomic: mark redeemed + credit balance
  const [updated] = await prisma.$transaction([
    prisma.giftVoucher.update({
      where: { code, redeemed: false },
      data: { redeemed: true, redeemedByStudentId: user.student.id, redeemedAt: new Date() },
    }),
    prisma.student.update({
      where: { id: user.student.id },
      data: { creditBalancePence: { increment: voucher.amountPence } },
    }),
  ]).catch(() => [null])

  if (!updated) return Response.json({ error: 'Voucher could not be redeemed' }, { status: 409 })

  return Response.json({ ok: true, amountPence: voucher.amountPence })
}
