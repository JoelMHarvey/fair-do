import { notFound } from 'next/navigation'
import Link from 'next/link'
import { SiteFooter } from '@/components/SiteFooter'
import { isFounder } from '@/lib/founder'
import { Mermaid } from './Mermaid'

export const metadata = { title: 'System diagrams — fair-do', robots: { index: false, follow: false } }

const DIAGRAMS: { id: string; title: string; blurb: string; chart: string }[] = [
  {
    id: 'arch',
    title: 'System architecture',
    blurb: 'Clients reach a Clerk-guarded Next.js app that talks to Prisma/Neon and the external services.',
    chart: `flowchart TB
  subgraph CL["Clients"]
    W["Web browser"]
    M["Teacher app (Expo)"]
  end
  CK["Clerk middleware — cookie + bearer"]
  subgraph APP["Next.js 16 (Vercel)"]
    P["RSC pages"]
    API["REST API (60 routes)"]
    MA["Mobile read API"]
    WH["Webhooks: Stripe / Clerk / Daily"]
    CR["Cron x6"]
  end
  subgraph EXT["External services"]
    ST["Stripe Connect"]
    DL["Daily.co"]
    RS["Resend"]
    IM["IMAP"]
    TW["Twilio"]
    AN["Anthropic"]
    CD["Cloudinary"]
    PL["Plausible"]
  end
  PR["Prisma 6"]
  DB[("Neon Postgres — 32 models")]
  W --> CK
  M -->|bearer| CK
  CK --> APP
  API --> PR
  MA --> PR
  P --> PR
  PR --> DB
  API --> ST
  API --> DL
  API --> RS
  CR --> AN
  CR --> IM
  ST --> WH
  WH --> API`,
  },
  {
    id: 'booking',
    title: 'Booking & payment flow',
    blurb: 'A booking creates a session (slotKey guards against double-booking), then settles by card via Stripe Connect or from internal credit.',
    chart: `flowchart TD
  A["Booking request"] --> B["Session created — slotKey guard"]
  B --> D{"Funding?"}
  D -->|card| C1["Stripe Checkout — destination charge"]
  C1 --> C2["Webhook: checkout.session.completed"]
  C2 --> C3["Payment + commission split"]
  D -->|credit| I1["Org pool / personal credit (atomic)"]
  C3 --> MG["Daily room + confirm emails"]
  I1 --> MG
  MG --> S["Session — Daily video"]
  S --> P["Payout to teacher (~2 days)"]
  S -.->|cancel| R["refund.ts — reverse_transfer if transferred; restore credit if internal"]
  CN["Commission — Starter 2.5% · Practice 1% · School 0%"]`,
  },
  {
    id: 'inbox',
    title: 'Inbox agent flow',
    blurb: 'A cron polls support mail, triages each message with Anthropic, then drafts, sends, or escalates by the active autonomy level. Off by default.',
    chart: `flowchart TD
  CRn["Cron /api/cron/inbox — 5 min"] --> IM["IMAP poll unseen"]
  IM --> DE["Dedupe by Message-ID"]
  DE --> RO["Resolve sender role"]
  RO --> TR["Triage — Anthropic (structured)"]
  TR --> DA{"decideAction(level)"}
  DA -->|serious| E["Escalate — email founder + push"]
  DA -->|send| SD["Resend threaded reply (ack / fix)"]
  DA -->|draft| DR["Draft to dashboard review"]
  E --> AU["InboxMessage audit + mark Seen"]
  SD --> AU
  DR --> AU`,
  },
  {
    id: 'onboarding',
    title: 'Teacher onboarding & credential verification',
    blurb: 'Sign-up lands in PENDING; an admin verifies the qualification, then the credentials cron monitors expiry forever.',
    chart: `flowchart TD
  S1["Teacher signs up (Clerk)"] --> S2["onboarding/teacher — qualification ref / rates"]
  S2 --> S3["status = PENDING"]
  S3 --> V{"Admin verify (/admin)"}
  V -->|approve| A1["ACTIVE + credentialVerified + CredentialCheck log"]
  A1 --> A2["Stripe Connect onboarding -> stripeOnboarded"]
  A2 --> A3["BOOKABLE"]
  V -->|reject| RJ["SUSPENDED + reason + email"]
  A3 -.->|credentials cron| CMon["nudge 60/30/14/7/1d -> 14d grace -> auto-suspend"]`,
  },
  {
    id: 'data',
    title: 'Data model (core)',
    blurb: 'The relational core: a User is a Teacher or Student; Match is the hub for lessons, payments, messages and notes.',
    chart: `erDiagram
  User ||--o| Teacher : "is"
  User ||--o| Student : "is"
  Teacher ||--o{ Match : "has"
  Student ||--o{ Match : "has"
  Teacher ||--o| Subscription : "has"
  Teacher ||--o{ Availability : "has"
  Teacher ||--o{ CredentialCheck : "log"
  Organisation ||--o{ Student : "pools"
  Match ||--o{ Session : "has"
  Match ||--o| MessageThread : "has"
  Match ||--o{ StudentDocument : "has"
  Session ||--o| Payment : "has"
  Session ||--o| Review : "has"
  Student ||--o{ Payment : "makes"`,
  },
  {
    id: 'schema',
    title: 'Database schema (all tables)',
    blurb: 'Every Prisma model and how they relate. Wide — scroll sideways. Standalone tables (cron/ops/audit) sit on their own.',
    chart: `erDiagram
  User ||--o| Teacher : "is"
  User ||--o| Student : "is"
  Organisation ||--o{ Student : "members"
  Teacher ||--o| Subscription : "subscription"
  Teacher ||--o{ Availability : "availability"
  Teacher ||--o{ Match : "matches"
  Teacher ||--o{ Session : "sessions"
  Teacher ||--o{ MessageThread : "threads"
  Teacher ||--o{ Complaint : "complaints"
  Teacher ||--o{ CredentialCheck : "checks"
  Teacher ||--o{ Review : "reviews"
  Teacher ||--o{ TeacherReferral : "referrals"
  Teacher ||--o{ StudentInvite : "invites"
  Teacher ||--o{ Package : "packages"
  Teacher ||--o{ Broadcast : "broadcasts"
  Student ||--o{ Match : "matches"
  Student ||--o{ Session : "sessions"
  Student ||--o{ MessageThread : "threads"
  Student ||--o{ Payment : "payments"
  Student ||--o{ SessionParticipant : "participations"
  Student ||--o{ Referral : "referrals"
  Student ||--o{ Review : "reviews"
  Student ||--o{ Package : "packages"
  Match ||--o{ Session : "sessions"
  Match ||--o| MessageThread : "thread"
  Match ||--o{ StudentDocument : "documents"
  Match ||--o{ StudentForm : "forms"
  Session ||--o| Payment : "payment"
  Session ||--o| Review : "review"
  Session ||--o{ SessionParticipant : "participants"
  MessageThread ||--o{ Message : "messages"
  FxRate {}
  CronRun {}
  AlertState {}
  ProcessedStripeEvent {}
  PendingSelfBooking {}
  GiftVoucher {}
  PushSubscription {}
  NativeDevice {}
  Setting {}
  InboxMessage {}`,
  },
]

