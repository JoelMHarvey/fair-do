'use client'

import { useState } from 'react'

// Shows the therapist their public self-booking link to share with clients.
export function BookingLinkCard({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard?.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1600) }).catch(() => {})
  }
  return (
    <div className="bg-white rounded-2xl border border-sand-200 shadow-sm p-5 mb-8">
      <h2 className="font-display text-base font-semibold text-brand-900">🔗 Your booking link</h2>
      <p className="text-sand-500 text-sm mt-0.5 mb-3">Share this so clients can book you directly — add it to your website, email signature or social bio.</p>
      <div className="flex gap-2">
        <input readOnly value={url} onFocus={e => e.currentTarget.select()} className="flex-1 min-w-0 rounded-lg border border-sand-200 bg-sand-50 px-3 py-2 text-xs text-sand-700" />
        <button onClick={copy} className="shrink-0 bg-brand-600 text-white text-sm font-medium px-3 py-2 rounded-lg hover:bg-brand-700 transition">{copied ? 'Copied' : 'Copy'}</button>
      </div>
    </div>
  )
}
