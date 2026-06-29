import { auth, clerkClient } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { UserRole, Region } from '@prisma/client'
import { z } from 'zod'

const schema = z.object({
  role: z.enum(['STUDENT', 'TEACHER']),
  country: z.enum(['UK', 'US']).optional(),
})

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return new Response('Invalid role', { status: 400 })

  const { role } = parsed.data
  const country = (parsed.data.country ?? 'UK') as Region

  // Upsert: webhook may not have fired yet (race condition or delivery delay)
  const user = await prisma.user.findUnique({ where: { clerkId: userId } })

  if (!user) {
    const clerk = await clerkClient()
    const clerkUser = await clerk.users.getUser(userId)
    const email = clerkUser.emailAddresses[0]?.emailAddress ?? ''
    // A row may already exist for this email under a different clerkId — e.g. after a
    // Clerk dev→prod instance migration, which mints a new clerkId for the same person.
    // Re-link that account to the current Clerk identity instead of colliding on the
    // unique email constraint (which would 500 and silently block onboarding).
    const byEmail = email ? await prisma.user.findUnique({ where: { email } }) : null
    if (byEmail) {
      await prisma.user.update({
        where: { id: byEmail.id },
        data: { clerkId: userId, role: role as UserRole, country },
      })
    } else {
      await prisma.user.create({
        data: { clerkId: userId, email, role: role as UserRole, country },
      })
    }
  } else {
    await prisma.user.update({
      where: { clerkId: userId },
      data: { role: role as UserRole, country },
    })
  }

  return new Response('OK', { status: 200 })
}
