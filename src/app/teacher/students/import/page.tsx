import { redirect, notFound } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { TeacherNav } from '@/components/TeacherNav'
import { PRACTICE_PORTAL_ENABLED } from '@/lib/practice'
import { PageHeader, HelpHint } from '@/components/Guidance'
import { HelpTip } from '@/components/HelpTip'
import ImportForm from './ImportForm'

export const metadata = { title: 'Import students — fair-do' }

export default async function ImportClientsPage() {
  if (!PRACTICE_PORTAL_ENABLED) notFound()

  const { userId } = await auth()
  if (!userId) redirect('/sign-in')
  const user = await prisma.user.findUnique({ where: { clerkId: userId }, include: { teacher: true } })
  if (!user?.teacher) redirect('/onboarding')

  return (
    <main className="min-h-screen bg-sand-50">
      <TeacherNav />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <PageHeader
          title="Add your students in one go"
          subtitle="Bring your whole caseload across at once. We’ll create each student for you and send them a private invite to join your practice — students you already have, or have already invited, are skipped automatically."
          help={{ href: '/teacher/help', label: 'How importing works' }}
        />

        <div className="mb-6">
          <HelpHint>
            You don’t need a special file. Just type or paste your students in the box below — one student on each line, starting with their email address. That’s it.
          </HelpHint>
        </div>

        <div className="bg-white rounded-2xl border border-sand-200 p-5 mb-6 text-sm text-sand-600">
          <p className="font-medium text-sand-800 mb-2 flex items-center">
            What to put on each line
            <HelpTip>
              Put one student per line. Start with their email address. If you like, add their first name and your price for them after a comma — but both are optional, so an email on its own is perfectly fine.
            </HelpTip>
          </p>
          <p className="mb-2">Each line is: <strong>email</strong>, then optionally their <strong>first name</strong>, then optionally a <strong>rate in £</strong> — separated by commas. For example:</p>
          <pre className="bg-sand-50 rounded-lg p-3 text-xs text-sand-700 overflow-x-auto">email, first name, rate (£)
jane@example.com, Jane, 60
sam@example.com, Sam
alex@example.com</pre>
          <p className="text-xs text-sand-400 mt-2">
            So <strong>jane@example.com, Jane, 60</strong> means Jane, charged £60 a lesson. <strong>alex@example.com</strong> on its own works too — just the email. First name and rate are optional, and if your first line says “email” we’ll treat it as a heading and skip it.
          </p>
        </div>

        <HelpHint tone="note">
          <span className="flex items-center">
            Pasting from a spreadsheet?
            <HelpTip>
              A spreadsheet (like Excel or Google Sheets) often lets you “export as CSV”, which just means a plain list with commas between the columns — exactly the format here. But you don’t have to: copying your email column and pasting it in works just as well.
            </HelpTip>
          </span>
          <span className="block mt-1">Copy the column with email addresses and paste it straight in. One email per line is all we need.</span>
        </HelpHint>

        <div className="mt-6">
          <ImportForm />
        </div>
      </div>
    </main>
  )
}
