import Anthropic from '@anthropic-ai/sdk'
import type { InboxAgentLevel } from './settings'

// Triage brain for the support inbox agent. Classifies an incoming email and drafts a
// reply; the ACTION POLICY (decideAction) — not the model — decides what actually happens.

const MODEL = 'claude-sonnet-4-6'
const FIX_CONFIDENCE_FLOOR = 0.8 // below this, a suggested fix is drafted for review, never auto-sent

export type Triage = {
  category: 'acknowledge' | 'suggest_fix' | 'escalate'
  severity: 'low' | 'normal' | 'high' | 'critical'
  confidence: number
  escalate: boolean
  draftReply: string
  reason: string
}

export type AgentEmail = {
  from: string
  subject: string
  body: string
  fromRole?: 'teacher' | 'student' | 'unknown'
}

export function agentConfigured(): boolean {
  return !!process.env.ANTHROPIC_API_KEY
}

// Curated, version-controlled brief — NOT the live DB or raw repo, so nothing leaks.
const SYSTEM = `You triage support email for fair-do, a UK tutoring-management product tutors subscribe to.

FAIR-DO MODEL (get this right; never contradict it):
- Tutors subscribe to fair-do and keep their own students, prices, and data. fair-do is the data PROCESSOR; the tutor is the data CONTROLLER.
- There is NO commission on lessons — only standard card processing, which fair-do keeps none of. Never say "15%" or quote a commission.
- The public tutor directory is OFF for now; students join via their tutor's invite link or QR code, not by browsing.
- fair-do is NOT a crisis or safeguarding service.

COMMON ISSUES + THE REAL FIX (only suggest a fix you're sure of):
- "Photo upload button doesn't work / not configured" -> it needs Cloudinary set up; tell them we're aware and it's being enabled.
- "I can't find my tutor / how do I join" (student) -> they connect through their tutor's personal invite link or QR code; ask their tutor for it.
- "When do I get paid?" (tutor) -> payouts reach the bank a couple of business days after a completed lesson.
- "Reset my password" -> do it at fair-do.com sign-in.
- "Can't get into my lesson room" -> the room opens 10 minutes before the start; use the link in the booking email.

YOUR JOB — classify into exactly one category:
- acknowledge: a simple "we've received this, a human is on it" is the right response (anything you can't confidently fix).
- suggest_fix: you are confident of a correct, safe answer from the list above or basic account help.
- escalate: ANYTHING serious or sensitive.

ESCALATE (set escalate=true, category=escalate, never propose a fix) for: safeguarding or child-welfare concerns, self-harm or crisis language, legal threats, data-protection/GDPR/erasure requests, payment disputes or refund demands, complaints about a tutor, press/partnership, or anything you are not confident about.

TONE: British, plain, warm, calm. No hype, no exclamation marks, no promises about timing or money. Never give teaching or academic advice. If there is any crisis or safeguarding language, escalate and include UK resources (Samaritans 116 123; NSPCC 0808 800 5000; emergency 999) in your draft.

confidence is your 0-1 certainty that draftReply is correct and safe to send as-is.`

const TRIAGE_TOOL: Anthropic.Tool = {
  name: 'triage',
  description: 'Record the triage decision for this support email.',
  input_schema: {
    type: 'object',
    properties: {
      category: { type: 'string', enum: ['acknowledge', 'suggest_fix', 'escalate'] },
      severity: { type: 'string', enum: ['low', 'normal', 'high', 'critical'] },
      confidence: { type: 'number', minimum: 0, maximum: 1 },
      escalate: { type: 'boolean' },
      draftReply: { type: 'string' },
      reason: { type: 'string' },
    },
    required: ['category', 'severity', 'confidence', 'escalate', 'draftReply', 'reason'],
  },
}

export async function triage(email: AgentEmail): Promise<Triage | null> {
  if (!agentConfigured()) return null
  const client = new Anthropic()
  try {
    const msg = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: SYSTEM,
      tools: [TRIAGE_TOOL],
      tool_choice: { type: 'tool', name: 'triage' },
      messages: [{
        role: 'user',
        content: `Sender: ${email.from} (${email.fromRole ?? 'unknown'})\nSubject: ${email.subject}\n\n${email.body}`,
      }],
    })
    const block = msg.content.find(b => b.type === 'tool_use')
    if (!block || block.type !== 'tool_use') return null
    const t = block.input as Triage
    // Defensive: a low-confidence or high-severity classification can never be a fix.
    if (t.severity === 'critical' || t.severity === 'high') { t.escalate = true; t.category = 'escalate' }
    if (t.escalate) t.category = 'escalate'
    return t
  } catch (e) {
    console.error('[inbox-agent] triage failed', e)
    return null
  }
}

// PURE action policy — given a triage result and the active level, decide what happens.
// This, not the model, is the safety gate. Unit-tested.
export type Action = {
  reply: 'none' | 'draft' | 'send'
  escalate: boolean
  replyType: 'acknowledge' | 'fix' | 'none'
}

export function decideAction(t: Triage, level: InboxAgentLevel): Action {
  if (level === 'off') return { reply: 'none', escalate: false, replyType: 'none' }

  // Serious/sensitive -> always escalate to a human, never auto-reply. At draft level we
  // still stage a (non-customer) note; at ack/assist we send nothing and escalate.
  const serious = t.escalate || t.category === 'escalate' || t.severity === 'high' || t.severity === 'critical'
  if (serious) {
    return { reply: level === 'draft' ? 'draft' : 'none', escalate: true, replyType: 'none' }
  }

  const replyType: 'acknowledge' | 'fix' = t.category === 'suggest_fix' ? 'fix' : 'acknowledge'

  if (level === 'draft') return { reply: 'draft', escalate: false, replyType }

  if (level === 'ack') {
    // Auto-send acknowledgements only; any fix is drafted for a human.
    return replyType === 'fix'
      ? { reply: 'draft', escalate: false, replyType }
      : { reply: 'send', escalate: false, replyType }
  }

  // assist: auto-send acknowledgements, and fixes only when confidence clears the floor.
  if (replyType === 'fix') {
    return t.confidence >= FIX_CONFIDENCE_FLOOR
      ? { reply: 'send', escalate: false, replyType }
      : { reply: 'draft', escalate: false, replyType }
  }
  return { reply: 'send', escalate: false, replyType }
}
