/**
 * Parent portal (P2-3) — route auth + flow tests.
 *
 * Locks the access-control and happy paths for:
 *  - teacher invite (tier-gated, teacher-owned match, no duplicates)
 *  - parent accept (role transition, role-clash rejection)
 *  - parent subscribe (parent-only, price-configured)
 *  - shared message thread (parent OR inviting teacher only)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

const m = vi.hoisted(() => ({
  auth: vi.fn(),
  currentUser: vi.fn(),
  canOffer: vi.fn(),
  userFind: vi.fn(),
  userUpsert: vi.fn(),
  userUpdate: vi.fn(),
  matchFind: vi.fn(),
  linkFindFirst: vi.fn(),
  linkFindUnique: vi.fn(),
  linkCreate: vi.fn(),
  linkUpdate: vi.fn(),
  linkCount: vi.fn(),
  linkUpdateMany: vi.fn(),
  psubFind: vi.fn(),
  psubUpsert: vi.fn(),
  hasActive: vi.fn(),
  syncFamily: vi.fn(),
  threadUpsert: vi.fn(),
  threadCreate: vi.fn(),
  threadUpdate: vi.fn(),
  msgCreate: vi.fn(),
  transaction: vi.fn(),
  sendInvite: vi.fn(),
  customerCreate: vi.fn(),
  checkoutCreate: vi.fn(),
  portalCreate: vi.fn(),
}))

vi.mock('@clerk/nextjs/server', () => ({ auth: m.auth, currentUser: m.currentUser }))
vi.mock('@/lib/parent', () => ({
  PARENT_PORTAL_ENABLED: true,
  PARENT_PORTAL_PRICE_PENCE: 499,
  FAMILY_SOFT_CAP: 6,
  teacherCanOfferParentPortal: m.canOffer,
  generateParentToken: () => 'tok_test',
  parentHasActivePortal: m.hasActive,
  syncFamilyPortalAccess: m.syncFamily,
}))
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: { findUnique: m.userFind, upsert: m.userUpsert, update: m.userUpdate },
    match: { findFirst: m.matchFind },
    parentLink: { findFirst: m.linkFindFirst, findUnique: m.linkFindUnique, create: m.linkCreate, update: m.linkUpdate, count: m.linkCount, updateMany: m.linkUpdateMany },
    parentSubscription: { findUnique: m.psubFind, upsert: m.psubUpsert },
    parentMessageThread: { upsert: m.threadUpsert, create: m.threadCreate, update: m.threadUpdate },
    parentMessage: { create: m.msgCreate },
    $transaction: m.transaction,
  },
}))
vi.mock('@/lib/email', () => ({ sendParentInvite: m.sendInvite }))
vi.mock('@/lib/stripe', () => ({
  getStripe: () => ({
    customers: { create: m.customerCreate },
    checkout: { sessions: { create: m.checkoutCreate } },
    billingPortal: { sessions: { create: m.portalCreate } },
  }),
}))
vi.mock('@/lib/ratelimit', () => ({
  checkRateLimit: vi.fn(async () => ({ allowed: true })),
  rateLimitResponse: vi.fn(() => new Response('rl', { status: 429 })),
}))
vi.mock('next/headers', () => ({ headers: vi.fn(async () => ({ get: () => null })) }))

import { POST as invite } from '@/app/api/teacher/parent/invite/route'
import { POST as accept } from '@/app/api/parent/accept/route'
import { POST as subscribe } from '@/app/api/parent/subscribe/route'
import { POST as sendMsg } from '@/app/api/parent/messages/send/route'
import { POST as revoke } from '@/app/api/teacher/parent/revoke/route'
import { POST as billingPortal } from '@/app/api/parent/billing-portal/route'

function req(body: object) {
  return new Request('http://localhost/x', { method: 'POST', body: JSON.stringify(body) })
}

beforeEach(() => {
  Object.values(m).forEach(fn => fn.mockReset())
  m.auth.mockResolvedValue({ userId: 'clerk_1' })
  m.transaction.mockImplementation((ops: Promise<unknown>[]) => Promise.all(ops))
})

describe('teacher invite', () => {
  it('403 when the caller is not a teacher', async () => {
    m.userFind.mockResolvedValue({ id: 'u1', teacher: null })
    const res = await invite(req({ matchId: 'mt1', parentEmail: 'p@x.com' }))
    expect(res.status).toBe(403)
  })

  it('403 when the teacher’s plan can’t offer the portal', async () => {
    m.userFind.mockResolvedValue({ id: 'u1', teacher: { id: 't1', firstName: 'A', lastName: 'B' } })
    m.canOffer.mockResolvedValue(false)
    const res = await invite(req({ matchId: 'mt1', parentEmail: 'p@x.com' }))
    expect(res.status).toBe(403)
  })

  it('201 + creates link + sends email on success', async () => {
    m.userFind.mockResolvedValue({ id: 'u1', teacher: { id: 't1', firstName: 'A', lastName: 'B' } })
    m.canOffer.mockResolvedValue(true)
    m.matchFind.mockResolvedValue({ id: 'mt1', studentId: 's1', student: { firstName: 'Kid' } })
    m.linkFindFirst.mockResolvedValue(null)
    m.linkCreate.mockResolvedValue({ id: 'pl1' })
    m.sendInvite.mockResolvedValue(undefined)
    const res = await invite(req({ matchId: 'mt1', parentEmail: 'P@X.com' }))
    expect(res.status).toBe(201)
    expect(m.linkCreate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ studentId: 's1', teacherId: 't1', inviteEmail: 'p@x.com', token: 'tok_test', status: 'pending' }),
    }))
    expect(m.sendInvite).toHaveBeenCalled()
  })

  it('409 on a duplicate active/pending invite', async () => {
    m.userFind.mockResolvedValue({ id: 'u1', teacher: { id: 't1', firstName: 'A', lastName: 'B' } })
    m.canOffer.mockResolvedValue(true)
    m.matchFind.mockResolvedValue({ id: 'mt1', studentId: 's1', student: { firstName: 'Kid' } })
    m.linkFindFirst.mockResolvedValue({ id: 'pl_existing' })
    const res = await invite(req({ matchId: 'mt1', parentEmail: 'p@x.com' }))
    expect(res.status).toBe(409)
    expect(m.linkCreate).not.toHaveBeenCalled()
  })
})

describe('parent accept', () => {
  it('404 on an invalid/revoked token', async () => {
    m.linkFindUnique.mockResolvedValue(null)
    const res = await accept(req({ token: 'nope' }))
    expect(res.status).toBe(404)
  })

  it('409 when the account is already a tutor or student', async () => {
    m.linkFindUnique.mockResolvedValue({ id: 'pl1', studentId: 's1', teacherId: 't1', status: 'pending', parentUserId: null })
    m.userFind.mockResolvedValue({ id: 'u1', teacher: { id: 't1' }, student: null })
    const res = await accept(req({ token: 'tok_test' }))
    expect(res.status).toBe(409)
    expect(m.transaction).not.toHaveBeenCalled()
  })

  it('403 when the signed-in email does not match the invited email', async () => {
    m.linkFindUnique.mockResolvedValue({ id: 'pl1', studentId: 's1', teacherId: 't1', status: 'pending', parentUserId: null, inviteEmail: 'invited@x.com', createdAt: new Date() })
    m.userFind.mockResolvedValue({ id: 'u1', teacher: null, student: null, email: 'attacker@x.com' })
    const res = await accept(req({ token: 'tok_test' }))
    expect(res.status).toBe(403)
    expect(m.transaction).not.toHaveBeenCalled()
  })

  it('409 when the token would hijack a link already owned by someone else', async () => {
    m.linkFindUnique.mockResolvedValue({ id: 'pl1', studentId: 's1', teacherId: 't1', status: 'active', parentUserId: 'u_other', inviteEmail: 'p@x.com', createdAt: new Date() })
    m.userFind.mockResolvedValue({ id: 'u1', teacher: null, student: null, email: 'p@x.com' })
    const res = await accept(req({ token: 'tok_test' }))
    expect(res.status).toBe(409)
    expect(m.transaction).not.toHaveBeenCalled()
  })

  it('410 when the invite has expired', async () => {
    const old = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    m.linkFindUnique.mockResolvedValue({ id: 'pl1', studentId: 's1', teacherId: 't1', status: 'pending', parentUserId: null, inviteEmail: 'p@x.com', createdAt: old })
    m.userFind.mockResolvedValue({ id: 'u1', teacher: null, student: null, email: 'p@x.com' })
    const res = await accept(req({ token: 'tok_test' }))
    expect(res.status).toBe(410)
    expect(m.transaction).not.toHaveBeenCalled()
  })

  it('links account + sets PARENT role + creates thread', async () => {
    m.linkFindUnique.mockResolvedValue({ id: 'pl1', studentId: 's1', teacherId: 't1', status: 'pending', parentUserId: null, inviteEmail: 'p@x.com', createdAt: new Date() })
    m.userFind.mockResolvedValue({ id: 'u1', teacher: null, student: null, email: 'P@X.com' })
    m.linkFindFirst.mockResolvedValue(null)
    m.userUpdate.mockResolvedValue({})
    m.linkUpdate.mockResolvedValue({})
    m.threadUpsert.mockResolvedValue({})
    m.hasActive.mockResolvedValue(false) // family not subscribed → no access sync
    const res = await accept(req({ token: 'tok_test' }))
    expect(res.status).toBe(200)
    expect(m.transaction).toHaveBeenCalled()
    expect(m.userUpdate).toHaveBeenCalledWith(expect.objectContaining({ data: { role: 'PARENT' } }))
    expect(m.syncFamily).not.toHaveBeenCalled()
  })

  it('covers a new child immediately when the family already pays', async () => {
    m.linkFindUnique.mockResolvedValue({ id: 'pl2', studentId: 's2', teacherId: 't2', status: 'pending', parentUserId: null, inviteEmail: 'p@x.com', createdAt: new Date() })
    m.userFind.mockResolvedValue({ id: 'u1', teacher: null, student: null, email: 'p@x.com' })
    m.linkFindFirst.mockResolvedValue(null)
    m.userUpdate.mockResolvedValue({})
    m.linkUpdate.mockResolvedValue({})
    m.threadUpsert.mockResolvedValue({})
    m.hasActive.mockResolvedValue(true) // family already subscribed
    const res = await accept(req({ token: 'tok_test' }))
    expect(res.status).toBe(200)
    expect(m.syncFamily).toHaveBeenCalledWith('u1', true)
  })
})

describe('parent subscribe', () => {
  it('403 when the caller is not a parent', async () => {
    m.userFind.mockResolvedValue({ id: 'u1', role: 'STUDENT', email: 'p@x.com' })
    const res = await subscribe(req({ parentLinkId: 'pl1' }))
    expect(res.status).toBe(403)
  })

  it('503 when the parent-portal price isn’t configured', async () => {
    delete process.env.STRIPE_PRICE_PARENT_PORTAL
    m.userFind.mockResolvedValue({ id: 'u1', role: 'PARENT', email: 'p@x.com' })
    m.linkCount.mockResolvedValue(1)
    m.hasActive.mockResolvedValue(false)
    const res = await subscribe(req({}))
    expect(res.status).toBe(503)
  })

  it('404 when the parent has no children linked yet', async () => {
    process.env.STRIPE_PRICE_PARENT_PORTAL = 'price_pp'
    m.userFind.mockResolvedValue({ id: 'u1', role: 'PARENT', email: 'p@x.com' })
    m.linkCount.mockResolvedValue(0)
    const res = await subscribe(req({}))
    expect(res.status).toBe(404)
    delete process.env.STRIPE_PRICE_PARENT_PORTAL
  })

  it('returns already=true when the family is already subscribed', async () => {
    process.env.STRIPE_PRICE_PARENT_PORTAL = 'price_pp'
    m.userFind.mockResolvedValue({ id: 'u1', role: 'PARENT', email: 'p@x.com' })
    m.linkCount.mockResolvedValue(2)
    m.hasActive.mockResolvedValue(true)
    const res = await subscribe(req({}))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true, already: true })
    expect(m.checkoutCreate).not.toHaveBeenCalled()
    delete process.env.STRIPE_PRICE_PARENT_PORTAL
  })

  it('201 + one family checkout URL on success (keyed by parentUserId)', async () => {
    process.env.STRIPE_PRICE_PARENT_PORTAL = 'price_pp'
    m.userFind.mockResolvedValue({ id: 'u1', role: 'PARENT', email: 'p@x.com' })
    m.linkCount.mockResolvedValue(2)
    m.hasActive.mockResolvedValue(false)
    m.psubFind.mockResolvedValue(null)
    m.customerCreate.mockResolvedValue({ id: 'cus_1' })
    m.psubUpsert.mockResolvedValue({})
    m.checkoutCreate.mockResolvedValue({ url: 'https://checkout.stripe/x' })
    const res = await subscribe(req({}))
    expect(res.status).toBe(201)
    expect(await res.json()).toEqual({ checkoutUrl: 'https://checkout.stripe/x' })
    expect(m.checkoutCreate).toHaveBeenCalledWith(expect.objectContaining({
      mode: 'subscription',
      metadata: expect.objectContaining({ type: 'parent_portal', parentUserId: 'u1' }),
    }))
    delete process.env.STRIPE_PRICE_PARENT_PORTAL
  })
})

describe('shared message thread', () => {
  const link = { id: 'pl1', parentUserId: 'u_parent', teacherId: 't1', status: 'active', portalActive: true, parentThread: { id: 'th1' } }

  it('403 for someone who is neither the parent nor the inviting teacher', async () => {
    m.userFind.mockResolvedValue({ id: 'u_other', teacher: null })
    m.linkFindFirst.mockResolvedValue(link)
    const res = await sendMsg(req({ parentLinkId: 'pl1', body: 'hi' }))
    expect(res.status).toBe(403)
    expect(m.msgCreate).not.toHaveBeenCalled()
  })

  it('403 when the parent is linked but not subscribed (paywall — M1)', async () => {
    m.userFind.mockResolvedValue({ id: 'u_parent', teacher: null })
    m.linkFindFirst.mockResolvedValue({ ...link, portalActive: false })
    const res = await sendMsg(req({ parentLinkId: 'pl1', body: 'hi' }))
    expect(res.status).toBe(403)
    expect(m.msgCreate).not.toHaveBeenCalled()
  })

  it('201 when the parent posts', async () => {
    m.userFind.mockResolvedValue({ id: 'u_parent', teacher: null })
    m.linkFindFirst.mockResolvedValue(link)
    m.msgCreate.mockResolvedValue({ id: 'msg1', body: 'hi', createdAt: new Date() })
    m.threadUpdate.mockResolvedValue({})
    const res = await sendMsg(req({ parentLinkId: 'pl1', body: 'hi' }))
    expect(res.status).toBe(201)
    expect(m.msgCreate).toHaveBeenCalled()
  })

  it('201 when the inviting teacher posts', async () => {
    m.userFind.mockResolvedValue({ id: 'u_t', teacher: { id: 't1' } })
    m.linkFindFirst.mockResolvedValue(link)
    m.msgCreate.mockResolvedValue({ id: 'msg2', body: 'yo', createdAt: new Date() })
    m.threadUpdate.mockResolvedValue({})
    const res = await sendMsg(req({ parentLinkId: 'pl1', body: 'yo' }))
    expect(res.status).toBe(201)
    expect(m.msgCreate).toHaveBeenCalled()
  })
})

describe('parent billing portal', () => {
  it('403 when the caller is not a parent', async () => {
    m.userFind.mockResolvedValue({ id: 'u1', role: 'STUDENT' })
    const res = await billingPortal()
    expect(res.status).toBe(403)
  })

  it('409 when there is no Stripe customer yet', async () => {
    m.userFind.mockResolvedValue({ id: 'u1', role: 'PARENT' })
    m.psubFind.mockResolvedValue({ stripeCustomerId: null })
    const res = await billingPortal()
    expect(res.status).toBe(409)
  })

  it('returns the Stripe billing portal url', async () => {
    m.userFind.mockResolvedValue({ id: 'u1', role: 'PARENT' })
    m.psubFind.mockResolvedValue({ stripeCustomerId: 'cus_1' })
    m.portalCreate.mockResolvedValue({ url: 'https://billing.stripe/x' })
    const res = await billingPortal()
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ url: 'https://billing.stripe/x' })
    expect(m.portalCreate).toHaveBeenCalledWith(expect.objectContaining({ customer: 'cus_1' }))
  })
})

describe('teacher revoke', () => {
  it('403 when the caller is not a teacher', async () => {
    m.userFind.mockResolvedValue({ id: 'u1', teacher: null })
    const res = await revoke(req({ parentLinkId: 'pl1' }))
    expect(res.status).toBe(403)
    expect(m.linkUpdate).not.toHaveBeenCalled()
  })

  it('404 when the link is not owned by the caller', async () => {
    m.userFind.mockResolvedValue({ id: 'u1', teacher: { id: 't1' } })
    m.linkFindFirst.mockResolvedValue(null) // scoped query found nothing
    const res = await revoke(req({ parentLinkId: 'pl_other' }))
    expect(res.status).toBe(404)
    expect(m.linkUpdate).not.toHaveBeenCalled()
  })

  it('revokes: status revoked, portalActive false, parentUserId cleared', async () => {
    m.userFind.mockResolvedValue({ id: 'u1', teacher: { id: 't1' } })
    m.linkFindFirst.mockResolvedValue({ id: 'pl1', teacherId: 't1' })
    m.linkUpdate.mockResolvedValue({})
    const res = await revoke(req({ parentLinkId: 'pl1' }))
    expect(res.status).toBe(200)
    expect(m.linkUpdate).toHaveBeenCalledWith({
      where: { id: 'pl1' },
      data: { status: 'revoked', portalActive: false, parentUserId: null },
    })
  })
})
