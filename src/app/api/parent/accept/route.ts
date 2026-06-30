import { auth, currentUser } from '@clerk/nextjs/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { PARENT_PORTAL_ENABLED, parentHasActivePortal, syncFamilyPortalAccess } from '@/lib/parent'

const schema = z.object({ token: z.string().min(1) })

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
    user = await prisma.user.upsert({
      where: { email },
      update: { clerkId: userId },
      create: { clerkId: userId, email, role: 'PARENT' },
      include: { teacher: true, student: true },
    })
  }

  // A teacher or student account can't double as a parent — keep roles clean.
  if (user.teacher || user.student) {
    return Response.json({ error: 'Use a separate email for the parent portal — this account is already a tutor or student.' }, { status: 409 })
  }

  // Already linked (e.g. re-accept) → idempotent success.
  if (link.parentUserId === user.id && link.status === 'active') {
    return Response.json({ ok: true }, { status: 200 })
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
