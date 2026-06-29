import { describe, it, expect, vi, beforeEach } from 'vitest'

const h = vi.hoisted(() => {
  process.env.AI_NOTES_ENABLED = 'true'
  process.env.ANTHROPIC_API_KEY = 'sk-test'
  return { mockCreate: vi.fn(), mockSubFind: vi.fn() }
})

vi.mock('@/lib/prisma', () => ({ prisma: { subscription: { findUnique: h.mockSubFind } } }))
vi.mock('@anthropic-ai/sdk', () => ({ default: class { messages = { create: h.mockCreate } } }))

import { teacherCanGetAiNotes, generateLessonNote, notesConfigured } from '@/lib/lesson-notes'

const LONG = 'We worked through quadratic equations for about forty minutes today and practised factorising.'

describe('teacherCanGetAiNotes', () => {
  beforeEach(() => h.mockSubFind.mockReset())

  it('false with no subscription', async () => {
    h.mockSubFind.mockResolvedValue(null)
    expect(await teacherCanGetAiNotes('t1')).toBe(false)
  })
  it('false on free/starter', async () => {
    h.mockSubFind.mockResolvedValue({ tier: 'starter', status: 'active', addOns: [] })
    expect(await teacherCanGetAiNotes('t1')).toBe(false)
  })
  it('true on a paid+active tier', async () => {
    h.mockSubFind.mockResolvedValue({ tier: 'pro', status: 'active', addOns: [] })
    expect(await teacherCanGetAiNotes('t1')).toBe(true)
  })
  it('false on a paid tier that is not active', async () => {
    h.mockSubFind.mockResolvedValue({ tier: 'pro', status: 'past_due', addOns: [] })
    expect(await teacherCanGetAiNotes('t1')).toBe(false)
  })
  it('true via the ai_notes add-on', async () => {
    h.mockSubFind.mockResolvedValue({ tier: 'starter', status: 'active', addOns: ['ai_notes'] })
    expect(await teacherCanGetAiNotes('t1')).toBe(true)
  })
})

describe('generateLessonNote', () => {
  beforeEach(() => h.mockCreate.mockReset())

  it('is configured when the flag + key are set', () => {
    expect(notesConfigured()).toBe(true)
  })

  it('returns null for a too-short transcript without calling the model', async () => {
    expect(await generateLessonNote('hi')).toBeNull()
    expect(h.mockCreate).not.toHaveBeenCalled()
  })

  it('returns a structured draft from the model tool call', async () => {
    h.mockCreate.mockResolvedValue({
      content: [{ type: 'tool_use', input: { topicsCovered: 'Quadratics', difficulty: 'Factorising', homework: 'Exercise 4' } }],
    })
    const draft = await generateLessonNote(LONG)
    expect(draft).toEqual({ topicsCovered: 'Quadratics', difficulty: 'Factorising', homework: 'Exercise 4' })
  })

  it('nulls empty optional fields', async () => {
    h.mockCreate.mockResolvedValue({
      content: [{ type: 'tool_use', input: { topicsCovered: 'Quadratics', difficulty: '', homework: '   ' } }],
    })
    expect(await generateLessonNote(LONG)).toEqual({ topicsCovered: 'Quadratics', difficulty: null, homework: null })
  })

  it('returns null when the model returns no tool_use block', async () => {
    h.mockCreate.mockResolvedValue({ content: [{ type: 'text', text: 'nope' }] })
    expect(await generateLessonNote(LONG)).toBeNull()
  })
})
