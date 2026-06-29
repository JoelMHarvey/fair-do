'use client'

import { useEffect, useState } from 'react'

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare global { interface Window { cloudinary?: any } }

type BrandInitial = {
  practiceName: string
  brandEnabled: boolean
  brandLogoUrl: string
  brandColor: string
  brandFooterLine: string
  replyToEmail: string
}

export default function BrandingCard({
  isPaid,
  initial,
}: {
  isPaid: boolean
  initial: BrandInitial
}) {
  const [enabled, setEnabled] = useState(initial.brandEnabled)
  const [logoUrl, setLogoUrl] = useState(initial.brandLogoUrl)
  const [color, setColor] = useState(initial.brandColor || '#217567')
  const [footerLine, setFooterLine] = useState(initial.brandFooterLine)
  const [replyTo, setReplyTo] = useState(initial.replyToEmail)
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
          folder: 'faresay/logos',
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (err: any, result: any) => {
          if (!err && result?.event === 'success') setLogoUrl(result.info.secure_url)
        },
      )
      .open()
  }

  async function save() {
    setSaving(true)
    setMsg('')
    const res = await fetch('/api/therapist/brand', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        brandEnabled: enabled,
        brandLogoUrl: logoUrl,
        brandColor: color,
        brandFooterLine: footerLine,
        replyToEmail: replyTo,
      }),
    })
    const d = await res.json().catch(() => ({}))
    if (res.ok) setMsg('Saved ✓')
    else setMsg(d.error ?? 'Something went wrong')
    setSaving(false)
  }

  const input =
    'w-full border border-sand-300 rounded-xl px-4 py-2.5 text-sand-900 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition'
  const fieldLabel = 'block text-sm font-medium text-sand-700 mb-1.5'

  if (!isPaid) {
    return (
      <div className="bg-white rounded-3xl border border-sand-200 p-6 shadow-sm">
        <h2 className="font-display text-lg font-semibold text-brand-900 mb-1">Email branding</h2>
        <p className="text-sm text-sand-500 mb-4">Add your logo and colours to every client email.</p>
        <div className="rounded-2xl bg-gradient-to-br from-brand-50 to-sand-50 border border-brand-100 p-5">
          <p className="text-sm font-semibold text-brand-800 mb-1">Make your emails yours</p>
          <p className="text-sm text-sand-600 mb-4">
            Upgrade to Practice or Clinic to add your logo, accent colour, and reply-to address to every client email.
          </p>
          <a
            href="/therapist/billing"
            className="inline-block bg-brand-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-brand-700 transition"
          >
            Upgrade plan →
          </a>
        </div>
      </div>
    )
  }

  const previewColor = /^#[0-9a-fA-F]{6}$/.test(color) ? color : '#217567'

  return (
    <div className="bg-white rounded-3xl border border-sand-200 p-6 shadow-sm">
      <div className="flex items-start justify-between mb-1">
        <div>
          <h2 className="font-display text-lg font-semibold text-brand-900">Email branding</h2>
          <p className="text-sm text-sand-500 mt-0.5">Your logo and colours on every client email.</p>
        </div>
        {/* Toggle */}
        <label className="flex items-center gap-2 cursor-pointer shrink-0 mt-0.5">
          <span className="text-sm text-sand-600">Enable</span>
          <div
            role="switch"
            aria-checked={enabled}
            onClick={() => setEnabled(v => !v)}
            className={`relative w-10 h-6 rounded-full transition cursor-pointer ${enabled ? 'bg-brand-600' : 'bg-sand-300'}`}
          >
            <span
              className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-5' : 'translate-x-1'}`}
            />
          </div>
        </label>
      </div>

      <div className={`space-y-4 mt-5 transition-opacity ${!enabled ? 'opacity-40 pointer-events-none select-none' : ''}`}>
        {/* Logo upload */}
        <div>
          <label className={fieldLabel}>Practice logo</label>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-sand-50 border border-sand-200 flex items-center justify-center overflow-hidden shrink-0">
              {logoUrl ? (
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

        {/* Colour picker */}
        <div>
          <label className={fieldLabel}>Accent colour</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={previewColor}
              onChange={e => setColor(e.target.value)}
              className="w-10 h-10 rounded-lg border border-sand-200 cursor-pointer p-0.5 bg-white"
            />
            <input
              type="text"
              value={color}
              onChange={e => {
                if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) setColor(e.target.value)
              }}
              maxLength={7}
              placeholder="#217567"
              className="w-28 border border-sand-300 rounded-xl px-3 py-2 text-sand-900 text-sm font-mono bg-white focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition"
            />
            <span className="text-xs text-sand-400">Header bar and CTA button colour.</span>
          </div>
        </div>

        {/* Footer line */}
        <div>
          <label className={fieldLabel}>
            Footer line <span className="text-sand-400 font-normal">— optional</span>
          </label>
          <input
            className={input}
            value={footerLine}
            onChange={e => setFooterLine(e.target.value)}
            placeholder="e.g. 123 High Street, London W1A 1AA"
            maxLength={200}
          />
          <p className="text-xs text-sand-400 mt-1">Address, registration number, or short practice blurb.</p>
        </div>

        {/* Reply-to */}
        <div>
          <label className={fieldLabel}>
            Reply-to email <span className="text-sand-400 font-normal">— optional</span>
          </label>
          <input
            className={input}
            type="email"
            value={replyTo}
            onChange={e => setReplyTo(e.target.value)}
            placeholder="hello@yourpractice.com"
          />
          <p className="text-xs text-sand-400 mt-1">Client replies go here instead of a Faresay inbox.</p>
        </div>
      </div>

      {/* Live preview */}
      <div className="mt-6">
        <p className="text-xs font-semibold text-sand-400 uppercase tracking-wider mb-3">Preview</p>
        <EmailPreview
          color={previewColor}
          logoUrl={logoUrl}
          footerLine={footerLine}
          practiceName={initial.practiceName}
          enabled={enabled}
        />
      </div>

      <div className="flex items-center gap-4 mt-5 pt-5 border-t border-sand-100">
        <button
          type="button"
          onClick={save}
          disabled={saving}
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
  )
}

