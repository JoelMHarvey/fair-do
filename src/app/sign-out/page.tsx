'use client'

import { useEffect } from 'react'
import { useClerk } from '@clerk/nextjs'
import { Logo } from '@/components/Logo'

export default function SignOutPage() {
  const { signOut } = useClerk()

  useEffect(() => {
    signOut({ redirectUrl: '/' })
  }, [signOut])

  return (
    <main className="min-h-screen bg-sand-50 flex flex-col items-center justify-center gap-4">
      <Logo />
      <p className="text-sand-500 text-sm">Signing you out…</p>
    </main>
  )
}
