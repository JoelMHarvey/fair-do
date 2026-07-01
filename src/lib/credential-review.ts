import 'server-only'
import Anthropic from '@anthropic-ai/sdk'

// AI-generated admin review summary for credential verification.
// Aggregates declared data, document extraction results, and DBS status into
// a structured recommendation that admins can act on in one click.

export type ReviewRecommendation = {
  confidence: number             // 0–100 integer
  summary: string                // 2–4 sentence plain-English summary
  recommendation: 'approve' | 'request_info' | 'manual' | 'reject'
  flags: string[]                // human-readable flag labels
  checklistState: {
    nameMatch: boolean
    refVerified: boolean
    inDate: boolean
  }
}

export type TeacherForReview = {
  firstName: string
  lastName: string
  qualificationBody: string | null
  qualificationRef: string | null
  qualificationExpiry: Date | null
  dbsNumber: string | null
  dbsDate: Date | null
  dbsCheckStatus: string | null
  dbsLastCheckedAt: Date | null
  // Extraction results from uploaded certificate (null if no doc uploaded)
  credentialDoc: {
    extractedName: string | null
    extractedBody: string | null
    extractedRef: string | null
    extractedExpiry: Date | null
    confidenceScore: number | null
    flags: string[]
  } | null
}

const REVIEW_TOOL: Anthropic.Tool = {
  name: 'credential_review',
  description: 'Generate a structured credential verification recommendation for a tutor application.',
  input_schema: {
    type: 'object',
    properties: {
      confidence: {
        type: 'integer',
        description: 'Overall verification confidence 0–100. 80+ = recommend approve; 50–79 = needs manual check; below 50 = likely reject or request more info.',
      },
      summary: {
        type: 'string',
        description: '2–4 sentences explaining what was verified, what matched, and any concerns. Be factual and concise. Address the admin directly.',
      },
      recommendation: {
        type: 'string',
        enum: ['approve', 'request_info', 'manual', 'reject'],
        description: 'approve = everything checks out; request_info = need something from the tutor; manual = admin should look at a specific thing; reject = clear problem.',
      },
      flags: {
        type: 'array',
        items: { type: 'string' },
        description: 'Short human-readable flags for notable issues, e.g. "Name mismatch on certificate", "DBS certificate stale (>3 years)", "Expiry in 45 days".',
      },
      nameMatch: {
        type: 'boolean',
        description: 'True if the name on the uploaded certificate matches the declared name (or no certificate was uploaded — give benefit of doubt).',
      },
      refVerified: {
        type: 'boolean',
        description: 'True if the qualification reference appears consistent and plausible for the stated body.',
      },
      inDate: {
        type: 'boolean',
        description: 'True if the qualification expiry is in the future (or no expiry shown — permanent qualifications like QTS).',
      },
    },
    required: ['confidence', 'summary', 'recommendation', 'flags', 'nameMatch', 'refVerified', 'inDate'],
  },
}

const MODEL = 'claude-haiku-4-5-20251001'

function formatDate(d: Date | null | undefined): string {
  if (!d) return 'not provided'
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

function daysUntil(d: Date | null | undefined): number | null {
  if (!d) return null
  return Math.ceil((d.getTime() - Date.now()) / 86_400_000)
}

function buildPrompt(t: TeacherForReview): string {
  const fullName = `${t.firstName} ${t.lastName}`
  const expiryDays = daysUntil(t.qualificationExpiry)
  const dbsStaleDays = t.dbsDate ? Math.floor((Date.now() - t.dbsDate.getTime()) / 86_400_000) : null

  const lines: string[] = [
    `Tutor application for: ${fullName}`,
    `Qualification body: ${t.qualificationBody ?? 'not stated'}`,
    `Qualification reference: ${t.qualificationRef ?? 'not provided'}`,
    `Qualification expiry: ${formatDate(t.qualificationExpiry)}${expiryDays != null ? ` (${expiryDays > 0 ? `${expiryDays} days away` : `EXPIRED ${Math.abs(expiryDays)} days ago`})` : ''}`,
    '',
    `DBS certificate number: ${t.dbsNumber ?? 'not provided'}`,
    `DBS issue date: ${formatDate(t.dbsDate)}${dbsStaleDays != null ? ` (${dbsStaleDays} days old)` : ''}`,
    `DBS Update Service check: ${t.dbsCheckStatus ?? 'not checked'}${t.dbsLastCheckedAt ? ` (last checked ${formatDate(t.dbsLastCheckedAt)})` : ''}`,
  ]

  if (t.credentialDoc) {
    const doc = t.credentialDoc
    lines.push('')
    lines.push('Certificate document analysis:')
    lines.push(`  Name on certificate: ${doc.extractedName ?? 'could not read'}`)
    lines.push(`  Body on certificate: ${doc.extractedBody ?? 'could not read'}`)
    lines.push(`  Reference on certificate: ${doc.extractedRef ?? 'could not read'}`)
    lines.push(`  Expiry on certificate: ${formatDate(doc.extractedExpiry)}`)
    lines.push(`  AI extraction confidence: ${doc.confidenceScore != null ? `${Math.round(doc.confidenceScore * 100)}%` : 'n/a'}`)
    if (doc.flags.length) lines.push(`  Extraction flags: ${doc.flags.join(', ')}`)
  } else {
    lines.push('')
    lines.push('No certificate document uploaded.')
  }

  lines.push('')
  lines.push('Based on the above, provide a credential verification recommendation. UK teaching platform context: QTS/QTLS are primary UK qualifications; DBS certificates are required for tutors teaching under-18s. DBS certificates older than 3 years without an Update Service check are considered stale. Qualifications must not be expired.')

  return lines.join('\n')
}

export async function generateCredentialReview(
  teacher: TeacherForReview,
): Promise<ReviewRecommendation | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null

  try {
    const client = new Anthropic()
    const msg = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      tools: [REVIEW_TOOL],
      tool_choice: { type: 'tool', name: 'credential_review' },
      messages: [{ role: 'user', content: buildPrompt(teacher) }],
    })

    const block = msg.content.find(b => b.type === 'tool_use')
    if (!block || block.type !== 'tool_use') return null

    const out = block.input as {
      confidence: number
      summary: string
      recommendation: 'approve' | 'request_info' | 'manual' | 'reject'
      flags: string[]
      nameMatch: boolean
      refVerified: boolean
      inDate: boolean
    }

    return {
      confidence: Math.min(100, Math.max(0, out.confidence)),
      summary: out.summary,
      recommendation: out.recommendation,
      flags: out.flags ?? [],
      checklistState: {
        nameMatch:   out.nameMatch,
        refVerified: out.refVerified,
        inDate:      out.inDate,
      },
    }
  } catch (e) {
    console.error('[credential-review] generation failed:', e instanceof Error ? e.message : e)
    return null
  }
}
