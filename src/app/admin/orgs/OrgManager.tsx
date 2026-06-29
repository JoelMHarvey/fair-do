'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Org = {
  id: string
  name: string
  contactEmail: string
  domain: string | null
  seatsTotal: number
  creditPoolPence: number
  members: number
  active: boolean
}

export default function OrgManager({ orgs }: { orgs: Org[] }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [domain, setDomain] = useState('')
  const [pool, setPool] = useState('')
  const [busy, setBusy] = useState(false)

  async function create() {
    setBusy(true)
    await fetch('/api/admin/org', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create',
        name,
        contactEmail,
        domain: domain || undefined,
        initialPoolPence: pool ? Math.round(parseFloat(pool) * 100) : 0,
      }),
    })
    setName(''); setContactEmail(''); setDomain(''); setPool('')
    router.refresh()
    setBusy(false)
  }

  async function topup(orgId: string) {
    const amount = prompt('Top up amount (£)?')
    if (!amount) return
    await fetch('/api/admin/org', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'topup', orgId, amountPence: Math.round(parseFloat(amount) * 100) }),
    })
    router.refresh()
  }

  const input = 'w-full border border-sand-300 rounded-xl px-4 py-2.5 text-sand-900 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-400'

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-3xl border border-sand-200 p-6 shadow-sm">
        <h2 className="font-display text-lg font-semibold text-brand-900 mb-4">New organisation</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input className={input} placeholder="Company name" value={name} onChange={e => setName(e.target.value)} />
          <input className={input} placeholder="Contact email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} />
          <input className={input} placeholder="Email domain (e.g. acme.com)" value={domain} onChange={e => setDomain(e.target.value)} />
          <input className={input} type="number" placeholder="Initial credit pool (£)" value={pool} onChange={e => setPool(e.target.value)} />
        </div>
        <button
          onClick={create}
          disabled={!name || !/\S+@\S+/.test(contactEmail) || busy}
          className="mt-4 bg-brand-600 text-white px-6 py-2.5 rounded-full font-medium hover:bg-brand-700 transition disabled:opacity-40"
        >
          {busy ? 'Creating…' : 'Create organisation'}
        </button>
      </div>

      <div>
        <h2 className="text-sm font-medium text-sand-500 uppercase tracking-wide mb-4">Organisations</h2>
        {orgs.length === 0 ? (
          <div className="bg-white rounded-3xl border border-sand-200 p-8 text-center text-sand-400 text-sm">No organisations yet</div>
        ) : (
          <div className="space-y-3">
            {orgs.map(o => (
              <div key={o.id} className="bg-white rounded-3xl border border-sand-200 p-5 shadow-sm flex items-center justify-between gap-4">
                <div>
                  <a href={`/admin/orgs/${o.id}`} className="font-display text-lg font-semibold text-brand-900 hover:text-brand-700">{o.name}</a>
                  <p className="text-sm text-sand-500">{o.contactEmail}{o.domain ? ` · @${o.domain}` : ''} · {o.members} member{o.members !== 1 ? 's' : ''}</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-xl font-semibold text-brand-700">£{(o.creditPoolPence / 100).toFixed(2)}</p>
                  <div className="flex gap-3 mt-1 justify-end">
                    <a href={`/admin/orgs/${o.id}`} className="text-sm text-sand-500 hover:text-brand-700">Report</a>
                    <button onClick={() => topup(o.id)} className="text-sm text-brand-600 hover:text-brand-700">Top up →</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
