'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function CredentialVisibilityCard({
  initial,
  qualificationBody,
  verified,
  hasCertificate,
}: {
  initial: boolean
  qualificationBody: string | null
  verified: boolean
  hasCertificate: boolean
}) {
  const router = useRouter()
  const [show, setShow] = useState(initial)
  const [busy, setBusy] = useState(false)

  async function toggle() {
    const next = !show
    setShow(next)
    setBusy(true)
    await fetch('/api/teacher/credential-visibility', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ show: next }),
    }).catch(() => setShow(!next))
    setBusy(false)
    router.refresh()
  }

  return (
    <div className="bg-white rounded-2xl border border-sand-200 p-5">
      <h3 className="font-medium text-sand-900 mb-1">Show credentials to parents</h3>
      <p className="text-sm text-sand-500 mb-4">
        When a parent follows a student, you can choose to show your teaching qualification
        {hasCertificate ? ' and certificate' : ''} on their portal — reassuring for parents
        choosing a tutor for their child.
      </p>

      {!qualificationBody ? (
        <p className="text-sm text-sand-400">Add your qualification on your profile first — then you can show it here.</p>
      ) : (
        <>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={show} disabled={busy} onChange={toggle} className="h-4 w-4 accent-brand-600" />
            <span className="text-sm text-sand-800">Show my credentials on the parent portal</span>
          </label>
          {show && (
            <div className="mt-3 rounded-xl bg-brand-50/60 border border-brand-100 px-3 py-2 text-sm text-sand-700">
              Parents will see: <strong>{qualificationBody}</strong>
              {verified && <span className="text-brand-700"> · Verified ✓</span>}
              {hasCertificate && <span className="text-sand-500"> · certificate viewable</span>}
            </div>
          )}
        </>
      )}
    </div>
  )
}
