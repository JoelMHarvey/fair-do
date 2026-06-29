import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import OrgManager from './OrgManager'
import { isAdminUser } from '@/lib/admin'
import { isFounder } from '@/lib/founder'

export default async function AdminOrgsPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')
  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!isAdminUser(user) && !(await isFounder())) redirect('/')

  const orgs = await prisma.organisation.findMany({
    include: { _count: { select: { members: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <main className="min-h-screen bg-sand-50">

      <div className="max-w-4xl mx-auto px-5 sm:px-6 py-10">
        <h1 className="font-display text-3xl font-semibold text-brand-900 mb-1">Corporate accounts</h1>
        <p className="text-sand-600 mb-8">Create organisations, fund credit pools, auto-enrol by email domain.</p>

        <OrgManager
          orgs={orgs.map(o => ({
            id: o.id,
            name: o.name,
            contactEmail: o.contactEmail,
            domain: o.domain,
            seatsTotal: o.seatsTotal,
            creditPoolPence: o.creditPoolPence,
            members: o._count.members,
            active: o.active,
          }))}
        />
      </div>
    </main>
  )
}
