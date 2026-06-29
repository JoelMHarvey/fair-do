import { TherapistNav } from '@/components/TherapistNav'
import { AdminSubNav } from '@/components/AdminSubNav'

// Founder portal shares the same top nav + admin sub-nav as the admin area
// (Docs is an admin sub-nav item). Pages keep their own isFounder gate.
export default function FounderLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TherapistNav />
      <AdminSubNav />
      {children}
    </>
  )
}
