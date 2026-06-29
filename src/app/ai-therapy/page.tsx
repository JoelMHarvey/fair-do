import Link from 'next/link'
import { SiteNav } from '@/components/SiteNav'
import { SiteFooter } from '@/components/SiteFooter'

export const metadata = {
  title: 'AI therapy: an honest look — Faresay',
  description: 'An impartial guide to AI therapy and mental-health chatbots — the benefits, the real risks, what the research says, the tools available, and where a human still matters.',
}

const TOOLS = [
  { name: 'Wysa', url: 'https://www.wysa.com/', note: 'An "emotionally intelligent" chatbot using CBT/DBT techniques; used in some NHS pathways.' },
  { name: 'Woebot', url: 'https://woebothealth.com/', note: 'CBT-based chatbot born out of Stanford research; one of the most studied.' },
  { name: 'Youper', url: 'https://www.youper.ai/', note: 'AI assistant blending CBT, ACT and mood tracking.' },
  { name: 'Limbic', url: 'https://www.limbic.ai/', note: 'Clinical AI used inside NHS Talking Therapies for triage and support.' },
  { name: 'General LLMs (ChatGPT, Claude, Gemini)', url: 'https://openai.com/', note: 'Not built for therapy, but widely used informally for venting and reflection. No clinical safeguards.' },
]

const RESEARCH = [
  { label: 'Woebot CBT chatbot — randomised trial (JMIR Mental Health, 2017)', url: 'https://mental.jmir.org/2017/2/e19/' },
  { label: 'American Psychological Association — AI & mental health guidance', url: 'https://www.apa.org/practice/artificial-intelligence-mental-health-care' },
  { label: 'NICE — digital mental health technologies', url: 'https://www.nice.org.uk/about/what-we-do/digital-health' },
  { label: 'WHO — ethics & governance of AI for health', url: 'https://www.who.int/publications/i/item/9789240029200' },
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
            Why not just use an AI therapist?
          </h1>
          <p className="text-lg text-sand-700 mt-6">
            It&apos;s a fair question — and the elephant in the room for a company like ours. We build software for human therapists, so we&apos;re not neutral. But you deserve a straight, impartial answer, not a sales pitch. Here&apos;s what AI can genuinely do, what it can&apos;t, and what the evidence actually says.
          </p>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-5 sm:px-8 pb-16 space-y-10 text-sand-700 leading-relaxed text-[17px]">

        {/* Crisis note up top */}
        <div className="bg-coral-50 border border-coral-200 rounded-2xl p-5 text-sm">
          <p className="font-medium text-coral-600 mb-1">First, a safety note</p>
          <p>No chatbot — and no website — is a crisis service. If you&apos;re in danger or thinking about suicide, please use <Link href="/help" className="text-brand-700 underline">urgent help</Link> (call 999, Samaritans 116 123, or text SHOUT to 85258). AI tools have, in documented cases, responded badly in crisis. Treat them with that in mind.</p>
        </div>

        <div>
          <h2 className="font-display text-2xl font-semibold text-brand-900 mb-3">What &ldquo;AI therapy&rdquo; actually is</h2>
          <p>
            It usually means a chatbot that talks with you about how you feel — sometimes guiding you through structured exercises (often CBT), sometimes just listening and reflecting. Some are purpose-built and clinically informed; others are general chatbots people use informally. They&apos;re available 24/7, usually free or cheap, and you can start instantly with no waitlist.
          </p>
        </div>

        <div>
          <h2 className="font-display text-2xl font-semibold text-brand-900 mb-4">The genuine upsides</h2>
          <div className="space-y-3">
            {[
              ['Access & cost', 'Free or a few pounds a month versus a per-session fee. No waitlist, no postcode lottery, available at 3am when it\'s hardest.'],
              ['Low stigma', 'For people who find it hard to open up to another person, a chatbot can feel safer to start with — no fear of being judged.'],
              ['Good at structure', 'Guided CBT exercises, mood tracking, journaling prompts, psychoeducation, breathing and grounding — AI does these consistently and patiently.'],
              ['A bridge, not a wall', 'For mild stress or low mood, or while waiting for a human therapist, it can genuinely help people take a first step.'],
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
              ['It doesn\'t actually feel', 'An AI can produce empathetic words, but it isn\'t with you. Therapy works partly because another human being chooses to sit with your pain and is changed by it. Simulated empathy is not the same as being witnessed.'],
              ['No duty of care', 'A licensed therapist is accountable to a regulator, trained to spot risk, and obligated to act. A chatbot has none of that. In a crisis, it may miss the signs — or say the wrong thing.'],
              ['No clinical judgement', 'It can\'t diagnose, can\'t hold the thread of your history with real understanding, and can confidently give wrong or generic advice ("hallucinate").'],
              ['Privacy', 'Your most sensitive thoughts become data. Read the privacy policy carefully — some tools train on or share what you share.'],
              ['Dependency & avoidance', 'Always-available reassurance can quietly replace real connection, or let you avoid the harder, more healing work of being known by a person.'],
              ['Weak regulation', 'Most consumer chatbots aren\'t regulated as medical devices. There have been serious safety failures and lawsuits, especially involving vulnerable young people.'],
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
            Honestly: it&apos;s early and mixed. A handful of trials suggest CBT-style chatbots can modestly reduce mild anxiety and depression in the short term — useful, but not the same as evidence for treating serious or complex conditions. Long-term effects, safety in crisis, and how findings hold up at scale are still open questions. Professional bodies urge caution and human oversight.
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
          <p className="mb-4 text-sand-600 text-[16px]">Shared for information, not endorsement. Check each one&apos;s privacy policy and remember none is a crisis service.</p>
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
          <h2 className="font-display text-2xl font-semibold text-brand-900 mb-3">On empathy, and making space</h2>
          <p>
            The heart of therapy isn&apos;t advice — it&apos;s relationship. Being truly heard by another person, having someone hold space for what you can&apos;t yet hold alone, feeling the quiet of not being judged. That relationship is, as far as we can tell, where a lot of the healing happens. An AI can imitate the words. It can&apos;t make the choice to care, and it can&apos;t be moved by you. For some things that&apos;s fine. For the deep, frightening, human stuff, it matters more than it sounds.
          </p>
        </div>

        <div className="bg-brand-50 border border-brand-200 rounded-2xl p-6">
          <h2 className="font-display text-xl font-semibold text-brand-900 mb-2">Our honest take</h2>
          <p className="text-sand-700">
            Use the right tool for the job. For psychoeducation, journaling, CBT practice, or a 3am moment when no one&apos;s awake, a good chatbot can genuinely help — and we&apos;d rather you have that than nothing. For working through trauma, grief, relationships, identity, or anything serious, we believe a real, regulated human therapist is worth it — and we&apos;ve built Faresay so that&apos;s affordable, not a luxury. The two aren&apos;t enemies. But they&apos;re not the same.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-5">
            <Link href="/sign-up" className="inline-block bg-brand-600 text-white px-7 py-3 rounded-full font-medium hover:bg-brand-700 transition text-center">
              Talk to a human therapist
            </Link>
            <Link href="/styles" className="inline-block border border-sand-300 text-sand-700 px-7 py-3 rounded-full font-medium hover:bg-white transition text-center">
              Understand therapy styles
            </Link>
          </div>
        </div>

        <p className="text-xs text-sand-400 text-center">
          This article is general information, not medical advice. Links to third-party tools and research are for context, not endorsement.
        </p>
      </div>

      <SiteFooter />
    </>
  )
}
