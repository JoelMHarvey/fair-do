'use client'

import { useState, useEffect } from 'react'
import PhotoUpload from './PhotoUpload'
import { LANGUAGES } from '@/lib/locale'
import { HelpTip } from '@/components/HelpTip'

type Percentile = { cheaperThanPercent: number; percentileRank: number; band: string; sampleSize: number; medianPence: number }

type Initial = {
  tagline: string
  bio: string
  sessionRatePence: number
  introRatePence: number | null
  groupRatePence: number | null
  groupMaxSize: number
  availableForNew: boolean
  languages: string[]
  websiteUrl: string
  linkedinUrl: string
  introVideoUrl: string
  profileImageUrl: string
  photoBaseUrl: string
  photoStyle: string
  timezone: string
}

const TIMEZONES = [
  'Europe/London', 'Europe/Dublin', 'Europe/Paris', 'Europe/Madrid', 'Europe/Berlin',
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
]

export default function ProfileForm({ initial }: { initial: Initial }) {
  const [tagline, setTagline] = useState(initial.tagline)
  const [bio, setBio] = useState(initial.bio)
  const [sessionRate, setSessionRate] = useState(String(initial.sessionRatePence / 100))
  const [pct, setPct] = useState<Percentile | null>(null)
  const [introRate, setIntroRate] = useState(initial.introRatePence != null ? String(initial.introRatePence / 100) : '')
  const [groupRate, setGroupRate] = useState(initial.groupRatePence != null ? String(initial.groupRatePence / 100) : '')
  const [groupMax, setGroupMax] = useState(initial.groupMaxSize)
  const [availableForNew, setAvailableForNew] = useState(initial.availableForNew)
  const [languages, setLanguages] = useState<string[]>(initial.languages.length ? initial.languages : ['English'])
  const [timezone, setTimezone] = useState(initial.timezone || 'Europe/London')
  const toggleLang = (l: string) => setLanguages(prev => prev.includes(l) ? prev.filter(x => x !== l) : [...prev, l])
  const [websiteUrl, setWebsiteUrl] = useState(initial.websiteUrl)
  const [linkedinUrl, setLinkedinUrl] = useState(initial.linkedinUrl)
  const [videoUrl, setVideoUrl] = useState(initial.introVideoUrl)
  const [photoBaseUrl, setPhotoBaseUrl] = useState(initial.photoBaseUrl)
  const [photoStyle, setPhotoStyle] = useState(initial.photoStyle || 'original')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  // Live rate percentile vs other active teachers (debounced)
  useEffect(() => {
    const pence = Math.round(parseFloat(sessionRate) * 100)
    if (!Number.isFinite(pence) || pence < 3000 || pence > 20000) { setPct(null); return }
    const t = setTimeout(() => {
      fetch(`/api/teacher/rate-percentile?rate=${pence}`)
        .then(r => r.ok ? r.json() : null)
        .then(d => setPct(d))
        .catch(() => setPct(null))
    }, 400)
    return () => clearTimeout(t)
  }, [sessionRate])

  async function save() {
    setSaving(true)
    setMsg('')
    const res = await fetch('/api/teacher/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tagline,
        bio,
        sessionRatePence: sessionRate ? Math.round(parseFloat(sessionRate) * 100) : undefined,
        introRatePence: introRate ? Math.round(parseFloat(introRate) * 100) : null,
        groupRatePence: groupRate ? Math.round(parseFloat(groupRate) * 100) : null,
        groupMaxSize: groupMax,
        availableForNew,
        languages,
        timezone,
        websiteUrl,
        linkedinUrl,
        introVideoUrl: videoUrl,
        photoBaseUrl,
        photoStyle,
      }),
    })
    const data = await res.json().catch(() => ({}))
    if (res.ok) setMsg('Saved ✓')
    else setMsg(data.error ?? 'Something went wrong')
    setSaving(false)
  }

  const input =
    'w-full border border-sand-300 rounded-xl px-4 py-2.5 text-sand-900 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition'
  const label = 'block text-sm font-medium text-sand-700 mb-1.5'
  const card = 'bg-white rounded-3xl border border-sand-200 p-6 shadow-sm'

  return (
    <div className="space-y-5">
      <div className={card}>
        <h2 className="font-display text-lg font-semibold text-brand-900 mb-4">About you</h2>
        <div className="space-y-4">
          <div>
            <label className={label}>
              Tagline <span className="text-sand-400 font-normal">— shown on your card</span>
              <HelpTip>One short line students see first, right under your name — a quick sense of who you teach and how. Keep it clear, e.g. “GCSE &amp; A-Level Maths — patient, exam-focused teaching”.</HelpTip>
            </label>
            <input className={input} value={tagline} onChange={e => setTagline(e.target.value)} placeholder="GCSE & A-Level Maths — patient, exam-focused teaching" maxLength={120} />
          </div>
          <div>
            <label className={label}>Bio</label>
            <textarea className={input} rows={5} value={bio} onChange={e => setBio(e.target.value)} />
            <p className="text-xs text-sand-400 mt-1">{bio.length} chars · minimum 50</p>
          </div>
          <div>
            <label className={label}>Profile photo <span className="text-sand-400 font-normal">— optional; blur or illustrate it if you prefer privacy</span></label>
            <PhotoUpload baseUrl={photoBaseUrl} style={photoStyle} onChange={(b, s) => { setPhotoBaseUrl(b); setPhotoStyle(s) }} />
          </div>
          <div>
            <label className={label}>Languages you offer sessions in</label>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map(l => (
                <button
                  key={l}
                  type="button"
                  onClick={() => toggleLang(l)}
                  className={`text-sm px-3 py-1.5 rounded-full border transition ${
                    languages.includes(l) ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-sand-200 text-sand-700 hover:border-brand-300'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={label}>Timezone <span className="text-sand-400 font-normal">— used for recurring lesson times</span></label>
            <select
              value={timezone}
              onChange={e => setTimezone(e.target.value)}
              className="w-full rounded-xl border border-sand-300 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none"
            >
              {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz.replace('_', ' ')}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className={card}>
        <h2 className="font-display text-lg font-semibold text-brand-900 mb-1">Rates</h2>
        <p className="text-sm text-sand-500 mb-4">Set your standard 50-minute session rate.</p>

        <div className="mb-4">
          <label className={label}>
            Standard lesson rate (£)
            <HelpTip>Your standard price for a lesson, in pounds. This is what most students pay — you can set a different price for an individual student later if you need to.</HelpTip>
          </label>
          <input className={input} type="number" value={sessionRate} onChange={e => setSessionRate(e.target.value)} placeholder="e.g. 50" />
          {pct && pct.sampleSize > 1 && (
            <div className="mt-2 rounded-xl bg-sand-50 border border-sand-200 p-3">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-sand-500">Budget</span>
                <span className={`font-medium ${pct.band === 'budget' ? 'text-brand-700' : pct.band === 'premium' ? 'text-coral-600' : 'text-sand-700'}`}>
                  {pct.band === 'budget' ? 'Budget-friendly' : pct.band === 'premium' ? 'Premium' : 'Mid-range'}
                </span>
                <span className="text-sand-500">Premium</span>
              </div>
              <div className="h-2 rounded-full bg-gradient-to-r from-brand-200 via-sand-200 to-coral-200 relative">
                <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-brand-700 border-2 border-white shadow" style={{ left: `calc(${Math.min(98, Math.max(2, pct.percentileRank))}% - 6px)` }} />
              </div>
              <p className="text-xs text-sand-600 mt-2">
                You&apos;re cheaper than <strong>{pct.cheaperThanPercent}%</strong> of tutors. Median is £{(pct.medianPence / 100).toFixed(0)} ({pct.sampleSize} tutors).
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>First-session rate (£)</label>
            <input className={input} type="number" value={introRate} onChange={e => setIntroRate(e.target.value)} placeholder="e.g. 35" />
            <p className="text-xs text-sand-400 mt-1">Discounted rate to attract new clients. Leave blank to disable.</p>
          </div>
          <div>
            <label className={label}>Group rate per person (£)</label>
            <input className={input} type="number" value={groupRate} onChange={e => setGroupRate(e.target.value)} placeholder="e.g. 25" />
            <p className="text-xs text-sand-400 mt-1">Per-person rate for group sessions.</p>
          </div>
        </div>
        <div className="mt-4">
          <label className={label}>Max group size</label>
          <select className={input} value={groupMax} onChange={e => setGroupMax(Number(e.target.value))}>
            {[1, 2, 3, 4, 5, 6, 8, 10, 12].map(n => (
              <option key={n} value={n}>{n === 1 ? '1 — no group sessions' : `${n} people`}</option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-3 mt-4 cursor-pointer">
          <input type="checkbox" checked={availableForNew} onChange={e => setAvailableForNew(e.target.checked)} className="w-4 h-4 accent-brand-600" />
          <span className="text-sm text-sand-700">Accepting new students</span>
        </label>
      </div>

      <div className={card}>
        <h2 className="font-display text-lg font-semibold text-brand-900 mb-4">Links</h2>
        <div className="space-y-4">
          <div><label className={label}>Personal website</label><input className={input} value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)} placeholder="https://…" /></div>
          <div><label className={label}>LinkedIn</label><input className={input} value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)} placeholder="https://…" /></div>
          <div><label className={label}>Intro video (YouTube/Vimeo)</label><input className={input} value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="https://…" /></div>
        </div>
      </div>

      <div className="flex items-center gap-4 sticky bottom-4">
        <button
          onClick={save}
          disabled={saving}
          className="bg-brand-600 text-white px-8 py-3 rounded-full font-medium hover:bg-brand-700 transition disabled:opacity-50 shadow-lg shadow-brand-600/20"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
        {msg && <span className={`text-sm font-medium ${msg.includes('✓') ? 'text-brand-600' : 'text-coral-600'}`}>{msg}</span>}
      </div>
    </div>
  )
}
