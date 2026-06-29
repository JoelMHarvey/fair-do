'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

// PARENT is a valid role (set via the parent-portal accept flow) but not a manual
// switch target here, so it's in the type but not in ALL.
type Role = 'STUDENT' | 'TEACHER' | 'ADMIN' | 'PARENT'
const ALL: Role[] = ['STUDENT', 'TEACHER', 'ADMIN']
const LABEL: Record<Role, string> = { STUDENT: 'student', TEACHER: 'teacher', ADMIN: 'admin', PARENT: 'parent' }

export default function RoleActions({
  userId, role, isSelf, allowlisted,
}: { userId: string; role: Role; isSelf: boolean; allowlisted: boolean }) {
  const router = useRouter()
  const [busy, setBusy] = useState<Role | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (isSelf) return <span className="text-xs text-sand-400">—</span>

  async function set(next: Role) {
    if (busy) return
    const verb = next === 'ADMIN' ? 'Make this user an admin' : `Set this user to ${LABEL[next]}`
    if (!window.confirm(`${verb}?`)) return
    setBusy(next)
    setError(null)
    try {
      const res = await fetch('/api/admin/users/role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: next }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) { setError(data.error ?? 'Failed'); setBusy(null); return }
      router.refresh()
    } catch {
      setError('Failed'); setBusy(null)
    }
  }

  return (
    <div className="inline-flex items-center gap-1.5 justify-end flex-wrap">
      {ALL.filter(r => r !== role).map(r => (
        <button
          key={r}
          onClick={() => set(r)}
          disabled={!!busy}
          className={`text-xs px-2 py-1 rounded-md border transition disabled:opacity-50 ${
            r === 'ADMIN'
              ? 'border-red-200 text-red-700 hover:bg-red-50'
              : 'border-sand-200 text-sand-600 hover:bg-sand-50'
          }`}
        >
          {busy === r ? '…' : r === 'ADMIN' ? 'Make admin' : `Make ${LABEL[r]}`}
        </button>
      ))}
      {allowlisted && <span className="text-[10px] text-sand-400" title="Allowlisted — stays admin regardless">locked</span>}
      {error && <span className="text-[10px] text-red-600">{error}</span>}
    </div>
  )
}
