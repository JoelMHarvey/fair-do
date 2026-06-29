import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { isAdminUser } from '@/lib/admin'
import { z } from 'zod'

const schema = z.object({
  complaintId: z.string().min(1),
  status: z.enum(['open', 'reviewing', 'resolved']),
  adminNotes: z.string().max(4000).optional(),
})

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const admin = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!isAdminUser(admin)) return new Response('Forbidden', { status: 403 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return new Response('Invalid', { status: 400 })

  await prisma.complaint.update({
    where: { id: parsed.data.complaintId },
    data: { status: parsed.data.status, ...(parsed.data.adminNotes !== undefined && { adminNotes: parsed.data.adminNotes }) },
  })

  return Response.json({ ok: true })
}
