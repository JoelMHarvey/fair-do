import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSchoolContext } from '@/lib/school'
import StaffManager from './StaffManager'

export const metadata = { title: 'Staff directory — fair-do' }

// Staff directory admin (M2.5). Entries are shown on the public /contacts page
// (visibility-filtered); the DSL is surfaced in safeguarding flows.
export default async function SchoolStaffPage() {
  const { org, role } = await getSchoolContext()
  if (role !== 'ADMIN') redirect('/school')

  const staff = await prisma.staffContact.findMany({
    where: { organisationId: org.id },
    orderBy: [{ order: 'asc' }, { name: 'asc' }],
    select: {
      id: true,
      name: true,
      title: true,
      department: true,
      email: true,
      phone: true,
      photoUrl: true,
      isDSL: true,
      isTutoringCoordinator: true,
      visibility: true,
    },
  })

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-2xl text-sand-900">Staff directory</h1>
        <p className="text-sm text-sand-500 mt-1">
          Contacts shown on your portal&apos;s <a href="/contacts" className="text-brand-600 hover:underline">contacts page</a> — directory entries only, not fair-do accounts.
          Flag your Designated Safeguarding Lead so they appear in safeguarding flows.
        </p>
      </header>
      {!staff.some(s => s.isDSL) && staff.length > 0 && (
        <p className="text-sm text-coral-600 bg-coral-50 border border-coral-200 rounded-xl px-4 py-2">
          No Designated Safeguarding Lead flagged yet — add one so parents and tutors know who to contact.
        </p>
      )}
      <StaffManager staff={staff} />
    </div>
  )
}
