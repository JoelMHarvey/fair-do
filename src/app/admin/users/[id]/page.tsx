import { redirect, notFound } from 'next/navigation'
import { auth, clerkClient } from '@clerk/nextjs/server'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { isAdminUser, isAdminEmail } from '@/lib/admin'
import { isFounder } from '@/lib/founder'
import RoleActions from '../RoleActions'
import ImpersonateButton from './ImpersonateButton'
import BlockButton from './BlockButton'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'User — fair-do admin' }

const IMPERSONATION_ENABLED = process.env.ADMIN_IMPERSONATION_ENABLED === 'true'

function fmt(d: Date | null | undefined): string {
  return d ? d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
}
function fmtMs(ms: number | null | undefined): string {
  return ms ? new Date(ms).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : '—'
}
function expired(d: Date | null | undefined): boolean {
  return !!d && d.getTime() < Date.now()
}

function Check({ ok, label, hint }: { ok: boolean; label: string; hint?: string }) {
  return (
    <li className="flex items-start gap-2 text-sm">
      <span className={ok ? 'text-brand-600' : 'text-amber-600'} aria-hidden>{ok ? '✓' : '⚠'}</span>
      <span>
        <span className={ok ? 'text-sand-700' : 'text-amber-700'}>{label}</span>
        {!ok && hint && <span className="text-sand-400"> — {hint}</span>}
      </span>
    </li>
  )
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 text-sm border-b border-sand-100 last:border-0">
      <span className="text-sand-500">{k}</span>
      <span className="text-sand-800 text-right">{v}</span>
    </div>
  )
}

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')
  const me = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!isAdminUser(me) && !(await isFounder())) redirect('/')

  const u = await prisma.user.findUnique({
    where: { id },
    include: { teacher: { include: { subscription: true } }, student: true },
  })
  if (!u) notFound()
  const t = u.teacher

  // Teacher activity (cheap, indexed counts).
  const [sessionsTotal, upcoming, completed, lastSession, broadcastCount] = t
    ? await Promise.all([
        prisma.session.count({ where: { teacherId: t.id } }),
        prisma.session.count({ where: { teacherId: t.id, status: 'SCHEDULED', scheduledAt: { gte: new Date() } } }),
        prisma.session.count({ where: { teacherId: t.id, status: 'COMPLETED' } }),
        prisma.session.findFirst({ where: { teacherId: t.id }, orderBy: { scheduledAt: 'desc' }, select: { scheduledAt: true } }),
        prisma.broadcast.count({ where: { teacherId: t.id } }),
      ])
    : [0, 0, 0, null, 0]

  // Clerk account facts + live session.
  let emailVerified = false
  let online = false
  let lastActiveAt: number | null = null
  let lastSignInAt: number | null = null
  let banned = false
  try {
    const clerk = await clerkClient()
    const cu = await clerk.users.getUser(u.clerkId)
    emailVerified = cu.emailAddresses.find(e => e.id === cu.primaryEmailAddressId)?.verification?.status === 'verified'
    lastActiveAt = cu.lastActiveAt ?? null
    lastSignInAt = cu.lastSignInAt ?? null
    banned = cu.banned
    const sessions = await clerk.sessions.getSessionList({ userId: u.clerkId, status: 'active', limit: 5 })
    online = sessions.data.length > 0
  } catch (e) {
    console.error('[admin/users/:id] clerk lookup failed:', e)
  }

  const sub = t?.subscription
  const allowlisted = isAdminEmail(u.email)
  const isSelf = u.id === me?.id
  const canImpersonate = IMPERSONATION_ENABLED && !isSelf && !allowlisted && u.role !== 'ADMIN'
  const canBlock = !isSelf && !allowlisted && u.role !== 'ADMIN'
  const name = t ? `${t.firstName} ${t.lastName}` : null

  return (
    <main className="min-h-screen bg-sand-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <Link href="/admin/users" className="text-sm text-sand-500 hover:text-brand-700">← All users</Link>
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${online ? 'bg-green-500' : 'bg-sand-300'}`} title={online ? 'Online now' : 'Offline'} />
              <h1 className="font-display text-xl font-semibold text-sand-900 truncate">{name ?? u.email}</h1>
            </div>
            <p className="text-sm text-sand-500 mt-0.5">{u.email}</p>
          </div>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-sand-100 text-sand-600 shrink-0">{u.role.toLowerCase()}{allowlisted && ' ★'}</span>
        </div>

        {banned && <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5">This Clerk account is banned.</div>}

        {/* Account */}
        <section className="bg-white rounded-2xl border border-sand-200 p-5">
          <h2 className="text-sm font-semibold text-sand-900 mb-2">Account</h2>
          <Row k="Email" v={<>{u.email} {emailVerified ? <span className="text-brand-600">✓</span> : <span className="text-amber-600">unverified</span>}</>} />
          <Row k="Role" v={u.role.toLowerCase()} />
          <Row k="Country" v={u.country} />
          <Row k="Joined" v={fmt(u.createdAt)} />
          <Row k="Online now" v={online ? 'yes' : 'no'} />
          <Row k="Last active" v={fmtMs(lastActiveAt)} />
          <Row k="Last sign-in" v={fmtMs(lastSignInAt)} />
        </section>

        {/* Teacher setup */}
        {t && (
          <section className="bg-white rounded-2xl border border-sand-200 p-5">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-sand-900">Teacher setup</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-sand-100 text-sand-600">{t.status.toLowerCase()}</span>
            </div>
            <Row k="Practice" v={t.practiceName ?? '—'} />
            <Row k="Booking page" v={t.practiceSlug ? <Link href={`/p/${t.practiceSlug}`} className="text-brand-700">/{t.practiceSlug}</Link> : '—'} />
            <Row k="Qualification" v={`${t.qualificationBody} ${t.qualificationRef}`} />
            <Row k="Plan" v={sub ? `${sub.tier} · ${sub.status}` : 'none'} />
            <Row k="Stripe payouts" v={t.stripeOnboarded ? 'connected' : t.stripeAccountId ? 'started, not enabled' : 'not connected'} />

            <h3 className="text-xs font-medium text-sand-500 uppercase tracking-wide mt-4 mb-2">Setup &amp; issues</h3>
            <ul className="space-y-1.5">
              <Check ok={emailVerified} label="Email verified" hint="ask them to confirm their email" />
              <Check ok={t.status === 'ACTIVE'} label="Approved &amp; active" hint={t.status === 'PENDING' ? 'pending approval' : t.status.toLowerCase()} />
              <Check ok={t.credentialVerified} label="Credentials verified" hint="run the credential check" />
              <Check ok={t.stripeOnboarded} label="Can take payments (Stripe)" hint="connect a bank account in onboarding" />
              <Check ok={!expired(t.qualificationExpiry)} label="Qualification in date" hint="qualification expired" />
              <Check ok={!!t.agreementAcceptedAt} label="Agreement + DPA accepted" hint="not accepted" />
              {sub && <Check ok={sub.status === 'active' || sub.status === 'trialing'} label="Subscription active" hint={sub.status} />}
            </ul>
          </section>
        )}

        {/* Activity */}
        {t && (
          <section className="bg-white rounded-2xl border border-sand-200 p-5">
            <h2 className="text-sm font-semibold text-sand-900 mb-2">Activity</h2>
            <Row k="Lessons" v={`${sessionsTotal} total · ${completed} completed · ${upcoming} upcoming`} />
            <Row k="Last lesson" v={fmt(lastSession?.scheduledAt ?? null)} />
            <Row k="Broadcasts sent" v={broadcastCount} />
          </section>
        )}

        {/* Management */}
        <section className="bg-white rounded-2xl border border-sand-200 p-5">
          <h2 className="text-sm font-semibold text-sand-900 mb-3">Manage access</h2>
          {isSelf ? (
            <p className="text-sm text-sand-400">This is your own account — you can't change your own role here.</p>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              <RoleActions userId={u.id} role={u.role} isSelf={isSelf} allowlisted={allowlisted} />
              {t?.status === 'PENDING' && (
                <Link href="/admin" className="text-xs px-2 py-1 rounded-md border border-brand-200 text-brand-700 hover:bg-brand-50">Approve in queue →</Link>
              )}
              {canImpersonate && <ImpersonateButton userId={u.id} email={u.email} />}
              {canBlock && <BlockButton userId={u.id} email={u.email} banned={banned} />}
            </div>
          )}
          {IMPERSONATION_ENABLED ? (
            !canImpersonate && !isSelf && <p className="text-xs text-sand-400 mt-2">Impersonation isn't available for admin / allowlisted accounts.</p>
          ) : (
            <p className="text-xs text-sand-400 mt-3">Impersonation is off. Set <code className="text-sand-500">ADMIN_IMPERSONATION_ENABLED=true</code> to enable "sign in as this user".</p>
          )}
        </section>
      </div>
    </main>
  )
}
