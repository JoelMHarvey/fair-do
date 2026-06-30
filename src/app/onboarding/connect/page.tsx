import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { DIRECTORY_ENABLED } from '@/lib/practice'
import { redirect } from 'next/navigation'
import { getDictionary, getLocaleFromHeaders } from '@/lib/dictionaries'

export const metadata = {
  title: 'Join your tutor — fair-do',
  robots: { index: false, follow: false },
}

// While the public directory is off, students join through their own tutor's
// invite link or QR code — not by browsing. If the directory is ever switched on,
// this page is redundant, so send people to the normal student flow instead.
export default async function ConnectPage() {
  if (DIRECTORY_ENABLED) redirect('/onboarding/student')

  const { onboarding_connect } = await getDictionary(await getLocaleFromHeaders())

  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-50 to-sand-50 flex flex-col items-center justify-center px-6 py-10">
      <div className="mb-10"><Logo /></div>
      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-semibold text-brand-900 mb-3">{onboarding_connect.heading}</h1>
          <p className="text-sand-600 text-lg">
            {onboarding_connect.lead}
          </p>
        </div>

        <div className="rounded-3xl border border-sand-200 bg-white p-7 shadow-sm">
          <div className="flex items-start gap-4">
            <span className="text-3xl shrink-0">🔗</span>
            <div>
              <p className="font-display font-semibold text-brand-900 text-lg">{onboarding_connect.invite_heading}</p>
              <p className="mt-1 text-sm text-sand-600">
                {onboarding_connect.invite_body}
              </p>
            </div>
          </div>

          <div className="my-6 h-px bg-sand-100" />

          <div className="flex items-start gap-4">
            <span className="text-3xl shrink-0">💬</span>
            <div>
              <p className="font-display font-semibold text-brand-900 text-lg">{onboarding_connect.no_invite_heading}</p>
              <p className="mt-1 text-sm text-sand-600">
                {onboarding_connect.no_invite_body}
              </p>
            </div>
          </div>
        </div>

        <p className="mt-7 text-center text-sm text-sand-500">
          {onboarding_connect.signin_pre}{' '}
          <Link href="/sign-in" className="text-brand-600 hover:text-brand-700 underline">{onboarding_connect.signin_link}</Link>
        </p>
        <p className="mt-3 text-center text-xs text-sand-400">
          {onboarding_connect.tutor_pre}{' '}
          <Link href="/for-tutors" className="text-brand-600 hover:text-brand-700 underline">{onboarding_connect.tutor_link}</Link>
        </p>
      </div>
    </main>
  )
}
