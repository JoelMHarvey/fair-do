import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { TeacherNav } from '@/components/TeacherNav'
import { PageHeader, HelpHint } from '@/components/Guidance'
import ProfileForm from './ProfileForm'
import BrandingCard from './BrandingCard'

const PAID_TIERS = new Set(['practice', 'clinic'])
const ACTIVE_STATUSES = new Set(['active', 'trialing'])

export default async function TeacherProfilePage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { teacher: { include: { subscription: true } } },
  })
  if (!user?.teacher) redirect('/onboarding')

  const t = user.teacher
  const sub = t.subscription
  const isPaid = !!sub && PAID_TIERS.has(sub.tier) && ACTIVE_STATUSES.has(sub.status)

  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-50/50 to-sand-50">
      <TeacherNav />

      <div className="max-w-2xl mx-auto px-5 sm:px-6 py-10">
        <PageHeader
          title="Edit your profile"
          subtitle="This is how students see you — your photo, a short tagline, your rates and your professional links. Fill in what you can now; you can always come back and edit it."
          help={{ href: '/teacher/help', label: 'How your profile works' }}
        />

        <div className="mb-8">
          <HelpHint>
            {"Don't worry about getting it perfect. Most tutors start with a tagline, a short bio and a lesson rate, then add the rest over time."}
          </HelpHint>
        </div>

        <ProfileForm
          initial={{
            tagline: t.tagline ?? '',
            bio: t.bio,
            sessionRatePence: t.sessionRatePence,
            introRatePence: t.introRatePence,
            groupRatePence: t.groupRatePence,
            groupMaxSize: t.groupMaxSize,
            availableForNew: t.availableForNew,
            languages: t.languages,
            websiteUrl: t.websiteUrl ?? '',
            linkedinUrl: t.linkedinUrl ?? '',
            introVideoUrl: t.introVideoUrl ?? '',
            profileImageUrl: t.profileImageUrl ?? '',
            photoBaseUrl: t.photoBaseUrl ?? '',
            photoStyle: t.photoStyle ?? 'original',
          }}
        />

        <div className="mt-5">
          <BrandingCard
            isPaid={isPaid}
            initial={{
              practiceName: t.practiceName ?? `${t.firstName} ${t.lastName}`,
              brandEnabled: t.brandEnabled,
              brandLogoUrl: t.brandLogoUrl ?? '',
              brandColor: t.brandColor ?? '',
              brandFooterLine: t.brandFooterLine ?? '',
              replyToEmail: t.replyToEmail ?? '',
            }}
          />
        </div>
      </div>
    </main>
  )
}
