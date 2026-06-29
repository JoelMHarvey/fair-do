'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Auto-refreshes the session page while the Daily room is still being created.
export default function RoomPoll() {
  const router = useRouter()
  useEffect(() => {
    const t = setInterval(() => router.refresh(), 6000)
    return () => clearInterval(t)
  }, [router])
  return null
}
