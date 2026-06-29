import { describe, it, expect, vi, beforeEach } from 'vitest'
import { resolveEmailBrand } from './email-brand'

vi.mock('./prisma', () => ({
  prisma: {
    teacher: {
      findUnique: vi.fn(),
    },
  },
}))

import { prisma } from './prisma'
const mockFindUnique = vi.mocked(prisma.teacher.findUnique)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function makeTeacher(overrides: Record<string, unknown> = {}): any {
  return {
    firstName: 'Alice',
    lastName: 'Smith',
    practiceName: 'Bright Minds Tuition',
    brandEnabled: true,
    brandLogoUrl: 'https://res.cloudinary.com/demo/image/upload/logo.png',
    brandColor: '#3a7ca5',
    brandFooterLine: '123 High Street, London W1A 1AA',
    replyToEmail: 'hello@brightminds.com',
    subscription: { tier: 'practice', status: 'active' },
    ...overrides,
  }
}

beforeEach(() => {
  mockFindUnique.mockReset()
})

describe('resolveEmailBrand', () => {
  it('returns null when teacher not found', async () => {
    mockFindUnique.mockResolvedValue(null)
    expect(await resolveEmailBrand('t_missing')).toBeNull()
  })

  it('returns null on starter tier', async () => {
    mockFindUnique.mockResolvedValue(makeTeacher({ subscription: { tier: 'starter', status: 'active' } }))
    expect(await resolveEmailBrand('t_1')).toBeNull()
  })

  it('returns null when brandEnabled is false', async () => {
    mockFindUnique.mockResolvedValue(makeTeacher({ brandEnabled: false }))
    expect(await resolveEmailBrand('t_1')).toBeNull()
  })

  it('returns null when subscription status is canceled', async () => {
    mockFindUnique.mockResolvedValue(makeTeacher({ subscription: { tier: 'practice', status: 'canceled' } }))
    expect(await resolveEmailBrand('t_1')).toBeNull()
  })

  it('returns null when subscription status is past_due', async () => {
    mockFindUnique.mockResolvedValue(makeTeacher({ subscription: { tier: 'practice', status: 'past_due' } }))
    expect(await resolveEmailBrand('t_1')).toBeNull()
  })

  it('returns null when no subscription row', async () => {
    mockFindUnique.mockResolvedValue(makeTeacher({ subscription: null }))
    expect(await resolveEmailBrand('t_1')).toBeNull()
  })

  it('returns brand for practice tier + active + enabled', async () => {
    mockFindUnique.mockResolvedValue(makeTeacher())
    const brand = await resolveEmailBrand('t_1')
    expect(brand).toMatchObject({
      practiceName: 'Bright Minds Tuition',
      color: '#3a7ca5',
      footerLine: '123 High Street, London W1A 1AA',
      replyTo: 'hello@brightminds.com',
    })
    expect(brand?.logoUrl).toBe('https://res.cloudinary.com/demo/image/upload/logo.png')
  })

  it('returns brand for clinic tier + trialing', async () => {
    mockFindUnique.mockResolvedValue(makeTeacher({ subscription: { tier: 'clinic', status: 'trialing' } }))
    expect(await resolveEmailBrand('t_1')).not.toBeNull()
  })

  it('falls back to teacher name when practiceName is unset', async () => {
    mockFindUnique.mockResolvedValue(makeTeacher({ practiceName: null }))
    const brand = await resolveEmailBrand('t_1')
    expect(brand?.practiceName).toBe('Alice Smith')
  })

  it('falls back to default color when brandColor is invalid hex', async () => {
    mockFindUnique.mockResolvedValue(makeTeacher({ brandColor: 'blue' }))
    const brand = await resolveEmailBrand('t_1')
    expect(brand?.color).toBe('#4f46e5')
  })

  it('rejects non-Cloudinary logo URL', async () => {
    mockFindUnique.mockResolvedValue(makeTeacher({ brandLogoUrl: 'https://evil.com/logo.png' }))
    const brand = await resolveEmailBrand('t_1')
    expect(brand?.logoUrl).toBeUndefined()
  })

  it('accepts logo URL without host when brandLogoUrl is null', async () => {
    mockFindUnique.mockResolvedValue(makeTeacher({ brandLogoUrl: null }))
    const brand = await resolveEmailBrand('t_1')
    expect(brand?.logoUrl).toBeUndefined()
  })
})
