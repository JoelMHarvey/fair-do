import { describe, it, expect, vi, beforeEach } from 'vitest'

const m = vi.hoisted(() => ({ create: vi.fn(), count: vi.fn(), deleteMany: vi.fn() }))
vi.mock('@/lib/prisma', () => ({ prisma: { errorEvent: { create: m.create, count: m.count, deleteMany: m.deleteMany } } }))

import { recordError, recentErrorCount } from '@/lib/error-log'

beforeEach(() => {
  Object.values(m).forEach(fn => fn.mockReset())
  m.create.mockResolvedValue({})
  m.count.mockResolvedValue(3)
  m.deleteMany.mockResolvedValue({ count: 0 })
})

describe('recordError', () => {
  it('records a truncated error line', () => {
    recordError('booking/create', 'boom')
    expect(m.create).toHaveBeenCalledWith({ data: { scope: 'booking/create', message: 'boom', digest: null } })
  })

  it('truncates long scope + message', () => {
    recordError('s'.repeat(200), 'm'.repeat(1000), 'dig')
    const arg = m.create.mock.calls[0][0].data
    expect(arg.scope.length).toBe(120)
    expect(arg.message.length).toBe(500)
    expect(arg.digest).toBe('dig')
  })

  it('never throws when the insert rejects (DB down)', () => {
    m.create.mockRejectedValue(new Error('db down'))
    expect(() => recordError('x', 'y')).not.toThrow()
  })
})

describe('recentErrorCount', () => {
  it('prunes old rows then returns the recent count', async () => {
    const n = await recentErrorCount(20 * 60_000, 24 * 3600_000)
    expect(m.deleteMany).toHaveBeenCalled()
    expect(n).toBe(3)
  })
})
