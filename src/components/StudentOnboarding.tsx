'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { activeUsStates } from '@/lib/locale'
import { SUBJECTS, LEVELS, GOALS, FREQUENCY } from '@/lib/taxonomy'
import type { Messages } from '@/lib/locale-config'

// Read the public flag directly — practice.ts is server-tainted (Clerk auth) and
// can't be imported into a client component.
const DIRECTORY_ENABLED = process.env.NEXT_PUBLIC_DIRECTORY_ENABLED === 'true'

type Form = {
  firstName: string
  lastName: string
  subjects: string[]
  levels: string[]
  goals: string[]
  frequency: string
  referralCode: string
  consentGiven: boolean
}

export function StudentOnboarding({ t }: { t: Messages['onboarding_student'] }) {
  return <Suspense><StudentOnboardingInner t={t} /></Suspense>
}

function StudentOnboardingInner({ t }: { t: Messages['onboarding_student'] }) {
  const router = useRouter()
  const isUS = useSearchParams().get('region') === 'US'
  const [usState, setUsState] = useState('')
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState<Form>({
    firstName: '',
    lastName: '',
    subjects: [],
    levels: [],
    goals: [],
    frequency: '',
    referralCode: '',
    consentGiven: false,
  })

  // Directory matching is off pre-launch — students join via their tutor's invite.
  useEffect(() => {
    if (!DIRECTORY_ENABLED) router.replace('/onboarding/connect')
  }, [router])
  if (!DIRECTORY_ENABLED) return null

  function update<K extends keyof Form>(field: K, value: Form[K]) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function toggle(field: 'subjects' | 'levels' | 'goals', value: string) {
    setForm(prev => ({
      ...prev,
      [field]: prev[field].includes(value) ? prev[field].filter(v => v !== value) : [...prev[field], value],
    }))
  }

  async function submit() {
    setSubmitting(true)
    setError('')
    const res = await fetch('/api/onboarding/student', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        questionnaire: {
          subjects: form.subjects,
          levels: form.levels,
          goals: form.goals,
          frequency: form.frequency || undefined,
          availability: [],
        },
        referralCode: form.referralCode.trim() || undefined,
        usState: isUS ? usState : undefined,
        consentGiven: form.consentGiven,
      }),
    })
    if (res.ok) {
      router.push('/tutors')
    } else {
      setError(t.error_generic)
      setSubmitting(false)
    }
  }

  const input =
    'w-full border border-sand-300 rounded-xl px-4 py-3 text-sand-900 text-base bg-white focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition'
  const chip = (active: boolean) =>
    `text-left text-sm px-4 py-3 rounded-xl border transition ${
      active
        ? 'border-brand-500 bg-brand-50 text-brand-800 ring-1 ring-brand-200'
        : 'border-sand-200 bg-white text-sand-700 hover:border-brand-300'
    }`
  const smallChip = (active: boolean) =>
    `text-sm px-3.5 py-2 rounded-full border transition ${
      active ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-sand-200 bg-white text-sand-700 hover:border-brand-300'
    }`

  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-50 to-sand-50 flex flex-col items-center px-4 py-10">
      <div className="mb-8"><Logo /></div>
      <div className="max-w-lg w-full">
        {/* progress */}
        <div className="flex gap-2 mb-8">
          {[1, 2].map(s => (
            <div key={s} className={`h-1.5 flex-1 rounded-full transition ${s <= step ? 'bg-brand-500' : 'bg-sand-200'}`} />
          ))}
        </div>

        {step === 1 && (
          <div className="animate-fade-up">
            <h1 className="font-display text-3xl font-semibold text-brand-900 mb-2">
              {t.step1_heading}
            </h1>
            <p className="text-sand-600 mb-2">{t.step1_subtitle}</p>
            <p className="text-sm text-sand-500 mb-7">
              {t.about_prompt}{' '}
              <Link href="/about" target="_blank" className="text-brand-600 hover:text-brand-700 underline">{t.about_link}</Link>.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div>
                <label className="block text-sm font-medium text-sand-700 mb-1.5">{t.first_name_label}</label>
                <input className={input} value={form.firstName} onChange={e => update('firstName', e.target.value)} placeholder={t.first_name_placeholder} />
              </div>
              <div>
                <label className="block text-sm font-medium text-sand-700 mb-1.5">{t.last_name_label}</label>
                <input className={input} value={form.lastName} onChange={e => update('lastName', e.target.value)} placeholder={t.last_name_placeholder} />
              </div>
            </div>

            {isUS && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-sand-700 mb-1.5">{t.state_label}</label>
                <select className={input} value={usState} onChange={e => setUsState(e.target.value)}>
                  <option value="">{t.state_placeholder}</option>
                  {activeUsStates().map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
                </select>
              </div>
            )}

            <label className="block text-sm font-medium text-sand-700 mb-2">
              {t.subjects_label} <span className="text-sand-400 font-normal">{t.subjects_hint}</span>
            </label>
            <div className="grid grid-cols-2 gap-2 mb-6">
              {SUBJECTS.map(s => (
                <button key={s} onClick={() => toggle('subjects', s)} className={chip(form.subjects.includes(s))}>
                  {s}
                </button>
              ))}
            </div>

            <label className="block text-sm font-medium text-sand-700 mb-2">
              {t.levels_label} <span className="text-sand-400 font-normal">{t.levels_hint}</span>
            </label>
            <div className="flex flex-wrap gap-2 mb-6">
              {LEVELS.map(l => (
                <button key={l} onClick={() => toggle('levels', l)} className={smallChip(form.levels.includes(l))}>
                  {l}
                </button>
              ))}
            </div>

            <label className="block text-sm font-medium text-sand-700 mb-2">
              {t.goals_label} <span className="text-sand-400 font-normal">{t.goals_hint}</span>
            </label>
            <div className="flex flex-wrap gap-2 mb-6">
              {GOALS.map(g => (
                <button key={g} onClick={() => toggle('goals', g)} className={smallChip(form.goals.includes(g))}>
                  {g}
                </button>
              ))}
            </div>

            <label className="block text-sm font-medium text-sand-700 mb-2">
              {t.frequency_label} <span className="text-sand-400 font-normal">{t.frequency_hint}</span>
            </label>
            <div className="flex flex-wrap gap-2 mb-7">
              {FREQUENCY.map(f => (
                <button
                  key={f}
                  onClick={() => update('frequency', form.frequency === f ? '' : f)}
                  className={smallChip(form.frequency === f)}
                >
                  {f}
                </button>
              ))}
            </div>

            <label className="block text-sm font-medium text-sand-700 mb-2">
              {t.referral_label} <span className="text-sand-400 font-normal">{t.referral_hint}</span>
            </label>
            <input
              className={`${input} mb-7 uppercase`}
              value={form.referralCode}
              onChange={e => update('referralCode', e.target.value)}
              placeholder={t.referral_placeholder}
            />

            <button
              className="w-full bg-brand-600 text-white py-3.5 rounded-full font-medium hover:bg-brand-700 transition disabled:opacity-40 shadow-lg shadow-brand-600/20"
              disabled={!form.firstName.trim() || !form.lastName.trim() || form.subjects.length === 0 || (isUS && !usState)}
              onClick={() => setStep(2)}
            >
              {t.continue_button}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-up">
            <h1 className="font-display text-3xl font-semibold text-brand-900 mb-2">
              {t.step2_heading}
            </h1>
            <p className="text-sand-600 mb-6">{t.step2_subtitle}</p>

            {/* Data consent (Art.6 — ordinary personal data) */}
            <div className="bg-white border border-sand-200 rounded-2xl p-5 mb-4 text-sm text-sand-600 space-y-2">
              <p className="font-medium text-sand-800">{t.consent_heading}</p>
              <p>{t.consent_body}{' '}<a href="/privacy" target="_blank" className="text-brand-600 underline">{t.privacy_link}</a>.</p>
            </div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={form.consentGiven} onChange={e => update('consentGiven', e.target.checked)} className="mt-1 w-4 h-4 accent-brand-600" />
              <span className="text-sm text-sand-700">{t.consent_checkbox}</span>
            </label>

            {error && <p className="text-red-600 text-sm mt-4">{error}</p>}

            <div className="flex gap-3 mt-7">
              <button onClick={() => setStep(1)} className="px-6 border border-sand-300 text-sand-700 py-3.5 rounded-full font-medium hover:bg-white transition">{t.back_button}</button>
              <button
                className="flex-1 bg-brand-600 text-white py-3.5 rounded-full font-medium hover:bg-brand-700 transition disabled:opacity-40 shadow-lg shadow-brand-600/20"
                disabled={!form.consentGiven || submitting}
                onClick={submit}
              >
                {submitting ? t.submitting : t.submit_button}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
