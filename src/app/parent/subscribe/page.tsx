import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { Logo } from '@/components/Logo'
import { PARENT_PORTAL_ENABLED, PARENT_PORTAL_PRICE_PENCE, parentHasActivePortal } from '@/lib/parent'
import SubscribeButton from './SubscribeButton'

export default async function ParentSubscribePage() {
  if (!PARENT_PORTAL_ENABLED) redirect('/')
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user || user.role !== 'PARENT') redirect('/')

  // Already paying → portal. Nothing linked → nothing to buy.
  if (await parentHasActivePortal(user.id)) redirect('/parent/dashboard')

  const links = await prisma.parentLink.findMany({
    where: { parentUserId: user.id, status: 'active' },
    include: { student: { select: { firstName: true, lastName: true } } },
    orderBy: { createdAt: 'asc' },
  })
  if (links.length === 0) redirect('/parent/dashboard')

  // Distinct children — one subscription covers them all.
  const seen = new Set<string>()
  const children = links.filter(l => (seen.has(l.studentId) ? false : seen.add(l.studentId)))

  const price = `£${(PARENT_PORTAL_PRICE_PENCE / 100).toFixed(2)}`

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-linear-to-b from-brand-50 via-sand-50 to-sand-50 px-6 py-12">
      <Logo />
      <div className="mt-8 w-full max-w-md bg-white rounded-2xl border border-sand-200 p-8">
        <h1 className="font-display text-2xl font-semibold text-brand-900 text-center">Unlock the parent portal</h1>
        <p className="text-sand-600 mt-3 text-sm text-center leading-relaxed">
          {price}/month for your whole family. Full lesson visibility, invoices, and a
          direct line to every tutor. Cancel any time.
        </p>

        <div className="mt-6 rounded-xl border border-sand-200 bg-sand-50 px-4 py-3">
          <p className="text-xs text-sand-500 mb-2">One subscription covers{children.length > 1 ? ` all ${children.length} children` : ''}:</p>
          <ul className="space-y-1.5">
            {children.map(l => (
              <li key={l.id} className="flex items-center gap-2 text-sm font-medium text-sand-900">
                <span className="text-brand-600" aria-hidden>✓</span>{l.student.firstName} {l.student.lastName}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6">
          <SubscribeButton label={`Subscribe — ${price}/mo`} />
        </div>
      </div>
    </main>
  )
}
