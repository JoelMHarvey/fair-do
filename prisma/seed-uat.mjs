// Seed a UAT / demo environment with rich, realistic therapists, ratings and availability
// so the public directory, profiles and match flow look populated.
//
//   node prisma/seed-uat.mjs
//
// Idempotent: re-running refreshes the demo data in place. Demo rows use clerkId
// prefixes `demo_therapist_` / `demo_client_` and Stripe ids `acct_demo_*`, so:
//   - production hides them unless ALLOW_DEMO_DATA=true (set that ONLY in UAT), and
//   - `node prisma/remove-demo-therapists.mjs` cleans them up.
//
// Browse-only demo: these therapists are NOT real Stripe Connect accounts, so leave
// BOOKINGS_ENABLED unset in UAT (browsing/profiles/matches look real; checkout stays closed).
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const THERAPISTS = [
  {
    firstName: 'Priya', lastName: 'Nair', registrationBody: 'BACP', registrationNumber: 'BACP-380114',
    tagline: 'Warm, practical CBT for anxiety and burnout',
    bio: 'I help people untangle anxiety, overthinking and work burnout using practical CBT. My style is warm and collaborative — we go at your pace and build tools you can actually use between sessions.',
    sessionRatePence: 5000, introRatePence: 3500, specialisms: ['Anxiety', 'Work stress', 'Depression'],
    approachTags: ['CBT', 'Mindfulness'], days: [1, 2, 4], img: 5, languages: ['English', 'Hindi'], founding: true,
  },
  {
    firstName: 'Marcus', lastName: 'Bell', registrationBody: 'UKCP', registrationNumber: 'UKCP-2011457',
    tagline: 'Trauma-informed therapy in a steady, unhurried space',
    bio: 'Twelve years working with trauma and PTSD. I offer a steady, unhurried space to process difficult experiences, drawing on EMDR and psychodynamic approaches. You set the direction; I help you feel safe enough to get there.',
    sessionRatePence: 6000, introRatePence: 4500, specialisms: ['Trauma / PTSD', 'Grief & loss', 'Identity / LGBTQ+'],
    approachTags: ['EMDR', 'Psychodynamic'], days: [2, 3, 5], img: 12, languages: ['English'], founding: false,
  },
  {
    firstName: 'Sofia', lastName: 'Almeida', registrationBody: 'BACP', registrationNumber: 'BACP-401290',
    tagline: 'Relationships, couples and life transitions',
    bio: 'I work with individuals and couples navigating relationship difficulties, separation and big life transitions. Person-centred at heart — I believe you already hold much of what you need, and my job is to help you hear it.',
    sessionRatePence: 5500, introRatePence: null, groupRatePence: 3500, groupMaxSize: 4,
    specialisms: ['Relationships', 'Life transitions', 'Identity / LGBTQ+'],
    approachTags: ['Person-centred', 'Psychodynamic'], days: [1, 3, 4, 5], img: 32, languages: ['English', 'Portuguese'], founding: false,
  },
  {
    firstName: 'Tom', lastName: 'Whitfield', registrationBody: 'BPS', registrationNumber: 'BPS-556102',
    tagline: 'Depression and low mood — getting momentum back',
    bio: 'Chartered psychologist focused on depression and low mood. Together we look at the patterns keeping you stuck and rebuild momentum, one small step at a time. Evidence-based, but never clinical or cold.',
    sessionRatePence: 5000, introRatePence: 4000, specialisms: ['Depression', 'Anxiety', 'Work stress'],
    approachTags: ['CBT', 'Mindfulness'], days: [1, 2, 3], img: 13, languages: ['English'], founding: false,
  },
  {
    firstName: 'Amara', lastName: 'Okonkwo', registrationBody: 'BACP', registrationNumber: 'BACP-372845',
    tagline: 'Grief, bereavement and finding a way through',
    bio: 'Grief changes shape but never fully leaves — and you don\'t have to carry it alone. I support people through bereavement and loss with compassion and zero pressure to "move on" before you\'re ready.',
    sessionRatePence: 4500, introRatePence: 3000, specialisms: ['Grief & loss', 'Bereavement', 'Depression'],
    approachTags: ['Person-centred', 'Psychodynamic'], days: [2, 4, 6], img: 16, languages: ['English', 'French'], founding: false,
  },
  {
    firstName: 'Daniel', lastName: 'Reyes', registrationBody: 'NCS', registrationNumber: 'NCS-19A8842',
    tagline: 'Identity, self-esteem and LGBTQ+ affirmative therapy',
    bio: 'LGBTQ+ affirmative therapist working with identity, self-esteem and the weight of not feeling enough. A judgement-free space to figure out who you are and what you want — on your own terms.',
    sessionRatePence: 5000, introRatePence: 3500, specialisms: ['Identity / LGBTQ+', 'Anxiety', 'Relationships'],
    approachTags: ['Person-centred', 'CBT'], days: [3, 4, 5, 6], img: 60, languages: ['English', 'Spanish'], founding: true,
  },
]

