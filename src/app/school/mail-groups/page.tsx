import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSchoolContext } from '@/lib/school'
import { parseMailGroupRule } from '@/lib/mail-groups'
import MailGroupsClient from './MailGroupsClient'

export const metadata = { title: 'Mail groups — fair-do' }

// Mail groups: rule-based audiences ("all Year 10 parents") resolved live at
// send time, or manual lists. Layout gates membership; group management is
// admin-only (staff use groups from the broadcasts page).
export default async function MailGroupsPage() {
  const { org, role } = await getSchoolContext()
  if (role !== 'ADMIN') redirect('/school')

  const [groups, yearGroups, houses, classes] = await Promise.all([
    prisma.mailGroup.findMany({
      where: { organisationId: org.id },
      include: { members: { orderBy: { email: 'asc' } } },
      orderBy: { name: 'asc' },
    }),
    prisma.yearGroup.findMany({ where: { organisationId: org.id }, orderBy: { order: 'asc' } }),
    prisma.house.findMany({ where: { organisationId: org.id }, orderBy: { name: 'asc' } }),
    prisma.schoolClass.findMany({ where: { organisationId: org.id }, orderBy: { name: 'asc' } }),
  ])

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl text-sand-900">Mail groups</h1>
        <p className="text-sm text-sand-500 mt-1">
          Audiences for school announcements. Rule-based groups (&ldquo;all Year 10 parents&rdquo;) resolve their
          membership fresh every time you send; manual lists are for people outside the portal.
        </p>
      </header>

      <MailGroupsClient
        groups={groups.map(g => ({
          id: g.id,
          name: g.name,
          rule: parseMailGroupRule(g.rule),
          members: g.members.map(m => ({ email: m.email, name: m.name ?? '' })),
        }))}
        yearGroups={yearGroups.map(y => ({ id: y.id, name: y.name }))}
        houses={houses.map(h => ({ id: h.id, name: h.name }))}
        classes={classes.map(c => ({ id: c.id, name: c.name }))}
      />
    </div>
  )
}
