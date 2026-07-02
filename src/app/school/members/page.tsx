import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getSchoolContext } from '@/lib/school'
import MembersManager from './MembersManager'
import ImportSection from './ImportSection'

export const metadata = { title: 'Members — fair-do' }

// Member management (M2.3/M2.4): list students with their assignments, add a
// single managed student, assign year/house/classes, and bulk CSV import.
export default async function SchoolMembersPage() {
  const { org, role } = await getSchoolContext()
  if (role !== 'ADMIN') redirect('/school')

  const [students, yearGroups, houses, classes] = await Promise.all([
    prisma.student.findMany({
      where: { organisationId: org.id },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
      select: {
        id: true,
        firstName: true,
        lastName: true,
        contactEmail: true,
        user: { select: { email: true } },
        orgProfile: { select: { yearGroupId: true, houseId: true, classIds: true } },
      },
    }),
    prisma.yearGroup.findMany({ where: { organisationId: org.id }, orderBy: [{ order: 'asc' }, { name: 'asc' }], select: { id: true, name: true } }),
    prisma.house.findMany({ where: { organisationId: org.id }, orderBy: { name: 'asc' }, select: { id: true, name: true, color: true } }),
    prisma.schoolClass.findMany({ where: { organisationId: org.id }, orderBy: { name: 'asc' }, select: { id: true, name: true } }),
  ])

  const members = students.map(s => ({
    id: s.id,
    firstName: s.firstName,
    lastName: s.lastName,
    email: s.user?.email ?? s.contactEmail,
    managed: !s.user,
    yearGroupId: s.orgProfile?.yearGroupId ?? null,
    houseId: s.orgProfile?.houseId ?? null,
    classIds: s.orgProfile?.classIds ?? [],
  }))

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-2xl text-sand-900">Members</h1>
        <p className="text-sm text-sand-500 mt-1">
          {members.length} student{members.length !== 1 ? 's' : ''}
          {org.domain ? <> — anyone signing up with an @{org.domain} email is enrolled automatically.</> : '.'}
          {yearGroups.length === 0 && <> Set up your <Link href="/school/structure" className="text-brand-600 hover:underline">structure</Link> first to assign years and classes.</>}
        </p>
      </header>

      <MembersManager members={members} yearGroups={yearGroups} houses={houses} classes={classes} />
      <ImportSection />
    </div>
  )
}
