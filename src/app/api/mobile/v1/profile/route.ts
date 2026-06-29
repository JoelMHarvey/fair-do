import { prisma } from '@/lib/prisma'
import { getMobileTeacher } from '@/lib/mobile-auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const teacher = await getMobileTeacher()
  if (!teacher) return new Response('Unauthorized', { status: 401 })

  const t = await prisma.teacher.findUnique({
    where: { id: teacher.id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      professionalTitle: true,
      bio: true,
      tagline: true,
      profileImageUrl: true,
      qualificationBody: true,
      qualificationRef: true,
      qualificationExpiry: true,
      credentialVerified: true,
      stripeOnboarded: true,
      status: true,
      sessionRatePence: true,
      introRatePence: true,
      availableForNew: true,
      subjects: true,
      teachingStyles: true,
      languages: true,
      websiteUrl: true,
      country: true,
      practiceName: true,
      practiceSlug: true,
    },
  })

  if (!t) return new Response('Not found', { status: 404 })

  return Response.json({
    id: t.id,
    firstName: t.firstName,
    lastName: t.lastName,
    professionalTitle: t.professionalTitle,
    bio: t.bio,
    tagline: t.tagline,
    profileImageUrl: t.profileImageUrl,
    qualificationBody: t.qualificationBody,
    qualificationRef: t.qualificationRef,
    qualificationExpiry: t.qualificationExpiry?.toISOString() ?? null,
    credentialVerified: t.credentialVerified,
    stripeOnboarded: t.stripeOnboarded,
    status: t.status,
    sessionRatePence: t.sessionRatePence,
    introRatePence: t.introRatePence,
    availableForNew: t.availableForNew,
    subjects: t.subjects,
    teachingStyles: t.teachingStyles,
    languages: t.languages,
    websiteUrl: t.websiteUrl,
    country: t.country,
    practiceName: t.practiceName,
    practiceSlug: t.practiceSlug,
  })
}
