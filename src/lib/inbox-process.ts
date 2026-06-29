import { Resend } from 'resend'
import { prisma } from './prisma'
import { processUnseen, type InboundEmail } from './mailbox'
import { getInboxAgentLevel } from './settings'
import { triage, decideAction, agentConfigured } from './inbox-agent'
import { sendOpsAlert } from './email'
import { sendPushToClerkId } from './push'

// Orchestrates the inbox agent: poll unseen support mail, triage it, then draft / send /
// escalate per the action policy. Runs only when the level is above "off" (cron entry).

const SUPPORT_FROM = process.env.RESEND_FROM ?? 'fair-do Support <support@fair-do.com>'
const FOUNDER_EMAIL = (process.env.FOUNDER_EMAIL ?? 'joelmharvey@gmail.com').toLowerCase()
const OPS_TO = process.env.ALERT_EMAIL || process.env.FOUNDER_EMAIL || 'joelmharvey@gmail.com'

const FARESAY_ALIASES = ['support', 'hello', 'enquiries']
export function aliasOf(to: string): string {
  const local = (to.split('@')[0] || '').toLowerCase()
  return FARESAY_ALIASES.includes(local) ? local : 'support'
}

async function resolveRole(email: string): Promise<'teacher' | 'student' | 'unknown'> {
  const lc = email.toLowerCase()
  try {
    const user = await prisma.user.findUnique({ where: { email: lc }, include: { teacher: true, student: true } })
    if (user?.teacher) return 'teacher'
    if (user?.student) return 'student'
    const managed = await prisma.student.findFirst({ where: { contactEmail: { equals: lc, mode: 'insensitive' } }, select: { id: true } })
    if (managed) return 'student'
  } catch { /* fall through to unknown */ }
  return 'unknown'
}

function replyHtml(text: string): string {
  const esc = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return `<div style="font-family:Helvetica,Arial,sans-serif;font-size:15px;color:#2e2920;line-height:1.6;white-space:pre-wrap">${esc}

— fair-do Support</div>`
}

async function sendReply(email: InboundEmail, body: string): Promise<void> {
  const resend = new Resend(process.env.RESEND_API_KEY)
  const subject = email.subject.toLowerCase().startsWith('re:') ? email.subject : `Re: ${email.subject || 'your message'}`
  const { error } = await resend.emails.send({
    from: SUPPORT_FROM,
    to: email.from,
    subject,
    html: replyHtml(body),
    ...(email.messageId ? { headers: { 'In-Reply-To': email.messageId, References: email.messageId } } : {}),
  })
  if (error) throw new Error(error.message)
}

async function escalate(email: InboundEmail, reason: string, severity: string): Promise<void> {
  await sendOpsAlert({
    to: OPS_TO,
    firing: [`Support escalation (${severity}) from ${email.from}: "${email.subject}" — ${reason}`],
    resolved: [],
  }).catch(e => console.error('[inbox] escalation email failed', e))
  try {
    const founder = await prisma.user.findUnique({ where: { email: FOUNDER_EMAIL }, select: { clerkId: true } })
    if (founder) {
      await sendPushToClerkId(founder.clerkId, {
        title: 'Support escalation',
        body: `${email.from}: ${email.subject}`.slice(0, 120),
        url: '/admin/health',
      }).catch(() => {})
    }
  } catch { /* push is best-effort */ }
}

export async function runInboxAgent(): Promise<{ level: string; configured: boolean; processed: number }> {
  const level = await getInboxAgentLevel()
  if (level === 'off') return { level, configured: true, processed: 0 }
  if (!agentConfigured()) return { level, configured: false, processed: 0 }

  const res = await processUnseen(async (email) => {
    if (!email.from) return true // nothing actionable → mark seen, move on

    // Dedupe by Message-ID so a re-run never double-processes / double-replies.
    if (email.messageId) {
      const seen = await prisma.inboxMessage.findUnique({ where: { messageId: email.messageId }, select: { id: true } }).catch(() => null)
      if (seen) return true
    }

    const role = await resolveRole(email.from)
    const tri = await triage({ from: email.from, subject: email.subject, body: email.text, fromRole: role })
    if (!tri) return false // triage unavailable (e.g. API blip) → leave unseen, retry next run

    const action = decideAction(tri, level)

    const row = await prisma.inboxMessage.create({
      data: {
        mailbox: aliasOf(email.to),
        messageId: email.messageId,
        fromEmail: email.from,
        fromRole: role,
        subject: email.subject.slice(0, 300),
        bodyPreview: email.text.slice(0, 2000),
        category: tri.category,
        severity: tri.severity,
        confidence: tri.confidence,
        draftReply: tri.draftReply.slice(0, 8000),
        status: 'new',
        handledBy: 'agent',
      },
    })

    let status: 'drafted' | 'replied' | 'escalated'
    if (action.escalate) {
      await escalate(email, tri.reason, tri.severity)
      status = 'escalated' // serious mail is never auto-replied to the customer
    } else if (action.reply === 'send') {
      try {
        await sendReply(email, tri.draftReply)
        status = 'replied'
      } catch (e) {
        console.error('[inbox] reply send failed — leaving as draft', e)
        status = 'drafted'
      }
    } else {
      status = 'drafted'
    }

    await prisma.inboxMessage.update({
      where: { id: row.id },
      data: {
        status,
        ...(status === 'replied' ? { sentAt: new Date() } : {}),
        ...(status === 'escalated' ? { escalatedAt: new Date() } : {}),
      },
    })
    return true
  })

  return { level, configured: res.configured, processed: res.processed }
}
