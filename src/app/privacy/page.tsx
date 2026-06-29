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
          <p className="text-sand-500 text-sm mb-6">Last updated: June 2026 · Version 2.0</p>

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
                <a href="mailto:privacy@faresay.com" className="text-brand-700 hover:underline">
                  privacy@faresay.com
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
                <li>Clerk — authentication / identity (US, SCCs / IDTA in place)</li>
                <li>Neon — application database (UK/EU regions selected where available)</li>
                <li>Stripe — payment processing, subscription billing and commission (US/EU, SCCs in place)</li>
                <li>Daily — video lesson delivery (US, SCCs / IDTA in place)</li>
                <li>Resend — transactional and account email (US, SCCs / IDTA in place)</li>
                <li>Plausible — cookieless, privacy-focused website analytics (EU)</li>
              </ul>
              <p className="mt-3">We do not sell your personal information.</p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-brand-900 mb-3">6. International data transfers</h2>
              <p>
                Our preferred residency for personal data is UK or EU regions. Some sub-processors are US-based (notably
                Clerk, Stripe, Daily and Resend). Where personal data is transferred outside the UK, we put in place an
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
                <a href="mailto:privacy@faresay.com" className="text-brand-700 hover:underline">
                  privacy@faresay.com
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
              <h2 className="font-display text-lg font-semibold text-brand-900 mb-3">10. Not a crisis service</h2>
              <p>
                This policy is about data protection, not crisis support. fair-do is not a crisis or emergency service. If
                you or someone else is in immediate danger, call <strong>999</strong>. For urgent wellbeing support,
                call Samaritans on <strong>116 123</strong> (free, 24/7), text SHOUT to <strong>85258</strong>, or call
                NHS 111 and select option 2.
              </p>
            </section>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
