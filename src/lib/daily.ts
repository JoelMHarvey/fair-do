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
      name: `faresay-${sessionId}`,
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
