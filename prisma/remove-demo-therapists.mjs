// Remove the demo therapists seeded by seed-therapists.mjs.
// Run before real clients arrive: node prisma/remove-demo-therapists.mjs
// Safe: refuses to delete any demo therapist that has real sessions/payments.
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const demos = await prisma.user.findMany({
    where: { clerkId: { startsWith: 'demo_therapist_' } },
    include: { therapist: { include: { sessions: true } } },
  })

  if (demos.length === 0) {
    console.log('No demo therapists found. Nothing to do.')
    return
  }

  console.log(`Found ${demos.length} demo therapist(s).`)
  let removed = 0
  for (const u of demos) {
    const t = u.therapist
    if (!t) {
      await prisma.user.delete({ where: { id: u.id } })
      continue
    }
    if (t.sessions.length > 0) {
      console.log(`  SKIP ${t.firstName} ${t.lastName} — has ${t.sessions.length} real session(s).`)
      continue
    }
    // Remove dependents first (availability, credential checks, matches with no sessions)
    await prisma.availability.deleteMany({ where: { therapistId: t.id } })
    await prisma.credentialCheck.deleteMany({ where: { therapistId: t.id } })
    await prisma.complaint.deleteMany({ where: { therapistId: t.id } })
    await prisma.match.deleteMany({ where: { therapistId: t.id } })
    await prisma.therapist.delete({ where: { id: t.id } })
    await prisma.user.delete({ where: { id: u.id } })
    console.log(`  removed ${t.firstName} ${t.lastName}`)
    removed++
  }
  console.log(`\nDone. Removed ${removed} demo therapist(s).`)
}

main().then(() => prisma.$disconnect()).catch(e => { console.error(e); prisma.$disconnect(); process.exit(1) })
