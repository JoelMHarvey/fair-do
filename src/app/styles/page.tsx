import Link from 'next/link'
import { SiteNav } from '@/components/SiteNav'
import { SiteFooter } from '@/components/SiteFooter'

export const metadata = {
  title: 'Subjects & how tutoring works — fair-do',
  description: 'Maths, English, the sciences, languages, music and exam prep explained — what you\'ll cover, how lessons work, the exams they map to, and where to read more.',
}

type Style = {
  key: string
  name: string
  icon: string
  what: string
  goodFor: string[]
  feels: string
  origin: string
  history: string
  howItWorks: string
  resources: { label: string; url: string }[]
}

const STYLES: Style[] = [
  {
    key: 'Maths',
    name: 'Maths',
    icon: '🔢',
    what: 'From times tables to A-level calculus — building confidence step by step, filling the gaps and making the reasoning click rather than just memorising rules.',
    goodFor: ['KS2', 'GCSE', 'A-level', 'Exam confidence'],
    feels: 'Active and worked-through. You\'ll tackle problems together, with the tutor spotting exactly where it breaks down and setting a little practice between lessons.',
    origin: 'Number, algebra, geometry, ratio, statistics and probability — scaled to your stage, whether that\'s shoring up KS2 basics or stretching toward A-level.',
    history: 'Lessons map to the national curriculum and the main exam boards (AQA, Edexcel, OCR), so what you practise lines up with what you\'ll actually be assessed on.',
    howItWorks: 'The tutor checks where you are, targets the gaps, and works through past-paper-style questions until the method feels automatic — building toward steady, visible progress.',
    resources: [
      { label: 'BBC Bitesize — Maths', url: 'https://www.bbc.co.uk/bitesize/subjects/z6vg9j6' },
      { label: 'AQA — GCSE Maths', url: 'https://www.aqa.org.uk/subjects/mathematics/gcse/mathematics-8300' },
    ],
  },
  {
    key: 'English',
    name: 'English',
    icon: '📖',
    what: 'Reading, writing, grammar and analysis — for everything from early literacy to GCSE literature essays and university applications.',
    goodFor: ['Literacy', 'GCSE English', 'Essay writing', 'Comprehension'],
    feels: 'A mix of discussion and practice. You\'ll read together, plan and redraft writing, and learn to back up a point with evidence.',
    origin: 'Reading comprehension, creative and persuasive writing, grammar and punctuation, and close analysis of set texts and unseen passages.',
    history: 'Aligned to the national curriculum and the major boards (AQA, Edexcel, OCR), covering both the language and literature papers.',
    howItWorks: 'The tutor builds from where your confidence is, models what good writing looks like, then hands the pen back to you with focused feedback each lesson.',
    resources: [
      { label: 'BBC Bitesize — English', url: 'https://www.bbc.co.uk/bitesize/subjects/z3kw2hv' },
      { label: 'AQA — GCSE English Language', url: 'https://www.aqa.org.uk/subjects/english/gcse/english-language-8700' },
    ],
  },
  {
    key: 'Science',
    name: 'The sciences',
    icon: '🔬',
    what: 'Biology, chemistry and physics made concrete — turning abstract ideas into things you can picture, explain and apply under exam conditions.',
    goodFor: ['KS3', 'GCSE', 'A-level', 'Combined & Triple'],
    feels: 'Explanatory and hands-on with examples. Expect diagrams, worked calculations and plenty of "but why does that happen?".',
    origin: 'Cells, forces, reactions, energy, the required practicals, and the maths skills that sit underneath every science paper.',
    history: 'Mapped to GCSE Combined and Triple Science and A-level specifications across AQA, Edexcel and OCR.',
    howItWorks: 'The tutor pins down the misconceptions, links each topic to exam-style questions, and rehearses the mark-scheme language examiners are looking for.',
    resources: [
      { label: 'BBC Bitesize — Science', url: 'https://www.bbc.co.uk/bitesize/subjects/zng4d2p' },
      { label: 'AQA — GCSE Sciences', url: 'https://www.aqa.org.uk/subjects/science' },
    ],
  },
  {
    key: 'Languages',
    name: 'Modern languages',
    icon: '🗣️',
    what: 'French, Spanish, German and more — building real speaking confidence alongside the grammar and vocabulary that exams ask for.',
    goodFor: ['GCSE', 'A-level', 'Speaking', 'Conversation'],
    feels: 'Lots of talking. You\'ll practise out loud in a low-pressure setting, with grammar introduced as you need it rather than as dry rules.',
    origin: 'Speaking, listening, reading and writing across familiar topics, plus the grammar and tenses each level expects.',
    history: 'Aligned to GCSE and A-level modern-language specifications (AQA, Edexcel), including the speaking exam.',
    howItWorks: 'The tutor blends real conversation with targeted drills, corrects gently in the moment, and builds steadily toward each paper of the exam.',
    resources: [
      { label: 'BBC Bitesize — Languages', url: 'https://www.bbc.co.uk/bitesize/subjects/z9dqxnb' },
      { label: 'AQA — GCSE French', url: 'https://www.aqa.org.uk/subjects/languages/gcse/french-8652' },
    ],
  },
  {
    key: 'Music',
    name: 'Music',
    icon: '🎵',
    what: 'Instrument lessons, theory and exam prep — for beginners finding their feet and graded students working toward the next certificate.',
    goodFor: ['Beginners', 'Graded exams', 'Theory', 'Aural'],
    feels: 'Practical and encouraging. You\'ll play, the tutor listens and guides, and practice goals are set for the week ahead.',
    origin: 'Technique, sight-reading, aural, scales and repertoire — plus music theory for those who want it.',
    history: 'Geared to the graded systems (ABRSM, Trinity), from absolute beginner through to the advanced grades.',
    howItWorks: 'The tutor meets your level, breaks tricky passages down into manageable pieces, and shapes each lesson around your next goal or grade.',
    resources: [
      { label: 'ABRSM — exams & grades', url: 'https://www.abrsm.org/en-gb/' },
      { label: 'BBC Bitesize — Music', url: 'https://www.bbc.co.uk/bitesize/subjects/zpf3cdm' },
    ],
  },
  {
    key: 'Exam prep',
    name: '11+, entrance & exam prep',
    icon: '🎯',
    what: 'Focused preparation for the high-stakes moments — 11+, independent-school entrance, GCSE and A-level finals — where technique and timing matter as much as content.',
    goodFor: ['11+', 'Entrance exams', 'GCSE finals', 'A-level finals'],
    feels: 'Structured and reassuring. Past papers under realistic conditions, then a careful review of what to do differently next time.',
    origin: 'Verbal and non-verbal reasoning, subject content, timed practice, and the exam technique that turns knowledge into marks.',
    history: 'Tailored to the specific exam — GL and CEM 11+ styles, individual school papers, and the main GCSE and A-level boards.',
    howItWorks: 'The tutor builds a realistic plan back from the exam date, rehearses under timed conditions, and grows confidence so the day itself feels familiar.',
    resources: [
      { label: 'The Eleven Plus exams — overview', url: 'https://www.elevenplusexams.co.uk/' },
      { label: 'BBC Bitesize — exam revision', url: 'https://www.bbc.co.uk/bitesize/articles/zhtdhcw' },
    ],
  },
]

