'use client'

import { useEffect, useRef, useState } from 'react'

type Turn = { role: 'user' | 'assistant'; content: string }

const GREETING =
  "Hi — I'm the fair-do Assistant. Ask me anything about using fair-do: booking, students, payments, messaging, your plan. I'll point you to the right place, and pass you to support if it's beyond me."

export function AssistantWidget() {
  const [open, setOpen] = useState(false)
  const [turns, setTurns] = useState<Turn[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [turns, open])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  async function send() {
    const text = input.trim()
    if (!text || streaming) return
    const next: Turn[] = [...turns, { role: 'user', content: text }]
    setTurns(next)
    setInput('')
    setStreaming(true)
    // Placeholder assistant turn we stream into.
    setTurns(t => [...t, { role: 'assistant', content: '' }])

    try {
      const res = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      })
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Something went wrong.')
      }
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let acc = ''
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        acc += decoder.decode(value, { stream: true })
        setTurns(t => {
          const copy = t.slice()
          copy[copy.length - 1] = { role: 'assistant', content: acc }
          return copy
        })
      }
      if (!acc.trim()) {
        setTurns(t => {
          const copy = t.slice()
          copy[copy.length - 1] = { role: 'assistant', content: 'Sorry — I didn\'t catch that. Try again, or email support@fair-do.com.' }
          return copy
        })
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Something went wrong.'
      setTurns(t => {
        const copy = t.slice()
        copy[copy.length - 1] = { role: 'assistant', content: `${msg} You can email support@fair-do.com.` }
        return copy
      })
    } finally {
      setStreaming(false)
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <>
      {/* Launcher */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open the fair-do Assistant"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-brand-600 text-white shadow-lg shadow-brand-600/25 hover:bg-brand-700 transition px-4 py-3 text-sm font-medium"
        >
          <span aria-hidden>💬</span>
          <span className="hidden sm:inline">Assistant</span>
        </button>
      )}

      {/* Panel */}
      {open && (
        <div className="fixed bottom-5 right-5 z-50 flex flex-col w-[min(92vw,380px)] h-[min(80vh,560px)] rounded-2xl border border-sand-200 bg-white shadow-2xl overflow-hidden">
          <header className="flex items-center justify-between gap-2 px-4 py-3 border-b border-sand-100 bg-sand-50/60">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-sand-900">fair-do Assistant</p>
              <p className="text-xs text-sand-400">Help with using fair-do</p>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close assistant" className="text-sand-400 hover:text-brand-700 text-lg leading-none px-1">×</button>
          </header>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            <div className="text-sm text-sand-600 bg-sand-50 rounded-xl px-3 py-2.5 leading-relaxed">{GREETING}</div>
            {turns.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                    m.role === 'user' ? 'bg-brand-600 text-white' : 'bg-sand-100 text-sand-800'
                  }`}
                >
                  {m.content || (streaming && i === turns.length - 1 ? '…' : '')}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-sand-100 p-3">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                rows={1}
                maxLength={4000}
                placeholder="Ask about using fair-do…"
                className="flex-1 resize-none rounded-xl border border-sand-300 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none max-h-32"
              />
              <button
                onClick={send}
                disabled={streaming || !input.trim()}
                className="shrink-0 rounded-xl bg-brand-600 text-white px-3.5 py-2 text-sm font-medium hover:bg-brand-700 disabled:opacity-50 transition"
              >
                {streaming ? '…' : 'Send'}
              </button>
            </div>
            <p className="mt-1.5 text-[11px] text-sand-400">Guidance only — it can&apos;t change your account. Don&apos;t share student details or passwords.</p>
          </div>
        </div>
      )}
    </>
  )
}
