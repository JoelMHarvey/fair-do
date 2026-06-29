'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

// Quietly re-renders the server component on an interval so the dashboard stays live.
export default function HealthAutoRefresh({ seconds = 60 }: { seconds?: number }) {
  const router = useRouter()
  const [on, setOn] = useState(true)
  useEffect(() => {
    if (!on) return
    const id = setInterval(() => router.refresh(), seconds * 1000)
    return () => clearInterval(id)
  }, [on, seconds, router])
  return (
    <button onClick={() => setOn(v => !v)} className="text-xs text-sand-500 hover:text-brand-700 underline">
      {on ? `Auto-refresh on (${seconds}s)` : 'Auto-refresh off'}
    </button>
  )
}