export default function StylesPage() {
  return (
    <>
      <SiteNav />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-50 to-sand-50" />
        <div className="max-w-2xl mx-auto px-5 sm:px-8 pt-20 pb-12 text-center">
          <p className="text-sm font-semibold text-coral-500 uppercase tracking-wide mb-3">A plain-English guide</p>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold text-brand-900 leading-tight">
            Subjects &amp; how tutoring works
          </h1>
          <p className="text-lg text-sand-700 mt-6">
            You don&apos;t need it all worked out before you start — a good tutor will guide you. Start with the simple version below, and open &ldquo;Go deeper&rdquo; on any subject to see what you&apos;ll cover and how lessons run.
          </p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-5 sm:px-8 pb-16">
        <div className="space-y-5">
          {STYLES.map(s => (
            <div key={s.key} className="bg-white rounded-3xl border border-sand-200 p-6 sm:p-7 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="text-3xl shrink-0">{s.icon}</div>
                <div className="flex-1">
                  <h2 className="font-display text-xl font-semibold text-brand-900 mb-2">{s.name}</h2>
                  <p className="text-sand-600 text-sm leading-relaxed mb-4">{s.what}</p>
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-sand-500 uppercase tracking-wide mb-2">Good for</p>
                    <div className="flex flex-wrap gap-1.5">
                      {s.goodFor.map(g => (
                        <span key={g} className="text-xs bg-brand-50 text-brand-700 px-2.5 py-1 rounded-full">{g}</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-sand-600"><span className="font-medium text-sand-800">What a lesson feels like:</span> {s.feels}</p>

                  <details className="group mt-4 border-t border-sand-100 pt-4">
                    <summary className="cursor-pointer list-none flex items-center gap-2 text-sm font-medium text-brand-700 hover:text-brand-800">
                      <span className="transition group-open:rotate-90">▸</span> Go deeper — what you&apos;ll cover &amp; how lessons work
                    </summary>
                    <div className="mt-4 space-y-4 text-sm text-sand-600 leading-relaxed">
                      <div><p className="font-medium text-sand-800 mb-1">What you&apos;ll cover</p><p>{s.origin}</p></div>
                      <div><p className="font-medium text-sand-800 mb-1">Exams &amp; curricula</p><p>{s.history}</p></div>
                      <div><p className="font-medium text-sand-800 mb-1">How lessons work</p><p>{s.howItWorks}</p></div>
                      <div>
                        <p className="font-medium text-sand-800 mb-1.5">Read more</p>
                        <ul className="space-y-1">
                          {s.resources.map(r => (
                            <li key={r.url}>
                              <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-brand-700 hover:text-brand-800 underline underline-offset-2">{r.label} ↗</a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </details>

                  <Link href="/sign-up" className="inline-block mt-4 text-sm font-medium text-brand-700 hover:text-brand-800">
                    Find a tutor →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-brand-50 border border-brand-200 rounded-2xl p-6 mt-8 text-center">
          <p className="text-sand-700 mb-4">
            Still unsure which subject or level you need? That&apos;s completely normal. Answer one short question and we&apos;ll match you with tutors who fit — you can always switch.
          </p>
          <Link href="/sign-up" className="inline-block bg-brand-600 text-white px-8 py-3 rounded-full font-medium hover:bg-brand-700 transition shadow-lg shadow-brand-600/20">
            Get matched
          </Link>
        </div>

        <p className="text-center text-xs text-sand-400 mt-6">
          Have a question first? See our <Link href="/help" className="text-brand-600 underline">help &amp; FAQs</Link>.
        </p>
      </div>

      <SiteFooter />
    </>
  )
}
