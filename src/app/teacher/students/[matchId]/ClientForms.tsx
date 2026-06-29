'use client'

import { useState } from 'react'
import { FORM_TEMPLATES, type FormField } from '@/lib/forms'

type Form = { id: string; title: string; status: string; token: string; fields?: FormField[]; responses?: Record<string, unknown> | null }

export default function ClientForms({ matchId, appUrl, initial }: { matchId: string; appUrl: string; initial: Form[] }) {
  const [forms, setForms] = useState<Form[]>(initial)
  const [busy, setBusy] = useState('')
  const [copied, setCopied] = useState('')

  async function send(templateKey: string) {
    setBusy(templateKey)
    const res = await fetch(`/api/practice/students/${matchId}/forms`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ templateKey }),
    })
    if (res.ok) { const { form } = await res.json(); setForms(f => [{ ...form, responses: null }, ...f]) }
    setBusy('')
  }

  async function remove(id: string) {
    setForms(f => f.filter(x => x.id !== id))
    await fetch(`/api/practice/students/${matchId}/forms`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) }).catch(() => {})
  }

  function copy(token: string) {
    navigator.clipboard?.writeText(`${appUrl}/forms/${token}`).then(() => { setCopied(token); setTimeout(() => setCopied(''), 1600) }).catch(() => {})
  }

  return (
    <div>
      {forms.length > 0 && (
        <div className="bg-white rounded-2xl border border-sand-200 overflow-hidden mb-3">
          {forms.map((f, i) => (
            <div key={f.id} className={`px-5 py-4 ${i > 0 ? 'border-t border-sand-100' : ''}`}>
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-sand-900">{f.title}</span>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${f.status === 'completed' ? 'bg-brand-50 text-brand-700' : 'bg-amber-50 text-amber-700'}`}>
                    {f.status === 'completed' ? 'Completed' : 'Awaiting'}
                  </span>
                  {f.status !== 'completed' && (
                    <button onClick={() => copy(f.token)} className="text-xs text-brand-700 hover:underline">{copied === f.token ? 'Copied' : 'Copy link'}</button>
                  )}
                  <button onClick={() => remove(f.id)} aria-label="Remove form" className="text-sand-400 hover:text-red-500 text-xs">Remove</button>
                </div>
              </div>
              {f.status === 'completed' && f.fields && f.responses && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs text-brand-700">View responses</summary>
                  <dl className="mt-2 space-y-1.5">
                    {f.fields.map(fl => (
                      <div key={fl.id} className="text-sm">
                        <dt className="text-xs text-sand-500">{fl.label}</dt>
                        <dd className="text-sand-800">{fl.type === 'checkbox' ? (f.responses![fl.id] ? '✓ Yes' : '—') : (String(f.responses![fl.id] ?? '—'))}</dd>
                      </div>
                    ))}
                  </dl>
                </details>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {FORM_TEMPLATES.map(t => (
          <button key={t.key} onClick={() => send(t.key)} disabled={busy === t.key} className="text-sm bg-white border border-sand-200 hover:border-brand-300 text-sand-700 rounded-full px-4 py-2 transition disabled:opacity-50">
            {busy === t.key ? 'Creating…' : `+ Send ${t.title.toLowerCase()}`}
          </button>
        ))}
      </div>
    </div>
  )
}
