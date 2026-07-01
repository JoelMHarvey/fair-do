'use client'

import { useState } from 'react'

const BOARDS = ['', 'AQA', 'Edexcel', 'OCR', 'WJEC', 'Pearson', 'Other']

type Props = {
  matchId: string
  targetGrade: string | null
  examBoard: string | null
  examDate: string | null // yyyy-mm-dd
}

// Teacher sets the student's goal (target grade / exam board / exam date). Shown to
// the parent on their dashboard. All optional.
export default function GoalEditor({ matchId, targetGrade, examBoard, examDate }: Props) {
  const [grade, setGrade] = useState(targetGrade ?? '')
  const [board, setBoard] = useState(examBoard ?? '')
  const [date, setDate] = useState(examDate ?? '')
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  async function save() {
    setState('saving')
    const res = await fetch(`/api/practice/students/${matchId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        targetGrade: grade.trim() || null,
        examBoard: board || null,
        examDate: date || null,
      }),
    })
    setState(res.ok ? 'saved' : 'error')
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <input
          value={grade}
          onChange={e => { setGrade(e.target.value); setState('idle') }}
          placeholder="Target grade (e.g. A*, Grade 5)"
          className="rounded-lg border border-sand-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
        />
        <select
          value={board}
          onChange={e => { setBoard(e.target.value); setState('idle') }}
          className="rounded-lg border border-sand-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
        >
          {BOARDS.map(b => <option key={b} value={b}>{b === '' ? 'Exam board…' : b}</option>)}
        </select>
        <input
          type="date"
          value={date}
          onChange={e => { setDate(e.target.value); setState('idle') }}
          className="rounded-lg border border-sand-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
        />
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={save}
          disabled={state === 'saving'}
          className="bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-brand-700 transition disabled:opacity-60"
        >
          {state === 'saving' ? '…' : 'Save goal'}
        </button>
        {state === 'saved' && <span className="text-xs text-brand-700">Saved</span>}
        {state === 'error' && <span className="text-xs text-red-600">Couldn’t save</span>}
      </div>
    </div>
  )
}
