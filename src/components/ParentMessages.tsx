'use client'

import { useState } from 'react'
import { useDict } from '@/components/DictProvider'

type Msg = { id: string; body: string; senderClerkId: string; createdAt: string }

export function ParentMessages({
  parentLinkId,
  viewerClerkId,
  initial,
}: {
  parentLinkId: string
  viewerClerkId: string
  initial: Msg[]
}) {
  const { parent_messages } = useDict()
  const [messages, setMessages] = useState<Msg[]>(initial)
  const [body, setBody] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function send(e: React.FormEvent) {
    e.preventDefault()
    const text = body.trim()
    if (!text) return
    setBusy(true)
    setError('')
    const res = await fetch('/api/parent/messages/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ parentLinkId, body: text }),
    })
    if (res.ok) {
      const m = await res.json()
      setMessages(prev => [...prev, { id: m.id, body: m.body, senderClerkId: viewerClerkId, createdAt: m.createdAt }])
      setBody('')
    } else {
      const d = await res.json().catch(() => ({}))
      setError(d.error ?? parent_messages.send_error)
    }
    setBusy(false)
  }

  return (
    <div>
      <div className="space-y-2 max-h-80 overflow-y-auto mb-3">
        {messages.length === 0 && <p className="text-sm text-sand-400">{parent_messages.empty}</p>}
        {messages.map(m => {
          const mine = m.senderClerkId === viewerClerkId
          return (
            <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${mine ? 'bg-brand-600 text-white' : 'bg-sand-100 text-sand-800'}`}>
                {m.body}
              </div>
            </div>
          )
        })}
      </div>
      <form onSubmit={send} className="flex gap-2">
        <input
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder={parent_messages.composer_placeholder}
          className="flex-1 rounded-xl border border-sand-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none"
        />
        <button type="submit" disabled={busy} className="bg-brand-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-brand-700 transition disabled:opacity-60">
          {busy ? parent_messages.sending : parent_messages.send}
        </button>
      </form>
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  )
}
