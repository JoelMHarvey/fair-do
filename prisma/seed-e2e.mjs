/**
 * Seed E2E test accounts in the staging database.
 *
 * Idempotent — safe to re-run. Creates:
 *   • User + Therapist record for E2E_THERAPIST_EMAIL
 *   • User + Client record  for E2E_CLIENT_EMAIL
 *   • Match between them
 *
 * Prints the Match ID on success so you can store it as E2E_TEST_MATCH_ID.
 *
 * Required env vars:
 *   DATABASE_URL        — staging Postgres URL
 *   CLERK_SECRET_KEY    — to resolve email → Clerk user ID
 *   E2E_THERAPIST_EMAIL
 *   E2E_CLIENT_EMAIL
 *
 * Optional:
 *   E2E_THERAPIST_FIRST_NAME  (default: "E2E")
 *   E2E_THERAPIST_LAST_NAME   (default: "Therapist")
 *   E2E_CLIENT_FIRST_NAME     (default: "E2E")
 *   E2E_CLIENT_LAST_NAME      (default: "Client")
 *
 * Run:
 *   DATABASE_URL=<staging> CLERK_SECRET_KEY=<sk_...> \
 *   E2E_THERAPIST_EMAIL=... E2E_CLIENT_EMAIL=... \
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
  const therapistEmail = process.env.E2E_THERAPIST_EMAIL
  const clientEmail = process.env.E2E_CLIENT_EMAIL

  if (!secretKey || !therapistEmail || !clientEmail) {
    console.error('Missing required env vars: CLERK_SECRET_KEY, E2E_THERAPIST_EMAIL, E2E_CLIENT_EMAIL')
    process.exit(1)
  }

  const therapistFirstName = process.env.E2E_THERAPIST_FIRST_NAME ?? 'E2E'
  const therapistLastName = process.env.E2E_THERAPIST_LAST_NAME ?? 'Therapist'
  const clientFirstName = process.env.E2E_CLIENT_FIRST_NAME ?? 'E2E'
  const clientLastName = process.env.E2E_CLIENT_LAST_NAME ?? 'Client'

  // ── Resolve Clerk user IDs ─────────────────────────────────────────────────
  console.log(`Looking up Clerk users…`)
  const [therapistClerkId, clientClerkId] = await Promise.all([
    clerkUserIdByEmail(therapistEmail, secretKey),
    clerkUserIdByEmail(clientEmail, secretKey),
  ])
  console.log(`  therapist Clerk ID: ${therapistClerkId}`)
  console.log(`  client    Clerk ID: ${clientClerkId}`)

  // ── Therapist: User + Therapist record ────────────────────────────────────
  const therapistUser = await prisma.user.upsert({
    where: { clerkId: therapistClerkId },
    update: { email: therapistEmail },
    create: { clerkId: therapistClerkId, email: therapistEmail, role: 'THERAPIST' },
  })

  const therapistData = {
    userId: therapistUser.id,
    firstName: therapistFirstName,
    lastName: therapistLastName,
    bio: 'E2E test account — do not contact.',
    registrationBody: 'BACP',
    registrationNumber: 'BACP-E2ETEST',
    registrationExpiry: new Date('2099-12-31'),
    credentialVerified: true,
    status: 'ACTIVE',
    sessionRatePence: 5000,
    specialisms: ['Anxiety'],
    approachTags: ['CBT'],
    languages: ['English'],
    availableForNew: true,
  }
  const therapist = await prisma.therapist.upsert({
    where: { userId: therapistUser.id },
    update: { firstName: therapistFirstName, lastName: therapistLastName, status: 'ACTIVE' },
    create: therapistData,
  })
  console.log(`  therapist DB ID: ${therapist.id}`)

  // ── Client: User + Client record ──────────────────────────────────────────
  const clientUser = await prisma.user.upsert({
    where: { clerkId: clientClerkId },
    update: { email: clientEmail },
    create: { clerkId: clientClerkId, email: clientEmail, role: 'CLIENT' },
  })

  const existingClient = await prisma.client.findUnique({ where: { userId: clientUser.id } })
  const client = existingClient ?? await prisma.client.create({
    data: {
      userId: clientUser.id,
      firstName: clientFirstName,
      lastName: clientLastName,
      consentGiven: true,
      consentDate: new Date(),
      consentVersion: '1.0',
    },
  })
  console.log(`  client    DB ID: ${client.id}`)

  // ── Match ─────────────────────────────────────────────────────────────────
  const match = await prisma.match.upsert({
    where: { therapistId_clientId: { therapistId: therapist.id, clientId: client.id } },
    update: { active: true },
    create: {
      therapistId: therapist.id,
      clientId: client.id,
      source: 'marketplace',
      active: true,
    },
  })
  console.log(`  match     DB ID: ${match.id}`)

  console.log('\n✓ E2E seed complete.')
  console.log(`\nSet GitHub secret  E2E_TEST_MATCH_ID = ${match.id}`)
  console.log(`(therapist slug may be unset — set E2E_THERAPIST_SLUG if you need profile tests)`)
}

main()
  .then(() => prisma.$disconnect())
  .catch(e => { console.error(e); prisma.$disconnect(); process.exit(1) })
