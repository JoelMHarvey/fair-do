'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { activeUsStates } from '@/lib/locale'
import PhotoUpload from '@/app/teacher/profile/PhotoUpload'
import { SUBJECTS, LEVELS, AGE_GROUPS, TEACHING_STYLES } from '@/lib/taxonomy'

const QUAL_BODIES_UK = ['QTS', 'QTLS', 'PGCE', 'CertEd', 'ABRSM', 'CELTA / TEFL', 'Other qualified']
const QUAL_BODIES_US = ['State teaching licence', 'TESOL / TEFL', 'Subject specialist', 'Other qualified']

// Mon–Sun, dayOfWeek: Mon=1 … Sat=6, Sun=0
const DAYS = [
  { label: 'Monday', key: 'Mon', dow: 1 },
  { label: 'Tuesday', key: 'Tue', dow: 2 },
  { label: 'Wednesday', key: 'Wed', dow: 3 },
  { label: 'Thursday', key: 'Thu', dow: 4 },
  { label: 'Friday', key: 'Fri', dow: 5 },
  { label: 'Saturday', key: 'Sat', dow: 6 },
  { label: 'Sunday', key: 'Sun', dow: 0 },
]

type DaySlot = { enabled: boolean; startTime: string; endTime: string }
type AvailMap = Record<string, DaySlot>

function initAvail(): AvailMap {
  const m: AvailMap = {}
  DAYS.forEach(d => { m[d.key] = { enabled: false, startTime: '09:00', endTime: '17:00' } })
  return m
}

type Form = {
  firstName: string
  lastName: string
  professionalTitle: string
  tagline: string
  phone: string
  bio: string
  sessionRateGBP: string
  qualificationBody: string
  qualificationRef: string
  qualificationExpiry: string
  dbsNumber: string
  dbsDate: string
  subjects: string[]
  levels: string[]
  ageGroups: string[]
  teachingStyles: string[]
  availability: AvailMap
  photoBaseUrl: string
  photoStyle: string
  agreementAccepted: boolean
}

// Bump when the Tutor Agreement / DPA materially change — stored per acceptance.
const AGREEMENT_VERSION = '2026-06-25'

export default function TherapistOnboarding() {
  return <Suspense><TherapistOnboardingInner /></Suspense>
}

