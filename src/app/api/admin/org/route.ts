import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { isAdminUser } from '@/lib/admin'
import { z } from 'zod'

const createSchema = z.object({
  action: z.literal('create'),
  name: z.string().min(1).max(120),
  contactEmail: z.string().email(),
  contactName: z.string().max(120).optional(),
  domain: z.string().max(120).optional(),
  seatsTotal: z.number().int().min(0).max(100000).optional(),
  initialPoolPence: z.number().int().min(0).max(100_000_00).optional(),
})

const topupSchema = z.object({
  action: z.literal('topup'),
  orgId: z.string().min(1),
  amountPence: z.number().int().min(1000).max(100_000_00),
})

const schema = z.discriminatedUnion('action', [createSchema, topupSchema])

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const admin = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!isAdminUser(admin)) return new Response('Forbidden', { status: 403 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return Response.json({ error: 'Invalid data' }, { status: 400 })

  if (parsed.data.action === 'create') {
    const { name, contactEmail, contactName, domain, seatsTotal, initialPoolPence } = parsed.data
    // Onboarding incentive: 10% off all member bookings for the first 30 days.
    const discountExpiry = new Date()
    discountExpiry.setDate(discountExpiry.getDate() + 30)
    const org = await prisma.organisation.create({
      data: {
        name,
        contactEmail,
        contactName: contactName || null,
        domain: domain ? domain.toLowerCase().replace(/^@/, '') : null,
        seatsTotal: seatsTotal ?? 0,
        creditPoolPence: initialPoolPence ?? 0,
        discountPercent: 10,
        discountExpiry,
      },
    })
    return Response.json({ ok: true, orgId: org.id })
  }

  // topup
  await prisma.organisation.update({
    where: { id: parsed.data.orgId },
    data: { creditPoolPence: { increment: parsed.data.amountPence } },
  })
  return Response.json({ ok: true })
}
