import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { Logo } from '@/components/Logo'
import { PARENT_PORTAL_ENABLED, PARENT_PORTAL_PRICE_PENCE } from '@/lib/parent'
import SubscribeButton from './SubscribeButton'

export default async function ParentSubscribePage() {
  if (!PARENT_PORTAL_ENABLED) redirect('/')
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user || user.role !== 'PARENT') redirect('/')

  const links = await prisma.parentLink.findMany({
    where: { parentUserId: user.id, status: 'active' },
    include: { student: { select: { firstName: true, lastName: true } } },
    orderBy: { createdAt: 'asc' },
  })
  const pending = links.filter(l => !l.portalActive)
  if (pending.length === 0) redirect('/parent/dashboard')

  const price = `£${(PARENT_PORTAL_PRICE_PENCE / 100).toFixed(2)}`

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-brand-50 via-sand-50 to-sand-50 px-6 py-12">
      <Logo />
      <div className="mt-8 w-full max-w-md bg-white rounded-2xl border border-sand-200 p-8">
        <h1 className="font-display text-2xl font-semibold text-brand-900 text-center">Unlock the parent portal</h1>
        <p className="text-sand-600 mt-3 text-sm text-center leading-relaxed">
          {price}/month per child. Full lesson visibility, invoices, and a direct line to
          the tutor. Cancel any time.
        </p>
        <div className="mt-6 space-y-3">
          {pending.map(l => (
            <div key={l.id} className="flex items-center justify-between gap-3 border border-sand-200 rounded-xl px-4 py-3">
              <span className="text-sm font-medium text-sand-900">{l.student.firstName} {l.student.lastName}</span>
              <SubscribeButton parentLinkId={l.id} />
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
