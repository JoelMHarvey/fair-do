import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import type { Teacher, User } from '@prisma/client'

export type AuthedTeacher = Teacher & { user: User }

// Resolve the signed-in Clerk user to their Teacher row. Returns null (not throws) so
// callers can return 401/403 cleanly. Works for both cookie sessions (web) and
// Authorization: Bearer <clerk-jwt> (mobile) — Clerk's middleware handles both.
export async function getMobileTeacher(): Promise<AuthedTeacher | null> {
  const { userId } = await auth()
  if (!userId) return null

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { teacher: true },
  })
  if (!user?.teacher) return null

  return { ...user.teacher, user }
}
