'use client'

import { useState, useRef, useEffect } from 'react'

type Message = {
  id: string
  body: string
  senderClerkId: string
  createdAt: string
}

export default function MessageThread({
  threadId,
  currentClerkId,
  initialMessages,
}: {
  threadId: string
  currentClerkId: string
  initialMessages: Message[]
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send() {
    const text = body.trim()
    if (!text || sending) return
    setSending(true)
    setBody('')

    const res = await fetch('/api/messages/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ threadId, body: text }),
    })

    if (res.ok) {
      const msg = await res.json()
      setMessages(prev => [...prev, msg])
    } else {
      setBody(text) // restore on failure
    }
    setSending(false)
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {messages.length === 0 && (
          <div className="text-center text-sand-400 text-sm pt-12">
            No messages yet. Say hello.
          </div>
        )}
        {messages.map((m, i) => {
          const isMe = m.senderClerkId === currentClerkId
          const dateLabel = formatDate(m.createdAt)
          const showDate = i === 0 || formatDate(messages[i - 1].createdAt) !== dateLabel

          return (
            <div key={m.id}>
              {showDate && (
                <div className="text-center text-xs text-sand-400 py-3">{dateLabel}</div>
              )}
              <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    isMe
                      ? 'bg-brand-600 text-white rounded-br-sm'
                      : 'bg-white border border-sand-200 text-sand-800 rounded-bl-sm'
                  }`}
                >
                  <p style={{ whiteSpace: 'pre-wrap' }}>{m.body}</p>
                  <p className={`text-[10px] mt-1 ${isMe ? 'text-brand-200' : 'text-sand-400'}`}>
                    {formatTime(m.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-sand-200 bg-white px-4 py-3 shrink-0">
        <div className="flex items-end gap-3">
          <textarea
            className="flex-1 resize-none border border-sand-200 rounded-xl px-4 py-2.5 text-sm text-sand-900 focus:outline-none focus:ring-2 focus:ring-brand-500 max-h-32"
            rows={1}
            placeholder="Type a message… (Enter to send)"
            value={body}
            onChange={e => setBody(e.target.value)}
            onKeyDown={handleKey}
          />
          <button
            onClick={send}
            disabled={!body.trim() || sending}
            className="bg-brand-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-brand-700 transition disabled:opacity-40 shrink-0"
          >
            Send
          </button>
        </div>
        <p className="text-xs text-sand-400 mt-1.5 px-1">Messages are stored securely. Do not share sensitive personal information.</p>
      </div>
    </>
  )
}
