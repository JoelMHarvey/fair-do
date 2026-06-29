import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { isAdminUser } from '@/lib/admin'
import { sendTherapistAdminMessage } from '@/lib/email'
import { z } from 'zod'

const schema = z.object({
  teacherId: z.string().min(1),
  subject: z.string().min(1).max(160),
  body: z.string().min(1).max(5000),
})

// Lets an admin email a teacher during review (e.g. ask for a certificate).
export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const me = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!isAdminUser(me)) return new Response('Forbidden', { status: 403 })

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return Response.json({ error: 'Invalid request' }, { status: 400 })
  const { teacherId, subject, body } = parsed.data

  const teacher = await prisma.teacher.findUnique({ where: { id: teacherId }, include: { user: true } })
  if (!teacher) return Response.json({ error: 'Teacher not found' }, { status: 404 })

  try {
    await sendTherapistAdminMessage({ email: teacher.user.email, firstName: teacher.firstName, subject, body })
    console.log(`[admin] ${me!.email} emailed teacher ${teacher.user.email}: "${subject}"`)
    return Response.json({ ok: true })
  } catch (e) {
    console.error('[admin] teacher email failed:', e instanceof Error ? e.message : e)
    return Response.json({ error: 'Could not send the email.' }, { status: 502 })
  }
}
