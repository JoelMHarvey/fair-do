import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockStudentFindMany, mockParentLinkFindMany, mockMatchFindMany, mockMailGroupFindFirst } = vi.hoisted(() => ({
  mockStudentFindMany: vi.fn(),
  mockParentLinkFindMany: vi.fn(),
  mockMatchFindMany: vi.fn(),
  mockMailGroupFindFirst: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    student: { findMany: mockStudentFindMany },
    parentLink: { findMany: mockParentLinkFindMany },
    match: { findMany: mockMatchFindMany },
    mailGroup: { findFirst: mockMailGroupFindFirst },
  },
}))

import { mailGroupRuleSchema, parseMailGroupRule, resolveMailGroup, resolveMailGroupRule } from './mail-groups'

const ORG = 'org_1'

const student = (id: string, over: Record<string, unknown> = {}) => ({
  id,
  firstName: 'Sam',
  lastName: 'Pupil',
  contactEmail: null,
  user: { email: `${id}@school.test` },
  ...over,
})

beforeEach(() => {
  vi.clearAllMocks()
  mockStudentFindMany.mockResolvedValue([])
  mockParentLinkFindMany.mockResolvedValue([])
  mockMatchFindMany.mockResolvedValue([])
})

describe('mailGroupRuleSchema / parseMailGroupRule', () => {
  it('accepts a bare audience', () => {
    expect(mailGroupRuleSchema.safeParse({ audience: 'students' }).success).toBe(true)
  })

  it('accepts structure filters', () => {
    const r = parseMailGroupRule({ audience: 'parents', yearGroupId: 'yg1', houseId: 'h1', classId: 'c1' })
    expect(r).toEqual({ audience: 'parents', yearGroupId: 'yg1', houseId: 'h1', classId: 'c1' })
  })

  it('null and invalid JSON both read as manual (null)', () => {
    expect(parseMailGroupRule(null)).toBeNull()
    expect(parseMailGroupRule({ audience: 'everyone' })).toBeNull()
    expect(parseMailGroupRule('parents')).toBeNull()
  })
})

describe('resolveMailGroupRule — students', () => {
  it('returns org students with account email, falling back to contactEmail, skipping unreachable', async () => {
    mockStudentFindMany.mockResolvedValue([
      student('s1'),
      student('s2', { user: null, contactEmail: 'managed@school.test', firstName: 'Mia' }),
      student('s3', { user: null, contactEmail: null }), // unreachable → dropped
    ])
    const out = await resolveMailGroupRule(ORG, { audience: 'students' })
    expect(out).toEqual([
      { email: 's1@school.test', name: 'Sam Pupil' },
      { email: 'managed@school.test', name: 'Mia Pupil' },
    ])
  })

  it('no filters → queries every org student without touching StudentOrgProfile', async () => {
    await resolveMailGroupRule(ORG, { audience: 'students' })
    const where = mockStudentFindMany.mock.calls[0][0].where
    expect(where).toEqual({ organisationId: ORG })
  })

  it('filters go through orgProfile; classId uses classIds has', async () => {
    await resolveMailGroupRule(ORG, { audience: 'students', yearGroupId: 'yg1', houseId: 'h1', classId: 'c1' })
    const where = mockStudentFindMany.mock.calls[0][0].where
    expect(where.organisationId).toBe(ORG)
    expect(where.orgProfile.is).toEqual({
      organisationId: ORG,
      yearGroupId: 'yg1',
      houseId: 'h1',
      classIds: { has: 'c1' },
    })
  })

  it('dedupes case-insensitively, first entry wins', async () => {
    mockStudentFindMany.mockResolvedValue([
      student('s1', { user: { email: 'Twin@School.test' }, firstName: 'A' }),
      student('s2', { user: { email: 'twin@school.test' }, firstName: 'B' }),
    ])
    const out = await resolveMailGroupRule(ORG, { audience: 'students' })
    expect(out).toEqual([{ email: 'Twin@School.test', name: 'A Pupil' }])
  })
})