function TherapistOnboardingInner() {
  const isUS = useSearchParams().get('region') === 'US'
  const QUAL_BODIES = isUS ? QUAL_BODIES_US : QUAL_BODIES_UK
  const cur = isUS ? '$' : '£'
  const credLabel = isUS ? 'license' : 'qualification'
  const [licenseState, setLicenseState] = useState('')
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState<Form>({
    firstName: '',
    lastName: '',
    professionalTitle: '',
    tagline: '',
    phone: '',
    bio: '',
    sessionRateGBP: '50',
    qualificationBody: '',
    qualificationRef: '',
    qualificationExpiry: '',
    dbsNumber: '',
    dbsDate: '',
    subjects: [],
    levels: [],
    ageGroups: [],
    teachingStyles: [],
    availability: initAvail(),
    photoBaseUrl: '',
    photoStyle: 'original',
    agreementAccepted: false,
  })

  function update<K extends keyof Form>(field: K, value: Form[K]) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function toggleTag(field: 'subjects' | 'levels' | 'ageGroups' | 'teachingStyles', val: string) {
    setForm(prev => ({
      ...prev,
      [field]: prev[field].includes(val)
        ? prev[field].filter((x: string) => x !== val)
        : [...prev[field], val],
    }))
  }

  function updateDay(key: string, field: keyof DaySlot, value: string | boolean) {
    setForm(prev => ({
      ...prev,
      availability: { ...prev.availability, [key]: { ...prev.availability[key], [field]: value } },
    }))
  }

  async function handleStripeConnect() {
    setSubmitting(true)
    setError('')

    const availArray = DAYS
      .filter(d => form.availability[d.key].enabled)
      .map(d => ({
        dayOfWeek: d.dow,
        startTime: form.availability[d.key].startTime,
        endTime: form.availability[d.key].endTime,
      }))

    const res = await fetch('/api/onboarding/therapist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: form.firstName,
        lastName: form.lastName,
        professionalTitle: form.professionalTitle || undefined,
        tagline: form.tagline || undefined,
        phone: form.phone || undefined,
        bio: form.bio,
        sessionRatePence: Math.round(parseFloat(form.sessionRateGBP) * 100),
        qualificationBody: form.qualificationBody,
        qualificationRef: form.qualificationRef,
        qualificationExpiry: form.qualificationExpiry,
        dbsNumber: form.dbsNumber || undefined,
        dbsDate: form.dbsDate || undefined,
        licenseState: isUS ? licenseState : undefined,
        subjects: form.subjects,
        levels: form.levels,
        ageGroups: form.ageGroups,
        teachingStyles: form.teachingStyles,
        availability: availArray,
        photoBaseUrl: form.photoBaseUrl || undefined,
        photoStyle: form.photoStyle || undefined,
        agreementAccepted: form.agreementAccepted,
        agreementVersion: AGREEMENT_VERSION,
      }),
    })

    if (!res.ok) {
      setError('Something went wrong. Please try again.')
      setSubmitting(false)
      return
    }

    const data = await res.json()
    window.location.href = data.stripeUrl
  }

  const input = 'w-full border border-sand-200 rounded-xl px-4 py-3 text-brand-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400'
  const pill = (active: boolean) =>
    `text-sm px-3 py-1.5 rounded-full border transition ${active ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-sand-200 text-sand-700 hover:border-sand-300'}`
  const back = 'flex-1 border border-sand-200 text-sand-700 py-3 rounded-xl font-medium hover:bg-sand-50 transition'
  const next = 'flex-1 bg-brand-600 text-white py-3 rounded-xl font-medium hover:bg-brand-700 transition disabled:opacity-50'

  const rate = parseFloat(form.sessionRateGBP || '0')

  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-50 to-sand-50 flex flex-col items-center px-4 py-10">
      <div className="mb-6"><Logo /></div>
      <div className="max-w-lg w-full">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-coral-600 bg-coral-50 border border-coral-200 px-2.5 py-1 rounded-full">Founding member · locked pricing</span>
          <Link href="/for-tutors" target="_blank" className="text-xs text-sand-500 hover:text-brand-700 underline">Why fair-do?</Link>
        </div>
        <div className="flex gap-2 mb-8">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className={`h-1.5 flex-1 rounded-full transition ${s <= step ? 'bg-brand-500' : 'bg-sand-200'}`} />
          ))}
        </div>

        {step === 1 && (
          <div>
            <h1 className="font-display text-2xl font-semibold text-brand-900 mb-1">Your profile</h1>
            <p className="text-sand-500 mb-6 text-sm">Students see this when browsing tutors — a photo and a clear title help them choose you.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-sand-700 mb-2">Profile photo</label>
                <PhotoUpload
                  baseUrl={form.photoBaseUrl}
                  style={form.photoStyle}
                  onChange={(baseUrl, style) => setForm(prev => ({ ...prev, photoBaseUrl: baseUrl, photoStyle: style }))}
                />
                <p className="text-xs text-sand-400 mt-2">Optional now — but profiles with a photo get far more enquiries. You can change it any time.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-sand-700 mb-1">First name</label>
                  <input className={input} value={form.firstName} onChange={e => update('firstName', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-sand-700 mb-1">Last name</label>
                  <input className={input} value={form.lastName} onChange={e => update('lastName', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-sand-700 mb-1">Professional title</label>
                <input className={input} value={form.professionalTitle} onChange={e => update('professionalTitle', e.target.value)} placeholder="e.g. Qualified Maths Teacher, GCSE Science Tutor" />
              </div>
              <div>
                <label className="block text-sm font-medium text-sand-700 mb-1">Tagline <span className="text-sand-400 font-normal">(optional)</span></label>
                <input className={input} value={form.tagline} onChange={e => update('tagline', e.target.value)} placeholder="One warm line students see first" maxLength={120} />
              </div>
              <div>
                <label className="block text-sm font-medium text-sand-700 mb-1">Mobile <span className="text-sand-400 font-normal">(private — account &amp; new-student alerts)</span></label>
                <input type="tel" className={input} value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="07700 900123" />
              </div>
              <div>
                <label className="block text-sm font-medium text-sand-700 mb-1">Bio</label>
                <textarea
                  className={`${input} resize-none`}
                  rows={5}
                  placeholder="Describe your teaching approach, experience, and what students can expect…"
                  value={form.bio}
                  onChange={e => update('bio', e.target.value)}
                />
                <p className={`text-xs mt-1 ${form.bio.length < 50 ? 'text-coral-500' : 'text-sand-400'}`}>
                {form.bio.length} chars · minimum 50 · 100–500 recommended
              </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-sand-700 mb-1">Lesson rate per 50 min</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sand-500 text-sm">{cur}</span>
                  <input
                    type="number"
                    min={30}
                    max={200}
                    className={`${input} pl-8`}
                    value={form.sessionRateGBP}
                    onChange={e => update('sessionRateGBP', e.target.value)}
                  />
                </div>
                {rate > 0 && (
                  <p className="text-xs text-brand-600 mt-1">
                    Students pay {cur}{rate.toFixed(2)} by card — paid straight to your connected account. fair-do charges your monthly plan plus a small card commission.
                  </p>
                )}
              </div>
            </div>
            <button
              className={`w-full mt-6 ${next}`}
              disabled={!form.firstName || !form.lastName || form.bio.length < 50 || !form.sessionRateGBP}
              onClick={() => setStep(2)}
            >
              Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h1 className="font-display text-2xl font-semibold text-brand-900 mb-1">Credentials &amp; subjects</h1>
            <p className="text-sand-500 mb-6 text-sm">Verified before your profile goes live.</p>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-sand-700 mb-2 capitalize">{credLabel} body</label>
                <div className="grid grid-cols-3 gap-2">
                  {QUAL_BODIES.map(b => (
                    <button
                      key={b}
                      onClick={() => update('qualificationBody', b)}
                      className={`py-2.5 rounded-xl border text-sm font-medium transition ${
                        form.qualificationBody === b ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-sand-200 text-sand-700 hover:border-sand-300'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>
              {isUS && (
                <div>
                  <label className="block text-sm font-medium text-sand-700 mb-1">State of licensure</label>
                  <select className={input} value={licenseState} onChange={e => setLicenseState(e.target.value)}>
                    <option value="">Select state…</option>
                    {activeUsStates().map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
                  </select>
                  <p className="text-xs text-sand-400 mt-1">You can only see students located in this state. fair-do is live in New York first.</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-sand-700 mb-1 capitalize">{credLabel} reference</label>
                  <input className={input} value={form.qualificationRef} onChange={e => update('qualificationRef', e.target.value)} placeholder="e.g. 123456 or RP12345" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-sand-700 mb-1">Expiry date</label>
                  <input type="date" className={input} value={form.qualificationExpiry} onChange={e => update('qualificationExpiry', e.target.value)} />
                </div>
              </div>
              {!isUS && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-sand-700 mb-1">DBS number <span className="text-sand-400 font-normal">(if you teach under-18s)</span></label>
                    <input className={input} value={form.dbsNumber} onChange={e => update('dbsNumber', e.target.value)} placeholder="e.g. 001234567890" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-sand-700 mb-1">DBS issue date</label>
                    <input type="date" className={input} value={form.dbsDate} onChange={e => update('dbsDate', e.target.value)} />
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-sand-700 mb-2">Subjects</label>
                <div className="flex flex-wrap gap-2">
                  {SUBJECTS.map(s => (
                    <button key={s} onClick={() => toggleTag('subjects', s)} className={pill(form.subjects.includes(s))}>{s}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-sand-700 mb-2">Levels you teach</label>
                <div className="flex flex-wrap gap-2">
                  {LEVELS.map(l => (
                    <button key={l} onClick={() => toggleTag('levels', l)} className={pill(form.levels.includes(l))}>{l}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-sand-700 mb-2">Age groups <span className="text-sand-400 font-normal">(optional)</span></label>
                <div className="flex flex-wrap gap-2">
                  {AGE_GROUPS.map(a => (
                    <button key={a} onClick={() => toggleTag('ageGroups', a)} className={pill(form.ageGroups.includes(a))}>{a}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-sand-700 mb-2">Teaching styles</label>
                <div className="flex flex-wrap gap-2">
                  {TEACHING_STYLES.map(a => (
                    <button key={a} onClick={() => toggleTag('teachingStyles', a)} className={pill(form.teachingStyles.includes(a))}>{a}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(1)} className={back}>Back</button>
              <button
                className={next}
                disabled={!form.qualificationBody || !form.qualificationRef || !form.qualificationExpiry || form.subjects.length === 0 || form.levels.length === 0 || (isUS && !licenseState)}
                onClick={() => setStep(3)}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h1 className="font-display text-2xl font-semibold text-brand-900 mb-1">Your availability</h1>
            <p className="text-sand-500 mb-6 text-sm">All times UK (Europe/London).</p>
            <div className="space-y-2">
              {DAYS.map(d => (
                <div
                  key={d.key}
                  className={`rounded-xl border p-4 transition ${form.availability[d.key].enabled ? 'border-brand-300 bg-brand-50/30' : 'border-sand-200'}`}
                >
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.availability[d.key].enabled}
                        onChange={e => updateDay(d.key, 'enabled', e.target.checked)}
                        className="w-4 h-4 accent-brand-600"
                      />
                      <span className="text-sm font-medium text-brand-900">{d.label}</span>
                    </label>
                    {form.availability[d.key].enabled && (
                      <div className="flex items-center gap-2 text-xs text-sand-600">
                        <input
                          type="time"
                          value={form.availability[d.key].startTime}
                          onChange={e => updateDay(d.key, 'startTime', e.target.value)}
                          className="border border-sand-200 rounded px-2 py-1"
                        />
                        <span>–</span>
                        <input
                          type="time"
                          value={form.availability[d.key].endTime}
                          onChange={e => updateDay(d.key, 'endTime', e.target.value)}
                          className="border border-sand-200 rounded px-2 py-1"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(2)} className={back}>Back</button>
              <button
                className={next}
                disabled={!DAYS.some(d => form.availability[d.key].enabled)}
                onClick={() => setStep(4)}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h1 className="font-display text-2xl font-semibold text-brand-900 mb-1">Set up payments</h1>
            <p className="text-sand-500 mb-6 text-sm">fair-do pays you via Stripe. Setup takes ~5 minutes.</p>
            <div className="bg-sand-100 rounded-xl p-5 mb-6 space-y-3 text-sm">
              <div className="flex justify-between text-sand-700">
                <span>Your lesson rate</span>
                <span className="font-medium">{cur}{form.sessionRateGBP}</span>
              </div>
              <p className="text-sand-700">
                Students pay by card via Stripe and the money goes straight to your connected account. fair-do&apos;s fee is your monthly plan plus a small card commission — see{' '}
                <Link href="/pricing" target="_blank" className="text-brand-700 underline">pricing</Link>.
              </p>
              <hr className="border-sand-200" />
              <p className="text-xs text-sand-500">Payments typically reach your bank around 2 business days after each lesson. Stripe handles all KYC.</p>
            </div>

            {/* Agreement + DPA acceptance — recorded with a timestamp + version (UK GDPR Art 28 evidence). */}
            <label className="flex items-start gap-3 cursor-pointer mb-5 rounded-xl border border-sand-200 p-4">
              <input
                type="checkbox"
                checked={form.agreementAccepted}
                onChange={e => update('agreementAccepted', e.target.checked)}
                className="w-5 h-5 mt-0.5 accent-brand-600 shrink-0"
              />
              <span className="text-sm text-sand-700">
                I have read and accept the{' '}
                <Link href="/terms" target="_blank" className="text-brand-700 underline">Tutor Terms</Link> and the{' '}
                <Link href="/terms#dpa" target="_blank" className="text-brand-700 underline">Data Processing Agreement</Link>.
                I understand I am the data controller for my students&apos; records and fair-do is my processor.
              </span>
            </label>

            {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
            <div className="flex gap-3">
              <button onClick={() => setStep(3)} className={back} disabled={submitting}>Back</button>
              <button className={next} disabled={submitting || !form.agreementAccepted} onClick={handleStripeConnect}>
                {submitting ? 'Redirecting to Stripe…' : 'Connect bank account →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
