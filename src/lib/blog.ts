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
    slug: 'do-i-need-therapy',
    title: 'How to know if you might need therapy',
    description: 'You don\'t have to be in crisis to benefit from therapy. Here are the signs it might help, and how to take a first step.',
    date: '2026-06-01',
    readMins: 5,
    sections: [
      { p: [
        'One of the most common things people say before starting therapy is some version of: "I\'m not sure my problem is big enough." You don\'t need to be in crisis, and you don\'t need a diagnosis. Therapy is for anyone who wants to feel better, understand themselves, or change something that isn\'t working.',
      ] },
      { h: 'Signs it might help', p: [
        'You\'ve felt low, anxious, or "not yourself" for more than a couple of weeks. The same patterns keep repeating in your relationships or work. You\'re carrying something — a loss, a memory, a worry — that you can\'t seem to put down. You\'re coping, but it\'s taking everything you have. Or simply: something feels off, and you\'d like a thinking partner who isn\'t a friend or family member.',
      ] },
      { h: 'It doesn\'t have to be a crisis', p: [
        'Plenty of people come to therapy not because everything has fallen apart, but to stop it from getting there — or to grow. Prevention and self-understanding are completely valid reasons.',
        'That said, if you are in crisis or thinking about harming yourself, please reach out to urgent support now rather than waiting for a session.',
      ] },
      { h: 'Taking a first step', p: [
        'You don\'t have to commit to anything big. A single session can help you decide if it\'s for you. On fair-do, you answer one short question, get matched with verified therapists who fit, and book when you\'re ready — no subscription, cancel free up to 24 hours before.',
      ] },
    ],
  },
  {
    slug: 'understanding-anxiety',
    title: 'Understanding anxiety: signs, causes, and what helps',
    description: 'A plain-English guide to anxiety — what it is, why it happens, and the approaches that genuinely help.',
    date: '2026-06-08',
    readMins: 6,
    sections: [
      { p: [
        'Anxiety is one of the most common reasons people seek therapy — and one of the most treatable. It\'s your body\'s threat system doing its job, just a little too often or too loudly. Understanding it is the first step to loosening its grip.',
      ] },
      { h: 'What anxiety can feel like', p: [
        'Racing or circular thoughts, a sense of dread, trouble sleeping, a tight chest or churning stomach, irritability, avoiding things you used to do, or feeling "on edge" without knowing why. It shows up in the body as much as the mind.',
      ] },
      { h: 'Why it happens', p: [
        'Anxiety can be driven by life stress, past experiences, temperament, health, or a mix. Often it\'s maintained by a loop: we feel anxious, we avoid the thing, the relief teaches our brain the thing really was dangerous — so the anxiety grows. Naming that loop is powerful.',
      ] },
      { h: 'What genuinely helps', p: [
        'CBT is well-evidenced for anxiety — it helps you test anxious thoughts and gently face what you\'ve been avoiding. Mindfulness-based approaches help you relate to anxious thoughts as passing events rather than facts. For anxiety rooted in past experiences, psychodynamic or EMDR work can help. There\'s no single right path — a good therapist tailors it to you.',
        'You can read more about each in our guide to therapy styles.',
      ] },
      { h: 'When to get support sooner', p: [
        'If anxiety is stopping you living your life, or comes with thoughts of harming yourself, don\'t wait — reach out to urgent support, and consider talking to a therapist.',
      ] },
    ],
  },
  {
    slug: 'first-therapy-session',
    title: 'What to expect in your first therapy session',
    description: 'Nervous about your first session? Here\'s exactly what tends to happen, and how to get the most from it.',
    date: '2026-06-15',
    readMins: 5,
    sections: [
      { p: [
        'Almost everyone feels a flutter of nerves before their first session. That\'s normal — you\'re about to talk to a stranger about personal things. Knowing what to expect takes a lot of the edge off.',
      ] },
      { h: 'The first session is mostly orientation', p: [
        'You won\'t be expected to pour out your whole life story. A first session is usually about getting to know each other: what brings you here, what you\'d like to be different, a little background, and how you both like to work. It\'s as much you interviewing them as the other way round.',
      ] },
      { h: 'You\'re allowed to not know', p: [
        '"I\'m not even sure why I\'m here" is a perfectly good place to start. A skilled therapist will help you find the thread. You also don\'t have to share anything you\'re not ready to.',
      ] },
      { h: 'Fit matters more than anything', p: [
        'The single biggest predictor of whether therapy helps is the relationship. If after a session or two it doesn\'t feel right, it\'s completely okay to try someone else — it\'s not a failure, it\'s finding your fit.',
      ] },
      { h: 'Getting the most from it', p: [
        'Be as honest as you can, including about the therapy itself ("that landed wrong", "I\'d like more structure"). Notice what comes up between sessions. And give it a little time — the first session is the start of a process, not a one-off fix.',
      ] },
    ],
  },
]

export function getPost(slug: string) {
  return POSTS.find(p => p.slug === slug)
}
