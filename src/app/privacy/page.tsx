import { SiteNav } from '@/components/SiteNav'
import { SiteFooter } from '@/components/SiteFooter'

export const metadata = {
  title: 'Privacy Policy — fair-do',
  description:
    'How fair-do handles personal data under UK GDPR — including the controller/processor split between fair-do and the tutors who use the studio portal, sub-processors, retention and your rights.',
}

export default function PrivacyPage() {
  return (
    <>
      <SiteNav />
      <main className="min-h-screen bg-gradient-to-b from-brand-50 via-sand-50 to-sand-50">
        <div className="max-w-2xl mx-auto px-5 sm:px-8 py-16">
          <h1 className="font-display text-4xl font-semibold text-brand-900 mb-2">Privacy Policy</h1>
          <p className="text-sand-500 text-sm mb-6">Last updated: July 2026 · Version 2.1</p>

          <div className="rounded-2xl border border-brand-100 bg-white/60 px-5 py-4 mb-10 text-sand-600 text-sm leading-relaxed">
            <p>
              This page is a plain-English summary of how fair-do handles personal data. Tutors who subscribe to
              fair-do receive the full Privacy Policy, Data Processing Agreement and Security &amp; Data Protection Policy
              as part of their subscription terms.
            </p>
          </div>

          <div className="space-y-8 text-sand-700 text-sm leading-relaxed">
            <section>
              <h2 className="font-display text-lg font-semibold text-brand-900 mb-3">1. Who we are</h2>
              <p>
                fair-do is a B2B SaaS studio portal for tutors. We provide software that an independent, UK-based
                tutor uses to run their own private studio — managing their own student list, scheduling and
                conducting video lessons, taking payments and keeping light notes. Our customer is the tutor.
              </p>
              <p className="mt-2">
                The portal is operated by <strong>[PLACEHOLDER: registered entity]</strong> (UK company registration
                pending). We are registered, or registering, with the Information Commissioner&apos;s Office (ICO).
              </p>
              <p className="mt-2">
                Contact:{' '}
                <a href="mailto:privacy@fair-do.com" className="text-brand-700 hover:underline">
                  privacy@fair-do.com
                </a>
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-brand-900 mb-3">2. Our two data-protection roles</h2>
              <p>
                It matters which role applies to a given piece of data. fair-do holds two distinct roles under UK GDPR:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2 mt-3">
                <li>
                  <strong>fair-do as controller.</strong> For the tutor&apos;s own account, identity, billing,
                  subscription, usage and support data — and for data about visitors to our website — fair-do is the{' '}
                  <strong>controller</strong>. This policy applies to that data.
                </li>
                <li>
                  <strong>fair-do as processor.</strong> For a tutor&apos;s <strong>students&apos;</strong> data
                  (including data about minors), fair-do is a <strong>processor</strong>, acting
                  only on the tutor&apos;s documented instructions under a Data Processing Agreement (UK GDPR Article
                  28). The <strong>tutor is the controller</strong> of that student data.
                </li>
              </ul>
              <p className="mt-3">
                fair-do does <strong>not</strong> own the teaching record and does not decide why or how a
                tutor&apos;s students&apos; data is used. Tutors keep teaching documents in their own storage; the
                portal holds only links to those documents plus light notes.
              </p>
              <p className="mt-2">
                <strong>If you are a student of a tutor who uses fair-do:</strong> this is not the right document for
                you. Please refer to <strong>your tutor&apos;s own privacy notice</strong>, and contact your tutor
                to exercise your rights. fair-do will assist your tutor as required under the DPA.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-brand-900 mb-3">3. What we collect (as controller)</h2>
              <p>We collect the following categories of personal data about tutors and website visitors:</p>
              <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
                <li>Account &amp; identity: name, email, phone, login credentials (passwords stored hashed via Clerk)</li>
                <li>Studio details: business name, qualification body, qualification reference and verification information</li>
                <li>Billing &amp; subscription: plan, transaction history, and records of the card-payment commission</li>
                <li>Usage &amp; analytics: features used, timestamps, IP address, device and log data</li>
                <li>Support &amp; communications: messages you send us and our responses</li>
                <li>Marketing data: contact details and preferences, where you have opted in</li>
              </ul>
              <p className="mt-3 text-sand-600">
                Not covered here: a tutor&apos;s students&apos; enrolment and lesson data. fair-do processes
                that only as a processor on the tutor&apos;s instructions under the DPA (see Section 2).
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-brand-900 mb-3">4. How we use your data (as controller)</h2>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>To create and manage the tutor&apos;s account and provide the portal (contract)</li>
                <li>To process the monthly subscription and the small card-payment commission (contract / legal obligation)</li>
                <li>To provide customer support and respond to enquiries</li>
                <li>To verify qualifications and eligibility to use the portal</li>
                <li>For security, fraud prevention and protecting the portal</li>
                <li>For product analytics and service improvement (aggregated where possible)</li>
              </ul>
              <p className="mt-3">
                We rely on the lawful bases of contract, legitimate interests, legal obligation and (for some marketing)
                consent. As controller, fair-do does not rely on these bases to process students&apos; data
                — that processing sits with the tutor as controller.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-brand-900 mb-3">5. Sub-processors</h2>
              <p>
                We use the following providers under written Article 28 terms. They process fair-do&apos;s controller data,
                and (under the DPA) act as sub-processors for student data:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
                <li>Vercel — application hosting (US/EU edge, SCCs / IDTA in place)</li>
                <li>Neon — application database (UK/EU regions selected where available)</li>
                <li>Clerk — authentication / identity (US, SCCs / IDTA in place)</li>
                <li>Stripe — payment processing, subscription billing and payouts (US/EU, SCCs in place)</li>
                <li>Daily — video lesson delivery and transcription (US, SCCs / IDTA in place)</li>
                <li>Anthropic — AI lesson notes and support triage; may process lesson transcripts, including of minors (US, SCCs / IDTA in place). See Section 11.</li>
                <li>Cloudinary — image and document hosting, including uploaded student documents (US/EU, SCCs / IDTA in place)</li>
                <li>Resend — transactional and account email (US, SCCs / IDTA in place)</li>
                <li>Twilio — SMS lesson reminders (US, SCCs / IDTA in place)</li>
                <li>Onfido — tutor credential / DBS verification (UK/EU)</li>
                <li>Upstash — rate-limiting (transient IP / account identifiers)</li>
                <li>Sentry — error monitoring (US/EU; configured not to capture personal data by default)</li>
                <li>Support mailbox provider (IMAP) — inbound support email</li>
                <li>Plausible — cookieless, privacy-focused website analytics (EU)</li>
              </ul>
              <p className="mt-3 text-sand-600">
                We keep a current sub-processor list and update it before adding any new provider that processes personal data.
              </p>
              <p className="mt-3">We do not sell your personal information.</p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-brand-900 mb-3">6. International data transfers</h2>
              <p>
                Our preferred residency for personal data is UK or EU regions. Some sub-processors are US-based (notably
                Vercel, Clerk, Stripe, Daily, Anthropic, Cloudinary, Resend and Twilio). Where personal data is
                transferred outside the UK, we put in place an
                appropriate safeguard — typically the UK International Data Transfer Agreement (IDTA) or the EU Standard
                Contractual Clauses (SCCs) with the UK Addendum — supported where required by a transfer risk assessment.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-brand-900 mb-3">7. Retention</h2>
              <p>
                We keep controller personal data only for as long as necessary, and to meet legal, accounting and
                dispute-resolution requirements (billing records are typically kept for around 6 years for tax purposes).
                When controller data is no longer required, we securely delete or anonymise it.
              </p>
              <p className="mt-2 text-sand-600">
                Retention of a tutor&apos;s students&apos; data is governed by the DPA and the tutor&apos;s own
                record-keeping obligations. fair-do returns or deletes that data on the tutor&apos;s instruction or
                on termination — fair-do does not set or hold the retention period.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-brand-900 mb-3">8. Your rights</h2>
              <p>
                Where fair-do is the controller of your data, under UK GDPR you have the right to access, rectify, erase,
                restrict and port your data, and to object to processing or withdraw consent. Contact{' '}
                <a href="mailto:privacy@fair-do.com" className="text-brand-700 hover:underline">
                  privacy@fair-do.com
                </a>{' '}
                to exercise any right. You also have the right to lodge a complaint with the ICO at ico.org.uk.
              </p>
              <p className="mt-2 text-sand-600">
                If you are a student of a tutor, contact your tutor (the controller) to exercise rights over your
                data — not fair-do.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-brand-900 mb-3">9. Cookies &amp; analytics</h2>
              <p>
                We use strictly necessary session cookies only (e.g. authentication and security) — no advertising
                trackers. For website analytics we use Plausible, which is cookieless and does not collect personal data
                or track you across sites.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-brand-900 mb-3">10. Children&apos;s data</h2>
              <p>
                fair-do is a tool for tutors, and tutors often teach children. fair-do does <strong>not</strong> offer
                accounts to children and does not market to them. A tutor&apos;s students may be minors, but that
                student data is processed by fair-do only as a <strong>processor</strong> on the tutor&apos;s
                instructions (see Section 2) — the tutor is the controller and is responsible for the lawful basis
                (including any parental consent) for teaching and recording that child.
              </p>
              <p className="mt-2">
                Consistent with the UK Age Appropriate Design Code (Children&apos;s Code), the portal is built to
                minimise data about minors: we collect only what a tutor enters, we do <strong>not profile children</strong>,
                do not use their data for advertising, and do not build behavioural profiles. Where a child&apos;s data is
                processed by AI features, see Section 11.
              </p>
              <p className="mt-2 text-sand-600">
                If you are a parent or guardian and want to exercise a child&apos;s data rights, contact the child&apos;s
                tutor (the controller). fair-do will support the tutor in responding.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-brand-900 mb-3">11. AI features</h2>
              <p>
                fair-do offers optional AI features. Where a tutor enables lesson notes, a lesson transcript (which may
                include a minor&apos;s voice and words) is sent to our AI sub-processor, <strong>Anthropic</strong>, to
                generate a written summary for the tutor. We also use Anthropic to triage inbound support email.
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
                <li>AI notes are generated on the <strong>tutor&apos;s instruction</strong> and are only visible to the tutor unless the tutor chooses to share them.</li>
                <li>Transcript and note content is <strong>not used to train third-party AI models</strong>; it is processed under Article 28 sub-processor terms.</li>
                <li>AI output is a draft aid for the tutor, not an automated decision about a student — there is no profiling and no automated decision-making with legal or similar effect.</li>
                <li>A tutor can operate fair-do without AI notes; the feature can be disabled.</li>
              </ul>
              <p className="mt-2 text-sand-600">
                Because this can involve minors&apos; data, tutors are responsible for having the appropriate lawful
                basis and consent before enabling AI notes for a child.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-brand-900 mb-3">12. Data breaches</h2>
              <p>
                We maintain security measures to protect personal data and have an incident-response process. Where
                fair-do is the <strong>controller</strong> and a personal data breach is likely to result in a risk to
                individuals, we will notify the ICO without undue delay and within 72 hours where required, and affected
                individuals where the risk is high.
              </p>
              <p className="mt-2 text-sand-600">
                Where fair-do is a <strong>processor</strong> (for a tutor&apos;s students&apos; data), we will notify
                the affected tutor (the controller) without undue delay after becoming aware of a breach, so the tutor
                can meet their own notification duties.
              </p>
            </section>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
