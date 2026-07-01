'use client'

import { useState } from 'react'

// Searchable + downloadable lesson transcript for the parent dashboard (P2-3).
// Download is plain text (no PDF dependency, per the repo's no-new-deps rule);
// the browser print dialog can save the opened transcript as PDF if needed.
export function TranscriptViewer({
  text,
  summaryLabel,
  searchPlaceholder,
  downloadLabel,
}: {
  text: string
  summaryLabel: string
  searchPlaceholder: string
  downloadLabel: string
}) {
  const [q, setQ] = useState('')
  const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean)
  const shown = q ? sentences.filter(s => s.toLowerCase().includes(q.toLowerCase())) : sentences

  function download() {
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'lesson-transcript.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <details className="mt-2">
      <summary className="text-xs text-brand-700 cursor-pointer">{summaryLabel}</summary>
      <div className="mt-2 space-y-2">
        <div className="flex gap-2">
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder={searchPlaceholder}
            className="flex-1 rounded-lg border border-sand-200 px-2.5 py-1.5 text-xs focus:border-brand-400 focus:outline-none"
          />
          <button onClick={download} className="text-xs text-brand-700 hover:text-brand-800 underline shrink-0">
            {downloadLabel}
          </button>
        </div>
        <p className="text-xs text-sand-600 whitespace-pre-wrap leading-relaxed">
          {shown.length ? shown.join(' ') : '—'}
        </p>
      </div>
    </details>
  )
}
