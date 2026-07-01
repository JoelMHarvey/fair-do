'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { activeUsStates } from '@/lib/locale'
import PhotoUpload from '@/app/teacher/profile/PhotoUpload'
import CredentialDocUpload, { type ExtractionPreview } from '@/components/CredentialDocUpload'
import { SUBJECTS, LEVELS, AGE_GROUPS, TEACHING_STYLES } from '@/lib/taxonomy'
import type { Messages } from '@/lib/locale-config'

// Alphabetical, with the catch-all "Other…" kept last.
const byLabel = (a: string, b: string) =>
  a.startsWith('Other') ? 1 : b.startsWith('Other') ? -1 : a.localeCompare(b)
const QUAL_BODIES_UK = ['QTS', 'QTLS', 'PGCE', 'CertEd', 'ABRSM', 'CELTA / TEFL', 'Other qualified'].sort(byLabel)
const QUAL_BODIES_US = ['State teaching licence', 'TESOL / TEFL', 'Subject specialist', 'Other qualified'].sort(byLabel)

// Mon–Sun, dayOfWeek: Mon=1 … Sat=6, Sun=0
const DAYS = [
  { key: 'Mon', dow: 1 },
  { key: 'Tue', dow: 2 },
  { key: 'Wed', dow: 3 },
  { key: 'Thu', dow: 4 },
  { key: 'Fri', dow: 5 },
  { key: 'Sat', dow: 6 },
  { key: 'Sun', dow: 0 },
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
  dbsUpdateConsent: boolean
  credentialDocUrl: string
  credentialExtraction: ExtractionPreview | null
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

export function TeacherOnboarding({ t }: { t: Messages['onboarding_teacher'] }) {
  return <Suspense><TeacherOnboardingInner t={t} /></Suspense>
}

function TeacherOnboardingInner({ t }: { t: Messages['onboarding_teacher'] }) {
  const isUS = useSearchParams().get('region') === 'US'
  const QUAL_BODIES = isUS ? QUAL_BODIES_US : QUAL_BODIES_UK
  const cur = isUS ? '$' : '£'
  const credLabel = isUS ? t.cred_label_us : t.cred_label_uk
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
    dbsUpdateConsent: false,
    credentialDocUrl: '',
    credentialExtraction: null,
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

    const res = await fetch('/api/onboarding/teacher', {
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
        dbsUpdateConsent: form.dbsUpdateConsent || undefined,
        credentialDocUrl: form.credentialDocUrl || undefined,
        credentialExtraction: form.credentialExtraction || undefined,
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
      setError(t.error_generic)
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
          <span className="text-xs font-medium text-coral-600 bg-coral-50 border border-coral-200 px-2.5 py-1 rounded-full">{t.founding_badge}</span>
          <Link href="/for-tutors" target="_blank" className="text-xs text-sand-500 hover:text-brand-700 underline">{t.why_link}</Link>
        </div>
        <div className="flex gap-2 mb-8">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className={`h-1.5 flex-1 rounded-full transition ${s <= step ? 'bg-brand-500' : 'bg-sand-200'}`} />
          ))}
        </div>

        {step === 1 && (
          <div>
            <h1 className="font-display text-2xl font-semibold text-brand-900 mb-1">{t.step1_heading}</h1>
            <p className="text-sand-500 mb-6 text-sm">{t.step1_subtitle}</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-sand-700 mb-2">{t.photo_label}</label>
                <PhotoUpload
                  baseUrl={form.photoBaseUrl}
                  style={form.photoStyle}
                  onChange={(baseUrl, style) => setForm(prev => ({ ...prev, photoBaseUrl: baseUrl, photoStyle: style }))}
                />
                <p className="text-xs text-sand-400 mt-2">{t.photo_hint}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-sand-700 mb-1">{t.first_name_label}</label>
                  <input className={input} value={form.firstName} onChange={e => update('firstName', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-sand-700 mb-1">{t.last_name_label}</label>
                  <input className={input} value={form.lastName} onChange={e => update('lastName', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-sand-700 mb-1">{t.professional_title_label}</label>
                <input className={input} value={form.professionalTitle} onChange={e => update('professionalTitle', e.target.value)} placeholder={t.professional_title_placeholder} />
              </div>
              <div>
                <label className="block text-sm font-medium text-sand-700 mb-1">{t.tagline_label} <span className="text-sand-400 font-normal">{t.optional_suffix}</span></label>
                <input className={input} value={form.tagline} onChange={e => update('tagline', e.target.value)} placeholder={t.tagline_placeholder} maxLength={120} />
              </div>
              <div>
                <label className="block text-sm font-medium text-sand-700 mb-1">{t.mobile_label} <span className="text-sand-400 font-normal">{t.mobile_hint}</span></label>
                <input type="tel" className={input} value={form.phone} onChange={e => update('phone', e.target.value)} placeholder={t.mobile_placeholder} />
              </div>
              <div>
                <label className="block text-sm font-medium text-sand-700 mb-1">{t.bio_label}</label>
                <textarea
                  className={`${input} resize-none`}
                  rows={5}
                  placeholder={t.bio_placeholder}
                  value={form.bio}
                  onChange={e => update('bio', e.target.value)}
                />
                <p className={`text-xs mt-1 ${form.bio.length < 50 ? 'text-coral-500' : 'text-sand-400'}`}>
                {form.bio.length}{t.bio_counter}
              </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-sand-700 mb-1">{t.rate_label}</label>
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
                    {t.rate_note_pre}{cur}{rate.toFixed(2)}{t.rate_note_post}
                  </p>
                )}
              </div>
            </div>
            <button
              className={`w-full mt-6 ${next}`}
              disabled={!form.firstName || !form.lastName || form.bio.length < 50 || !form.sessionRateGBP}
              onClick={() => setStep(2)}
            >
              {t.continue}
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h1 className="font-display text-2xl font-semibold text-brand-900 mb-1">{t.step2_heading}</h1>
            <p className="text-sand-500 mb-6 text-sm">{t.step2_subtitle}</p>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-sand-700 mb-2 capitalize">{credLabel} {t.cred_body_suffix}</label>
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
                  <label className="block text-sm font-medium text-sand-700 mb-1">{t.license_state_label}</label>
                  <select className={input} value={licenseState} onChange={e => setLicenseState(e.target.value)}>
                    <option value="">{t.license_state_placeholder}</option>
                    {activeUsStates().map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
                  </select>
                  <p className="text-xs text-sand-400 mt-1">{t.license_state_hint}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-sand-700 mb-1 capitalize">{credLabel} {t.cred_ref_suffix}</label>
                  <input className={input} value={form.qualificationRef} onChange={e => update('qualificationRef', e.target.value)} placeholder={t.cred_ref_placeholder} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-sand-700 mb-1">{t.expiry_label}</label>
                  <input type="date" className={input} value={form.qualificationExpiry} onChange={e => update('qualificationExpiry', e.target.value)} />
                </div>
              </div>
              {!isUS && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-sand-700 mb-1">{t.dbs_number_label} <span className="text-sand-400 font-normal">{t.dbs_number_hint}</span></label>
                      <input className={input} value={form.dbsNumber} onChange={e => update('dbsNumber', e.target.value)} placeholder={t.dbs_number_placeholder} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-sand-700 mb-1">{t.dbs_date_label}</label>
                      <input type="date" className={input} value={form.dbsDate} onChange={e => update('dbsDate', e.target.value)} />
                    </div>
                  </div>
                  {form.dbsNumber && (
                    <label className="flex items-start gap-3 cursor-pointer rounded-xl border border-sand-200 bg-sand-50/50 p-3">
                      <input
                        type="checkbox"
                        checked={form.dbsUpdateConsent}
                        onChange={e => update('dbsUpdateConsent', e.target.checked)}
                        className="w-4 h-4 mt-0.5 accent-brand-600 shrink-0"
                      />
                      <span className="text-xs text-sand-600">
                        I consent to fair-do checking my DBS certificate status via the DBS Update Service at any time while I am an active tutor. I understand this requires my certificate number and date of birth.
                      </span>
                    </label>
                  )}
                </>
              )}

              {/* Certificate document upload */}
              <div>
                <label className="block text-sm font-medium text-sand-700 mb-1">
                  Certificate document <span className="text-sand-400 font-normal">(optional but speeds up verification)</span>
                </label>
                <p className="text-xs text-sand-400 mb-2">Upload a photo or scan of your qualification certificate. We&apos;ll read it automatically to help verify your details.</p>
                <CredentialDocUpload
                  name={`${form.firstName} ${form.lastName}`.trim()}
                  body={form.qualificationBody}
                  ref={form.qualificationRef}
                  onUploaded={(url, extraction) => {
                    setForm(prev => ({ ...prev, credentialDocUrl: url, credentialExtraction: extraction }))
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-sand-700 mb-2">{t.subjects_label}</label>
                <div className="flex flex-wrap gap-2">
                  {[...SUBJECTS].sort((a, b) => a.localeCompare(b)).map(s => (
                    <button key={s} onClick={() => toggleTag('subjects', s)} className={pill(form.subjects.includes(s))}>{s}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-sand-700 mb-2">{t.levels_label}</label>
                <div className="flex flex-wrap gap-2">
                  {LEVELS.map(l => (
                    <button key={l} onClick={() => toggleTag('levels', l)} className={pill(form.levels.includes(l))}>{l}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-sand-700 mb-2">{t.age_groups_label} <span className="text-sand-400 font-normal">{t.optional_suffix}</span></label>
                <div className="flex flex-wrap gap-2">
                  {AGE_GROUPS.map(a => (
                    <button key={a} onClick={() => toggleTag('ageGroups', a)} className={pill(form.ageGroups.includes(a))}>{a}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-sand-700 mb-2">{t.teaching_styles_label}</label>
                <div className="flex flex-wrap gap-2">
                  {TEACHING_STYLES.map(a => (
                    <button key={a} onClick={() => toggleTag('teachingStyles', a)} className={pill(form.teachingStyles.includes(a))}>{a}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(1)} className={back}>{t.back}</button>
              <button
                className={next}
                disabled={!form.qualificationBody || !form.qualificationRef || !form.qualificationExpiry || form.subjects.length === 0 || form.levels.length === 0 || (isUS && !licenseState)}
                onClick={() => setStep(3)}
              >
                {t.continue}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h1 className="font-display text-2xl font-semibold text-brand-900 mb-1">{t.step3_heading}</h1>
            <p className="text-sand-500 mb-6 text-sm">{t.step3_subtitle}</p>
            <div className="space-y-2">
              {DAYS.map((d, i) => (
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
                      <span className="text-sm font-medium text-brand-900">{t.days[i]}</span>
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
              <button onClick={() => setStep(2)} className={back}>{t.back}</button>
              <button
                className={next}
                disabled={!DAYS.some(d => form.availability[d.key].enabled)}
                onClick={() => setStep(4)}
              >
                {t.continue}
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h1 className="font-display text-2xl font-semibold text-brand-900 mb-1">{t.step4_heading}</h1>
            <p className="text-sand-500 mb-6 text-sm">{t.step4_subtitle}</p>
            <div className="bg-sand-100 rounded-xl p-5 mb-6 space-y-3 text-sm">
              <div className="flex justify-between text-sand-700">
                <span>{t.summary_rate_label}</span>
                <span className="font-medium">{cur}{form.sessionRateGBP}</span>
              </div>
              <p className="text-sand-700">
                {t.payment_note_pre}{' '}
                <Link href="/pricing" target="_blank" className="text-brand-700 underline">{t.pricing_link}</Link>{t.payment_note_post}
              </p>
              <hr className="border-sand-200" />
              <p className="text-xs text-sand-500">{t.payment_kyc_note}</p>
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
                {t.agreement_pre}{' '}
                <Link href="/terms" target="_blank" className="text-brand-700 underline">{t.terms_link}</Link>{t.agreement_mid}{' '}
                <Link href="/terms#dpa" target="_blank" className="text-brand-700 underline">{t.dpa_link}</Link>{t.agreement_post}
              </span>
            </label>

            {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
            <div className="flex gap-3">
              <button onClick={() => setStep(3)} className={back} disabled={submitting}>{t.back}</button>
              <button className={next} disabled={submitting || !form.agreementAccepted} onClick={handleStripeConnect}>
                {submitting ? t.redirecting : t.connect_button}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
