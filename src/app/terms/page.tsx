import { SiteNav } from '@/components/SiteNav'
import { SiteFooter } from '@/components/SiteFooter'

export const metadata = {
  title: 'Terms of Service — fair-do',
  description:
    'The subscription terms governing a tutor\'s use of the fair-do studio portal — the service, subscription and commission, your responsibilities, data protection, liability and governing law.',
}

export default function TermsPage() {
  return (
    <>
      <SiteNav />
      <main className="min-h-screen bg-gradient-to-b from-brand-50 via-sand-50 to-sand-50">
        <div className="max-w-2xl mx-auto px-5 sm:px-8 py-16">
          <h1 className="font-display text-4xl font-semibold text-brand-900 mb-2">Terms of Service</h1>
          <p className="text-sand-500 text-sm mb-6">Last updated: June 2026 · Version 2.0</p>

          <div className="rounded-2xl border border-brand-100 bg-white/60 px-5 py-4 mb-10 text-sand-600 text-sm leading-relaxed">
            <p>
              This page is a plain-English summary of the subscription terms between fair-do and the tutor who
              subscribes to the studio portal. Subscribing tutors receive the full Subscription Terms of Service and
              Data Processing Agreement, which govern in the event of any inconsistency.
            </p>
          </div>

          <div className="space-y-8 text-sand-700 text-sm leading-relaxed">
            <section>
              <h2 className="font-display text-lg font-semibold text-brand-900 mb-3">1. The service</h2>
              <p>
                fair-do is a studio-management software platform (SaaS) that an independent, UK-based tutor
                subscribes to in order to run their own private studio — managing students, scheduling
                appointments, holding secure video lessons, taking card payments, sending reminders and keeping studio
                records.
              </p>
              <p className="mt-2">
                fair-do is <strong>software</strong>, not an education provider. We do not provide teaching or
                tuition services, and we are not an intermediary between you and your students. The teaching
                relationship, the student relationship and the teaching record are between you and your student — fair-do is
                not a party to either, and does not own the teaching record. Your students are your students, not
                fair-do&apos;s.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-brand-900 mb-3">2. A B2B subscription agreement</h2>
              <p>
                These terms are a business-to-business (B2B) software-as-a-service agreement between fair-do and you, the
                professional or studio that subscribes to the service (the &quot;Customer&quot;). You confirm you are
                subscribing in the course of a business (as a sole trader, partnership or company) and not as a consumer.
              </p>
              <p className="mt-2">
                The service is operated by <strong>[PLACEHOLDER: registered entity]</strong>, a company registered in
                England &amp; Wales (registration pending). By creating an account, subscribing or using the service, you
                agree to be bound by the full subscription terms.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-brand-900 mb-3">3. Eligibility</h2>
              <p>
                To subscribe and use the service to deliver lessons, you must be a tutor appropriately
                qualified and entitled to teach in the UK — holding a recognised teaching qualification (for example QTS,
                PGCE, or a relevant subject degree). You must keep your qualifications current and, where you work with
                children, hold an appropriate DBS check.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-brand-900 mb-3">4. Subscription and fees</h2>
              <p>
                The service is offered on <strong>monthly subscription plans</strong>, billed monthly in advance via our
                payment provider, Stripe. Where you use the service to take card payments from your students, fair-do
                charges a <strong>small commission</strong> on each card payment processed, in addition to your
                subscription fee and the underlying Stripe processing fees.
              </p>
              <p className="mt-2">
                This commission is a fee for the payment-processing facility within the software. It is{' '}
                <strong>not</strong> a marketplace fee, a referral fee, or any share, split or cut of your teaching
                fee. You set your own fees, own your students, and receive your fees less only the processor fees
                and this commission. Exact tiers, prices and the commission rate are disclosed in-product before you
                subscribe or enable payments.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-brand-900 mb-3">5. Your responsibilities</h2>
              <p>As the professional running your own studio, you (and not fair-do) are responsible for:</p>
              <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
                <li>The student relationship and the teaching record, which you own, maintain, retain and secure</li>
                <li>All assessment, lesson planning, professional judgement, and the suitability and safety of tuition</li>
                <li>
                  Your duties as <strong>data controller</strong> of your students&apos; data — lawful basis,
                  consent where required, privacy information and data-subject rights
                </li>
                <li>Safeguarding, duty of care and signposting students to appropriate UK services</li>
                <li>Holding any qualifications and DBS checks your work requires and meeting professional standards</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-brand-900 mb-3">6. Data protection</h2>
              <p>
                In respect of your students&apos; personal data, <strong>you are
                the controller and fair-do is the processor</strong>, acting only on your documented instructions under
                the Data Processing Agreement (which forms part of these terms). In respect of your account, billing and
                product-usage data, fair-do acts as an independent controller, as described in our Privacy Policy. Both
                parties comply with the UK GDPR and the Data Protection Act 2018.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-brand-900 mb-3">7. Term, cancellation and your data</h2>
              <p>
                Paid plans renew automatically each month until cancelled. You may cancel at any time through your account;
                cancellation takes effect at the end of the then-current paid month. On termination you may export and keep
                your data, after which we delete or return it in accordance with the DPA. You remain responsible, as
                controller, for retaining the teaching record for the period your standards require.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-brand-900 mb-3">8. Warranties and disclaimers</h2>
              <p>
                To the fullest extent permitted by law, the service is provided &quot;as is&quot; and &quot;as
                available&quot;. Because fair-do does not provide tuition, we make no warranty as to the suitability, safety,
                quality or outcome of any lessons you deliver using the service. Nothing in these terms excludes any liability
                that cannot lawfully be excluded, and the service will be supplied with reasonable care and skill.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-brand-900 mb-3">9. Limitation of liability</h2>
              <p>
                Nothing limits liability that cannot lawfully be limited (including for death or personal injury caused by
                negligence, or for fraud). Subject to that, fair-do&apos;s total aggregate liability in any 12-month period
                is limited to the <strong>total subscription and commission fees you paid to fair-do in the 12 months</strong>{' '}
                before the event giving rise to the claim. We are not liable for indirect or consequential losses, nor for
                the tuition you provide, your teaching decisions, or your discharge of your duties as data controller — all of
                which are your sole responsibility.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-brand-900 mb-3">10. Governing law</h2>
              <p>
                These terms are governed by the laws of England &amp; Wales, and the courts of England &amp; Wales have
                exclusive jurisdiction.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-brand-900 mb-3">11. Contact</h2>
              <p>
                <a href="mailto:legal@fair-do.com" className="text-brand-700 hover:underline">
                  legal@fair-do.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
