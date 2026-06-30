import 'server-only'
import { prisma } from './prisma'

// GDPR data portability (Art. 20): assemble the user's own personal data as a
// JSON bundle. Excludes system rows, other users' PII, and security-sensitive
// tokens / Stripe ids (those are not portability data).

export async function exportUserByClerkId(clerkId: string) {
  const user = await prisma.user.findUnique({
    where: { clerkId },
    include: { teacher: true, student: true },
  })
  if (!user) return null

  const bundle: Record<string, unknown> = {
    exportedAt: null, // stamped by the caller (Date is unavailable in some contexts)
    account: {
      email: user.email,
      role: user.role,
      country: user.country,
      locale: user.locale,
      createdAt: user.createdAt,
    },
  }

  // Complaints the user filed + support mail they sent (their own correspondence).
  bundle.complaintsFiled = await prisma.complaint.findMany({
    where: { reporterClerkId: clerkId },
    select: { category: true, body: true, status: true, createdAt: true },
  })

  if (user.student) {
    const s = user.student.id
    const t = user.student
    bundle.student = {
      firstName: t.firstName, lastName: t.lastName, contactEmail: t.contactEmail, phone: t.phone,
      dateOfBirth: t.dateOfBirth, country: t.country, usState: t.usState, questionnaire: t.questionnaire,
      consentGiven: t.consentGiven, consentDate: t.consentDate, creditBalancePence: t.creditBalancePence,
      referralCode: t.referralCode, createdAt: t.createdAt,
    }
    bundle.sessions = await prisma.session.findMany({
      where: { studentId: s },
      select: { scheduledAt: true, durationMins: true, status: true, isGroup: true, createdAt: true },
      orderBy: { scheduledAt: 'desc' },
    })
    bundle.lessonNotes = await prisma.lessonNote.findMany({
      where: { studentId: s, status: 'shared' },
      select: { topicsCovered: true, difficulty: true, homework: true, sharedAt: true },
    })
    bundle.payments = await prisma.payment.findMany({
      where: { studentId: s },
      select: { amountTotalPence: true, currency: true, status: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    })
    bundle.reviews = await prisma.review.findMany({ where: { studentId: s }, select: { rating: true, comment: true, createdAt: true } })
    bundle.packages = await prisma.package.findMany({ where: { studentId: s }, select: { name: true, sessionsTotal: true, sessionsUsed: true, pricePence: true, status: true } })
    bundle.notesAboutMe = await prisma.match.findMany({ where: { studentId: s }, select: { notes: true } })
  }

  if (user.teacher) {
    const t = user.teacher
    bundle.teacher = {
      firstName: t.firstName, lastName: t.lastName, phone: t.phone, professionalTitle: t.professionalTitle,
      bio: t.bio, tagline: t.tagline, subjects: t.subjects, levels: t.levels, teachingStyles: t.teachingStyles,
      ageGroups: t.ageGroups, qualificationBody: t.qualificationBody, languages: t.languages,
      websiteUrl: t.websiteUrl, linkedinUrl: t.linkedinUrl, sessionRatePence: t.sessionRatePence,
      referralCode: t.referralCode, createdAt: t.createdAt,
    }
    bundle.reviewsReceived = await prisma.review.findMany({ where: { teacherId: t.id }, select: { rating: true, comment: true, createdAt: true } })
    bundle.subscription = await prisma.subscription.findUnique({
      where: { teacherId: t.id },
      select: { tier: true, status: true, currentPeriodEnd: true, createdAt: true },
    })
  }

  // Parent (role=PARENT, no teacher/student): their links + portal subscription + messages.
  const parentLinks = await prisma.parentLink.findMany({
    where: { parentUserId: user.id },
    select: { studentId: true, status: true, inviteEmail: true, acceptedAt: true, createdAt: true },
  })
  if (parentLinks.length > 0) {
    bundle.parentLinks = parentLinks
    bundle.parentSubscription = await prisma.parentSubscription.findUnique({
      where: { parentUserId: user.id },
      select: { status: true, currentPeriodEnd: true, createdAt: true },
    })
  }

  return bundle
}