describe('resolveMailGroupRule — parents', () => {
  it('resolves active ParentLink rows for the filtered students, preferring the linked account email', async () => {
    mockStudentFindMany.mockResolvedValue([student('s1'), student('s2')])
    mockParentLinkFindMany.mockResolvedValue([
      { studentId: 's1', inviteEmail: 'invited@home.test', parentUser: { email: 'mum@home.test' } },
      { studentId: 's2', inviteEmail: 'dad@home.test', parentUser: null },
      { studentId: 's2', inviteEmail: 'MUM@home.test', parentUser: { email: 'mum@home.test' } }, // same parent, both kids → deduped
    ])
    const out = await resolveMailGroupRule(ORG, { audience: 'parents', yearGroupId: 'yg1' })
    expect(mockParentLinkFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { studentId: { in: ['s1', 's2'] }, status: 'active' } }),
    )
    expect(out).toEqual([{ email: 'mum@home.test' }, { email: 'dad@home.test' }])
  })

  it('no matching students → empty, without querying parent links', async () => {
    mockStudentFindMany.mockResolvedValue([])
    const out = await resolveMailGroupRule(ORG, { audience: 'parents' })
    expect(out).toEqual([])
    expect(mockParentLinkFindMany).not.toHaveBeenCalled()
  })
})

describe('resolveMailGroupRule — tutors', () => {
  it('resolves teachers with an active Match to the filtered students, deduped', async () => {
    mockStudentFindMany.mockResolvedValue([student('s1'), student('s2')])
    mockMatchFindMany.mockResolvedValue([
      { studentId: 's1', teacher: { firstName: 'Tina', lastName: 'Tutor', user: { email: 'tina@tutors.test' } } },
      { studentId: 's2', teacher: { firstName: 'Tina', lastName: 'Tutor', user: { email: 'tina@tutors.test' } } },
      { studentId: 's2', teacher: { firstName: 'Tom', lastName: 'Teach', user: { email: 'tom@tutors.test' } } },
    ])
    const out = await resolveMailGroupRule(ORG, { audience: 'tutors', classId: 'c1' })
    expect(mockMatchFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { studentId: { in: ['s1', 's2'] }, active: true } }),
    )
    expect(out).toEqual([
      { email: 'tina@tutors.test', name: 'Tina Tutor' },
      { email: 'tom@tutors.test', name: 'Tom Teach' },
    ])
  })
})

describe('resolveMailGroup', () => {
  it('unknown group / wrong org → null (query is org-scoped)', async () => {
    mockMailGroupFindFirst.mockResolvedValue(null)
    const out = await resolveMailGroup('grp_x', ORG)
    expect(out).toBeNull()
    expect(mockMailGroupFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'grp_x', organisationId: ORG } }),
    )
  })

  it('manual group (rule=null) → its member rows, deduped', async () => {
    mockMailGroupFindFirst.mockResolvedValue({
      id: 'grp_1',
      organisationId: ORG,
      rule: null,
      members: [
        { email: 'a@x.test', name: 'A' },
        { email: 'A@x.test', name: 'A again' },
        { email: 'b@x.test', name: null },
      ],
    })
    const out = await resolveMailGroup('grp_1', ORG)
    expect(out).toEqual([
      { email: 'a@x.test', name: 'A' },
      { email: 'b@x.test' },
    ])
    expect(mockStudentFindMany).not.toHaveBeenCalled()
  })

  it('rule group → resolved live from structure', async () => {
    mockMailGroupFindFirst.mockResolvedValue({
      id: 'grp_2',
      organisationId: ORG,
      rule: { audience: 'students', yearGroupId: 'yg1' },
      members: [],
    })
    mockStudentFindMany.mockResolvedValue([student('s1')])
    const out = await resolveMailGroup('grp_2', ORG)
    expect(out).toEqual([{ email: 's1@school.test', name: 'Sam Pupil' }])
  })

  it('corrupt stored rule degrades to the manual member list', async () => {
    mockMailGroupFindFirst.mockResolvedValue({
      id: 'grp_3',
      organisationId: ORG,
      rule: { audience: 'martians' },
      members: [{ email: 'kept@x.test', name: null }],
    })
    const out = await resolveMailGroup('grp_3', ORG)
    expect(out).toEqual([{ email: 'kept@x.test' }])
  })
})
