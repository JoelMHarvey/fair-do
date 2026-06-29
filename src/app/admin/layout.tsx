import { TherapistNav } from '@/components/TherapistNav'
import { AdminSubNav } from '@/components/AdminSubNav'

// Admin area shares the same top nav as the rest of the app, with an extra admin
// sub-nav. Pages keep their own auth gate + redirect, so a non-admin never reaches here.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TherapistNav />
      <AdminSubNav />
      {children}
    </>
  )
}
