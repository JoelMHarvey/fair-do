import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { getDictionary, getLocaleFromHeaders } from '@/lib/dictionaries'

export default async function TeacherComplete() {
  const { onboarding_complete } = await getDictionary(await getLocaleFromHeaders())
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { teacher: true },
  })

  if (!user?.teacher) redirect('/onboarding/teacher')

  // Mark Stripe onboarded if returning from Stripe Connect
  if (user.teacher.stripeAccountId && !user.teacher.stripeOnboarded) {
    await prisma.teacher.update({
      where: { id: user.teacher.id },
      data: { stripeOnboarded: true },
    })
  }

  return (
    <main className="min-h-screen bg-sand-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold text-brand-900 mb-3">{onboarding_complete.heading}</h1>
        <p className="text-sand-500 mb-8">
          {onboarding_complete.review_pre}{user.teacher.qualificationBody}{onboarding_complete.review_post}
        </p>
        <Link
          href="/teacher/dashboard"
          className="inline-block bg-brand-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-brand-700 transition"
        >
          {onboarding_complete.cta}
        </Link>
      </div>
    </main>
  )
}
