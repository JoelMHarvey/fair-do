import { redirect, notFound } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { Logo } from '@/components/Logo'
import { PrintButton } from '@/components/PrintButton'
import { PARENT_PORTAL_ENABLED } from '@/lib/parent'

function fmtDate(d: Date) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

// Per-lesson receipt for a parent (P2-3 "downloadable receipts per lesson"). Printable
// to PDF via the browser. Authorised only for a parent linked to the payment's student.
export default async function ParentReceiptPage({ params }: { params: Promise<{ paymentId: string }> }) {
  if (!PARENT_PORTAL_ENABLED) redirect('/')
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')
  const { paymentId } = await params

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user || user.role !== 'PARENT') redirect('/')

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { session: { include: { teacher: true } }, student: true },
  })
  if (!payment) notFound()

  // Authorise: the parent must have an active, paid link to this payment's student.
  const link = await prisma.parentLink.findFirst({
    where: { parentUserId: user.id, studentId: payment.studentId, status: 'active', portalActive: true },
  })
  if (!link) redirect('/parent/dashboard')

  const sym = payment.currency === 'usd' ? '$' : '£'
  const amount = `${sym}${(payment.amountTotalPence / 100).toFixed(2)}`
  const teacher = payment.session?.teacher

  return (
    <main className="min-h-screen bg-sand-50 print:bg-white">
      <div className="max-w-lg mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <Logo />
          <PrintButton label="Download / print" />
        </div>

        <div className="bg-white rounded-2xl border border-sand-200 p-8 print:border-0 print:p-0">
          <h1 className="font-display text-2xl font-semibold text-brand-900 mb-1">Receipt</h1>
          <p className="text-sm text-sand-500 mb-6">{fmtDate(payment.createdAt)}</p>

          <dl className="space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-sand-500">Student</dt><dd className="text-sand-900 font-medium">{payment.student.firstName} {payment.student.lastName}</dd></div>
            {teacher && <div className="flex justify-between"><dt className="text-sand-500">Tutor</dt><dd className="text-sand-900 font-medium">{teacher.firstName} {teacher.lastName}</dd></div>}
            {payment.session && <div className="flex justify-between"><dt className="text-sand-500">Lesson</dt><dd className="text-sand-900">{fmtDate(payment.session.scheduledAt)}</dd></div>}
            <div className="flex justify-between"><dt className="text-sand-500">Status</dt><dd className="text-sand-900 capitalize">{payment.status.replace('_', ' ')}</dd></div>
            <div className="flex justify-between border-t border-sand-100 pt-3 text-base"><dt className="text-sand-900 font-medium">Total</dt><dd className="text-brand-900 font-semibold">{amount}</dd></div>
          </dl>

          <p className="text-xs text-sand-400 mt-8">Receipt #{payment.id} · fair-do</p>
        </div>
      </div>
    </main>
  )
}
