import Link from 'next/link'
import { SiteNav } from '@/components/SiteNav'
import { SiteFooter } from '@/components/SiteFooter'

export const metadata = {
  title: 'AI tutoring: an honest look — fair-do',
  description: 'An impartial guide to AI tutors and learning chatbots — the benefits, the real risks, what the research says, the tools available, and where a human teacher still matters.',
}

const TOOLS = [
  { name: 'Khan Academy (Khanmigo)', url: 'https://www.khanmigo.ai/', note: 'An AI tutor built on Khan Academy\'s lessons; piloted in some schools for guided practice.' },
  { name: 'Photomath', url: 'https://photomath.com/', note: 'Scans a maths problem and shows step-by-step working; handy for checking method.' },
  { name: 'Duolingo', url: 'https://www.duolingo.com/', note: 'Gamified language practice with AI-driven exercises and feedback.' },
  { name: 'Century Tech', url: 'https://www.century.tech/', note: 'An AI learning platform used in some UK schools for personalised practice.' },
  { name: 'General LLMs (ChatGPT, Claude, Gemini)', url: 'https://www.anthropic.com/claude', note: 'Not built for teaching, but widely used to explain topics and check work. No guarantee of accuracy.' },
]

const RESEARCH = [
  { label: 'Education Endowment Foundation — one-to-one tuition evidence', url: 'https://educationendowmentfoundation.org.uk/education-evidence/teaching-learning-toolkit/one-to-one-tuition' },
  { label: 'DfE — generative AI in education (policy paper)', url: 'https://www.gov.uk/government/publications/generative-artificial-intelligence-in-education' },
  { label: 'EEF — using digital technology to improve learning', url: 'https://educationendowmentfoundation.org.uk/education-evidence/guidance-reports/digital' },
  { label: 'Ofsted — approach to artificial intelligence', url: 'https://www.gov.uk/government/publications/ofsteds-approach-to-artificial-intelligence-ai' },
]

