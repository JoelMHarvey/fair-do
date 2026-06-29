import Link from 'next/link'
import { SiteNav } from '@/components/SiteNav'
import { SiteFooter } from '@/components/SiteFooter'

export const metadata = {
  title: 'Why we built Faresay — our values',
  description: 'Therapy that’s fair — to the people who do the work, and the people who need it. Why Faresay exists, and what we promise therapists and clients.',
}

function H({ children }: { children: React.ReactNode }) {
  return <h2 className="font-display text-2xl font-semibold text-brand-900 mt-12 mb-4">{children}</h2>
}

export default function ValuesPage() {
  return (
    <>
      <SiteNav />
      <main className="min-h-screen bg-gradient-to-b from-brand-50 via-sand-50 to-sand-50">
        <article className="max-w-2xl mx-auto px-5 sm:px-8 py-16 text-sand-700 text-lg leading-relaxed">
          <p className="text-xs font-semibold uppercase tracking-wide text-coral-600 mb-3">Our values</p>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold text-brand-900 leading-tight">Why we built Faresay</h1>
          <p className="mt-5">
            We build software for a living. Faresay started because we kept noticing something about online therapy
            that bothered us, and after a while we couldn’t leave it alone.
          </p>

          <H>What bothered us</H>
          <p>
            Therapy works. That’s not a hunch — the evidence is strong, and most of us have either felt it or watched
            it change someone close to us.
          </p>
          <p className="mt-4">
            But the way it’s sold online had drifted somewhere wrong. A lot of the big platforms take a huge share of
            every session — up to 65% in some cases. So the therapist, who trained for years and does the actual hard,
            human part of the work, ends up with maybe a third. The client pays full price, often when they’re least
            able to afford it. And a company in the middle, who never meets either of them, takes the biggest cut.
          </p>
          <p className="mt-4">We kept thinking someone would come along and fix it. Nobody did. So we had a go ourselves.</p>

          <H>What we actually believe</H>
          <p className="mt-2"><strong className="text-brand-900">Therapists should keep what they earn.</strong> On Faresay they keep what they charge — we don’t take a cut of your sessions. Therapists pay one flat monthly fee to use the platform, and that’s the arrangement. The work is theirs.</p>
          <p className="mt-4"><strong className="text-brand-900">Cheaper isn’t a gimmick — it’s the point.</strong> Take out the middleman’s cut and sessions can simply cost less. That’s how therapy reaches people it currently prices out. We’re not running a sale; this is the reason the company exists.</p>
          <p className="mt-4"><strong className="text-brand-900">Nobody should make money from people suffering.</strong> We charge a small, flat fee to keep things running, and that’s it. What people bring to therapy isn’t a number to be squeezed for margin, and we’re not going to build a business that treats it like one.</p>
          <p className="mt-4"><strong className="text-brand-900">We don’t cut corners on trust.</strong> Every therapist here is registered with BACP, UKCP, BPS or NCPS. We check before anyone’s approved, we keep a record of it, and we check again down the line. “Move fast and break things” is fine for a photo app. Not for this.</p>

          <H>What we promise therapists</H>
          <p>You’ve probably been burned by a platform before, so let’s be specific.</p>
          <p className="mt-4">You keep what you charge — we don’t take a percentage of your sessions. You cover only the standard card-processing fee every business pays, and we keep none of it.</p>
          <p className="mt-4">The price you join at is the price you keep — for good. It doesn’t go up. And as we grow, the rate for new joiners actually comes down, because a bigger platform should be cheaper to run, not greedier.</p>
          <p className="mt-4">If you’re just getting started — a couple of clients, finding your feet — you start free. You don’t pay anything until your practice has grown enough that Faresay is clearly worth it. You’re verified and visible from day one regardless.</p>
          <p className="mt-4">And it’s your practice, not ours. Your rates, your hours, your clients. We take care of the booking, the payments, the video. You can walk away whenever you like and take your clients with you.</p>

          <H>What we promise clients</H>
          <p>If you’re the one looking for help, here’s where we stand.</p>
          <p className="mt-4">Everyone you’ll find here is a real, qualified, registered therapist — we’ve checked.</p>
          <p className="mt-4">You’re not paying over the odds to cover someone’s advertising budget, because there isn’t a middleman taking a slice.</p>
          <p className="mt-4">Your privacy matters more to us than almost anything. Sessions are encrypted. We keep only what we have to, we never sell your information, and we will never use what you’re going through to sell you ads.</p>
          <p className="mt-4">And you’re a person to us. Not a conversion, not a number on a dashboard.</p>

          <H>Where we’re going</H>
          <p>
            Right now Faresay is mostly built for therapists. But the bigger idea is this: a place where anyone can
            find the right therapist for them and book them directly — the way you’d choose anyone you’re trusting
            with something that matters. Good therapy, fairly priced, as ordinary as it should be.
          </p>
          <p className="mt-4">
            We’re building toward that slowly and in the right order. The verification, the safeguarding, the
            foundations — those come first, before we open things up. Some of it isn’t here yet, and we’d rather say
            so than promise it early.
          </p>
          <p className="mt-4">
            The one thing that won’t move is the idea underneath: therapy that’s fair. Fair to the people who do the
            work, and fair to the people who need it.
          </p>

          <H>Say hello</H>
          <p>We’re a small team and we read everything — including the bits we’ve got wrong. Tell us.</p>
          <p className="mt-3"><a href="mailto:hello@faresay.com" className="text-brand-700 underline hover:text-brand-800">hello@faresay.com</a></p>

          <div className="mt-12 flex flex-wrap gap-3">
            <Link href="/for-tutors" className="inline-block bg-brand-600 text-white px-6 py-3 rounded-full font-medium hover:bg-brand-700 transition shadow-sm">
              Become a founding therapist
            </Link>
            <Link href="/sign-up" className="inline-block bg-white border border-sand-200 text-brand-800 px-6 py-3 rounded-full font-medium hover:border-brand-300 transition">
              Find your therapist
            </Link>
          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  )
}
