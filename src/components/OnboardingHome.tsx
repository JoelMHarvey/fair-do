'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Logo } from '@/components/Logo'
import type { Messages } from '@/lib/locale-config'

// Read the public flag directly — practice.ts is server-tainted (Clerk auth) and
// can't be imported into a client component.
const DIRECTORY_ENABLED = process.env.NEXT_PUBLIC_DIRECTORY_ENABLED === 'true'

export function OnboardingHome({ t }: { t: Messages['onboarding_home'] }) {
  const router = useRouter()
  const [loading, setLoading] = useState<'student' | 'teacher' | null>(null)
  const [country, setCountry] = useState<'UK' | 'US'>('UK')

  async function selectRole(role: 'STUDENT' | 'TEACHER') {
    setLoading(role === 'STUDENT' ? 'student' : 'teacher')
    const res = await fetch('/api/onboarding/role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, country }),
    })
    if (res.ok) {
      const dest = role === 'STUDENT' ? '/onboarding/student' : '/onboarding/teacher'
      router.push(`${dest}?region=${country}`)
    } else {
      setLoading(null)
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-brand-50 to-sand-50 px-6 py-10">
      <div className="mb-10"><Logo /></div>
      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-semibold text-brand-900 mb-3">{t.heading}</h1>
          <p className="text-sand-600 text-lg">{t.subtitle}</p>
        </div>

        <div className="flex items-center justify-center gap-2 mb-8">
          <span className="text-sm text-sand-500">{t.country_label}</span>
          {(['UK', 'US'] as const).map(c => (
            <button
              key={c}
              onClick={() => setCountry(c)}
              className={`px-4 py-1.5 rounded-full text-sm border transition ${
                country === c ? 'border-brand-500 bg-brand-50 text-brand-700 font-medium' : 'border-sand-200 text-sand-600 hover:border-brand-300'
              }`}
            >
              {c === 'UK' ? t.country_uk : t.country_us}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <button
            onClick={() => (DIRECTORY_ENABLED ? selectRole('STUDENT') : router.push('/onboarding/connect'))}
            disabled={loading !== null}
            className="group relative flex flex-col items-center gap-4 rounded-3xl border border-sand-200 bg-white p-8 transition hover:border-brand-400 hover:shadow-lg hover:-translate-y-0.5 duration-200 disabled:opacity-50 shadow-sm"
          >
            <span className="text-5xl">🪑</span>
            <div>
              <p className="font-display font-semibold text-brand-900 text-center text-lg">
                {DIRECTORY_ENABLED ? t.student_title_need : t.student_title_have}
              </p>
              <p className="mt-1 text-sm text-sand-500 text-center">
                {DIRECTORY_ENABLED ? t.student_subtitle_need : t.student_subtitle_have}
              </p>
            </div>
            {loading === 'student' && (
              <span className="absolute inset-0 flex items-center justify-center rounded-3xl bg-white/80 text-sm text-sand-500">
                {t.setting_up}
              </span>
            )}
          </button>

          <button
            onClick={() => selectRole('TEACHER')}
            disabled={loading !== null}
            className="group relative flex flex-col items-center gap-4 rounded-3xl border border-sand-200 bg-white p-8 transition hover:border-brand-400 hover:shadow-lg hover:-translate-y-0.5 duration-200 disabled:opacity-50 shadow-sm"
          >
            <span className="text-5xl">💬</span>
            <div>
              <p className="font-display font-semibold text-brand-900 text-center text-lg">{t.teacher_title}</p>
              <p className="mt-1 text-sm text-sand-500 text-center">{t.teacher_subtitle}</p>
            </div>
            {loading === 'teacher' && (
              <span className="absolute inset-0 flex items-center justify-center rounded-3xl bg-white/80 text-sm text-sand-500">
                {t.setting_up}
              </span>
            )}
          </button>
        </div>

        <p className="mt-8 text-center text-xs text-sand-400">
          {t.footer_note}
        </p>
      </div>
    </main>
  )
}
