import { describe, it, expect, vi } from 'vitest'

vi.hoisted(() => {
  process.env.WHITEBOARD_ENABLED = 'true'
  process.env.EXCALIDRAW_ROOM_SECRET = 'test-secret'
  delete process.env.EXCALIDRAW_SERVER_URL
})

import { whiteboardUrl, whiteboardEmbeddable, WHITEBOARD_ENABLED } from '@/lib/whiteboard'

describe('whiteboardUrl', () => {
  it('flag is on', () => {
    expect(WHITEBOARD_ENABLED).toBe(true)
  })

  it('builds an excalidraw room URL with a 20-hex id and 22-char key', () => {
    const url = whiteboardUrl('sess_1')!
    expect(url).toMatch(/^https:\/\/excalidraw\.com\/#room=[0-9a-f]{20},[A-Za-z0-9_-]{22}$/)
  })

  it('is deterministic for the same session (both participants get the same board)', () => {
    expect(whiteboardUrl('sess_1')).toBe(whiteboardUrl('sess_1'))
  })

  it('differs by session', () => {
    expect(whiteboardUrl('sess_1')).not.toBe(whiteboardUrl('sess_2'))
  })

  it('not embeddable without a self-hosted server', () => {
    expect(whiteboardEmbeddable()).toBe(false)
  })
})
