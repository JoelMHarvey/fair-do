import { prisma } from '@/lib/prisma'
import { getMyOrg } from '@/lib/org'

// CSV export of the org's pool-funded sessions. Org contact only.
// Privacy: aggregate by date + amount, NO member identity (employer must not see who attended).
export async function GET() {
  const mine = await getMyOrg()
  if (!mine) return new Response('No organisation', { status: 403 })
  if (!mine.isContact) return new Response('Only the org contact can export', { status: 403 })

  const members = await prisma.student.findMany({ where: { organisationId: mine.org.id }, select: { id: true } })
  const memberIds = members.map(m => m.id)

  const payments = memberIds.length
    ? await prisma.payment.findMany({
        where: { studentId: { in: memberIds }, stripePaymentIntentId: { startsWith: 'org_' }, status: 'paid' },
        select: { amountTotalPence: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      })
    : []

  const rows = [['Date', 'Amount (£)', 'Type']]
  for (const p of payments) {
    rows.push([p.createdAt.toISOString().slice(0, 10), (p.amountTotalPence / 100).toFixed(2), 'Lesson (pool-funded)'])
  }
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="fair-do-${mine.org.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-usage.csv"`,
    },
  })
}
