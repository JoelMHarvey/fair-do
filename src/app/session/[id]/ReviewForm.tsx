'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ReviewForm({ sessionId, therapistName }: { sessionId: string; therapistName: string }) {
  const router = useRouter()
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function submit() {
    setBusy(true)
    setError('')
    const res = await fetch('/api/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, rating, comment: comment.trim() || undefined }),
    })
    if (res.ok) { setDone(true); router.refresh() }
    else { const d = await res.json().catch(() => ({})); setError(d.error ?? 'Could not submit') ; setBusy(false) }
  }

  if (done) {
    return <p className="text-sm text-brand-200 text-center">Thank you — your feedback helps other clients.</p>
  }

  return (
    <div className="bg-brand-800 border border-brand-700 rounded-2xl p-5 max-w-sm mx-auto text-center">
      <p className="text-white font-medium mb-3">How was your session with {therapistName}?</p>
      <div className="flex justify-center gap-1 mb-4">
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setRating(n)}
            className={`text-3xl transition ${(hover || rating) >= n ? 'text-amber-300' : 'text-brand-600'}`}
            aria-label={`${n} star${n > 1 ? 's' : ''}`}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={e => setComment(e.target.value)}
        placeholder="Anything you'd like to add? (optional)"
        rows={3}
        className="w-full bg-brand-900/50 border border-brand-700 rounded-xl px-3 py-2 text-sm text-white placeholder:text-brand-100/40 focus:outline-none focus:ring-2 focus:ring-brand-500 mb-3"
      />
      {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
      <button
        onClick={submit}
        disabled={rating === 0 || busy}
        className="w-full bg-white text-brand-900 py-2.5 rounded-full text-sm font-medium hover:bg-brand-50 transition disabled:opacity-40"
      >
        {busy ? 'Submitting…' : 'Submit review'}
      </button>
    </div>
  )
}
