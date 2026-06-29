import 'server-only'
import Anthropic from '@anthropic-ai/sdk'
import { prisma } from '@/lib/prisma'

// AI lesson notes (P2-4). After a lesson, Claude drafts a short structured summary
// from the transcript; the teacher reviews/edits and approves before it's shared.
// Ships behind a flag — no notes are generated unless this is on.
export const AI_NOTES_ENABLED = process.env.AI_NOTES_ENABLED === 'true'

// Haiku is plenty for this structured-extraction task and keeps per-lesson cost
// negligible (~10k tokens for a 60-min transcript).
const MODEL = 'claude-haiku-4-5-20251001'

// Paid teacher tiers that include AI notes (Pro+). Forward-compatible with the
// upcoming free/pro/studio rename.
const AI_NOTES_TIERS = new Set(['practice', 'clinic', 'pro', 'studio'])

export async function teacherCanGetAiNotes(teacherId: string): Promise<boolean> {
  const sub = await prisma.subscription.findUnique({
    where: { teacherId },
    select: { tier: true, status: true, addOns: true },
  })
  if (!sub) return false
  return (sub.status === 'active' && AI_NOTES_TIERS.has(sub.tier)) || sub.addOns.includes('ai_notes')
}

export function notesConfigured(): boolean {
  return AI_NOTES_ENABLED && !!process.env.ANTHROPIC_API_KEY
}

export type LessonNoteDraft = {
  topicsCovered: string
  difficulty: string | null
  homework: string | null
}

const SYSTEM = `You are summarising a private one-to-one tutoring lesson from its transcript. Be concise, factual, and parent-friendly. Only use what the transcript supports — never invent topics, homework, or progress. If the transcript is too short or unclear to summarise, say so briefly in topicsCovered and leave the other fields empty.`

const NOTE_TOOL: Anthropic.Tool = {
  name: 'lesson_note',
  description: 'Record the structured summary of this tutoring lesson.',
  input_schema: {
    type: 'object',
    properties: {
      topicsCovered: { type: 'string', description: 'Subject and topics covered, 1-3 short sentences.' },
      difficulty: { type: 'string', description: 'Areas the student found difficult, or empty if none noted.' },
      homework: { type: 'string', description: 'Practice or homework set, or empty if none.' },
    },
    required: ['topicsCovered'],
  },
}

// Generate a draft note from transcript plain text. Returns null when not configured
// or on any model error (the caller treats notes as best-effort).
export async function generateLessonNote(plainText: string): Promise<LessonNoteDraft | null> {
  if (!notesConfigured()) return null
  const text = plainText.trim()
  if (text.length < 40) return null
  try {
    const client = new Anthropic()
    const msg = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: SYSTEM,
      tools: [NOTE_TOOL],
      tool_choice: { type: 'tool', name: 'lesson_note' },
      messages: [{ role: 'user', content: text.slice(0, 60_000) }],
    })
    const block = msg.content.find(b => b.type === 'tool_use')
    if (!block || block.type !== 'tool_use') return null
    const out = block.input as { topicsCovered?: string; difficulty?: string; homework?: string }
    if (!out.topicsCovered) return null
    return {
      topicsCovered: out.topicsCovered,
      difficulty: out.difficulty?.trim() || null,
      homework: out.homework?.trim() || null,
    }
  } catch (e) {
    console.error('[lesson-notes] generation failed:', e instanceof Error ? e.message : e)
    return null
  }
}
