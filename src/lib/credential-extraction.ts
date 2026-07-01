import 'server-only'
import Anthropic from '@anthropic-ai/sdk'

// Claude-Vision extraction of credential details from an uploaded certificate image.
// Called immediately after a teacher uploads their certificate document.
// Supports Cloudinary image URLs (JPEG/PNG/WebP/GIF) and falls back gracefully
// if the document is unreadable or the API is unconfigured.

export type ExtractionResult = {
  extractedName: string | null
  extractedBody: string | null
  extractedRef: string | null
  extractedExpiry: Date | null
  issuingOrganisation: string | null
  confidenceScore: number          // 0.0–1.0
  flags: string[]                  // name_mismatch | ref_mismatch | expired | unreadable | body_mismatch
  rawText: string                  // best plain-text summary Claude pulled from the document
}

type Declared = {
  name: string          // teacher's declared full name
  body: string          // declared qualification body (e.g. "QTS")
  ref: string           // declared reference number
}

const EXTRACT_TOOL: Anthropic.Tool = {
  name: 'credential_extract',
  description: 'Extract structured credential information from a teaching qualification certificate or document image.',
  input_schema: {
    type: 'object',
    properties: {
      holderName:          { type: 'string',  description: 'Full name of the certificate holder as it appears on the document.' },
      qualificationBody:   { type: 'string',  description: 'Issuing body or organisation (e.g. "Teaching Regulation Agency", "ABRSM", "Cambridge Assessment English", "University of London").' },
      qualificationTitle:  { type: 'string',  description: 'Name of the qualification (e.g. "QTS", "PGCE", "CELTA", "DipABRSM").' },
      referenceNumber:     { type: 'string',  description: 'Certificate reference, TRN, membership number, or registration number.' },
      expiryDate:          { type: 'string',  description: 'Expiry or "valid until" date in ISO 8601 format (YYYY-MM-DD). Empty string if no expiry shown.' },
      issuingOrganisation: { type: 'string',  description: 'Organisation that signed/issued the document, if different from the awarding body.' },
      rawText:             { type: 'string',  description: 'Key text extracted verbatim from the document in 1–3 sentences.' },
      readable:            { type: 'boolean', description: 'True if the document is clear enough to extract meaningful credential information.' },
    },
    required: ['readable', 'rawText'],
  },
}

const MODEL = 'claude-haiku-4-5-20251001'

// Normalise a string for loose comparison (strip whitespace, lowercase).
function norm(s: string | null | undefined): string {
  return (s ?? '').toLowerCase().replace(/\s+/g, ' ').trim()
}

// Build flag list by comparing extracted vs declared values.
function buildFlags(
  extracted: { name: string | null; body: string | null; ref: string | null; expiry: Date | null; readable: boolean },
  declared: Declared,
): string[] {
  const flags: string[] = []
  if (!extracted.readable) { flags.push('unreadable'); return flags }

  if (extracted.name && norm(extracted.name) !== norm(declared.name)) {
    flags.push('name_mismatch')
  }
  if (extracted.ref && norm(extracted.ref) !== norm(declared.ref)) {
    flags.push('ref_mismatch')
  }
  // Body mismatch: crude keyword check since the extracted body may be a full name
  if (extracted.body) {
    const bodyNorm = norm(extracted.body)
    const declaredNorm = norm(declared.body)
    const knownAbbreviations: Record<string, string[]> = {
      qts:    ['teaching regulation agency', 'qualified teacher', 'qts'],
      abrsm:  ['associated board', 'abrsm', 'royal schools of music'],
      celta:  ['cambridge', 'celta', 'english language teaching'],
      certed: ['society for education', 'set', 'certificate in education'],
      qtls:   ['qtls', 'society for education', 'qualified teacher learning'],
      pgce:   ['pgce', 'postgraduate certificate'],
    }
    const synonyms = knownAbbreviations[declaredNorm] ?? [declaredNorm]
    if (!synonyms.some(s => bodyNorm.includes(s))) {
      flags.push('body_mismatch')
    }
  }
  if (extracted.expiry && extracted.expiry < new Date()) {
    flags.push('expired')
  }
  return flags
}

// Score: starts at 1.0 and deducts per flag.
function scoreFromFlags(flags: string[], readable: boolean): number {
  if (!readable) return 0
  let score = 1.0
  for (const f of flags) {
    if (f === 'name_mismatch')  score -= 0.3
    if (f === 'ref_mismatch')   score -= 0.3
    if (f === 'body_mismatch')  score -= 0.2
    if (f === 'expired')        score -= 0.1
  }
  return Math.max(0, Math.round(score * 100) / 100)
}

export async function extractCredential(
  docUrl: string,
  declared: Declared,
): Promise<ExtractionResult> {
  const empty: ExtractionResult = {
    extractedName: null,
    extractedBody: null,
    extractedRef: null,
    extractedExpiry: null,
    issuingOrganisation: null,
    confidenceScore: 0,
    flags: ['unreadable'],
    rawText: '',
  }

  if (!process.env.ANTHROPIC_API_KEY) return empty

  try {
    const client = new Anthropic()

    // Cloudinary image URLs are public and directly accessible by Claude.
    // Strip any existing transformation parameters to get the raw image.
    const imageUrl = docUrl.includes('/upload/')
      ? docUrl.replace(/\/upload\/[^/]+\//, '/upload/')
      : docUrl

    const msg = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      tools: [EXTRACT_TOOL],
      tool_choice: { type: 'tool', name: 'credential_extract' },
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'url', url: imageUrl },
            },
            {
              type: 'text',
              text: `This is a teaching credential certificate or qualification document. Extract the key information from it. The teacher declared their name as "${declared.name}", qualification body as "${declared.body}", and reference number as "${declared.ref}". Compare carefully.`,
            },
          ],
        },
      ],
    })

    const block = msg.content.find(b => b.type === 'tool_use')
    if (!block || block.type !== 'tool_use') return empty

    const out = block.input as {
      holderName?: string
      qualificationBody?: string
      qualificationTitle?: string
      referenceNumber?: string
      expiryDate?: string
      issuingOrganisation?: string
      rawText?: string
      readable?: boolean
    }

    const readable = out.readable !== false
    const extractedExpiry = out.expiryDate
      ? (() => { const d = new Date(out.expiryDate!); return isNaN(d.getTime()) ? null : d })()
      : null

    const extracted = {
      name:    out.holderName ?? null,
      body:    out.qualificationBody ?? out.qualificationTitle ?? null,
      ref:     out.referenceNumber ?? null,
      expiry:  extractedExpiry,
      readable,
    }

    const flags = buildFlags(extracted, declared)
    const confidenceScore = scoreFromFlags(flags, readable)

    return {
      extractedName:       extracted.name,
      extractedBody:       extracted.body,
      extractedRef:        extracted.ref,
      extractedExpiry:     extracted.expiry,
      issuingOrganisation: out.issuingOrganisation ?? null,
      confidenceScore,
      flags,
      rawText:             out.rawText ?? '',
    }
  } catch (e) {
    console.error('[credential-extraction] Claude call failed:', e instanceof Error ? e.message : e)
    return empty
  }
}
