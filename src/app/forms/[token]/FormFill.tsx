'use client'

import { useState } from 'react'
import type { FormField } from '@/lib/forms'

export default function FormFill({ token, title, fields }: { token: string; title: string; fields: FormField[] }) {
  const [values, setValues] = useState<Record<string, string | boolean>>({})
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  function set(id: string, v: string | boolean) { setValues(s => ({ ...s, [id]: v })) }

  async function submit() {
    setError('')
    for (const f of fields) {
      if (f.required) {
        const v = values[f.id]
        const missing = f.type === 'checkbox' ? v !== true : !String(v ?? '').trim()
        if (missing) { setError(`Please complete: ${f.label}`); return }
      }
    }
    setBusy(true)
    const res = await fetch(`/api/forms/${token}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ responses: values }),
    })
    if (res.ok) setDone(true)
    else { const d = await res.json().catch(() => ({})); setError(d.error || 'Something went wrong.') }
    setBusy(false)
  }

  if (done) {
    return (
      <div className="bg-white rounded-3xl border border-sand-200 p-8 text-center shadow-sm">
        <div className="text-4xl mb-3">✓</div>
        <h2 className="font-display text-xl font-semibold text-brand-900 mb-1">Thank you</h2>
        <p className="text-sand-600">Your answers have been sent to your tutor. You can close this page.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-3xl border border-sand-200 p-6 sm:p-8 shadow-sm space-y-5">
      <h2 className="font-display text-xl font-semibold text-brand-900">{title}</h2>
      {fields.map(f => (
        <div key={f.id}>
          {f.type === 'checkbox' ? (
            <label className="flex items-start gap-2.5 text-sm text-sand-800">
              <input type="checkbox" checked={values[f.id] === true} onChange={e => set(f.id, e.target.checked)} className="mt-0.5 w-4 h-4 accent-brand-600" />
              <span>{f.label}{f.required && <span className="text-coral-500"> *</span>}</span>
            </label>
          ) : (
            <>
              <label className="block text-sm font-medium text-sand-700 mb-1.5">{f.label}{f.required && <span className="text-coral-500"> *</span>}</label>
              {f.type === 'textarea' ? (
                <textarea rows={3} value={(values[f.id] as string) ?? ''} onChange={e => set(f.id, e.target.value)} className="w-full border border-sand-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-400" />
              ) : f.id === 'dob' || f.id === 'date' ? (
                <input type="date" max="2100-12-31" value={(values[f.id] as string) ?? ''} onChange={e => set(f.id, e.target.value)} className="w-full border border-sand-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-400" />
              ) : (
                <input type="text" value={(values[f.id] as string) ?? ''} onChange={e => set(f.id, e.target.value)} className="w-full border border-sand-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-400" />
              )}
            </>
          )}
        </div>
      ))}
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button onClick={submit} disabled={busy} className="w-full bg-brand-600 text-white py-3 rounded-full font-medium hover:bg-brand-700 transition disabled:opacity-50 shadow-sm">
        {busy ? 'Sending…' : 'Submit'}
      </button>
      <p className="text-xs text-sand-400 text-center">Your answers go only to your tutor.</p>
    </div>
  )
}
