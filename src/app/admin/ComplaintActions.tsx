'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ComplaintActions({ complaintId, currentStatus }: { complaintId: string; currentStatus: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  async function setStatus(status: string) {
    setBusy(true)
    await fetch('/api/admin/complaint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ complaintId, status }),
    })
    router.refresh()
    setBusy(false)
  }

  return (
    <div className="flex flex-col gap-2 shrink-0">
      {currentStatus === 'open' && (
        <button
          onClick={() => setStatus('reviewing')}
          disabled={busy}
          className="text-xs px-3 py-1.5 rounded-lg bg-amber-100 text-amber-700 font-medium hover:bg-amber-200 transition disabled:opacity-50"
        >
          Mark reviewing
        </button>
      )}
      <button
        onClick={() => setStatus('resolved')}
        disabled={busy}
        className="text-xs px-3 py-1.5 rounded-lg bg-brand-100 text-brand-700 font-medium hover:bg-brand-200 transition disabled:opacity-50"
      >
        Resolve
      </button>
    </div>
  )
}
