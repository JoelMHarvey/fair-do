'use client'

import { useEffect, useState } from 'react'
import { brandRamp, HEX_RE, type RampStep } from '@/lib/theme'
import { SLUG_RE } from '@/lib/tenant-host'

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare global { interface Window { cloudinary?: any } }

type BrandingInitial = {
  slug: string
  brandColor: string
  accentColor: string
  brandLogoUrl: string
  welcomeMessage: string
  footerLine: string
}

const SWATCH_STEPS: RampStep[] = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]

export function BrandingForm({ schoolName, initial }: { schoolName: string; initial: BrandingInitial }) {
  const [slug, setSlug] = useState(initial.slug)
  const [brandColor, setBrandColor] = useState(initial.brandColor)
  const [accentColor, setAccentColor] = useState(initial.accentColor)
  const [logoUrl, setLogoUrl] = useState(initial.brandLogoUrl)
  const [welcomeMessage, setWelcomeMessage] = useState(initial.welcomeMessage)
  const [footerLine, setFooterLine] = useState(initial.footerLine)
  const [widgetReady, setWidgetReady] = useState(false)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (window.cloudinary) { setWidgetReady(true); return }
    const s = document.createElement('script')
    s.src = 'https://upload-widget.cloudinary.com/global/all.js'
    s.onload = () => setWidgetReady(true)
    document.body.appendChild(s)
  }, [])

  function openLogoWidget() {
    if (!window.cloudinary || !CLOUD || !PRESET) return
    window.cloudinary
      .createUploadWidget(
        {
          cloudName: CLOUD,
          uploadPreset: PRESET,
          sources: ['local', 'url'],
          multiple: false,
          cropping: false,
          folder: 'fair-do/school-logos',
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (err: any, result: any) => {
          if (!err && result?.event === 'success') setLogoUrl(result.info.secure_url)
        },
      )
      .open()
  }

  const slugOk = slug === '' || SLUG_RE.test(slug)
  const ramp = HEX_RE.test(brandColor) ? brandRamp(brandColor) : null
  const accentRamp = HEX_RE.test(accentColor) ? brandRamp(accentColor) : null

  async function save() {
    setSaving(true)
    setMsg('')
    const res = await fetch('/api/school/branding', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, brandColor, accentColor, brandLogoUrl: logoUrl, welcomeMessage, footerLine }),
    })
    const d = await res.json().catch(() => ({}))
    if (res.ok) setMsg('Saved ✓ — your portal picks this up within a minute.')
    else setMsg(d.error ?? 'Something went wrong')
    setSaving(false)
  }

  const input =
    'w-full border border-sand-300 rounded-xl px-4 py-2.5 text-sand-900 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition'
  const fieldLabel = 'block text-sm font-medium text-sand-700 mb-1.5'

  return (
    <div className="grid lg:grid-cols-2 gap-6 items-start">
      <div className="bg-white rounded-xl border border-sand-200 p-6 space-y-5">
        {/* Subdomain */}
        <div>
          <label className={fieldLabel} htmlFor="branding-slug">Portal subdomain</label>
          <div className="flex items-center gap-2">
            <input
              id="branding-slug"
              className={`${input} max-w-[200px] font-mono ${!slugOk ? 'border-coral-600' : ''}`}
              value={slug}
              onChange={e => setSlug(e.target.value.toLowerCase())}
              placeholder="stgeorges"
              maxLength={63}
            />
            <span className="text-sm text-sand-500">.fair-do.com</span>
          </div>
          <p className={`text-xs mt-1 ${slugOk ? 'text-sand-400' : 'text-coral-600'}`}>
            {slugOk
              ? 'Lowercase letters, numbers and dashes. Changing this changes your portal address.'
              : 'Only lowercase letters, numbers and dashes; no leading or trailing dash.'}
          </p>
        </div>

        {/* Logo */}
        <div>
          <label className={fieldLabel}>School logo</label>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-sand-50 border border-sand-200 flex items-center justify-center overflow-hidden shrink-0">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt="Logo preview" className="w-full h-full object-contain p-1" />
              ) : (
                <span className="text-xs text-sand-400 text-center px-1">No logo</span>
              )}
            </div>
            <div>
              <button
                type="button"
                onClick={openLogoWidget}
                disabled={!widgetReady || !CLOUD}
                className="bg-brand-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-brand-700 transition disabled:opacity-50"
              >
                {logoUrl ? 'Change logo' : 'Upload logo'}
              </button>
              {logoUrl && (
                <button
                  type="button"
                  onClick={() => setLogoUrl('')}
                  className="ml-2 text-sm text-sand-400 hover:text-coral-500 transition"
                >
                  Remove
                </button>
              )}
              <p className="text-xs text-sand-400 mt-1.5">PNG or SVG with transparent background works best.</p>
            </div>
          </div>
        </div>

        {/* Colours */}
        <ColourField
          label="Brand colour"
          hint="We derive your portal's full palette from this one colour."
          value={brandColor}
          onChange={setBrandColor}
          fallback="#4f46e5"
        />
        <ColourField
          label="Accent colour — optional"
          hint="Highlights and calls-to-action. Leave blank to keep fair-do amber."
          value={accentColor}
          onChange={setAccentColor}
          fallback="#f59e0b"
        />

        {/* Welcome message */}
        <div>
          <label className={fieldLabel} htmlFor="branding-welcome">
            Welcome message <span className="text-sand-400 font-normal">— optional, shown on your portal home</span>
          </label>
          <textarea
            id="branding-welcome"
            className={`${input} min-h-[90px]`}
            value={welcomeMessage}
            onChange={e => setWelcomeMessage(e.target.value)}
            maxLength={500}
            placeholder="Welcome to our tutoring portal. Book sessions with our approved tutors…"
          />
          <p className="text-xs text-sand-400 mt-1">{welcomeMessage.length}/500 · plain text</p>
        </div>

        {/* Footer line */}
        <div>
          <label className={fieldLabel} htmlFor="branding-footer">
            Footer line <span className="text-sand-400 font-normal">— optional, shown on emails</span>
          </label>
          <input
            id="branding-footer"
            className={input}
            value={footerLine}
            onChange={e => setFooterLine(e.target.value)}
            maxLength={200}
            placeholder="e.g. St George's School, 1 Chapel Lane, York · office@stgeorges.sch.uk"
          />
        </div>

        <div className="flex items-center gap-4 pt-4 border-t border-sand-100">
          <button
            type="button"
            onClick={save}
            disabled={saving || !slugOk}
            className="bg-brand-600 text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-brand-700 transition disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save branding'}
          </button>
          {msg && (
            <span className={`text-sm font-medium ${msg.includes('✓') ? 'text-brand-600' : 'text-coral-600'}`}>
              {msg}
            </span>
          )}
        </div>
      </div>

      {/* Live preview — client-side ramp from lib/theme, same maths as the portal */}
      <div className="bg-white rounded-xl border border-sand-200 p-6 space-y-5">
        <p className="text-xs font-semibold text-sand-400 uppercase tracking-wider">Preview</p>

        <div>
          <p className="text-xs text-sand-500 mb-2">Palette derived from your brand colour</p>
          <div className="flex rounded-lg overflow-hidden border border-sand-200">
            {SWATCH_STEPS.map(step => (
              <div
                key={step}
                title={`brand-${step}`}
                className="h-9 flex-1"
                style={{ backgroundColor: ramp ? ramp[step] : undefined }}
              />
            ))}
          </div>
          {!ramp && <p className="text-xs text-sand-400 mt-1.5">Pick a brand colour to see your palette.</p>}
        </div>

        {/* Mini portal mock */}
        <div className="rounded-2xl border border-sand-200 overflow-hidden">
          <div className="px-4 py-3 flex items-center justify-between border-b" style={{ backgroundColor: ramp?.[50] ?? '#f8f7f4', borderColor: ramp?.[100] ?? '#e6e4dd' }}>
            <span className="flex items-center gap-2">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt="" className="h-6 max-w-[100px] object-contain" />
              ) : (
                <span className="text-sm font-semibold" style={{ color: ramp?.[900] ?? '#312e81' }}>{schoolName}</span>
              )}
              <span className="text-[9px] leading-tight text-sand-400">powered by<br />fair-do</span>
            </span>
            <span
              className="text-xs font-medium text-white rounded-full px-3 py-1.5"
              style={{ backgroundColor: ramp?.[600] ?? '#4f46e5' }}
            >
              Book a lesson
            </span>
          </div>
          <div className="px-4 py-4 bg-white">
            <p className="text-sm font-semibold" style={{ color: ramp?.[900] ?? '#312e81' }}>{schoolName} tutoring portal</p>
            {welcomeMessage ? (
              <p className="text-xs text-sand-600 mt-1 whitespace-pre-line">{welcomeMessage}</p>
            ) : (
              <p className="text-xs text-sand-400 mt-1">Your welcome message appears here.</p>
            )}
            <span
              className="inline-block mt-3 text-[11px] font-semibold rounded-full px-2.5 py-1"
              style={{ backgroundColor: accentRamp?.[100] ?? '#fef3c7', color: accentRamp?.[600] ?? '#d97706' }}
            >
              Highlight
            </span>
          </div>
          <div className="px-4 py-2.5 bg-sand-50 border-t border-sand-100">
            {footerLine && <p className="text-[10px] text-sand-500">{footerLine}</p>}
            <p className="text-[10px] text-sand-400">Powered by fair-do</p>
          </div>
        </div>

        <p className="text-xs text-sand-400">
          Emails to your students and parents use the same logo, colour and footer line.
        </p>
      </div>
    </div>
  )
}

function ColourField({
  label,
  hint,
  value,
  onChange,
  fallback,
}: {
  label: string
  hint: string
  value: string
  onChange: (v: string) => void
  fallback: string
}) {
  const pickerValue = HEX_RE.test(value) ? value : fallback
  return (
    <div>
      <label className="block text-sm font-medium text-sand-700 mb-1.5">{label}</label>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={pickerValue}
          onChange={e => onChange(e.target.value)}
          className="w-10 h-10 rounded-lg border border-sand-200 cursor-pointer p-0.5 bg-white"
          aria-label={`${label} picker`}
        />
        <input
          type="text"
          value={value}
          onChange={e => {
            if (/^#?[0-9a-fA-F]{0,6}$/.test(e.target.value)) onChange(e.target.value)
          }}
          maxLength={7}
          placeholder={fallback}
          className="w-28 border border-sand-300 rounded-xl px-3 py-2 text-sand-900 text-sm font-mono bg-white focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition"
        />
        <span className="text-xs text-sand-400">{hint}</span>
      </div>
    </div>
  )
}
