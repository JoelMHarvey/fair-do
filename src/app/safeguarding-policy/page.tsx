import { SiteNav } from '@/components/SiteNav'
import { SiteFooter } from '@/components/SiteFooter'

export const metadata = {
  title: 'Safeguarding Policy — fair-do',
  description:
    'fair-do\'s safeguarding policy for tutors working with children and young people — obligations, reporting procedure, and external contacts.',
}

export default function SafeguardingPolicyPage() {
  return (
    <>
      <SiteNav />
      <main className="min-h-screen bg-gradient-to-b from-brand-50 via-sand-50 to-sand-50">
        <div className="max-w-2xl mx-auto px-5 sm:px-8 py-16">
          <h1 className="font-display text-4xl font-semibold text-brand-900 mb-2">Safeguarding Policy</h1>
          <p className="text-sand-500 text-sm mb-6">Version 1.0 · July 2026</p>

          <div className="rounded-2xl border border-brand-100 bg-white/60 px-5 py-4 mb-10 text-sand-600 text-sm leading-relaxed">
            <p>
              fair-do connects tutors with students, including children and young people. All tutors must read
              this policy and confirm their acceptance before their profile goes live. If you have an immediate
              safeguarding concern, email <a href="mailto:support@fair-do.com" className="text-brand-700 underline">support@fair-do.com</a> with
              the subject line <strong>SAFEGUARDING</strong>, or call 999 if a child is in immediate danger.
            </p>
          </div>

          <div className="space-y-8 text-sand-700 text-sm leading-relaxed">

            <section>
              <h2 className="font-display text-lg font-semibold text-brand-900 mb-3">1. Purpose</h2>
              <p>
                This policy sets out fair-do&apos;s commitment to the safety and welfare of children and young
                people who use the platform, the obligations all tutors accept at sign-up, and the procedure
                for reporting and responding to safeguarding concerns.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-brand-900 mb-3">2. Tutor obligations</h2>
              <p className="mb-3">By signing up to fair-do, tutors confirm that they:</p>
              <ol className="list-decimal pl-5 space-y-2">
                <li>
                  <strong>Hold a valid enhanced DBS check</strong> (or equivalent), as verified during onboarding,
                  and will notify fair-do immediately if their DBS status changes.
                </li>
                <li>
                  <strong>Are not on the DBS Children&apos;s Barred List</strong> and have never been prohibited
                  from working with children.
                </li>
                <li>
                  <strong>Will conduct lessons appropriately</strong> — no recording without prior consent, no
                  sharing of personal contact details with students outside the platform, and no conduct that
                  could reasonably be perceived as grooming.
                </li>
                <li>
                  <strong>Will act on any disclosure</strong> — if a student discloses abuse, neglect, or harm,
                  the tutor will listen without judgement, not promise confidentiality, note what was said, and
                  report to fair-do within 24 hours.
                </li>
                <li>
                  <strong>Will report concerns about other users or platform content</strong> to fair-do promptly.
                </li>
                <li>
                  <strong>Will not contact students outside lesson times</strong> for personal or non-educational
                  purposes via the platform.
                </li>
              </ol>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-brand-900 mb-3">3. fair-do&apos;s commitments</h2>
              <p className="mb-3">fair-do will:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Verify tutor credentials (DBS + teaching qualification) before any tutor can teach, and monitor expiry with automatic suspension if credentials lapse.</li>
                <li>Respond to all safeguarding reports within 24 hours — and the same day if a child may be in immediate danger.</li>
                <li>Refer to the DBS, Teaching Regulation Agency, LADO, or police as required — without necessarily informing the subject of the referral.</li>
                <li>Suspend accounts where there is a credible safeguarding concern, pending investigation.</li>
                <li>Maintain records of all concerns and actions taken for a minimum of 10 years.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-brand-900 mb-3">4. How to report a concern</h2>

              <h3 className="font-medium text-brand-800 mb-2 mt-4">As a tutor</h3>
              <ol className="list-decimal pl-5 space-y-2 mb-4">
                <li><strong>If a child is in immediate danger</strong> — call 999 first, then notify fair-do.</li>
                <li>
                  <strong>All other concerns</strong> — email{' '}
                  <a href="mailto:support@fair-do.com?subject=SAFEGUARDING" className="text-brand-700 underline">
                    support@fair-do.com
                  </a>{' '}
                  with the subject line <strong>SAFEGUARDING</strong>. Include the student&apos;s first name, your
                  username, a factual account of what was said or observed (in the student&apos;s own words where
                  possible), and the date and time.
                </li>
              </ol>
              <p className="text-sand-500 text-xs">
                Do not attempt to investigate the concern yourself or alert the person the concern is about.
              </p>

              <h3 className="font-medium text-brand-800 mb-2 mt-4">As a parent or student</h3>
              <p>
                Email{' '}
                <a href="mailto:support@fair-do.com?subject=SAFEGUARDING" className="text-brand-700 underline">
                  support@fair-do.com
                </a>{' '}
                with the subject line <strong>SAFEGUARDING</strong>, or call the NSPCC helpline on{' '}
                <strong>0808 800 5000</strong> (free, 24/7).
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-brand-900 mb-3">5. External contacts</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-sand-200">
                      <th className="text-left py-2 pr-4 font-medium text-sand-600">Organisation</th>
                      <th className="text-left py-2 pr-4 font-medium text-sand-600">Purpose</th>
                      <th className="text-left py-2 font-medium text-sand-600">Contact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sand-100">
                    {[
                      ['Emergency services', 'Child in immediate danger', '999'],
                      ['Police (non-emergency)', 'Report a concern', '101'],
                      ['NSPCC helpline', 'Adults concerned about a child', '0808 800 5000'],
                      ['Childline', 'Children who need support', '0800 1111'],
                      ['DBS', 'Barring referrals / check status', '03000 200 190'],
                      ['Teaching Regulation Agency', 'QTS / teacher misconduct', '020 7593 5393'],
                      ['LADO', 'Allegations against adults working with children', 'Via your local authority'],
                    ].map(([org, purpose, contact]) => (
                      <tr key={org}>
                        <td className="py-2 pr-4 font-medium text-sand-700">{org}</td>
                        <td className="py-2 pr-4 text-sand-500">{purpose}</td>
                        <td className="py-2 text-sand-700">{contact}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-brand-900 mb-3">6. Record keeping</h2>
              <p>
                All safeguarding concerns reported to fair-do are recorded securely, regardless of whether a
                referral to an external agency is made. Records are retained for a minimum of 10 years (or until
                the child reaches the age of 25, whichever is later).
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-brand-900 mb-3">7. Policy review</h2>
              <p>
                This policy is reviewed annually, or sooner if there is a significant change in legislation or
                platform operations. <strong>Responsible person:</strong> Joel Harvey, fair-do.{' '}
                <strong>Next review:</strong> July 2027.
              </p>
            </section>

          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
