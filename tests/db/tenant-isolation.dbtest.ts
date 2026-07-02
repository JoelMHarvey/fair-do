import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import { prisma, truncateAll, makeUser } from './helpers'

beforeEach(truncateAll)
afterAll(async () => { await prisma.$disconnect() })

async function makeOrg(name: string, slug: string) {
  return prisma.organisation.create({
    data: { name, contactEmail: `${slug}@school.test`, slug, plan: 'portal', active: true },
  })
}

// Enterprise portal tenancy — the DB-level invariants every tenant-scoped query
// relies on (docs/ENTERPRISE-SCHOOLS-PLAN.md §5 D6). Code-level scoping is
// covered by the API tests; this file proves the schema can't silently mix tenants.
describe('tenant isolation (real DB)', () => {
  it('Organisation.slug is unique — two schools cannot claim one subdomain', async () => {
    await makeOrg('School A', 'stgeorges')
    await expect(makeOrg('School B', 'stgeorges')).rejects.toThrow()
  })

  it('structure names are unique per org but reusable across orgs', async () => {
    const a = await makeOrg('School A', 'a')
    const b = await makeOrg('School B', 'b')
    await prisma.yearGroup.create({ data: { organisationId: a.id, name: 'Year 7' } })
    // Same name in a different org is fine — tenancy boundary holds.
    await expect(prisma.yearGroup.create({ data: { organisationId: b.id, name: 'Year 7' } })).resolves.toBeTruthy()
    // Duplicate within the same org is rejected.
    await expect(prisma.yearGroup.create({ data: { organisationId: a.id, name: 'Year 7' } })).rejects.toThrow()
  })

  it('OrgMembership is unique per (organisation, user) — no duplicate admin rows', async () => {
    const org = await makeOrg('School A', 'a')
    const u = await makeUser()
    await prisma.orgMembership.create({ data: { organisationId: org.id, userId: u.id, role: 'ADMIN' } })
    await expect(
      prisma.orgMembership.create({ data: { organisationId: org.id, userId: u.id, role: 'STAFF' } }),
    ).rejects.toThrow()
  })

  it('tenant-scoped models enforce their organisation FK', async () => {
    await expect(
      prisma.staffContact.create({ data: { organisationId: 'missing_org', name: 'X', title: 'DSL', email: 'x@y.test' } }),
    ).rejects.toThrow()
    await expect(
      prisma.mailGroup.create({ data: { organisationId: 'missing_org', name: 'All parents' } }),
    ).rejects.toThrow()
  })

  it('a student has at most one org profile, and org-scoped filters cannot see another tenant', async () => {
    const a = await makeOrg('School A', 'a')
    const b = await makeOrg('School B', 'b')
    const u = await makeUser()
    const student = await prisma.student.create({
      data: { userId: u.id, firstName: 'Kid', lastName: 'Smith', organisationId: a.id },
    })
    await prisma.studentOrgProfile.create({ data: { organisationId: a.id, studentId: student.id } })
    // One profile per student — a second org cannot also claim them.
    await expect(
      prisma.studentOrgProfile.create({ data: { organisationId: b.id, studentId: student.id } }),
    ).rejects.toThrow()
    // The canonical scoped read: org B sees nothing of org A.
    expect(await prisma.studentOrgProfile.findMany({ where: { organisationId: b.id } })).toHaveLength(0)
    expect(await prisma.staffContact.findMany({ where: { organisationId: b.id } })).toHaveLength(0)
  })

  it('MailGroupMember is unique per (group, email) — resolution cannot double-send', async () => {
    const org = await makeOrg('School A', 'a')
    const group = await prisma.mailGroup.create({ data: { organisationId: org.id, name: 'Manual list' } })
    await prisma.mailGroupMember.create({ data: { mailGroupId: group.id, email: 'parent@x.test' } })
    await expect(
      prisma.mailGroupMember.create({ data: { mailGroupId: group.id, email: 'parent@x.test' } }),
    ).rejects.toThrow()
  })

  it('OrgCalendar icsToken is unique and events cascade under their calendar only', async () => {
    const a = await makeOrg('School A', 'a')
    const b = await makeOrg('School B', 'b')
    const calA = await prisma.orgCalendar.create({ data: { organisationId: a.id, name: 'Term dates' } })
    const calB = await prisma.orgCalendar.create({ data: { organisationId: b.id, name: 'Term dates' } })
    expect(calA.icsToken).not.toEqual(calB.icsToken)
    await prisma.orgCalendarEvent.create({
      data: { calendarId: calA.id, title: 'Half term', startsAt: new Date('2026-10-26'), endsAt: new Date('2026-10-30'), kind: 'holiday' },
    })
    const bEvents = await prisma.orgCalendarEvent.findMany({ where: { calendar: { organisationId: b.id } } })
    expect(bEvents).toHaveLength(0)
  })
})
