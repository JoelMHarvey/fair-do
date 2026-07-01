const DAILY_API = 'https://api.daily.co/v1'

export async function createRoom(sessionId: string, scheduledAt: Date, maxParticipants = 2): Promise<{ name: string; url: string }> {
  const apiKey = process.env.DAILY_API_KEY
  if (!apiKey || apiKey === '...') throw new Error('DAILY_API_KEY not configured')

  // Room expires 3 hours after scheduled time
  const exp = Math.floor(scheduledAt.getTime() / 1000) + 3 * 60 * 60

  const res = await fetch(`${DAILY_API}/rooms`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      name: `fair-do-${sessionId}`,
      // Private: a valid meeting token is required to join, so a leaked room URL alone
      // cannot admit a stranger to a therapy session. Tokens are minted per participant
      // in the session page (createMeetingToken).
      privacy: 'private',
      properties: {
        exp,
        enable_chat: true,
        enable_screenshare: false,
        enable_knocking: false,
        max_participants: maxParticipants,
        lang: 'en',
        // Transcription (P2-4) — off unless explicitly enabled on the Daily account.
        // Stored transcript is fetched by the meeting-ended webhook (ingestTranscript).
        ...(process.env.DAILY_TRANSCRIPTION_ENABLED === 'true'
          ? { enable_transcription_storage: true, auto_start_transcription: true }
          : {}),
      },
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Daily.co error: ${res.status} ${text}`)
  }

  const data = await res.json()
  return { name: data.name as string, url: data.url as string }
}

// A meeting token carries the participant's identity so the webhook can tell
// client from therapist. user_id is prefixed: "client_<id>" / "therapist_<id>".
export async function createMeetingToken(opts: {
  roomName: string
  userId: string
  userName: string
}): Promise<string | null> {
  const apiKey = process.env.DAILY_API_KEY
  if (!apiKey || apiKey === '...') return null
  try {
    const res = await fetch(`${DAILY_API}/meeting-tokens`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ properties: { room_name: opts.roomName, user_id: opts.userId, user_name: opts.userName } }),
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.token as string
  } catch {
    return null
  }
}

// ── Transcription (P2-4) ─────────────────────────────────────────────────────

function safeJson(s: string): unknown | null {
  try { return JSON.parse(s) } catch { return null }
}

// Flatten a Daily transcript (JSON or WebVTT/SRT) to plain text for the AI prompt.
function flattenTranscript(text: string): string {
  const json = safeJson(text)
  if (json) {
    const out: string[] = []
    const walk = (v: unknown) => {
      if (!v) return
      if (Array.isArray(v)) return v.forEach(walk)
      if (typeof v === 'object') {
        const o = v as Record<string, unknown>
        const t = o.text ?? o.transcript ?? o.value
        if (typeof t === 'string') out.push(t)
        else Object.values(o).forEach(walk)
      }
    }
    walk(json)
    if (out.length) return out.join(' ').replace(/\s+/g, ' ').trim()
  }
  // VTT/SRT/plain: drop headers, cue numbers, and timestamp lines.
  return text
    .split(/\r?\n/)
    .filter(l => l.trim() && l.trim() !== 'WEBVTT' && !l.includes('-->') && !/^\d+$/.test(l.trim()))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// Fetch a finished transcript by id (from the Daily `transcript.ready` webhook).
// Returns the raw payload + flattened plain text, or null on any failure.
export async function fetchDailyTranscript(transcriptId: string): Promise<{ rawJson: unknown; plainText: string } | null> {
  const apiKey = process.env.DAILY_API_KEY
  if (!apiKey || apiKey === '...') return null
  try {
    const linkRes = await fetch(`${DAILY_API}/transcript/${transcriptId}/access-link`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    })
    if (!linkRes.ok) return null
    const { link } = (await linkRes.json()) as { link?: string }
    if (!link) return null
    const contentRes = await fetch(link)
    if (!contentRes.ok) return null
    const text = await contentRes.text()
    return { rawJson: safeJson(text) ?? text, plainText: flattenTranscript(text) }
  } catch (e) {
    console.error('[daily] transcript fetch failed:', e instanceof Error ? e.message : e)
    return null
  }
}
