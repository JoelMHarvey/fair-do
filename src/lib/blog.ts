export type Section = { h?: string; p: string[] }
export type Post = {
  slug: string
  title: string
  description: string
  date: string // ISO
  readMins: number
  sections: Section[]
}

export const POSTS: Post[] = [
  {
    slug: 'do-i-need-a-tutor',
    title: 'How to know if a tutor could help',
    description: 'You don\'t need to be falling behind to benefit from a tutor. Here are the signs it might help, and how to take a first step.',
    date: '2026-06-01',
    readMins: 5,
    sections: [
      { p: [
        'One of the most common things people say before getting a tutor is some version of: "Are things bad enough to need one?" You don\'t need to be failing, and you don\'t need a crisis at school. Tutoring is for anyone who wants to understand a subject better, build confidence, or get ready for something that matters.',
      ] },
      { h: 'Signs it might help', p: [
        'Homework has become a nightly battle, or it\'s taking far longer than it should. A subject that used to click has stopped making sense. Grades have slipped, or they\'re fine but an exam is coming up. Confidence has dropped — "I\'m just rubbish at maths." Or simply: a learner who\'s ready to stretch further than the classroom has time for, and would benefit from one-to-one attention.',
      ] },
      { h: 'It doesn\'t have to be a problem', p: [
        'Plenty of people get a tutor not because things have gone wrong, but to stay ahead, build a strong foundation, or prepare for an entrance exam or university application. Stretch and confidence are completely valid reasons.',
      ] },
      { h: 'Taking a first step', p: [
        'You don\'t have to commit to anything big. A single lesson can help you decide if a tutor is right. On fair-do, you tell us the subject and level, get matched with verified tutors who fit, and book when you\'re ready — no subscription, cancel free up to 24 hours before.',
      ] },
    ],
  },
  {
    slug: 'understanding-exam-stress',
    title: 'Understanding exam stress: signs, causes, and what helps',
    description: 'A plain-English guide to exam stress — what it is, why it happens, and the approaches that genuinely help.',
    date: '2026-06-08',
    readMins: 6,
    sections: [
      { p: [
        'Exam stress is one of the most common reasons families look for a tutor — and one of the most manageable. It\'s your body\'s threat system doing its job, just a little too often or too loudly. Understanding it is the first step to loosening its grip.',
      ] },
      { h: 'What exam stress can feel like', p: [
        'Racing or circular thoughts, a sense of dread, trouble sleeping, a tight chest or churning stomach, irritability, going blank in tests, or avoiding revision altogether. It shows up in the body as much as the mind.',
      ] },
      { h: 'Why it happens', p: [
        'Exam stress can be driven by pressure, gaps in understanding, past experiences of "freezing", perfectionism, or a mix. Often it\'s maintained by a loop: revision feels overwhelming, so we avoid it, which leaves us less prepared — so the dread grows. Naming that loop is powerful.',
      ] },
      { h: 'What genuinely helps', p: [
        'Breaking work into small, specific steps beats vague "do more revision". Past papers under realistic conditions turn the unknown into the familiar. Spaced practice — little and often — sticks far better than cramming. And one-to-one time lets a tutor find the exact gap that\'s causing the panic and close it. There\'s no single right path — a good tutor tailors it to the learner.',
        'You can read more about subjects and levels in our subjects guide.',
      ] },
      { h: 'When to get more support', p: [
        'If stress is affecting sleep, mood, or daily life beyond exams, don\'t wait — talk to your GP or school, and for someone in distress, Samaritans (116 123) and the NSPCC (0808 800 5000) can help.',
      ] },
    ],
  },
  {
    slug: 'first-tutoring-lesson',
    title: 'What to expect in your first tutoring lesson',
    description: 'Nervous about the first lesson? Here\'s exactly what tends to happen, and how to get the most from it.',
    date: '2026-06-15',
    readMins: 5,
    sections: [
      { p: [
        'Almost everyone feels a flutter of nerves before a first lesson — learner and parent alike. That\'s normal. Knowing what to expect takes a lot of the edge off.',
      ] },
      { h: 'The first lesson is mostly orientation', p: [
        'No one expects you to know everything on day one. A first lesson is usually about getting to know each other: where you are with the subject, what you\'d like to improve, what\'s coming up (a test, an exam, an application), and how you both like to work. It\'s as much you sizing up the tutor as the other way round.',
      ] },
      { h: 'You\'re allowed to find it hard', p: [
        '"I don\'t really get any of this" is a perfectly good place to start. A skilled tutor will find the thread and build from what you do know. There\'s no judgement — that\'s the whole point of one-to-one.',
      ] },
      { h: 'Fit matters more than anything', p: [
        'The single biggest predictor of whether tutoring works is the relationship. If after a lesson or two it doesn\'t feel right, it\'s completely okay to try someone else — it\'s not a failure, it\'s finding your fit.',
      ] },
      { h: 'Getting the most from it', p: [
        'Come with specific questions or a topic you\'re stuck on. Be honest about what isn\'t landing ("can we go slower here", "I\'d like more practice questions"). Do the small bits of practice between lessons. And give it a little time — tutoring is a process, not a one-off fix.',
      ] },
    ],
  },
]

export function getPost(slug: string) {
  return POSTS.find(p => p.slug === slug)
}
