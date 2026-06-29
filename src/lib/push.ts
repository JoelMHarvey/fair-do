import webpush from 'web-push'
import { prisma } from '@/lib/prisma'

let configured: boolean | null = null

function configure(): boolean {
  if (configured !== null) return configured
  const pub = process.env.VAPID_PUBLIC_KEY
  const priv = process.env.VAPID_PRIVATE_KEY
  if (!pub || !priv) { configured = false; return false }
  webpush.setVapidDetails(process.env.VAPID_SUBJECT ?? 'mailto:support@fair-do.com', pub, priv)
  configured = true
  return true
}

export type PushPayload = { title: string; body: string; url?: string }

// Send a web-push to every device a user has subscribed. Silently no-ops if VAPID
// isn't configured; prunes dead subscriptions (404/410). Never throws to the caller.
async function sendWebPush(clerkId: string, payload: PushPayload): Promise<void> {
  if (!configure()) return
  const subs = await prisma.pushSubscription.findMany({ where: { clerkId } }).catch(() => [])
  await Promise.all(subs.map(async (s) => {
    try {
      await webpush.sendNotification(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        JSON.stringify(payload),
      )
    } catch (e) {
      const code = (e as { statusCode?: number }).statusCode
      if (code === 404 || code === 410) {
        await prisma.pushSubscription.delete({ where: { endpoint: s.endpoint } }).catch(() => {})
      }
    }
  }))
}

// Send via Expo Push Notifications service — covers APNs (iOS) and FCM (Android).
// Tokens are ExponentPushToken[...] strings registered by the native app.
// Prunes tokens that Expo reports as invalid. Never throws to the caller.
async function sendExpoPush(clerkId: string, payload: PushPayload): Promise<void> {
  const devices = await prisma.nativeDevice.findMany({ where: { clerkId } }).catch(() => [])
  if (devices.length === 0) return

  type ExpoMessage = { to: string; title: string; body: string; data?: Record<string, string> }
  const messages: ExpoMessage[] = devices.map(d => ({
    to: d.token,
    title: payload.title,
    body: payload.body,
    ...(payload.url ? { data: { url: payload.url } } : {}),
  }))

  try {
    const res = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(messages),
    })
    if (!res.ok) return

    const json = await res.json() as { data: Array<{ status: string; details?: { error?: string } }> }
    const results = Array.isArray(json.data) ? json.data : []

    // Prune invalid/unregistered tokens
    const toDelete: string[] = []
    results.forEach((r, i) => {
      if (r.status === 'error') {
        const err = r.details?.error
        if (err === 'DeviceNotRegistered' || err === 'InvalidCredentials') {
          if (devices[i]) toDelete.push(devices[i].token)
        }
      }
    })
    if (toDelete.length > 0) {
      await prisma.nativeDevice.deleteMany({ where: { token: { in: toDelete } } }).catch(() => {})
    }
  } catch {
    // Non-blocking — push failure never breaks the caller
  }
}

// Send to all of a user's devices (web-push + native). Both paths are non-blocking.
export async function sendPushToClerkId(clerkId: string, payload: PushPayload): Promise<void> {
  await Promise.all([
    sendWebPush(clerkId, payload),
    sendExpoPush(clerkId, payload),
  ])
}
