import { SchoolNav } from '@/components/SchoolNav'
import { getSchoolContext } from '@/lib/school'

// School-admin console shell. getSchoolContext 404s when the enterprise portal
// flag is off and redirects non-members, so every /school page is gated here.
export default async function SchoolLayout({ children }: { children: React.ReactNode }) {
  const { org, role } = await getSchoolContext()
  return (
    <div className="min-h-screen bg-sand-50">
      <SchoolNav schoolName={org.name} role={role} />
      <main className="max-w-6xl mx-auto px-5 sm:px-8 py-8">{children}</main>
    </div>
  )
}
