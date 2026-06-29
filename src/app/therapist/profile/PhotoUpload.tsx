'use client'

import { useEffect, useState } from 'react'
import { styledCloudinaryUrl } from '@/lib/cloudinary'

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

const STYLES = [
  { key: 'original', label: 'Photo', hint: 'Your real photo' },
  { key: 'blurred', label: 'Blurred', hint: 'Soft privacy' },
  { key: 'illustrated', label: 'Illustrated', hint: 'Drawn look' },
] as const

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare global { interface Window { cloudinary?: any } }

export default function PhotoUpload({
  baseUrl, style, onChange,
}: {
  baseUrl: string
  style: string
  onChange: (baseUrl: string, style: string) => void
}) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (window.cloudinary) { setReady(true); return }
    const s = document.createElement('script')
    s.src = 'https://upload-widget.cloudinary.com/global/all.js'
    s.onload = () => setReady(true)
    document.body.appendChild(s)
  }, [])

  function openWidget() {
    if (!window.cloudinary || !CLOUD || !PRESET) return
    window.cloudinary.createUploadWidget(
      { cloudName: CLOUD, uploadPreset: PRESET, sources: ['local', 'camera', 'url'], multiple: false, cropping: true, croppingAspectRatio: 1, folder: 'faresay/therapists' },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (err: any, result: any) => {
        if (!err && result?.event === 'success') onChange(result.info.secure_url, style || 'original')
      },
    ).open()
  }

  if (!CLOUD || !PRESET) {
    return (
      <div className="rounded-xl bg-sand-50 border border-sand-200 p-4 text-sm text-sand-500">
        Photo upload isn&apos;t configured yet. Add <code>NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME</code> and{' '}
        <code>NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET</code> (see docs/LAUNCH.md).
      </div>
    )
  }

  const preview = styledCloudinaryUrl(baseUrl, style)

  return (
    <div className="flex items-start gap-5">
      <div className="w-24 h-24 rounded-2xl bg-brand-100 overflow-hidden flex items-center justify-center shrink-0 border border-sand-200">
        {preview ? <img src={preview} alt="" className="w-full h-full object-cover" /> : <span className="text-sand-400 text-xs text-center px-2">No photo</span>}
      </div>
      <div className="flex-1">
        <button
          type="button"
          onClick={openWidget}
          disabled={!ready}
          className="bg-brand-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-brand-700 transition disabled:opacity-50"
        >
          {baseUrl ? 'Change photo' : 'Upload photo'}
        </button>
        {baseUrl && (
          <>
            <p className="text-xs text-sand-500 mt-3 mb-1.5">Style — privacy is yours to choose:</p>
            <div className="flex gap-2">
              {STYLES.map(s => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => onChange(baseUrl, s.key)}
                  className={`px-3 py-1.5 rounded-full text-xs border transition ${
                    (style || 'original') === s.key ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-sand-200 text-sand-600 hover:border-brand-300'
                  }`}
                  title={s.hint}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
