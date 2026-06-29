import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { sendTeacherApproved, sendTeacherRejected } from '@/lib/email'
import { isAdminUser } from '@/lib/admin'
import { z } from 'zod'

const schema = z.object({
  teacherId: z.string().min(1),
  action: z.enum(['approve', 'reject']),
  notes: z.string().max(1000).optional(),
})

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!isAdminUser(user)) return new Response('Forbidden', { status: 403 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return new Response('Invalid data', { status: 400 })

  const { teacherId, action, notes } = parsed.data

  const teacher = await prisma.teacher.findUnique({
    where: { id: teacherId },
    include: { user: true },
  })
  if (!teacher) return new Response('Not found', { status: 404 })

  const newStatus = action === 'approve' ? 'ACTIVE' : 'SUSPENDED'

  await prisma.teacher.update({
    where: { id: teacherId },
    data: {
      status: newStatus,
      credentialVerified: action === 'approve',
      // Approving overrides a credential auto-suspension and re-arms expiry reminders.
      ...(action === 'approve'
        ? { credentialSuspended: false, availableForNew: true, qualReminderStage: null }
        : {}),
    },
  })

  // Audit trail — immutable record of who verified what, when. Regulatory/GDPR evidence.
  await prisma.credentialCheck.create({
    data: {
      teacherId,
      checkedByClerkId: userId,
      qualificationBody: teacher.qualificationBody ?? '',
      qualificationRef: teacher.qualificationRef ?? '',
      method: 'manual',
      result: action === 'approve' ? 'verified' : 'rejected',
      notes: notes ?? null,
    },
  })

  try {
    if (action === 'approve') {
      await sendTeacherApproved({
        email: teacher.user.email,
        firstName: teacher.firstName,
        qualificationBody: teacher.qualificationBody ?? '',
      })
    } else {
      await sendTeacherRejected({
        email: teacher.user.email,
        firstName: teacher.firstName,
        qualificationBody: teacher.qualificationBody ?? '',
      })
    }
  } catch {
    // Email failure must not block the approval action
  }

  return Response.json({ status: newStatus })
}
