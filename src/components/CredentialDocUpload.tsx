'use client'

import { useState } from 'react'

const CLOUD  = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare global { interface Window { cloudinary?: any } }

export type ExtractionPreview = {
  extractedName: string | null
  extractedBody: string | null
  extractedRef:  string | null
  extractedExpiry: string | null // ISO string or null
  confidenceScore: number
  flags: string[]
  rawText: string
}

type Props = {
  // Current declared values — sent alongside the URL for comparison.
  name: string
  body: string
  qualRef: string
  // Callbacks
  onUploaded: (url: string, extraction: ExtractionPreview) => void
}

const FLAG_LABELS: Record<string, string> = {
  name_mismatch:  'Name on certificate doesn\'t match',
  ref_mismatch:   'Reference number doesn\'t match',
  body_mismatch:  'Qualification body doesn\'t match',
  expired:        'Certificate appears expired',
  unreadable:     'Couldn\'t read the document clearly',
}

export default function CredentialDocUpload({ name, body, qualRef, onUploaded }: Props) {
  const [loading, setLoading] = useState(false)
  const [extraction, setExtraction] = useState<ExtractionPreview | null>(null)
  const [docUrl, setDocUrl] = useState('')
  const [error, setError] = useState('')

  function openWidget() {
    if (!window.cloudinary || !CLOUD || !PRESET) return
    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName:  CLOUD,
        uploadPreset: PRESET,
        sources:    ['local', 'camera'],
        multiple:   false,
        resourceType: 'auto',  // accepts images + PDFs
        maxFileSize: 10_000_000, // 10 MB
        folder:     'fair-do/credentials',
        clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp', 'pdf'],
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async (err: any, result: any) => {
        if (err) { setError('Upload failed — please try again.'); return }
        if (result?.event !== 'success') return

        const url      = result.info.secure_url as string
        const fileName = result.info.original_filename as string

        setDocUrl(url)
        setLoading(true)
        setError('')
        setExtraction(null)

        try {
          const res = await fetch('/api/onboarding/teacher/credential-doc', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url, fileName, name, body, ref: qualRef }),
          })
          if (res.ok) {
            const data = await res.json() as { url: string; extraction: ExtractionPreview }
            setExtraction(data.extraction)
            onUploaded(data.url, data.extraction)
          } else {
            // Upload succeeded but extraction failed — still let them proceed.
            onUploaded(url, {
              extractedName: null, extractedBody: null, extractedRef: null,
              extractedExpiry: null, confidenceScore: 0, flags: ['unreadable'], rawText: '',
            })
          }
        } catch {
          setError('Could not analyse the document — you can still continue.')
          onUploaded(url, {
            extractedName: null, extractedBody: null, extractedRef: null,
            extractedExpiry: null, confidenceScore: 0, flags: ['unreadable'], rawText: '',
          })
        } finally {
          setLoading(false)
          widget.destroy()
        }
      },
    )
    widget.open()
  }

  const hasFlags = extraction && extraction.flags.length > 0 && !extraction.flags.every(f => f === 'unreadable')
  const confidence = extraction ? Math.round(extraction.confidenceScore * 100) : null
  const allOk = extraction && extraction.flags.length === 0

  if (!CLOUD || !PRESET) {
    return (
      <div className="rounded-xl bg-sand-50 border border-sand-200 p-4 text-sm text-sand-500">
        Document upload isn&apos;t configured (no Cloudinary preset). You can skip this step.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={openWidget}
          disabled={loading}
          className="bg-brand-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-brand-700 transition disabled:opacity-50"
        >
          {loading ? 'Analysing…' : docUrl ? 'Replace document' : 'Upload certificate'}
        </button>
        {docUrl && !loading && (
          <a
            href={docUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-brand-600 underline hover:text-brand-700"
          >
            View uploaded ↗
          </a>
        )}
      </div>

      {error && <p className="text-sm text-coral-600">{error}</p>}

      {extraction && (
        <div className={`rounded-xl border p-4 text-sm space-y-2 ${
          allOk ? 'border-brand-200 bg-brand-50/40' :
          hasFlags ? 'border-amber-200 bg-amber-50/40' :
          'border-sand-200 bg-sand-50/40'
        }`}>
          <div className="flex items-center justify-between">
            <span className="font-medium text-sand-800">Certificate analysis</span>
            {confidence !== null && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                confidence >= 80 ? 'bg-brand-100 text-brand-700' :
                confidence >= 50 ? 'bg-amber-100 text-amber-700' :
                'bg-red-100 text-red-700'
              }`}>
                {confidence}% match
              </span>
            )}
          </div>

          {extraction.flags.includes('unreadable') ? (
            <p className="text-sand-500">The document was difficult to read. An admin will review manually.</p>
          ) : (
            <div className="space-y-1 text-sand-700">
              {extraction.extractedName  && <p><span className="text-sand-400">Name:</span> {extraction.extractedName}</p>}
              {extraction.extractedBody  && <p><span className="text-sand-400">Body:</span> {extraction.extractedBody}</p>}
              {extraction.extractedRef   && <p><span className="text-sand-400">Ref:</span> {extraction.extractedRef}</p>}
              {extraction.extractedExpiry && (
                <p><span className="text-sand-400">Expiry:</span> {new Date(extraction.extractedExpiry).toLocaleDateString('en-GB')}</p>
              )}
            </div>
          )}

          {hasFlags && (
            <div className="space-y-1 pt-1">
              {extraction.flags.filter(f => f !== 'unreadable').map(f => (
                <p key={f} className="text-amber-700 text-xs flex items-center gap-1">
                  <span>⚠</span> {FLAG_LABELS[f] ?? f}
                </p>
              ))}
              <p className="text-xs text-sand-400">Please double-check the fields above match your certificate exactly.</p>
            </div>
          )}

          {allOk && (
            <p className="text-brand-700 text-xs">✓ Certificate details match your declaration.</p>
          )}
        </div>
      )}
    </div>
  )
}