const CLIENTS = [
  { firstName: 'Alex', lastName: 'Rivers', questionnaire: { reasons: ['Anxiety', 'Work stress'], approach: ['CBT'] } },
  { firstName: 'Jordan', lastName: 'Patel', questionnaire: { reasons: ['Trauma / PTSD'], approach: ['EMDR'] } },
  { firstName: 'Sam', lastName: 'Cole', questionnaire: { reasons: ['Relationships', 'Life transitions'], approach: ['Person-centred'] } },
  { firstName: 'Robin', lastName: 'Shaw', questionnaire: { reasons: ['Grief & loss'], approach: ['Person-centred'] } },
]

// { therapist index, client index, rating, comment, daysAgo }
const REVIEWS = [
  { t: 0, c: 0, rating: 5, daysAgo: 12, comment: 'Priya gave me practical tools I actually use. I finally feel less at the mercy of my anxiety.' },
  { t: 0, c: 3, rating: 5, daysAgo: 30, comment: 'Warm, sharp and genuinely helpful from the first session.' },
  { t: 1, c: 1, rating: 5, daysAgo: 9, comment: 'Marcus made a really hard thing feel safe to talk about. Never rushed.' },
  { t: 1, c: 3, rating: 4, daysAgo: 40, comment: 'Steady and thoughtful. Helped me make sense of a lot.' },
  { t: 2, c: 2, rating: 5, daysAgo: 7, comment: 'We saw Sofia as a couple and it changed how we talk to each other.' },
  { t: 3, c: 0, rating: 4, daysAgo: 21, comment: 'Practical and kind. I have momentum again.' },
  { t: 4, c: 3, rating: 5, daysAgo: 15, comment: 'Amara held space for my grief without any pressure. I\'m grateful.' },
  { t: 5, c: 2, rating: 5, daysAgo: 18, comment: 'The first therapist I\'ve felt truly understood by. Affirming and warm.' },
]

const daysAgoDate = (n) => { const d = new Date(); d.setDate(d.getDate() - n); d.setHours(14, 0, 0, 0); return d }