function EmailPreview({
  color,
  logoUrl,
  footerLine,
  practiceName,
  enabled,
}: {
  color: string
  logoUrl: string
  footerLine: string
  practiceName: string
  enabled: boolean
}) {
  if (!enabled) {
    return (
      <div className="rounded-2xl border border-sand-200 bg-sand-50 p-4 text-center text-sm text-sand-400">
        Branding off — clients see the default Faresay email.
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-sand-200 overflow-hidden text-xs">
      {/* Header */}
      <div style={{ backgroundColor: color }} className="px-5 py-4 flex items-center gap-3">
        {logoUrl ? (
          <img src={logoUrl} alt="" style={{ height: 32, maxWidth: 120, objectFit: 'contain' }} />
        ) : (
          <span className="text-white font-semibold" style={{ fontSize: 14 }}>
            {practiceName}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="bg-white px-5 py-4">
        <p className="font-semibold text-sand-900 mb-1" style={{ fontSize: 13 }}>
          Your session is confirmed
        </p>
        <p className="text-sand-500" style={{ fontSize: 12 }}>
          Monday 5 January, 10:00 · 50 minutes
        </p>
        <div className="mt-3">
          <span
            style={{
              backgroundColor: color,
              display: 'inline-block',
              borderRadius: 20,
              padding: '6px 16px',
              color: '#fff',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            View session
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-sand-50 px-5 py-3 border-t border-sand-100">
        {footerLine && (
          <p className="text-sand-500 mb-1" style={{ fontSize: 11 }}>
            {footerLine}
          </p>
        )}
        <p className="text-sand-400" style={{ fontSize: 11 }}>
          Powered by Faresay · In a crisis? Call 999 or NHS 111.
        </p>
      </div>
    </div>
  )
}
