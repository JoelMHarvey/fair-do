import Link from 'next/link'
import { SiteNav } from '@/components/SiteNav'
import { SiteFooter } from '@/components/SiteFooter'

export const metadata = {
  title: 'Understanding therapy styles — Faresay',
  description: 'CBT, psychodynamic, person-centred, EMDR, mindfulness and integrative therapy explained — origins, history, how they work, and where to read more.',
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
    key: 'CBT',
    name: 'CBT — Cognitive Behavioural Therapy',
    icon: '🧩',
    what: 'A practical, structured approach that looks at how your thoughts, feelings and behaviours connect — and how changing one can shift the others.',
    goodFor: ['Anxiety', 'Depression', 'Phobias', 'Panic', 'OCD'],
    feels: 'Active and goal-focused. You\'ll often set small tasks between sessions and learn concrete tools you can keep using.',
    origin: 'Developed by psychiatrist Aaron T. Beck in the 1960s, building on earlier behavioural therapy and Albert Ellis\'s rational-emotive work.',
    history: 'Beck noticed his depressed patients had streams of automatic negative thoughts. By testing and reshaping those thoughts, symptoms eased. CBT became one of the most researched therapies in the world and is recommended by the UK\'s NICE for many conditions.',
    howItWorks: 'You and your therapist identify unhelpful thought patterns ("cognitive distortions") and the behaviours that reinforce them, then test them against reality and practise new responses — often with worksheets and between-session experiments.',
    resources: [
      { label: 'NHS — overview of CBT', url: 'https://www.nhs.uk/mental-health/talking-therapies-medicine-treatments/talking-therapies-and-counselling/cognitive-behavioural-therapy-cbt/overview/' },
      { label: 'BABCP — the CBT professional body', url: 'https://babcp.com/' },
    ],
  },
  {
    key: 'Psychodynamic',
    name: 'Psychodynamic therapy',
    icon: '🌊',
    what: 'Explores how your past, early relationships and unconscious patterns shape how you feel and relate today.',
    goodFor: ['Recurring relationship patterns', 'Long-standing low mood', 'Self-understanding'],
    feels: 'More open and exploratory, less structured. You talk freely; the therapist helps you notice patterns and meaning over time.',
    origin: 'Rooted in the psychoanalysis of Sigmund Freud (late 1800s), later evolved by figures like Carl Jung, Melanie Klein and Donald Winnicott into shorter, more relational forms.',
    history: 'Classical psychoanalysis (the couch, several sessions a week) gradually gave way to once-weekly "psychodynamic" therapy that keeps the focus on the unconscious and the past while being more practical for modern life.',
    howItWorks: 'By paying attention to recurring themes, dreams, slips, and the relationship with the therapist itself, hidden conflicts become conscious — and once seen, they lose some of their grip.',
    resources: [
      { label: 'BPC — British Psychoanalytic Council', url: 'https://www.bpc.org.uk/information-support/what-is-psychotherapy/' },
      { label: 'NHS — psychotherapy overview', url: 'https://www.nhs.uk/mental-health/talking-therapies-medicine-treatments/talking-therapies-and-counselling/types-of-talking-therapies/' },
    ],
  },
  {
    key: 'Person-centred',
    name: 'Person-centred therapy',
    icon: '🌱',
    what: 'Built on the belief that you already hold what you need to grow. The therapist offers warmth, empathy and no judgement to help you find your own way.',
    goodFor: ['Self-esteem', 'Life transitions', 'Feeling unheard', 'General wellbeing'],
    feels: 'Gentle and led by you. There\'s no agenda imposed — the relationship itself is the healing space.',
    origin: 'Created by American psychologist Carl Rogers in the 1940s–50s as part of the "humanistic" movement.',
    history: 'Rogers broke from the expert-led model, arguing that people have an innate drive toward growth that flourishes given the right conditions — empathy, genuineness, and unconditional positive regard.',
    howItWorks: 'The therapist doesn\'t direct or diagnose. By being deeply heard and accepted, you reconnect with your own feelings and judgement, and change emerges from within rather than being prescribed.',
    resources: [
      { label: 'BACP — what is counselling', url: 'https://www.bacp.co.uk/about-therapy/what-is-counselling/' },
      { label: 'Counselling Directory — person-centred', url: 'https://www.counselling-directory.org.uk/person-centred-therapy.html' },
    ],
  },
  {
    key: 'EMDR',
    name: 'EMDR — Eye Movement Desensitisation & Reprocessing',
    icon: '👁️',
    what: 'A structured therapy that helps the brain reprocess distressing memories using guided eye movements or tapping, so they lose their grip.',
    goodFor: ['Trauma', 'PTSD', 'Distressing memories', 'Phobias'],
    feels: 'Structured and focused. You recall difficult moments briefly while following a back-and-forth cue; many find relief without long retelling.',
    origin: 'Developed by American psychologist Francine Shapiro in 1987, after she noticed that certain eye movements seemed to reduce the intensity of distressing thoughts.',
    history: 'Initially met with scepticism, EMDR built a strong evidence base for trauma and is now recommended by NICE and the World Health Organization for PTSD.',
    howItWorks: 'While you hold a distressing memory in mind, bilateral stimulation (eye movements, taps or tones) is thought to help the brain "digest" the memory so it\'s stored as an ordinary, non-threatening recollection.',
    resources: [
      { label: 'NHS — EMDR for PTSD', url: 'https://www.nhs.uk/mental-health/conditions/post-traumatic-stress-disorder-ptsd/treatment/' },
      { label: 'EMDR Association UK', url: 'https://emdrassociation.org.uk/' },
    ],
  },
  {
    key: 'Mindfulness',
    name: 'Mindfulness-based approaches',
    icon: '🧘',
    what: 'Teaches you to notice thoughts and feelings as they arise, without being swept away — often blended with CBT (MBCT).',
    goodFor: ['Stress', 'Recurrent depression', 'Rumination', 'Burnout'],
    feels: 'Practice-based. Expect breathing and awareness exercises you build into daily life, plus reflection in sessions.',
    origin: 'Modern mindfulness draws on centuries-old Buddhist contemplative practice, secularised by Jon Kabat-Zinn (MBSR, 1979) and adapted into MBCT by Segal, Williams and Teasdale in the 1990s.',
    history: 'Kabat-Zinn brought mindfulness into hospitals for chronic pain and stress; researchers later combined it with CBT to prevent depressive relapse. NICE now recommends MBCT for recurrent depression.',
    howItWorks: 'Regular practice trains attention to stay with the present moment, so you relate to difficult thoughts as passing events rather than facts — reducing rumination and reactivity.',
    resources: [
      { label: 'NHS — mindfulness', url: 'https://www.nhs.uk/mental-health/self-help/tips-and-support/mindfulness/' },
      { label: 'Oxford Mindfulness Foundation', url: 'https://www.oxfordmindfulness.org/' },
    ],
  },
  {
    key: 'Integrative',
    name: 'Integrative / blended',
    icon: '🎨',
    what: 'Many experienced therapists draw on several approaches and tailor the mix to you, rather than following one school.',
    goodFor: ['When you\'re not sure', 'Complex or layered concerns', 'Wanting flexibility'],
    feels: 'Adaptable. The therapist meets you where you are and shifts methods as your needs change.',
    origin: 'Emerged through the later 20th century as research showed the therapeutic relationship often matters more than any single technique.',
    history: 'Rather than one founder, integrative practice grew from a profession-wide recognition that no single model fits everyone — and that thoughtfully combining approaches can serve clients better.',
    howItWorks: 'Your therapist assesses what you need and blends tools — perhaps CBT skills, person-centred warmth, and a psychodynamic eye for patterns — adjusting as therapy progresses.',
    resources: [
      { label: 'UKCP — find the right therapy', url: 'https://www.psychotherapy.org.uk/seeking-therapy/' },
      { label: 'BACP — types of therapy', url: 'https://www.bacp.co.uk/about-therapy/types-of-therapy/' },
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
            Which kind of therapy is right for you?
          </h1>
          <p className="text-lg text-sand-700 mt-6">
            You don&apos;t need to know before you start — a good therapist will guide you. Start with the simple version below, and open &ldquo;Go deeper&rdquo; on any approach to read its origins, history and how it actually works.
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
                    <p className="text-xs font-semibold text-sand-500 uppercase tracking-wide mb-2">Often helps with</p>
                    <div className="flex flex-wrap gap-1.5">
                      {s.goodFor.map(g => (
                        <span key={g} className="text-xs bg-brand-50 text-brand-700 px-2.5 py-1 rounded-full">{g}</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-sand-600"><span className="font-medium text-sand-800">What a session feels like:</span> {s.feels}</p>

                  <details className="group mt-4 border-t border-sand-100 pt-4">
                    <summary className="cursor-pointer list-none flex items-center gap-2 text-sm font-medium text-brand-700 hover:text-brand-800">
                      <span className="transition group-open:rotate-90">▸</span> Go deeper — origins, history &amp; how it works
                    </summary>
                    <div className="mt-4 space-y-4 text-sm text-sand-600 leading-relaxed">
                      <div><p className="font-medium text-sand-800 mb-1">Where it came from</p><p>{s.origin}</p></div>
                      <div><p className="font-medium text-sand-800 mb-1">A little history</p><p>{s.history}</p></div>
                      <div><p className="font-medium text-sand-800 mb-1">How it works</p><p>{s.howItWorks}</p></div>
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
                    Find a {s.key} therapist →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-brand-50 border border-brand-200 rounded-2xl p-6 mt-8 text-center">
          <p className="text-sand-700 mb-4">
            Still unsure? That&apos;s completely normal. Answer one short question and we&apos;ll match you with therapists who fit — you can always switch.
          </p>
          <Link href="/sign-up" className="inline-block bg-brand-600 text-white px-8 py-3 rounded-full font-medium hover:bg-brand-700 transition shadow-lg shadow-brand-600/20">
            Get matched
          </Link>
        </div>

        <p className="text-center text-xs text-sand-400 mt-6">
          Need help now? See <Link href="/help" className="text-coral-600 underline">urgent support</Link>.
        </p>
      </div>

      <SiteFooter />
    </>
  )
}
