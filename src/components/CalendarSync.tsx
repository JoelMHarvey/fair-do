'use client'

import { useState } from 'react'

// Shows the therapist's private calendar-subscribe URL + how to add it to Google/Apple/Outlook.
export function CalendarSync({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)
  const [open, setOpen] = useState(false)
  const webcal = url.replace(/^https?:\/\//, 'webcal://')

  function copy() {
    navigator.clipboard?.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    }).catch(() => {})
  }

  return (
    <section className="bg-white rounded-2xl border border-sand-200 shadow-sm p-5 mb-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-base font-semibold text-brand-900">📅 Sync your calendar</h2>
          <p className="text-sand-500 text-sm mt-0.5">See your fair-do lessons in Google, Apple or Outlook — they update automatically.</p>
        </div>
        <button onClick={() => setOpen(v => !v)} className="text-sm font-medium text-brand-700 hover:text-brand-800 shrink-0">
          {open ? 'Hide' : 'Set up'}
        </button>
      </div>

      {open && (
        <div className="mt-4">
          <div className="flex gap-2">
            <input
              readOnly
              value={url}
              onFocus={e => e.currentTarget.select()}
              className="flex-1 min-w-0 rounded-lg border border-sand-200 bg-sand-50 px-3 py-2 text-xs text-sand-700"
            />
            <button onClick={copy} className="shrink-0 bg-brand-600 text-white text-sm font-medium px-3 py-2 rounded-lg hover:bg-brand-700 transition">
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <div className="mt-3 text-xs text-sand-600 space-y-1.5 leading-relaxed">
            <p><strong>Apple Calendar:</strong> <a href={webcal} className="text-brand-700 underline">tap to add</a>, or Settings → Calendar → Add Account → Subscribed Calendar → paste the link.</p>
            <p><strong>Google Calendar:</strong> Other calendars → <em>+</em> → From URL → paste the link.</p>
            <p><strong>Outlook:</strong> Add calendar → Subscribe from web → paste the link.</p>
          </div>
          <p className="mt-3 text-xs text-sand-400">Keep this link private — anyone with it can see your lesson times.</p>
        </div>
      )}
    </section>
  )
}
