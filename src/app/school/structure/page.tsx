import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSchoolContext } from '@/lib/school'
import StructureManager from './StructureManager'

export const metadata = { title: 'Structure — fair-do' }

// Academic structure (M2.2): year groups, houses, classes, subjects.
// Server-rendered lists; StructureManager does the CRUD calls + refresh.
export default async function SchoolStructurePage() {
  const { org, role } = await getSchoolContext()
  if (role !== 'ADMIN') redirect('/school')

  const [yearGroups, houses, classes, subjects] = await Promise.all([
    prisma.yearGroup.findMany({
      where: { organisationId: org.id },
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true, order: true },
    }),
    prisma.house.findMany({
      where: { organisationId: org.id },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, color: true },
    }),
    prisma.schoolClass.findMany({
      where: { organisationId: org.id },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, kind: true, yearGroupId: true, subjectId: true },
    }),
    prisma.orgSubject.findMany({
      where: { organisationId: org.id },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, marketplaceKey: true, examBoard: true },
    }),
  ])

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-2xl text-sand-900">Academic structure</h1>
        <p className="text-sm text-sand-500 mt-1">
          Year groups, houses, classes and subjects — used for member assignments, reports and mail groups.
        </p>
      </header>
      <StructureManager yearGroups={yearGroups} houses={houses} classes={classes} subjects={subjects} />
    </div>
  )
}
