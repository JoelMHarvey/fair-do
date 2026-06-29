import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { Logo } from '@/components/Logo'
import { practiceDisplayName, clientEmail } from '@/lib/practice'
import PrintButton from './PrintButton'

export const metadata = { title: 'Receipt — fair-do', robots: { index: false, follow: false } }

export default async function ReceiptPage({ params }: { params: Promise<{ paymentId: string }> }) {
  const { paymentId } = await params

  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      student: { include: { user: true } },
      session: { include: { teacher: true } },
    },
  })
  if (!payment) notFound()

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { student: true, teacher: true },
  })
  const isStudent = user?.student?.id === payment.studentId
  const isTeacher = !!payment.session && user?.teacher?.id === payment.session.teacherId
  const isAdmin = user?.role === 'ADMIN'
  if (!isStudent && !isTeacher && !isAdmin) notFound()

  const sym = payment.currency === 'usd' ? '$' : '£'
  const money = (p: number) => `${sym}${(p / 100).toFixed(2)}`
  const seller = payment.session ? practiceDisplayName(payment.session.teacher) : 'Tuition services'
  const receiptNo = `FD-${payment.id.slice(-8).toUpperCase()}`
  const refunded = payment.status === 'refunded' || payment.status === 'partially_refunded'
  const lineLabel = payment.session
    ? `Lesson — ${payment.session.scheduledAt.toLocaleDateString('en-GB', { dateStyle: 'long' })}`
    : 'Lesson package'

  return (
    <main className="min-h-screen bg-sand-50 print:bg-white">
      <nav className="border-b border-sand-200 bg-white/80 backdrop-blur px-5 sm:px-8 h-16 flex items-center justify-between sticky top-0 z-40 print:hidden">
        <Logo />
        <div className="flex items-center gap-4">
          <Link href={isTeacher ? '/teacher/dashboard' : '/dashboard'} className="text-sm text-sand-500 hover:text-brand-700">← Dashboard</Link>
          <PrintButton />
        </div>
      </nav>

      <div className="max-w-xl mx-auto px-4 sm:px-6 py-8 sm:py-12 print:py-0">
        <div className="bg-white rounded-2xl border border-sand-200 p-8 print:border-0 print:p-0">
          <div className="flex items-start justify-between mb-8">
            <div>
              <p className="font-display text-2xl font-semibold text-brand-900">Receipt</p>
              <p className="text-sm text-sand-500 mt-1">{receiptNo}</p>
            </div>
            <div className="text-right">
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${refunded ? 'bg-red-50 text-red-600' : 'bg-brand-50 text-brand-700'}`}>
                {refunded ? 'Refunded' : 'Paid'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8 text-sm">
            <div>
              <p className="text-xs text-sand-400 uppercase tracking-wide mb-1">From</p>
              <p className="font-medium text-sand-900">{seller}</p>
              <p className="text-sand-500">via fair-do</p>
            </div>
            <div>
              <p className="text-xs text-sand-400 uppercase tracking-wide mb-1">Billed to</p>
              <p className="font-medium text-sand-900">{payment.student.firstName} {payment.student.lastName}</p>
              <p className="text-sand-500">{clientEmail(payment.student) ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-sand-400 uppercase tracking-wide mb-1">Date</p>
              <p className="text-sand-900">{payment.createdAt.toLocaleDateString('en-GB', { dateStyle: 'long' })}</p>
            </div>
            <div>
              <p className="text-xs text-sand-400 uppercase tracking-wide mb-1">Payment ref</p>
              <p className="text-sand-900 font-mono text-xs break-all">{payment.stripePaymentIntentId}</p>
            </div>
          </div>

          <table className="w-full text-sm mb-6">
            <thead>
              <tr className="border-b border-sand-200 text-left text-xs text-sand-400 uppercase tracking-wide">
                <th className="py-2 font-medium">Description</th>
                <th className="py-2 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-sand-100">
                <td className="py-3 text-sand-800">{lineLabel}</td>
                <td className="py-3 text-sand-800 text-right">{money(payment.amountTotalPence)}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td className="py-3 font-medium text-sand-900">Total {refunded ? 'refunded' : 'paid'}</td>
                <td className="py-3 font-semibold text-sand-900 text-right">{money(payment.amountTotalPence)}</td>
              </tr>
            </tfoot>
          </table>

          <p className="text-xs text-sand-400 leading-relaxed">
            This is a receipt for payment processed via fair-do. No VAT has been charged unless stated.
            Keep this for your records.
          </p>
        </div>
      </div>
    </main>
  )
}
