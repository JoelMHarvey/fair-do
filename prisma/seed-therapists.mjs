// Seed demo therapists so the directory + matching can be exercised in beta.
// Run: node prisma/seed-therapists.mjs
// NOTE: demo data — DELETE before real public launch (see cleanup query at bottom).
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const THERAPISTS = [
  {
    firstName: 'Priya', lastName: 'Nair', registrationBody: 'BACP', registrationNumber: 'BACP-380114',
    tagline: 'Warm, practical CBT for anxiety and burnout',
    bio: 'I help people untangle anxiety, overthinking and work burnout using practical CBT. My style is warm and collaborative — we go at your pace and build tools you can actually use between sessions.',
    sessionRatePence: 5000, introRatePence: 3500, specialisms: ['Anxiety', 'Work stress', 'Depression'],
    approachTags: ['CBT', 'Mindfulness'], days: [1, 2, 4],
  },
  {
    firstName: 'Marcus', lastName: 'Bell', registrationBody: 'UKCP', registrationNumber: 'UKCP-2011457',
    tagline: 'Trauma-informed therapy in a steady, unhurried space',
    bio: 'Twelve years working with trauma and PTSD. I offer a steady, unhurried space to process difficult experiences, drawing on EMDR and psychodynamic approaches. You set the direction; I help you feel safe enough to get there.',
    sessionRatePence: 6000, introRatePence: 4500, specialisms: ['Trauma / PTSD', 'Grief & loss', 'Identity / LGBTQ+'],
    approachTags: ['EMDR', 'Psychodynamic'], days: [2, 3, 5],
  },
  {
    firstName: 'Sofia', lastName: 'Almeida', registrationBody: 'BACP', registrationNumber: 'BACP-401290',
    tagline: 'Relationships, couples and life transitions',
    bio: 'I work with individuals and couples navigating relationship difficulties, separation and big life transitions. Person-centred at heart — I believe you already hold much of what you need, and my job is to help you hear it.',
    sessionRatePence: 5500, introRatePence: null, groupRatePence: 3500, groupMaxSize: 4,
    specialisms: ['Relationships', 'Life transitions', 'Identity / LGBTQ+'],
    approachTags: ['Person-centred', 'Psychodynamic'], days: [1, 3, 4, 5],
  },
  {
    firstName: 'Tom', lastName: 'Whitfield', registrationBody: 'BPS', registrationNumber: 'BPS-556102',
    tagline: 'Depression and low mood — getting momentum back',
    bio: 'Chartered psychologist focused on depression and low mood. Together we look at the patterns keeping you stuck and rebuild momentum, one small step at a time. Evidence-based, but never clinical or cold.',
    sessionRatePence: 5000, introRatePence: 4000, specialisms: ['Depression', 'Anxiety', 'Work stress'],
    approachTags: ['CBT', 'Mindfulness'], days: [1, 2, 3],
  },
  {
    firstName: 'Amara', lastName: 'Okonkwo', registrationBody: 'BACP', registrationNumber: 'BACP-372845',
    tagline: 'Grief, bereavement and finding a way through',
    bio: 'Grief changes shape but never fully leaves — and you don\'t have to carry it alone. I support people through bereavement and loss with compassion and zero pressure to "move on" before you\'re ready.',
    sessionRatePence: 4500, introRatePence: 3000, specialisms: ['Grief & loss', 'Bereavement', 'Depression'],
    approachTags: ['Person-centred', 'Psychodynamic'], days: [2, 4, 6],
  },
  {
    firstName: 'Daniel', lastName: 'Reyes', registrationBody: 'NCS', registrationNumber: 'NCS-19A8842',
    tagline: 'Identity, self-esteem and LGBTQ+ affirmative therapy',
    bio: 'LGBTQ+ affirmative therapist working with identity, self-esteem and the weight of not feeling enough. A judgement-free space to figure out who you are and what you want — on your own terms.',
    sessionRatePence: 5000, introRatePence: 3500, specialisms: ['Identity / LGBTQ+', 'Anxiety', 'Relationships'],
    approachTags: ['Person-centred', 'CBT'], days: [3, 4, 5, 6],
  },
]

async function main() {
  for (const [i, t] of THERAPISTS.entries()) {
    const clerkId = `demo_therapist_${i + 1}`
    const email = `${t.firstName.toLowerCase()}.${t.lastName.toLowerCase()}@demo.faresay.com`

    const user = await prisma.user.upsert({
      where: { clerkId },
      update: {},
      create: { clerkId, email, role: 'THERAPIST' },
    })

    const existing = await prisma.therapist.findUnique({ where: { userId: user.id } })
    if (existing) { console.log(`skip ${t.firstName} (exists)`); continue }

    const therapist = await prisma.therapist.create({
      data: {
        userId: user.id,
        firstName: t.firstName,
        lastName: t.lastName,
        bio: t.bio,
        tagline: t.tagline,
        registrationBody: t.registrationBody,
        registrationNumber: t.registrationNumber,
        registrationExpiry: new Date('2027-12-31'),
        credentialVerified: true,
        status: 'ACTIVE',
        stripeAccountId: `acct_demo_${i + 1}`,
        stripeOnboarded: true,
        sessionRatePence: t.sessionRatePence,
        introRatePence: t.introRatePence ?? null,
        groupRatePence: t.groupRatePence ?? null,
        groupMaxSize: t.groupMaxSize ?? 1,
        availableForNew: true,
        specialisms: t.specialisms,
        approachTags: t.approachTags,
      },
    })

    await prisma.availability.createMany({
      data: t.days.map(d => ({ therapistId: therapist.id, dayOfWeek: d, startTime: '09:00', endTime: '17:00' })),
    })
    console.log(`created ${t.firstName} ${t.lastName}`)
  }
  console.log('\nDone. To remove demo data later:')
  console.log("  DELETE therapists/users WHERE clerkId LIKE 'demo_therapist_%'")
}

main().then(() => prisma.$disconnect()).catch(e => { console.error(e); prisma.$disconnect(); process.exit(1) })
