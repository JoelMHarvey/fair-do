import { auth, currentUser } from '@clerk/nextjs/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { PARENT_PORTAL_ENABLED, parentHasActivePortal, syncFamilyPortalAccess } from '@/lib/parent'

const schema = z.object({ token: z.string().min(1) })

// Parent invites expire if not accepted within two weeks.
const INVITE_TTL_DAYS = 14

export async function POST(req: Request) {
  if (!PARENT_PORTAL_ENABLED) return new Response('Not found', { status: 404 })

  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return new Response('Bad request', { status: 400 })

  const link = await prisma.parentLink.findUnique({ where: { token: parsed.data.token } })
  if (!link || link.status === 'revoked') return Response.json({ error: 'This invite is no longer valid.' }, { status: 404 })

  // Resolve (or create) the signed-in user's row. The Clerk webhook normally creates
  // it on sign-up, but accept can race that, so fall back to the Clerk profile.
  let user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { teacher: true, student: true },
  })
  if (!user) {
    const cu = await currentUser()
    const email = cu?.primaryEmailAddress?.emailAddress ?? cu?.emailAddresses[0]?.emailAddress
    if (!email) return Response.json({ error: 'No email on your account.' }, { status: 400 })
    // Don't silently rebind an existing account's Clerk ID — treat a mismatch as an error.
    const byEmail = await prisma.user.findUnique({ where: { email }, include: { teacher: true, student: true } })
    if (byEmail && byEmail.clerkId !== userId) {
      return Response.json({ error: 'This email is already linked to another account.' }, { status: 409 })
    }
    user = byEmail ?? await prisma.user.create({
      data: { clerkId: userId, email, role: 'PARENT' },
      include: { teacher: true, student: true },
    })
  }

  // A teacher or student account can't double as a parent — keep roles clean.
  if (user.teacher || user.student) {
    return Response.json({ error: 'Use a separate email for the parent portal — this account is already a tutor or student.' }, { status: 409 })
  }

  // Bind the invite to the email it was sent to. A leaked/forwarded token must not
  // let a different account claim a child's data.
  if (user.email.toLowerCase() !== link.inviteEmail.toLowerCase()) {
    return Response.json({ error: 'This invite was sent to a different email address.' }, { status: 403 })
  }

  // Already linked to this same parent → idempotent success.
  if (link.parentUserId === user.id && link.status === 'active') {
    return Response.json({ ok: true }, { status: 200 })
  }

  // Never let a token re-claim a link already owned by someone else, or accept a
  // non-pending (already-used) invite — prevents ownership hijack of a live link.
  if (link.parentUserId && link.parentUserId !== user.id) {
    return Response.json({ error: 'This invite has already been used.' }, { status: 409 })
  }
  if (link.status !== 'pending') {
    return Response.json({ error: 'This invite is no longer valid.' }, { status: 409 })
  }

  // Expire stale invites.
  if (Date.now() - new Date(link.createdAt).getTime() > INVITE_TTL_DAYS * 24 * 60 * 60 * 1000) {
    return Response.json({ error: 'This invite has expired. Ask your tutor for a new one.' }, { status: 410 })
  }

  // One parent account per student.
  const clash = await prisma.parentLink.findFirst({
    where: { parentUserId: user.id, studentId: link.studentId, status: 'active', id: { not: link.id } },
  })
  if (clash) return Response.json({ error: 'You already follow this student.' }, { status: 409 })

  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { role: 'PARENT' } }),
    prisma.parentLink.update({
      where: { id: link.id },
      data: { parentUserId: user.id, status: 'active', acceptedAt: new Date() },
    }),
    prisma.parentMessageThread.upsert({
      where: { parentLinkId: link.id },
      update: {},
      create: { parentLinkId: link.id, teacherId: link.teacherId },
    }),
  ])

  // If this family already pays, the new child is covered immediately — no extra
  // charge. This also refreshes the soft-abuse flag for the larger family.
  if (await parentHasActivePortal(user.id)) {
    await syncFamilyPortalAccess(user.id, true)
  }

  return Response.json({ ok: true }, { status: 200 })
}
