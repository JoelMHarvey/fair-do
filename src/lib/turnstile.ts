// Cloudflare Turnstile server-side verification. Env-gated: if TURNSTILE_SECRET_KEY
// is unset, verification is skipped (returns true) so local/preview work without it.
// When configured, a missing/invalid token is rejected.
export async function verifyTurnstile(token: string | undefined | null, ip?: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return true // not configured → don't block
  if (!token) return false
  try {
    const body = new URLSearchParams({ secret, response: token })
    if (ip && ip !== 'unknown') body.set('remoteip', ip)
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST', body, signal: AbortSignal.timeout(8000),
    })
    const data = (await res.json()) as { success?: boolean }
    return data.success === true
  } catch (e) {
    console.error('[turnstile] verify failed', e)
    return false
  }
}
