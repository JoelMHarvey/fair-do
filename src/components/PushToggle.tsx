'use client'

import { useEffect, useState } from 'react'

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(b64)
  const arr = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i)
  return arr
}

// "Turn on notifications" for therapists — get a heads-up when a client messages or
// books, even when Faresay isn't open. Hides itself if the browser can't do push or
// the app isn't configured with a VAPID key.
export function PushToggle() {
  const [supported, setSupported] = useState(false)
  const [on, setOn] = useState(false)
  const [busy, setBusy] = useState(false)
  const vapid = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

  useEffect(() => {
    if (!vapid) return
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) return
    setSupported(true)
    navigator.serviceWorker.ready
      .then(reg => reg.pushManager.getSubscription())
      .then(sub => setOn(!!sub))
      .catch(() => {})
  }, [vapid])

  async function enable() {
    setBusy(true)
    try {
      const perm = await Notification.requestPermission()
      if (perm !== 'granted') { setBusy(false); return }
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapid!) as BufferSource,
      })
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: sub }),
      })
      setOn(true)
    } catch { /* ignore */ }
    setBusy(false)
  }

  async function disable() {
    setBusy(true)
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        })
        await sub.unsubscribe()
      }
      setOn(false)
    } catch { /* ignore */ }
    setBusy(false)
  }

  if (!supported) return null

  return (
    <div className="flex items-center justify-between gap-3 bg-white border border-sand-200 rounded-2xl px-4 py-3 mb-6">
      <div className="min-w-0">
        <p className="text-sm font-medium text-sand-900">🔔 Notifications</p>
        <p className="text-xs text-sand-500">{on ? 'On — we’ll alert you to new messages and bookings.' : 'Get alerted when a client messages or books, even when Faresay is closed.'}</p>
      </div>
      <button
        onClick={on ? disable : enable}
        disabled={busy}
        className={`shrink-0 text-sm font-medium px-4 py-2 rounded-full transition disabled:opacity-50 ${
          on ? 'border border-sand-200 text-sand-600 hover:bg-sand-50' : 'bg-brand-600 text-white hover:bg-brand-700'
        }`}
      >
        {busy ? '…' : on ? 'Turn off' : 'Turn on'}
      </button>
    </div>
  )
}
