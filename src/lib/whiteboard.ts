import 'server-only'
import { createHash } from 'crypto'

// Interactive whiteboard (P2-1). A collaborative Excalidraw room shared by the
// teacher and student during a lesson. The room id + end-to-end key are derived
// deterministically from the session id + a server secret, so both participants
// open the exact same board without any stored state. Ships behind a flag.
export const WHITEBOARD_ENABLED = process.env.WHITEBOARD_ENABLED === 'true'

// excalidraw.com blocks being iframed; self-hosting (EXCALIDRAW_SERVER_URL) allows
// an embedded board. Either way the URL is the same shape.
export function whiteboardUrl(sessionId: string): string | null {
  if (!WHITEBOARD_ENABLED) return null
  const secret = process.env.EXCALIDRAW_ROOM_SECRET ?? 'fair-do-default-secret'
  const base = (process.env.EXCALIDRAW_SERVER_URL ?? 'https://excalidraw.com').replace(/\/$/, '')
  // 20-hex room id (doesn't leak the session id) + 22-char base64url E2E key.
  const roomId = createHash('sha256').update(`room:${sessionId}:${secret}`).digest('hex').slice(0, 20)
  const key = createHash('sha256').update(`key:${sessionId}:${secret}`).digest('base64url').slice(0, 22)
  return `${base}/#room=${roomId},${key}`
}

// True when a self-hosted (embeddable) Excalidraw is configured.
export function whiteboardEmbeddable(): boolean {
  return WHITEBOARD_ENABLED && !!process.env.EXCALIDRAW_SERVER_URL
}
