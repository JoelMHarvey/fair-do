import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Logo } from '@/components/Logo'
import { PARENT_PORTAL_ENABLED, PARENT_PORTAL_PRICE_PENCE } from '@/lib/parent'
import AcceptInvite from './AcceptInvite'

export default async function ParentAcceptPage({ params }: { params: Promise<{ token: string }> }) {
  if (!PARENT_PORTAL_ENABLED) notFound()
  const { token } = await params

  const link = await prisma.parentLink.findUnique({
    where: { token },
    include: { student: { select: { firstName: true } } },
  })
  if (!link || link.status === 'revoked') notFound()

  const teacher = await prisma.teacher.findUnique({
    where: { id: link.teacherId },
    select: { firstName: true, lastName: true },
  })
  const teacherName = teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Your tutor'
  const price = `£${(PARENT_PORTAL_PRICE_PENCE / 100).toFixed(2)}`

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-brand-50 via-sand-50 to-sand-50 px-6 py-12">
      <Logo />
      <div className="mt-8 w-full max-w-md bg-white rounded-2xl border border-sand-200 p-8 text-center">
        <h1 className="font-display text-2xl font-semibold text-brand-900">
          Follow {link.student.firstName}&rsquo;s lessons
        </h1>
        <p className="text-sand-600 mt-3 text-sm leading-relaxed">
          {teacherName} invited you to the parent portal. Get full visibility of every
          lesson — upcoming sessions, attendance, invoices, and a direct line to the tutor.
        </p>
        <ul className="text-left text-sm text-sand-700 mt-5 space-y-2">
          <li>✓ Upcoming &amp; past lessons with attendance</li>
          <li>✓ Invoices and downloadable receipts</li>
          <li>✓ A private message thread with the tutor</li>
        </ul>
        <p className="text-sand-500 text-sm mt-5">{price}/month · cancel any time</p>
        <div className="mt-6">
          <AcceptInvite token={token} />
        </div>
      </div>
    </main>
  )
}
