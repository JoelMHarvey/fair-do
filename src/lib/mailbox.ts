import { ImapFlow } from 'imapflow'
import { simpleParser } from 'mailparser'

// Unread count for a support mailbox over IMAP. Env-gated: returns
// { configured: false } and never throws if IMAP_* aren't set.
//
// Gmail (once support@faresay.com routes there): IMAP_HOST=imap.gmail.com,
// IMAP_PORT=993, IMAP_USER=support@faresay.com, IMAP_PASSWORD=<app password>
// (requires 2FA + an App Password; the normal account password won't work).

export type MailboxStats = { configured: boolean; unread?: number; total?: number; error?: string }

function cfg() {
  const host = process.env.IMAP_HOST
  const user = process.env.IMAP_USER
  const pass = process.env.IMAP_PASSWORD
  if (!host || !user || !pass) return null
  return { host, user, pass, port: Number(process.env.IMAP_PORT ?? 993), mailbox: process.env.IMAP_MAILBOX ?? 'INBOX' }
}

export async function getSupportMailboxStats(): Promise<MailboxStats> {
  const c = cfg()
  if (!c) return { configured: false }
  const client = new ImapFlow({
    host: c.host, port: c.port, secure: true,
    auth: { user: c.user, pass: c.pass },
    logger: false,
    socketTimeout: 10000,
  })
  try {
    await client.connect()
    // STATUS doesn't need the mailbox selected — avoid a redundant SELECT/lock.
    const status = await client.status(c.mailbox, { messages: true, unseen: true })
    return { configured: true, unread: status.unseen ?? 0, total: status.messages ?? 0 }
  } catch (e) {
    console.error('[mailbox] imap failed', e)
    // Generic code only — never echo host/username/connection text into a response.
    const msg = (e instanceof Error ? e.message : String(e)).toLowerCase()
    const code = msg.includes('auth') || msg.includes('login') || msg.includes('credential')
      ? 'auth_failed'
      : msg.includes('timeout') ? 'timeout' : 'connection_failed'
    return { configured: true, error: code }
  } finally {
    await client.logout().catch(() => {})
  }
}

export type InboundEmail = {
  uid: number
  messageId: string | null
  from: string
  to: string
  subject: string
  text: string
}

// Process unseen mail one at a time. The handler returns true when the message has been
// dealt with — only then is it marked \Seen, so a crash leaves mail to retry, never drops
// it. Capped per run. No-ops (configured:false) when IMAP_* aren't set.
export async function processUnseen(
  handler: (e: InboundEmail) => Promise<boolean>,
  cap = 25,
): Promise<{ configured: boolean; processed: number }> {
  const c = cfg()
  if (!c) return { configured: false, processed: 0 }
  const client = new ImapFlow({
    host: c.host, port: c.port, secure: true,
    auth: { user: c.user, pass: c.pass }, logger: false, socketTimeout: 20000,
  })
  let processed = 0
  try {
    await client.connect()
    const lock = await client.getMailboxLock(c.mailbox)
    try {
      const uids = (await client.search({ seen: false }, { uid: true })) || []
      for (const uid of uids.slice(0, cap)) {
        const msg = await client.fetchOne(String(uid), { source: true, envelope: true }, { uid: true })
        if (!msg || !msg.source) continue
        const parsed = await simpleParser(msg.source as Buffer)
        const email: InboundEmail = {
          uid,
          messageId: parsed.messageId ?? msg.envelope?.messageId ?? null,
          from: parsed.from?.value?.[0]?.address ?? msg.envelope?.from?.[0]?.address ?? '',
          to: parsed.to && !Array.isArray(parsed.to) ? (parsed.to.value?.[0]?.address ?? '') : '',
          subject: parsed.subject ?? msg.envelope?.subject ?? '',
          text: (parsed.text ?? '').slice(0, 8000),
        }
        const ok = await handler(email)
        if (ok) { await client.messageFlagsAdd(String(uid), ['\\Seen'], { uid: true }); processed++ }
      }
    } finally {
      lock.release()
    }
  } catch (e) {
    console.error('[mailbox] processUnseen failed', e)
  } finally {
    await client.logout().catch(() => {})
  }
  return { configured: true, processed }
}
