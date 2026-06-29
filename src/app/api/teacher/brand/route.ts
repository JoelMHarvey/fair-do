import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const PAID_TIERS = new Set(['pro', 'school', 'practice', 'clinic'])
const ACTIVE_STATUSES = new Set(['active', 'trialing'])

const schema = z.object({
  brandEnabled: z.boolean().optional(),
  brandLogoUrl: z
    .string()
    .refine(v => v === '' || v.startsWith('https://res.cloudinary.com/'), 'Logo must be a Cloudinary URL')
    .optional(),
  brandColor: z
    .string()
    .refine(v => v === '' || /^#[0-9a-fA-F]{6}$/.test(v), 'Colour must be a 6-digit hex e.g. #3a7ca5')
    .optional(),
  brandFooterLine: z.string().max(200).optional(),
  replyToEmail: z.string().email().or(z.literal('')).optional(),
})

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { teacher: { include: { subscription: true } } },
  })
  if (!user?.teacher) return new Response('Not a teacher', { status: 403 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success)
    return Response.json({ error: parsed.error.issues[0]?.message ?? 'Invalid' }, { status: 400 })

  const d = parsed.data
  const sub = user.teacher.subscription
  const isPaid = !!sub && PAID_TIERS.has(sub.tier) && ACTIVE_STATUSES.has(sub.status)

  if (d.brandEnabled && !isPaid) {
    return Response.json(
      { error: 'Branded emails require a Pro or School plan' },
      { status: 403 },
    )
  }

  const clean = (v: string | undefined) => (v === '' ? null : v)

  await prisma.teacher.update({
    where: { id: user.teacher.id },
    data: {
      ...(d.brandEnabled !== undefined && { brandEnabled: d.brandEnabled }),
      ...(d.brandLogoUrl !== undefined && { brandLogoUrl: clean(d.brandLogoUrl) }),
      ...(d.brandColor !== undefined && { brandColor: clean(d.brandColor) }),
      ...(d.brandFooterLine !== undefined && { brandFooterLine: clean(d.brandFooterLine) }),
      ...(d.replyToEmail !== undefined && { replyToEmail: clean(d.replyToEmail) }),
    },
  })

  return Response.json({ ok: true })
}
