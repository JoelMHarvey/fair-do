import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Logo } from '@/components/Logo'
import { PRACTICE_PORTAL_ENABLED } from '@/lib/practice'
import type { FormField } from '@/lib/forms'
import FormFill from './FormFill'

export const metadata = { title: 'Your form — fair-do', robots: { index: false, follow: false } }

export default async function PublicFormPage({ params }: { params: Promise<{ token: string }> }) {
  if (!PRACTICE_PORTAL_ENABLED) notFound()
  const { token } = await params
  const form = await prisma.studentForm.findUnique({ where: { token } })
  if (!form) notFound()

  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-50 via-sand-50 to-sand-50">
      <nav className="bg-white/80 backdrop-blur border-b border-sand-200 px-5 sm:px-8 h-16 flex items-center">
        <Logo />
      </nav>
      <div className="max-w-xl mx-auto px-5 sm:px-8 py-12">
        <p className="text-sm text-sand-600 mb-6">Your tutor has asked you to complete this. It only takes a few minutes, and your answers go straight to them.</p>
        {form.status === 'completed' ? (
          <div className="bg-white rounded-3xl border border-sand-200 p-8 text-center shadow-sm">
            <div className="text-4xl mb-3">✓</div>
            <h2 className="font-display text-xl font-semibold text-brand-900 mb-1">Already completed</h2>
            <p className="text-sand-600">Thanks — this form has been submitted. You can close this page.</p>
          </div>
        ) : (
          <FormFill token={token} title={form.title} fields={form.fields as unknown as FormField[]} />
        )}
      </div>
    </main>
  )
}
