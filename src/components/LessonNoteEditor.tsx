'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Note = {
  sessionId: string
  topicsCovered: string
  difficulty: string | null
  homework: string | null
  status: string
}

const ta = 'w-full rounded-xl border border-sand-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none'

export function LessonNoteEditor({ initial }: { initial: Note }) {
  const router = useRouter()
  const [topics, setTopics] = useState(initial.topicsCovered)
  const [difficulty, setDifficulty] = useState(initial.difficulty ?? '')
  const [homework, setHomework] = useState(initial.homework ?? '')
  const [status, setStatus] = useState(initial.status)
  const [busy, setBusy] = useState<'' | 'save' | 'share'>('')
  const [error, setError] = useState('')

  async function submit(action: 'save' | 'share') {
    setBusy(action)
    setError('')
    const res = await fetch('/api/teacher/lesson-notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: initial.sessionId, action, topicsCovered: topics, difficulty, homework }),
    })
    if (res.ok) {
      const d = await res.json()
      setStatus(d.status)
      router.refresh()
    } else {
      const d = await res.json().catch(() => ({}))
      setError(d.error ?? 'Could not save.')
    }
    setBusy('')
  }

  return (
    <div className="bg-white rounded-2xl border border-sand-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs px-2 py-0.5 rounded-full bg-sand-100 text-sand-600">
          {status === 'shared' ? 'Shared with student' : status === 'approved' ? 'Approved · not shared' : 'AI draft'}
        </span>
      </div>
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-sand-500 mb-1">Topics covered</label>
          <textarea rows={2} className={ta} value={topics} onChange={e => setTopics(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-medium text-sand-500 mb-1">Areas of difficulty</label>
          <textarea rows={2} className={ta} value={difficulty} onChange={e => setDifficulty(e.target.value)} placeholder="Optional" />
        </div>
        <div>
          <label className="block text-xs font-medium text-sand-500 mb-1">Homework / practice</label>
          <textarea rows={2} className={ta} value={homework} onChange={e => setHomework(e.target.value)} placeholder="Optional" />
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <button onClick={() => submit('save')} disabled={!!busy} className="text-sm font-medium px-4 py-2 rounded-lg border border-sand-200 text-sand-700 hover:border-brand-300 transition disabled:opacity-60">
          {busy === 'save' ? 'Saving…' : 'Save draft'}
        </button>
        <button onClick={() => submit('share')} disabled={!!busy} className="text-sm font-medium px-4 py-2 rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition disabled:opacity-60">
          {busy === 'share' ? 'Sharing…' : status === 'shared' ? 'Re-share' : 'Share with student'}
        </button>
      </div>
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  )
}
