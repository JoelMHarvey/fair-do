import { describe, it, expect } from 'vitest'
import { decideAction, type Triage } from './inbox-agent'

const t = (over: Partial<Triage> = {}): Triage => ({
  category: 'acknowledge',
  severity: 'normal',
  confidence: 0.9,
  escalate: false,
  draftReply: '...',
  reason: '',
  ...over,
})

describe('decideAction — safety policy', () => {
  it('off does nothing, ever', () => {
    expect(decideAction(t({ category: 'suggest_fix' }), 'off')).toEqual({ reply: 'none', escalate: false, replyType: 'none' })
    expect(decideAction(t({ escalate: true }), 'off').reply).toBe('none')
  })

  it('serious mail always escalates and never auto-sends', () => {
    for (const level of ['draft', 'ack', 'assist'] as const) {
      const a = decideAction(t({ category: 'escalate', escalate: true, severity: 'critical' }), level)
      expect(a.escalate).toBe(true)
      expect(a.reply).not.toBe('send') // draft level may stage a note, ack/assist send nothing
      expect(a.replyType).toBe('none')
    }
    // high severity is treated as serious too
    expect(decideAction(t({ severity: 'high' }), 'assist').escalate).toBe(true)
    expect(decideAction(t({ severity: 'high' }), 'assist').reply).toBe('none')
  })

  it('draft level never sends — only drafts', () => {
    expect(decideAction(t({ category: 'acknowledge' }), 'draft')).toEqual({ reply: 'draft', escalate: false, replyType: 'acknowledge' })
    expect(decideAction(t({ category: 'suggest_fix' }), 'draft')).toEqual({ reply: 'draft', escalate: false, replyType: 'fix' })
  })

  it('ack level auto-sends acknowledgements but drafts fixes', () => {
    expect(decideAction(t({ category: 'acknowledge' }), 'ack')).toEqual({ reply: 'send', escalate: false, replyType: 'acknowledge' })
    expect(decideAction(t({ category: 'suggest_fix', confidence: 0.99 }), 'ack')).toEqual({ reply: 'draft', escalate: false, replyType: 'fix' })
  })

  it('assist auto-sends acknowledgements and high-confidence fixes only', () => {
    expect(decideAction(t({ category: 'acknowledge' }), 'assist').reply).toBe('send')
    expect(decideAction(t({ category: 'suggest_fix', confidence: 0.85 }), 'assist').reply).toBe('send')
    // below the floor → drafted, not sent
    expect(decideAction(t({ category: 'suggest_fix', confidence: 0.6 }), 'assist').reply).toBe('draft')
  })
})
