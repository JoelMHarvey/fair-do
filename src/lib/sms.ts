// SMS via Twilio's REST API — no SDK, just a fetch with basic auth.
// Env-gated like lib/push: a complete no-op if Twilio isn't configured, and it
// never throws to the caller. Wire it anywhere; it stays dormant until the env
// vars are set in Vercel.
//
// Required env: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and a sender —
// either TWILIO_FROM (a Twilio number, E.164) or TWILIO_MESSAGING_SERVICE_SID.

let configured: boolean | null = null

function configure(): boolean {
  if (configured !== null) return configured
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  const sender = process.env.TWILIO_FROM || process.env.TWILIO_MESSAGING_SERVICE_SID
  configured = Boolean(sid && token && sender)
  return configured
}

// Best-effort UK-first normalisation to E.164. Returns null if it can't make
// a plausible number (we'd rather skip than send to a bad address).
export function toE164(raw: string | null | undefined): string | null {
  if (!raw) return null
  let s = raw.replace(/[^\d+]/g, '')
  if (!s) return null
  if (s.startsWith('+')) return /^\+\d{8,15}$/.test(s) ? s : null
  if (s.startsWith('00')) s = '+' + s.slice(2)
  else if (s.startsWith('0')) s = '+44' + s.slice(1) // assume UK national format
  else s = '+44' + s
  return /^\+\d{8,15}$/.test(s) ? s : null
}

// Send one SMS. Silently no-ops when Twilio isn't configured or the number is
// unusable. Returns true only if Twilio accepted the message. Never throws.
export async function sendSms(to: string | null | undefined, body: string): Promise<boolean> {
  if (!configure()) return false
  const dest = toE164(to)
  if (!dest) return false

  const sid = process.env.TWILIO_ACCOUNT_SID!
  const token = process.env.TWILIO_AUTH_TOKEN!
  const form = new URLSearchParams({ To: dest, Body: body })
  if (process.env.TWILIO_MESSAGING_SERVICE_SID) form.set('MessagingServiceSid', process.env.TWILIO_MESSAGING_SERVICE_SID)
  else form.set('From', process.env.TWILIO_FROM!)

  try {
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + Buffer.from(`${sid}:${token}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: form.toString(),
    })
    if (!res.ok) {
      console.error('[sms] Twilio rejected:', res.status, await res.text().catch(() => ''))
      return false
    }
    return true
  } catch (e) {
    console.error('[sms] send failed:', e)
    return false
  }
}
