import { auth, clerkClient } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { isAdminUser, isAdminEmail } from '@/lib/admin'

// "Sign in as this user" via a Clerk actor token. Off unless explicitly enabled —
// it's a powerful capability, so it's gated, guarded, and logged. Clerk shows a
// native impersonation banner for the duration of the session.
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (process.env.ADMIN_IMPERSONATION_ENABLED !== 'true') {
    return Response.json({ error: 'Impersonation is disabled.' }, { status: 403 })
  }

  const { id } = await params
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const me = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!isAdminUser(me)) return new Response('Forbidden', { status: 403 })

  const target = await prisma.user.findUnique({ where: { id } })
  if (!target) return Response.json({ error: 'User not found' }, { status: 404 })
  if (target.id === me!.id) return Response.json({ error: 'You can’t impersonate yourself.' }, { status: 400 })
  // Never impersonate another admin / allowlisted account.
  if (target.role === 'ADMIN' || isAdminEmail(target.email)) {
    return Response.json({ error: 'Can’t impersonate an admin account.' }, { status: 400 })
  }

  try {
    const clerk = await clerkClient()
    const actorToken = await clerk.actorTokens.create({
      userId: target.clerkId,
      actor: { sub: me!.clerkId },
      expiresInSeconds: 600,
    })
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://fair-do.com'
    console.log(`[admin] ${me!.email} impersonating ${target.email}`)
    return Response.json({ url: `${appUrl}/sign-in?__clerk_ticket=${actorToken.token}` }, { status: 200 })
  } catch (e) {
    console.error('[admin] impersonation token failed:', e instanceof Error ? e.message : e)
    return Response.json({ error: 'Could not start impersonation.' }, { status: 502 })
  }
}