export default function AiTherapyPage() {
  return (
    <>
      <SiteNav />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-50 to-sand-50" />
        <div className="max-w-2xl mx-auto px-5 sm:px-8 pt-20 pb-12 text-center">
          <p className="text-sm font-semibold text-coral-500 uppercase tracking-wide mb-3">The honest version</p>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold text-brand-900 leading-tight">
            Why not just use an AI tutor?
          </h1>
          <p className="text-lg text-sand-700 mt-6">
            It&apos;s a fair question — and the elephant in the room for a company like ours. We build software for human tutors, so we&apos;re not neutral. But you deserve a straight, impartial answer, not a sales pitch. Here&apos;s what AI can genuinely do, what it can&apos;t, and what the evidence actually says.
          </p>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-5 sm:px-8 pb-16 space-y-10 text-sand-700 leading-relaxed text-[17px]">

        <div>
          <h2 className="font-display text-2xl font-semibold text-brand-900 mb-3">What &ldquo;AI tutoring&rdquo; actually is</h2>
          <p>
            It usually means a chatbot or app that helps you learn — sometimes walking you through structured practice, sometimes just explaining a topic or checking your working. Some are purpose-built for education and curriculum-aware; others are general chatbots students use informally. They&apos;re available 24/7, usually free or cheap, and you can start instantly with no waiting list.
          </p>
        </div>

        <div>
          <h2 className="font-display text-2xl font-semibold text-brand-900 mb-4">The genuine upsides</h2>
          <div className="space-y-3">
            {[
              ['Access & cost', 'Free or a few pounds a month versus an hourly rate. No travel, no waiting list, available at 11pm the night before a deadline.'],
              ['Endlessly patient', 'It never tires, never judges a "silly" question, and will re-explain the same thing ten different ways until it lands.'],
              ['Good at drills & explanation', 'Practice questions, instant feedback, step-by-step worked solutions, flashcards and recall — AI does these consistently and tirelessly.'],
              ['A bridge, not a wall', 'For a quick concept check, a homework nudge, or while waiting to start with a tutor, it can genuinely help a student take the first step.'],
            ].map(([t, b]) => (
              <div key={t} className="bg-white rounded-2xl border border-sand-200 p-5">
                <p className="font-medium text-brand-800 mb-1">{t}</p>
                <p className="text-sand-600 text-[16px]">{b}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-display text-2xl font-semibold text-brand-900 mb-4">The real risks</h2>
          <div className="space-y-3">
            {[
              ['It doesn\'t actually know the student', 'A good tutor reads a flicker of confusion on a face, remembers what clicked last week, and adapts in the moment. An AI guesses from text alone — it isn\'t really with the learner.'],
              ['No accountability', 'A real tutor builds a relationship with the family, can be asked how things are going, and is answerable for their work. A chatbot has none of that.'],
              ['It can be confidently wrong', 'AI can give plausible but incorrect answers or working ("hallucinate"). For a student who can\'t yet tell right from wrong, that\'s a real problem.'],
              ['It can do the work for them', 'The easiest path with a chatbot is to copy the answer. Real learning comes from struggling productively — something a good tutor protects and a chatbot can quietly undermine.'],
              ['Privacy', 'A child\'s schoolwork and details become data. Read the privacy policy carefully — some tools train on or share what you put in.'],
              ['Patchy on the actual exam', 'General AI doesn\'t reliably know your exact board, spec or mark scheme. A tutor who knows the exam can be the difference between knowing a topic and scoring the marks.'],
            ].map(([t, b]) => (
              <div key={t} className="bg-white rounded-2xl border border-sand-200 p-5">
                <p className="font-medium text-brand-800 mb-1">{t}</p>
                <p className="text-sand-600 text-[16px]">{b}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-display text-2xl font-semibold text-brand-900 mb-3">What the research says (so far)</h2>
          <p className="mb-4">
            Honestly: it&apos;s early and mixed. AI tools can help with practice and feedback, and there&apos;s genuine promise in personalised drills. But the strongest evidence in education is still for structured, one-to-one teaching with a person who knows the learner. Long-term effects, accuracy at scale, and the impact on how children actually learn are still open questions, and professional bodies urge caution and human oversight.
          </p>
          <ul className="space-y-2">
            {RESEARCH.map(r => (
              <li key={r.url}>
                <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-brand-700 hover:text-brand-800 underline underline-offset-2">{r.label} ↗</a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-display text-2xl font-semibold text-brand-900 mb-3">Tools people are using</h2>
          <p className="mb-4 text-sand-600 text-[16px]">Shared for information, not endorsement. Check each one&apos;s privacy policy, and remember none of them replaces a teacher who knows your child.</p>
          <div className="space-y-3">
            {TOOLS.map(t => (
              <a key={t.name} href={t.url} target="_blank" rel="noopener noreferrer" className="block bg-white rounded-2xl border border-sand-200 p-5 hover:border-brand-300 transition">
                <p className="font-medium text-brand-800">{t.name} ↗</p>
                <p className="text-sand-600 text-[16px] mt-1">{t.note}</p>
              </a>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-display text-2xl font-semibold text-brand-900 mb-3">On motivation, and being known</h2>
          <p>
            The heart of good tutoring isn&apos;t information — it&apos;s relationship. A tutor who believes in a student, notices the moment something clicks, and turns up week after week builds the confidence that makes learning stick. That encouragement, and the gentle accountability of someone who knows you, is where a lot of the progress happens. An AI can imitate the words. It can&apos;t choose to care, and it can&apos;t be proud of you. For drills and quick answers that&apos;s fine. For lasting confidence, it matters more than it sounds.
          </p>
        </div>

        <div className="bg-brand-50 border border-brand-200 rounded-2xl p-6">
          <h2 className="font-display text-xl font-semibold text-brand-900 mb-2">Our honest take</h2>
          <p className="text-sand-700">
            Use the right tool for the job. For practice questions, explanations, flashcards, or an 11pm moment when no one&apos;s awake, a good AI tool can genuinely help — and we&apos;d rather a student have that than nothing. For building real understanding, confidence and exam technique, we believe a real, qualified human tutor is worth it — and we&apos;ve built fair-do so that&apos;s affordable, not a luxury. The two aren&apos;t enemies. But they&apos;re not the same.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-5">
            <Link href="/sign-up" className="inline-block bg-brand-600 text-white px-7 py-3 rounded-full font-medium hover:bg-brand-700 transition text-center">
              Find a human tutor
            </Link>
            <Link href="/styles" className="inline-block border border-sand-300 text-sand-700 px-7 py-3 rounded-full font-medium hover:bg-white transition text-center">
              Subjects &amp; how tutoring works
            </Link>
          </div>
        </div>

        <p className="text-xs text-sand-400 text-center">
          This article is general information, not formal academic advice. Links to third-party tools and research are for context, not endorsement.
        </p>
      </div>

      <SiteFooter />
    </>
  )
}
