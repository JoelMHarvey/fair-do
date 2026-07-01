'use client'

import { useState } from 'react'

// Small inline "Remove" control for a parent link on the student detail page.
// Confirms, POSTs to the revoke API, then refreshes.
export default function RevokeParentButton({ parentLinkId }: { parentLinkId: string }) {
  const [busy, setBusy] = useState(false)

  async function revoke() {
    if (!confirm('Remove this parent’s access to this student? They can be re-invited later.')) return
    setBusy(true)
    const res = await fetch('/api/teacher/parent/revoke', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ parentLinkId }),
    })
    if (res.ok) {
      window.location.reload()
    } else {
      setBusy(false)
      alert('Could not remove access. Please try again.')
    }
  }

  return (
    <button
      onClick={revoke}
      disabled={busy}
      className="text-xs text-red-600 hover:text-red-700 hover:underline disabled:opacity-50"
    >
      {busy ? '…' : 'Remove'}
    </button>
  )
}
