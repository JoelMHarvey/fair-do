import { auth, clerkClient } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { isAdminUser, isAdminEmail } from '@/lib/admin'
import { z } from 'zod'

const schema = z.object({ ban: z.boolean() })

// Block / unblock a user. Banning a Clerk account revokes its sessions and
// stops it signing in. Admin-gated; never bans an admin/allowlisted/self account.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const me = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!isAdminUser(me)) return new Response('Forbidden', { status: 403 })

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return Response.json({ error: 'Invalid request' }, { status: 400 })
  const { ban } = parsed.data

  const target = await prisma.user.findUnique({ where: { id } })
  if (!target) return Response.json({ error: 'User not found' }, { status: 404 })
  if (target.id === me!.id) return Response.json({ error: 'You can’t block yourself.' }, { status: 400 })
  if (target.role === 'ADMIN' || isAdminEmail(target.email)) {
    return Response.json({ error: 'Can’t block an admin account.' }, { status: 400 })
  }

  try {
    const clerk = await clerkClient()
    if (ban) await clerk.users.banUser(target.clerkId)
    else await clerk.users.unbanUser(target.clerkId)
    console.log(`[admin] ${me!.email} ${ban ? 'blocked' : 'unblocked'} ${target.email}`)
    return Response.json({ ok: true, banned: ban })
  } catch (e) {
    console.error('[admin] ban toggle failed:', e instanceof Error ? e.message : e)
    return Response.json({ error: 'Could not update the account.' }, { status: 502 })
  }
}
