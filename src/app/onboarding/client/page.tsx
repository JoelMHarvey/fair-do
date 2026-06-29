'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { activeUsStates } from '@/lib/locale'

// Read the public flag directly — practice.ts is server-tainted (Clerk auth) and
// can't be imported into a client component.
const DIRECTORY_ENABLED = process.env.NEXT_PUBLIC_DIRECTORY_ENABLED === 'true'

const REASONS = [
  'Anxiety or worry', 'Depression or low mood', 'Trauma or PTSD',
  'Relationship difficulties', 'Grief or loss', 'Work stress',
  'Identity or self-esteem', 'Life transitions', 'Not sure yet',
]

const APPROACHES = ['CBT', 'Psychodynamic', 'Person-centred', 'EMDR', 'Mindfulness', 'No preference']

type Form = {
  firstName: string
  lastName: string
  reasons: string[]
  preferredApproaches: string[]
  referralCode: string
  acknowledged: boolean
  consentGiven: boolean
}

export default function ClientOnboarding() {
  return <Suspense><ClientOnboardingInner /></Suspense>
}

function ClientOnboardingInner() {
  const router = useRouter()
  const isUS = useSearchParams().get('region') === 'US'
  const [usState, setUsState] = useState('')
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState<Form>({
    firstName: '',
    lastName: '',
    reasons: [],
    preferredApproaches: [],
    referralCode: '',
    acknowledged: false,
    consentGiven: false,
  })

  // Directory matching is off pre-pivot — clients join via their therapist's invite.
  // Send any direct hit to the connect explainer instead of the (hidden) directory.
  useEffect(() => {
    if (!DIRECTORY_ENABLED) router.replace('/onboarding/connect')
  }, [router])
  if (!DIRECTORY_ENABLED) return null

  function update<K extends keyof Form>(field: K, value: Form[K]) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function toggle(field: 'reasons' | 'preferredApproaches', value: string) {
    setForm(prev => ({
      ...prev,
      [field]: prev[field].includes(value) ? prev[field].filter(v => v !== value) : [...prev[field], value],
    }))
  }

  async function submit() {
    setSubmitting(true)
    setError('')
    const res = await fetch('/api/onboarding/client', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        questionnaire: {
          reason: form.reasons[0] ?? '',
          reasons: form.reasons,
          previousTherapy: null,
          preferredApproach: form.preferredApproaches[0] || undefined,
          preferredApproaches: form.preferredApproaches,
          availability: [],
          crisisAcknowledged: form.acknowledged,
          crisisAcknowledgedAt: new Date().toISOString(),
        },
        referralCode: form.referralCode.trim() || undefined,
        usState: isUS ? usState : undefined,
        consentGiven: form.consentGiven,
      }),
    })
    if (res.ok) {
      router.push('/therapists')
    } else {
      setError('Something went wrong. Please try again.')
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
              Let&apos;s find your therapist
            </h1>
            <p className="text-sand-600 mb-2">Two quick steps. Take your time — there&apos;s no rush.</p>
            <p className="text-sm text-sand-500 mb-7">
              Want to know who we are first?{' '}
              <Link href="/about" target="_blank" className="text-brand-600 hover:text-brand-700 underline">Read our story</Link>.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div>
                <label className="block text-sm font-medium text-sand-700 mb-1.5">First name</label>
                <input className={input} value={form.firstName} onChange={e => update('firstName', e.target.value)} placeholder="Alex" />
              </div>
              <div>
                <label className="block text-sm font-medium text-sand-700 mb-1.5">Last name</label>
                <input className={input} value={form.lastName} onChange={e => update('lastName', e.target.value)} placeholder="Morgan" />
              </div>
            </div>

            {isUS && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-sand-700 mb-1.5">Which state are you in?</label>
                <select className={input} value={usState} onChange={e => setUsState(e.target.value)}>
                  <option value="">Select your state…</option>
                  {activeUsStates().map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
                </select>
                <p className="text-xs text-sand-400 mt-1">We can only match you with therapists licensed in your state. We&apos;re live in New York first — more states soon.</p>
              </div>
            )}

            <label className="block text-sm font-medium text-sand-700 mb-2">
              What brings you here today? <span className="text-sand-400 font-normal">— choose any that fit</span>
            </label>
            <div className="grid grid-cols-2 gap-2 mb-6">
              {REASONS.map(r => (
                <button key={r} onClick={() => toggle('reasons', r)} className={chip(form.reasons.includes(r))}>
                  {r}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-sand-700">
                Any approaches you prefer? <span className="text-sand-400 font-normal">— optional, pick any</span>
              </label>
              <Link href="/styles" target="_blank" className="text-xs text-brand-600 hover:text-brand-700 underline shrink-0">
                What do these mean?
              </Link>
            </div>
            <div className="flex flex-wrap gap-2 mb-7">
              {APPROACHES.map(a => (
                <button key={a} onClick={() => toggle('preferredApproaches', a)} className={smallChip(form.preferredApproaches.includes(a))}>
                  {a}
                </button>
              ))}
            </div>

            <label className="block text-sm font-medium text-sand-700 mb-2">
              Referral code? <span className="text-sand-400 font-normal">— optional, gets you £10 off</span>
            </label>
            <input
              className={`${input} mb-7 uppercase`}
              value={form.referralCode}
              onChange={e => update('referralCode', e.target.value)}
              placeholder="FRIEND-XXXX"
            />

            <button
              className="w-full bg-brand-600 text-white py-3.5 rounded-full font-medium hover:bg-brand-700 transition disabled:opacity-40 shadow-lg shadow-brand-600/20"
              disabled={!form.firstName.trim() || !form.lastName.trim() || form.reasons.length === 0 || (isUS && !usState)}
              onClick={() => setStep(2)}
            >
              Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-up">
            <h1 className="font-display text-3xl font-semibold text-brand-900 mb-2">
              Before we begin
            </h1>
            <p className="text-sand-600 mb-6">Two things we need you to know.</p>

            {/* Crisis */}
            <div className="bg-coral-50 border border-coral-200 rounded-2xl p-5 mb-4">
              <p className="text-coral-600 font-semibold text-sm mb-2">Faresay isn&apos;t a crisis service</p>
              <p className="text-sand-700 text-sm mb-3">If you need urgent help right now:</p>
              <ul className="text-sand-700 text-sm space-y-1">
                <li><strong>Emergency:</strong> 999</li>
                <li><strong>Samaritans:</strong> 116 123 — free, 24/7</li>
                <li><strong>Crisis text:</strong> text SHOUT to 85258</li>
              </ul>
            </div>
            <label className="flex items-start gap-3 cursor-pointer mb-5">
              <input type="checkbox" checked={form.acknowledged} onChange={e => update('acknowledged', e.target.checked)} className="mt-1 w-4 h-4 accent-brand-600" />
              <span className="text-sm text-sand-700">I understand, and I know how to get urgent help if I need it.</span>
            </label>

            {/* GDPR */}
            <div className="bg-white border border-sand-200 rounded-2xl p-5 mb-4 text-sm text-sand-600 space-y-2">
              <p className="font-medium text-sand-800">Your data, protected</p>
              <p>Your answers are special category data under UK GDPR. We use them only to match you with a therapist and provide your care. Seen by your therapist and essential staff only. Kept 7 years, then deleted. Full details in our <a href="/privacy" target="_blank" className="text-brand-600 underline">Privacy Policy</a>.</p>
            </div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={form.consentGiven} onChange={e => update('consentGiven', e.target.checked)} className="mt-1 w-4 h-4 accent-brand-600" />
              <span className="text-sm text-sand-700">I consent to Faresay processing my health information to match me with a therapist.</span>
            </label>

            {error && <p className="text-coral-600 text-sm mt-4">{error}</p>}

            <div className="flex gap-3 mt-7">
              <button onClick={() => setStep(1)} className="px-6 border border-sand-300 text-sand-700 py-3.5 rounded-full font-medium hover:bg-white transition">Back</button>
              <button
                className="flex-1 bg-brand-600 text-white py-3.5 rounded-full font-medium hover:bg-brand-700 transition disabled:opacity-40 shadow-lg shadow-brand-600/20"
                disabled={!form.acknowledged || !form.consentGiven || submitting}
                onClick={submit}
              >
                {submitting ? 'Finding your matches…' : 'See my matches'}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
