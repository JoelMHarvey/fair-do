import { notFound } from 'next/navigation'
import { SiteFooter } from '@/components/SiteFooter'
import { isFounder } from '@/lib/founder'
import { collectMetrics } from '@/lib/monitoring'
import { HealthDashboard } from '@/components/HealthDashboard'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'System health — fair-do', robots: { index: false, follow: false } }

export default async function FounderHealthPage() {
  if (!(await isFounder())) notFound()

  const m = await collectMetrics()
  return (
    <>
      <main className="min-h-screen bg-gradient-to-b from-brand-50 via-sand-50 to-sand-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-coral-600">Founder · private</p>
        </div>
        <HealthDashboard m={m} backHref="/founder" backLabel="← Docs" />
      </main>
      <SiteFooter />
    </>
  )
}