export default async function FounderArchitecturePage() {
  if (!(await isFounder())) notFound()

  return (
    <>
      <main className="min-h-screen bg-gradient-to-b from-brand-50 via-sand-50 to-sand-50">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 py-14">
          <p className="text-xs font-semibold uppercase tracking-wide text-coral-600 mb-2">Founder · private</p>
          <h1 className="font-display text-4xl font-semibold text-brand-900">System diagrams</h1>
          <p className="text-sand-700 mt-3 mb-6">
            How fair-do fits together — architecture, the money path, the inbox agent, onboarding, and the data model.
          </p>
          <Link
            href="/founder"
            className="inline-flex items-center gap-2 mb-10 bg-white border border-sand-200 hover:border-brand-300 rounded-full px-4 py-2 text-sm font-medium text-brand-800 transition"
          >
            ← Back to docs
          </Link>

          <div className="space-y-8">
            {DIAGRAMS.map((d) => (
              <section key={d.id} className="bg-white rounded-2xl border border-sand-200 p-5 sm:p-6">
                <h2 className="font-display text-lg font-semibold text-brand-900 mb-1">{d.title}</h2>
                <p className="text-sand-500 text-sm mb-4">{d.blurb}</p>
                <Mermaid id={d.id} chart={d.chart} />
              </section>
            ))}
          </div>

          <p className="text-xs text-sand-400 mt-12">
            Generated from the codebase. Source of truth is the repo; this is a read-only view.
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
