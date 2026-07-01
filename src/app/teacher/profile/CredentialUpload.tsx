'use client'

import { useEffect, useState } from 'react'

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare global { interface Window { cloudinary?: any } }

// Upload (or remove) a credential document/image (PDF or image). Persisted via
// /api/teacher/credential-doc. Shown to parents only if the teacher opts in on the
// credential-visibility toggle.
export default function CredentialUpload({ initialUrl }: { initialUrl: string | null }) {
  const [url, setUrl] = useState(initialUrl)
  const [ready, setReady] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (window.cloudinary) { setReady(true); return }
    const s = document.createElement('script')
    s.src = 'https://upload-widget.cloudinary.com/global/all.js'
    s.onload = () => setReady(true)
    document.body.appendChild(s)
  }, [])

  async function save(next: string | null) {
    setBusy(true)
    const res = await fetch('/api/teacher/credential-doc', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: next }),
    })
    setBusy(false)
    if (res.ok) setUrl(next)
    else alert('Could not save. Please try again.')
  }

  function openWidget() {
    if (!window.cloudinary || !CLOUD || !PRESET) return
    window.cloudinary.createUploadWidget(
      { cloudName: CLOUD, uploadPreset: PRESET, sources: ['local', 'camera', 'url'], multiple: false, resourceType: 'auto', folder: 'fair-do/credentials' },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (err: any, result: any) => { if (!err && result?.event === 'success') save(result.info.secure_url as string) },
    ).open()
  }

  if (!CLOUD || !PRESET) {
    return <p className="text-sm text-sand-500">Uploads aren&apos;t configured yet (Cloudinary env vars).</p>
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <button
        type="button" onClick={openWidget} disabled={!ready || busy}
        className="bg-brand-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-brand-700 transition disabled:opacity-50"
      >
        {url ? 'Replace certificate' : 'Upload certificate'}
      </button>
      {url && (
        <>
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-600 hover:text-brand-700 underline">View</a>
          <button type="button" onClick={() => save(null)} disabled={busy} className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50">Remove</button>
        </>
      )}
    </div>
  )
}
