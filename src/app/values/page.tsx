import Link from 'next/link'
import { SiteNav } from '@/components/SiteNav'
import { SiteFooter } from '@/components/SiteFooter'

export const metadata = {
  title: 'Why we built fair-do — our values',
  description: 'Tutoring that is fair — to the people who do the work, and the people who need it. Why fair-do exists, and what we promise tutors and students.',
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
          <h1 className="font-display text-4xl sm:text-5xl font-semibold text-brand-900 leading-tight">Why we built fair-do</h1>
          <p className="mt-5">
            We build software for a living. fair-do started because we kept noticing something about online tutoring
            that bothered us, and after a while we couldn&rsquo;t leave it alone.
          </p>

          <H>What bothered us</H>
          <p>
            Good tutoring works. That&rsquo;s not a hunch — the evidence is strong, and most of us have either felt it or watched
            it change someone close to us.
          </p>
          <p className="mt-4">
            But the way it&rsquo;s sold online had drifted somewhere wrong. A lot of the big platforms take a huge share of
            every lesson — up to 65% in some cases. So the tutor, who trained for years and does the actual hard,
            human part of the work, ends up with maybe a third. The student pays full price, often when they&rsquo;re least
            able to afford it. And a company in the middle, who never meets either of them, takes the biggest cut.
          </p>
          <p className="mt-4">We kept thinking someone would come along and fix it. Nobody did. So we had a go ourselves.</p>

          <H>What we actually believe</H>
          <p className="mt-2"><strong className="text-brand-900">Tutors should keep what they earn.</strong> On fair-do they keep what they charge — we don&rsquo;t take a cut of your lessons. Tutors pay one flat monthly fee to use the platform, and that&rsquo;s the arrangement. The work is theirs.</p>
          <p className="mt-4"><strong className="text-brand-900">Cheaper isn&rsquo;t a gimmick — it&rsquo;s the point.</strong> Take out the middleman&rsquo;s cut and lessons can simply cost less. That&rsquo;s how good tutoring reaches families it currently prices out. We&rsquo;re not running a sale; this is the reason the company exists.</p>
          <p className="mt-4"><strong className="text-brand-900">Nobody should get rich off the work tutors do.</strong> We charge a small, flat fee to keep things running, and that&rsquo;s it. A tutor&rsquo;s hard work isn&rsquo;t a number to be squeezed for margin, and we&rsquo;re not going to build a business that treats it like one.</p>
          <p className="mt-4"><strong className="text-brand-900">We don&rsquo;t cut corners on trust.</strong> Every tutor here shares their teaching qualifications and a current DBS check. We check before anyone&rsquo;s approved, we keep a record of it, and we check again down the line. &ldquo;Move fast and break things&rdquo; is fine for a photo app. Not for this.</p>

          <H>What we promise tutors</H>
          <p>You&rsquo;ve probably been burned by a platform before, so let&rsquo;s be specific.</p>
          <p className="mt-4">You keep what you charge — we don&rsquo;t take a percentage of your lessons. You cover only the standard card-processing fee every business pays, and we keep none of it.</p>
          <p className="mt-4">The price you join at is the price you keep — for good. It doesn&rsquo;t go up. And as we grow, the rate for new joiners actually comes down, because a bigger platform should be cheaper to run, not greedier.</p>
          <p className="mt-4">If you&rsquo;re just getting started — a couple of students, finding your feet — you start free. You don&rsquo;t pay anything until your tutoring has grown enough that fair-do is clearly worth it. You&rsquo;re verified and visible from day one regardless.</p>
          <p className="mt-4">And it&rsquo;s your tutoring, not ours. Your rates, your hours, your students. We take care of the booking, the payments, the video. You can walk away whenever you like and take your students with you.</p>

          <H>What we promise students</H>
          <p>If you&rsquo;re the one looking for help, here&rsquo;s where we stand.</p>
          <p className="mt-4">Everyone you&rsquo;ll find here is a real, qualified tutor — we&rsquo;ve checked.</p>
          <p className="mt-4">You&rsquo;re not paying over the odds to cover someone&rsquo;s advertising budget, because there isn&rsquo;t a middleman taking a slice.</p>
          <p className="mt-4">Your privacy matters more to us than almost anything. Lessons are encrypted. We keep only what we have to, we never sell your information, and we will never use your learning to sell you ads.</p>
          <p className="mt-4">And you&rsquo;re a person to us. Not a conversion, not a number on a dashboard.</p>

          <H>Where we&rsquo;re going</H>
          <p>
            Right now fair-do is mostly built for tutors. But the bigger idea is this: a place where anyone can
            find the right tutor for them and book them directly — the way you&rsquo;d choose anyone you&rsquo;re trusting
            with something that matters. Good tutoring, fairly priced, as ordinary as it should be.
          </p>
          <p className="mt-4">
            We&rsquo;re building toward that slowly and in the right order. The verification, the safeguarding, the
            foundations — those come first, before we open things up. Some of it isn&rsquo;t here yet, and we&rsquo;d rather say
            so than promise it early.
          </p>
          <p className="mt-4">
            The one thing that won&rsquo;t move is the idea underneath: tutoring that&rsquo;s fair. Fair to the people who do the
            work, and fair to the people who need it.
          </p>

          <H>Say hello</H>
          <p>We&rsquo;re a small team and we read everything — including the bits we&rsquo;ve got wrong. Tell us.</p>
          <p className="mt-3"><a href="mailto:hello@fair-do.com" className="text-brand-700 underline hover:text-brand-800">hello@fair-do.com</a></p>

          <div className="mt-12 flex flex-wrap gap-3">
            <Link href="/for-tutors" className="inline-block bg-brand-600 text-white px-6 py-3 rounded-full font-medium hover:bg-brand-700 transition shadow-sm">
              Become a founding tutor
            </Link>
            <Link href="/sign-up" className="inline-block bg-white border border-sand-200 text-brand-800 px-6 py-3 rounded-full font-medium hover:border-brand-300 transition">
              Find a tutor
            </Link>
          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  )
}
