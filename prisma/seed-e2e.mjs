/**
 * Seed E2E test accounts in the staging database.
 *
 * Idempotent — safe to re-run. Creates:
 *   • User + Teacher record for E2E_TEACHER_EMAIL
 *   • User + Student record for E2E_STUDENT_EMAIL
 *   • Match between them
 *
 * Prints the Match ID on success so you can store it as E2E_TEST_MATCH_ID.
 *
 * Required env vars:
 *   DATABASE_URL        — staging Postgres URL
 *   CLERK_SECRET_KEY    — to resolve email → Clerk user ID
 *   E2E_TEACHER_EMAIL
 *   E2E_STUDENT_EMAIL
 *
 * Optional:
 *   E2E_TEACHER_FIRST_NAME  (default: "E2E")
 *   E2E_TEACHER_LAST_NAME   (default: "Teacher")
 *   E2E_STUDENT_FIRST_NAME  (default: "E2E")
 *   E2E_STUDENT_LAST_NAME   (default: "Student")
 *
 * Run:
 *   DATABASE_URL=<staging> CLERK_SECRET_KEY=<sk_...> \
 *   E2E_TEACHER_EMAIL=... E2E_STUDENT_EMAIL=... \
 *   node prisma/seed-e2e.mjs
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function clerkUserIdByEmail(email, secretKey) {
  const res = await fetch(
    `https://api.clerk.com/v1/users?email_address=${encodeURIComponent(email)}&limit=1`,
    { headers: { Authorization: `Bearer ${secretKey}` } },
  )
  if (!res.ok) throw new Error(`Clerk users lookup failed ${res.status}: ${await res.text()}`)
  const users = await res.json()
  if (!users.length) throw new Error(`No Clerk user found for ${email}`)
  return users[0].id
}

async function main() {
  const secretKey = process.env.CLERK_SECRET_KEY
  const teacherEmail = process.env.E2E_TEACHER_EMAIL
  const studentEmail = process.env.E2E_STUDENT_EMAIL

  if (!secretKey || !teacherEmail || !studentEmail) {
    console.error('Missing required env vars: CLERK_SECRET_KEY, E2E_TEACHER_EMAIL, E2E_STUDENT_EMAIL')
    process.exit(1)
  }

  const teacherFirstName = process.env.E2E_TEACHER_FIRST_NAME ?? 'E2E'
  const teacherLastName = process.env.E2E_TEACHER_LAST_NAME ?? 'Teacher'
  const studentFirstName = process.env.E2E_STUDENT_FIRST_NAME ?? 'E2E'
  const studentLastName = process.env.E2E_STUDENT_LAST_NAME ?? 'Student'

  // ── Resolve Clerk user IDs ─────────────────────────────────────────────────
  console.log(`Looking up Clerk users…`)
  const [teacherClerkId, studentClerkId] = await Promise.all([
    clerkUserIdByEmail(teacherEmail, secretKey),
    clerkUserIdByEmail(studentEmail, secretKey),
  ])
  console.log(`  teacher Clerk ID: ${teacherClerkId}`)
  console.log(`  student Clerk ID: ${studentClerkId}`)

  // ── Teacher: User + Teacher record ─────────────────────────────────────────
  const teacherUser = await prisma.user.upsert({
    where: { clerkId: teacherClerkId },
    update: { email: teacherEmail },
    create: { clerkId: teacherClerkId, email: teacherEmail, role: 'TEACHER' },
  })

  const teacherData = {
    userId: teacherUser.id,
    firstName: teacherFirstName,
    lastName: teacherLastName,
    bio: 'E2E test account — do not contact.',
    qualificationBody: 'QTS',
    qualificationRef: 'QTS-E2ETEST',
    qualificationExpiry: new Date('2099-12-31'),
    credentialVerified: true,
    status: 'ACTIVE',
    sessionRatePence: 5000,
    subjects: ['Maths'],
    levels: ['GCSE'],
    languages: ['English'],
    availableForNew: true,
  }
  const teacher = await prisma.teacher.upsert({
    where: { userId: teacherUser.id },
    update: { firstName: teacherFirstName, lastName: teacherLastName, status: 'ACTIVE' },
    create: teacherData,
  })
  console.log(`  teacher DB ID: ${teacher.id}`)

  // ── Student: User + Student record ─────────────────────────────────────────
  const studentUser = await prisma.user.upsert({
    where: { clerkId: studentClerkId },
    update: { email: studentEmail },
    create: { clerkId: studentClerkId, email: studentEmail, role: 'STUDENT' },
  })

  const existingStudent = await prisma.student.findUnique({ where: { userId: studentUser.id } })
  const student = existingStudent ?? await prisma.student.create({
    data: {
      userId: studentUser.id,
      firstName: studentFirstName,
      lastName: studentLastName,
      consentGiven: true,
      consentDate: new Date(),
    },
  })
  console.log(`  student DB ID: ${student.id}`)

  // ── Match ─────────────────────────────────────────────────────────────────
  const match = await prisma.match.upsert({
    where: { teacherId_studentId: { teacherId: teacher.id, studentId: student.id } },
    update: { active: true },
    create: {
      teacherId: teacher.id,
      studentId: student.id,
      source: 'marketplace',
      active: true,
    },
  })
  console.log(`  match   DB ID: ${match.id}`)

  console.log('\n✓ E2E seed complete.')
  console.log(`\nSet GitHub secret  E2E_TEST_MATCH_ID = ${match.id}`)
  console.log(`(teacher slug may be unset — set E2E_TEACHER_SLUG if you need profile tests)`)
}

main()
  .then(() => prisma.$disconnect())
  .catch(e => { console.error(e); prisma.$disconnect(); process.exit(1) })
