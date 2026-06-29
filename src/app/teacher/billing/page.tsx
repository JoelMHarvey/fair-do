import { redirect, notFound } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { TherapistNav } from '@/components/TherapistNav'
import { PRACTICE_PORTAL_ENABLED } from '@/lib/practice'
import { PageHeader, HelpHint } from '@/components/Guidance'
import { HelpTip } from '@/components/HelpTip'
import { PRACTICE_TIERS, tierById } from '@/lib/billing'
import BillingClient from './BillingClient'

export const metadata = { title: 'Plan & billing — fair-do' }

export default async function BillingPage({ searchParams }: { searchParams: Promise<{ subscribed?: string }> }) {
  if (!PRACTICE_PORTAL_ENABLED) notFound()
  const { subscribed } = await searchParams

  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const user = await prisma.user.findUnique({ where: { clerkId: userId }, include: { teacher: true } })
  if (!user?.teacher) redirect('/onboarding')

  const sub = await prisma.subscription.findUnique({ where: { teacherId: user.teacher.id } })
  const active = !!sub && (sub.status === 'active' || sub.status === 'trialing')
  const currentTier = active ? tierById(sub!.tier) : undefined

  return (
    <main className="min-h-screen bg-sand-50">
      <TherapistNav />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <PageHeader
          title="Plan & billing"
          subtitle="You keep the great majority of every lesson. We only grow when you grow."
          help={{ href: '/teacher/help', label: 'How plans work' }}
        />

        <div className="mb-8">
          <HelpHint>
            Pick a monthly plan that fits how busy you are. On top of the plan price, we take a small
            commission&nbsp;
            <HelpTip label="What commission means">
              A small percentage of each lesson payment your students make through fair-do. It covers
              card processing and the booking tools — it&rsquo;s only ever taken from money you actually
              receive.
            </HelpTip>
            from each payment your students make through the platform. In return you get online
            bookings, secure card payments, automatic receipts, and the video room — no separate tools
            to wire up.
          </HelpHint>
        </div>

        {subscribed === '1' && (
          <div className="bg-brand-50 border border-brand-200 rounded-xl p-4 text-sm text-brand-800 mb-6">
            <strong>You’re subscribed.</strong> Your plan is active — thank you for building your practice with fair-do.
          </div>
        )}

        <div className="bg-white rounded-2xl border border-sand-200 p-5 mb-8">
          <p className="text-xs text-sand-500 mb-1 flex items-center">
            Current plan
            {sub?.currentPeriodEnd && active && currentTier && currentTier.pricePence > 0 && (
              <HelpTip label="What the renewal date means">
                This is the end of your current billing period — the day your plan renews for another
                month. You&rsquo;re only ever paid up to this date; nothing is charged beyond it.
              </HelpTip>
            )}
          </p>
          <p className="text-lg font-semibold text-sand-900">
            {currentTier ? currentTier.name : 'No active plan'}
            {sub && !active && <span className="text-sm font-normal text-amber-700"> · {sub.status}</span>}
          </p>
          <p className="text-sm text-sand-500 mt-1">
            {currentTier
              ? `${(currentTier.commissionBps / 100).toFixed(currentTier.commissionBps % 100 ? 1 : 0)}% per transaction`
              : 'Choose a plan below to start taking payments through fair-do.'}
            {sub?.currentPeriodEnd && active && currentTier && currentTier.pricePence > 0 &&
              ` · renews ${sub.currentPeriodEnd.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`}
          </p>
        </div>

        <BillingClient
          tiers={PRACTICE_TIERS}
          currentTierId={active ? sub!.tier : null}
          hasCustomer={!!sub?.stripeCustomerId}
        />

        {active && (
          <div className="mt-8">
            <HelpHint tone="note">
              Need to change or cancel? You can manage everything — update your card, switch plan, or
              cancel — in the billing portal&nbsp;
              <HelpTip label="What the billing portal is">
                A secure page run by our payment provider where you can view invoices, update your
                payment card, change plan, or cancel. The button to open it is just above.
              </HelpTip>
              . If you cancel, your plan stays active until the end of the period you&rsquo;ve already
              paid for, and your student records and past receipts are kept safe.
            </HelpHint>
          </div>
        )}

        <p className="text-xs text-sand-400 mt-8">
          Prices shown are per month, exclusive of VAT. Commission is taken from payments you process
          through fair-do; payouts reach your bank a couple of business days after each lesson.
        </p>
      </div>
    </main>
  )
}
