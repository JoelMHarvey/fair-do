import { prisma } from '@/lib/prisma'
import { getMobileTeacher } from '@/lib/mobile-auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const teacher = await getMobileTeacher()
  if (!teacher) return new Response('Unauthorized', { status: 401 })

  const payments = await prisma.payment.findMany({
    where: {
      session: { teacherId: teacher.id },
      status: 'paid',
    },
    include: {
      session: {
        select: {
          scheduledAt: true,
          matchId: true,
          student: { select: { firstName: true, lastName: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const monthTotal = payments
    .filter(p => new Date(p.createdAt) >= startOfMonth)
    .reduce((s, p) => s + p.teacherPayoutPence, 0)

  const allTimeTotal = payments.reduce((s, p) => s + p.teacherPayoutPence, 0)

  const currencySymbol = teacher.country === 'US' ? '$' : '£'

  return Response.json({
    currencySymbol,
    monthTotalPence: monthTotal,
    allTimeTotalPence: allTimeTotal,
    payments: payments.map(p => ({
      id: p.id,
      amountTotalPence: p.amountTotalPence,
      teacherPayoutPence: p.teacherPayoutPence,
      platformFeePence: p.platformFeePence,
      currency: p.currency,
      createdAt: p.createdAt.toISOString(),
      studentFirstName: p.session?.student.firstName ?? '',
      studentLastName: p.session?.student.lastName ?? '',
      sessionScheduledAt: p.session?.scheduledAt.toISOString() ?? null,
    })),
  })
}
