import { prisma } from '@/lib/prisma'

export { prisma }

// Wipe every table between tests so each starts from a clean slate. Keeps the
// migration bookkeeping table. CASCADE handles FK order for us.
export async function truncateAll() {
  const rows = await prisma.$queryRaw<{ tablename: string }[]>`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public' AND tablename NOT LIKE '\\_prisma%'
  `
  if (rows.length === 0) return
  const list = rows.map(r => `"public"."${r.tablename}"`).join(', ')
  await prisma.$executeRawUnsafe(`TRUNCATE ${list} RESTART IDENTITY CASCADE`)
}

let seq = 0
const uniq = () => `${Date.now().toString(36)}_${seq++}`

// Minimal valid-row factories (only required fields + what a test asserts on).
export async function makeUser(over: Partial<{ clerkId: string; email: string; role: 'STUDENT' | 'TEACHER' | 'PARENT' | 'ADMIN' }> = {}) {
  const u = uniq()
  return prisma.user.create({
    data: { clerkId: over.clerkId ?? `ck_${u}`, email: over.email ?? `user_${u}@x.test`, role: over.role ?? 'STUDENT' },
  })
}

export async function makeStudent(userId: string, over: Partial<{ firstName: string; contactEmail: string }> = {}) {
  return prisma.student.create({
    data: { userId, firstName: over.firstName ?? 'Kid', lastName: 'Smith', contactEmail: over.contactEmail ?? `kid_${uniq()}@x.test`, dateOfBirth: new Date('2012-01-01') },
  })
}

export async function makeTeacher(userId: string) {
  return prisma.teacher.create({
    data: { userId, firstName: 'Alice', lastName: 'Teach', bio: 'bio', sessionRatePence: 5000 },
  })
}
