'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CancelButton({ sessionId, refundable }: { sessionId: string; refundable: boolean }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function cancel() {
    setBusy(true)
    setError('')
    const res = await fetch(`/api/session/${sessionId}/cancel`, { method: 'POST' })
    if (res.ok) {
      const data = await res.json().catch(() => ({}))
      router.push(`/dashboard?cancelled=${data.refunded ? 'refunded' : '1'}`)
    } else {
      setError('Could not cancel. Please try again.')
      setBusy(false)
    }
  }

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="text-sm text-brand-100/70 hover:text-white underline underline-offset-2"
      >
        Cancel this lesson
      </button>
    )
  }

  return (
    <div className="bg-brand-800 border border-brand-700 rounded-2xl p-5 max-w-sm mx-auto text-center">
      <p className="text-white font-medium mb-1">Cancel this lesson?</p>
      {refundable ? (
        <p className="text-sm text-brand-200 mb-4">You&apos;re more than 24 hours ahead — you&apos;ll get a full refund.</p>
      ) : (
        <p className="text-sm text-amber-300 mb-4">
          This is within 24 hours of the lesson, so it&apos;s <strong>non-refundable</strong>. You won&apos;t be charged again, but no refund is issued.
        </p>
      )}
      {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={() => setConfirming(false)}
          disabled={busy}
          className="flex-1 py-2.5 rounded-xl border border-brand-600 text-brand-100 text-sm hover:bg-brand-700 transition disabled:opacity-50"
        >
          Keep lesson
        </button>
        <button
          onClick={cancel}
          disabled={busy}
          className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition disabled:opacity-50"
        >
          {busy ? 'Cancelling…' : refundable ? 'Cancel & refund' : 'Cancel anyway'}
        </button>
      </div>
    </div>
  )
}