async function main() {
  // --- Therapists (upsert + enrich, refresh availability) ---
  const teacherIds = []
  for (const [i, t] of THERAPISTS.entries()) {
    const clerkId = `demo_therapist_${i + 1}`
    const email = `${t.firstName.toLowerCase()}.${t.lastName.toLowerCase()}@demo.faresay.com`
    const user = await prisma.user.upsert({
      where: { clerkId }, update: {}, create: { clerkId, email, role: 'THERAPIST' },
    })

    const data = {
      userId: user.id, firstName: t.firstName, lastName: t.lastName, bio: t.bio, tagline: t.tagline,
      registrationBody: t.registrationBody, registrationNumber: t.registrationNumber,
      registrationExpiry: new Date('2027-12-31'), credentialVerified: true, status: 'ACTIVE',
      stripeAccountId: `acct_demo_${i + 1}`, stripeOnboarded: true,
      sessionRatePence: t.sessionRatePence, introRatePence: t.introRatePence ?? null,
      groupRatePence: t.groupRatePence ?? null, groupMaxSize: t.groupMaxSize ?? 1,
      availableForNew: true, specialisms: t.specialisms, approachTags: t.approachTags,
      languages: t.languages, profileImageUrl: `https://i.pravatar.cc/400?img=${t.img}`,
      isFoundingMember: t.founding,
    }
    const therapist = await prisma.therapist.upsert({
      where: { userId: user.id }, update: data, create: data,
    })
    teacherIds.push(therapist.id)

    await prisma.availability.deleteMany({ where: { teacherId: therapist.id } })
    await prisma.availability.createMany({
      data: t.days.map(d => ({ teacherId: therapist.id, dayOfWeek: d, startTime: '09:00', endTime: '17:00' })),
    })
    console.log(`therapist ✓ ${t.firstName} ${t.lastName}`)
  }

  // --- Clients ---
  const clientIds = []
  for (const [i, c] of CLIENTS.entries()) {
    const clerkId = `demo_client_${i + 1}`
    const email = `${c.firstName.toLowerCase()}.${c.lastName.toLowerCase()}@demo.faresay.com`
    const user = await prisma.user.upsert({
      where: { clerkId }, update: {}, create: { clerkId, email, role: 'CLIENT' },
    })
    const existing = await prisma.client.findUnique({ where: { userId: user.id } })
    const client = existing ?? await prisma.client.create({
      data: {
        userId: user.id, firstName: c.firstName, lastName: c.lastName,
        questionnaire: c.questionnaire, consentGiven: true, consentDate: new Date(), consentVersion: '1.0',
      },
    })
    clientIds.push(client.id)
    console.log(`client ✓ ${c.firstName} ${c.lastName}`)
  }

  // --- Matches + completed sessions + reviews (populate ratings) ---
  let made = 0
  for (const r of REVIEWS) {
    const teacherId = teacherIds[r.t]
    const clientId = clientIds[r.c]
    const existingReview = await prisma.review.findFirst({ where: { teacherId, clientId } })
    if (existingReview) continue

    const match = await prisma.match.upsert({
      where: { teacherId_clientId: { teacherId, clientId } },
      update: {}, create: { teacherId, clientId },
    })
    const session = await prisma.session.create({
      data: {
        matchId: match.id, teacherId, clientId,
        scheduledAt: daysAgoDate(r.daysAgo), status: 'COMPLETED',
        callStartedAt: daysAgoDate(r.daysAgo), callEndedAt: daysAgoDate(r.daysAgo), joinCount: 2,
      },
    })
    await prisma.review.create({
      data: { sessionId: session.id, clientId, teacherId, rating: r.rating, comment: r.comment, createdAt: daysAgoDate(r.daysAgo) },
    })
    made++
  }
  console.log(`reviews ✓ ${made} new`)

  // --- Sample organisation (for the /org reporting demo) ---
  await prisma.organisation.upsert({
    where: { id: 'demo_org_acme' },
    update: {},
    create: {
      id: 'demo_org_acme', name: 'Acme Co (demo)', contactEmail: 'people@demo.faresay.com',
      contactName: 'Demo HR', seatsTotal: 25, creditPoolPence: 250000, domain: null, discountPercent: 0,
    },
  })
  console.log('org ✓ Acme Co (demo)')

  console.log('\nUAT seed complete. Set ALLOW_DEMO_DATA=true in the UAT env so these surface.')
}

main().then(() => prisma.$disconnect()).catch(e => { console.error(e); prisma.$disconnect(); process.exit(1) })
