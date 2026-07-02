import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { resolveOrgEmailBrand, resolveStudentEmailBrand } from './email-brand'

vi.mock('./prisma', () => ({
  prisma: {
    teacher: { findUnique: vi.fn() },
    student: { findUnique: vi.fn() },
    organisation: { findUnique: vi.fn() },
  },
}))

import { prisma } from './prisma'
const mockTeacher = vi.mocked(prisma.teacher.findUnique)
const mockStudent = vi.mocked(prisma.student.findUnique)
const mockOrg = vi.mocked(prisma.organisation.findUnique)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function makeOrg(overrides: Record<string, unknown> = {}): any {
  return {
    name: 'St George’s School',
    active: true,
    plan: 'portal',
    brandLogoUrl: 'https://res.cloudinary.com/demo/image/upload/crest.png',
    brandColor: '#1d4ed8',
    footerLine: 'St George’s School, 1 Chapel Lane, York',
    ...overrides,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function makePaidTeacher(): any {
  return {
    firstName: 'Alice',
    lastName: 'Smith',
    practiceName: 'Bright Minds Tuition',
    brandEnabled: true,
    brandLogoUrl: 'https://res.cloudinary.com/demo/image/upload/logo.png',
    brandColor: '#3a7ca5',
    brandFooterLine: null,
    replyToEmail: null,
    subscription: { tier: 'practice', status: 'active' },
    user: { email: 'alice@example.com' },
  }
}

const origFlag = process.env.ENTERPRISE_PORTAL_ENABLED

beforeEach(() => {
  mockTeacher.mockReset()
  mockStudent.mockReset()
  mockOrg.mockReset()
  process.env.ENTERPRISE_PORTAL_ENABLED = 'true'
})

afterEach(() => {
  if (origFlag === undefined) delete process.env.ENTERPRISE_PORTAL_ENABLED
  else process.env.ENTERPRISE_PORTAL_ENABLED = origFlag
})

describe('resolveOrgEmailBrand', () => {
  it('returns null when the enterprise portal flag is off', async () => {
    process.env.ENTERPRISE_PORTAL_ENABLED = 'false'
    expect(await resolveOrgEmailBrand({ orgId: 'org_1' })).toBeNull()
    expect(mockOrg).not.toHaveBeenCalled()
  })

  it('returns null when the student has no organisation', async () => {
    mockStudent.mockResolvedValue({ organisationId: null } as never)
    expect(await resolveOrgEmailBrand({ studentId: 's_1' })).toBeNull()
    expect(mockOrg).not.toHaveBeenCalled()
  })

  it('returns null when the student is not found', async () => {
    mockStudent.mockResolvedValue(null)
    expect(await resolveOrgEmailBrand({ studentId: 's_missing' })).toBeNull()
  })

  it('returns null when neither studentId nor orgId is given', async () => {
    expect(await resolveOrgEmailBrand({})).toBeNull()
  })

  it('returns null when the org is not found', async () => {
    mockOrg.mockResolvedValue(null)
    expect(await resolveOrgEmailBrand({ orgId: 'org_missing' })).toBeNull()
  })

  it('returns null on the basic school plan', async () => {
    mockOrg.mockResolvedValue(makeOrg({ plan: 'school' }))
    expect(await resolveOrgEmailBrand({ orgId: 'org_1' })).toBeNull()
  })

  it('returns null when the org is inactive', async () => {
    mockOrg.mockResolvedValue(makeOrg({ active: false }))
    expect(await resolveOrgEmailBrand({ orgId: 'org_1' })).toBeNull()
  })

  it('returns null when no branding is set', async () => {
    mockOrg.mockResolvedValue(makeOrg({ brandColor: null, brandLogoUrl: null }))
    expect(await resolveOrgEmailBrand({ orgId: 'org_1' })).toBeNull()
  })

  it('returns null when colour is invalid and logo is non-Cloudinary', async () => {
    mockOrg.mockResolvedValue(makeOrg({ brandColor: 'blue', brandLogoUrl: 'https://evil.com/crest.png' }))
    expect(await resolveOrgEmailBrand({ orgId: 'org_1' })).toBeNull()
  })

  it('returns the school brand on a portal plan with branding set', async () => {
    mockOrg.mockResolvedValue(makeOrg())
    expect(await resolveOrgEmailBrand({ orgId: 'org_1' })).toEqual({
      practiceName: 'St George’s School',
      logoUrl: 'https://res.cloudinary.com/demo/image/upload/crest.png',
      color: '#1d4ed8',
      footerLine: 'St George’s School, 1 Chapel Lane, York',
    })
  })

  it('works on portal_plus too', async () => {
    mockOrg.mockResolvedValue(makeOrg({ plan: 'portal_plus' }))
    expect(await resolveOrgEmailBrand({ orgId: 'org_1' })).not.toBeNull()
  })

  it('resolves the org via the student', async () => {
    mockStudent.mockResolvedValue({ organisationId: 'org_1' } as never)
    mockOrg.mockResolvedValue(makeOrg())
    const brand = await resolveOrgEmailBrand({ studentId: 's_1' })
    expect(brand?.practiceName).toBe('St George’s School')
    expect(mockOrg).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'org_1' } }))
  })

  it('falls back to the default colour when brandColor is invalid but a logo is set', async () => {
    mockOrg.mockResolvedValue(makeOrg({ brandColor: 'navy' }))
    const brand = await resolveOrgEmailBrand({ orgId: 'org_1' })
    expect(brand?.color).toBe('#4f46e5')
    expect(brand?.logoUrl).toContain('res.cloudinary.com')
  })

  it('drops a non-Cloudinary logo but keeps a valid colour', async () => {
    mockOrg.mockResolvedValue(makeOrg({ brandLogoUrl: 'https://evil.com/crest.png' }))
    const brand = await resolveOrgEmailBrand({ orgId: 'org_1' })
    expect(brand?.logoUrl).toBeUndefined()
    expect(brand?.color).toBe('#1d4ed8')
  })
})

describe('resolveStudentEmailBrand', () => {
  it('teacher branding wins when present', async () => {
    mockTeacher.mockResolvedValue(makePaidTeacher())
    mockStudent.mockResolvedValue({ organisationId: 'org_1' } as never)
    mockOrg.mockResolvedValue(makeOrg())
    const brand = await resolveStudentEmailBrand('t_1', 's_1')
    expect(brand?.practiceName).toBe('Bright Minds Tuition')
    expect(mockOrg).not.toHaveBeenCalled()
  })

  it('falls back to the school brand when the teacher has none', async () => {
    mockTeacher.mockResolvedValue(null)
    mockStudent.mockResolvedValue({ organisationId: 'org_1' } as never)
    mockOrg.mockResolvedValue(makeOrg())
    const brand = await resolveStudentEmailBrand('t_1', 's_1')
    expect(brand?.practiceName).toBe('St George’s School')
  })

  it('returns null when neither teacher nor school brand applies', async () => {
    mockTeacher.mockResolvedValue(null)
    mockStudent.mockResolvedValue({ organisationId: null } as never)
    expect(await resolveStudentEmailBrand('t_1', 's_1')).toBeNull()
  })
})
