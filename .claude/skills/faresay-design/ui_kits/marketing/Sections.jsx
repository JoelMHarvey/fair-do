// Faresay practice-portal homepage sections — faithful recreation of the CURRENT
// homepage (TherapistHome.tsx). Therapist-first: subscription tool, not a fee.
const { Button, Card, BreathingLotus } = window.FaresayDesignSystem_e2ff75

const BENEFITS = [
  { icon: '🤝', title: 'Your clients stay yours', body: 'You own the relationship and the record. Faresay is your tool — never a middleman between you and the people you help.' },
  { icon: '🪶', title: 'Genuinely simple', body: 'Set up in about 15 minutes — no tech skills needed. Import your client list, book a session, done. Plain-English help on every page.' },
  { icon: '🔒', title: 'Private by design', body: 'Encrypted, with UK/EU data residency and appropriate safeguards. You stay the data controller — in control of your clients\u2019 information.' },
  { icon: '💷', title: 'Set your own prices', body: 'Your rate, your hours, even a different price per client. You keep what you charge — Faresay is a simple monthly subscription, not a cut of every session.' },
  { icon: '⚡', title: 'Get paid automatically', body: 'Clients pay by card; the money lands in your bank about two business days after each session. No chasing, no spreadsheets.' },
  { icon: '📱', title: 'Runs from your phone', body: 'Add Faresay to your home screen and run your whole practice from a phone — no computer required.' },
]

const STEPS = [
  { n: 1, title: 'Add your clients', body: 'Invite them by email or import your whole list — set up in minutes.' },
  { n: 2, title: 'Book sessions', body: 'Pick a time — we create a private video room and email your client automatically.' },
  { n: 3, title: 'Get paid', body: 'Connect payments once; the money arrives in your bank after each session.' },
]

function Hero() {
  return (
    <section style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, zIndex: -1, background: 'linear-gradient(to bottom, var(--color-brand-50), var(--color-sand-50) 55%, var(--color-sand-50))' }} />
      <div style={{ position: 'absolute', top: -96, right: -96, zIndex: -1, height: 384, width: 384, borderRadius: '50%', background: 'rgba(215,240,232,0.5)', filter: 'blur(60px)' }} />
      <div style={{ position: 'absolute', top: 160, left: -96, zIndex: -1, height: 320, width: 320, borderRadius: '50%', background: 'rgba(253,228,217,0.4)', filter: 'blur(60px)' }} />
      <div style={{ maxWidth: 768, margin: '0 auto', padding: '64px 32px 64px', textAlign: 'center' }}>
        <BreathingLotus size={200} style={{ marginBottom: 24 }} />
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, borderRadius: 9999, border: '1px solid var(--border-brand)', background: 'rgba(255,255,255,0.6)', padding: '6px 16px', fontSize: 14, fontWeight: 500, color: 'var(--color-brand-700)' }}>
          <span style={{ height: 6, width: 6, borderRadius: '50%', background: 'var(--color-brand-500)' }} />
          The calm practice tool for therapists
        </span>
        <h1 style={{ fontSize: 60, lineHeight: 1.05, marginTop: 24, marginBottom: 0 }}>
          Your whole practice,<br /><span style={{ color: 'var(--color-brand-600)' }}>in one calm place.</span>
        </h1>
        <p style={{ fontSize: 20, color: 'var(--text-body)', marginTop: 24, maxWidth: 560, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6 }}>
          Faresay brings your clients, scheduling, secure video and payments together — simple enough to run from your phone, private enough for the work you do.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 36, flexWrap: 'wrap' }}>
          <Button size="lg">Start free</Button>
          <Button size="lg" variant="ghost">See how it works</Button>
        </div>
        <p style={{ fontSize: 14, color: 'var(--text-subtle)', marginTop: 16 }}>Free to start · set up in ~15 minutes · keep your own clients</p>
      </div>
    </section>
  )
}

function EthosBand() {
  return (
    <section style={{ background: 'var(--color-brand-900)', color: '#fff' }}>
      <div style={{ maxWidth: 768, margin: '0 auto', padding: '64px 32px', textAlign: 'center' }}>
        <p style={{ color: 'var(--color-brand-200)', fontSize: 14, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Made by people with heart</p>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 500, lineHeight: 1.3, margin: 0, color: '#fff' }}>
          We think therapists deserve better tools — and fairer terms. Faresay grows when you grow. No lock-in, no games, and no company profiting from human suffering.
        </p>
      </div>
    </section>
  )
}

function Benefits() {
  return (
    <section style={{ maxWidth: 1024, margin: '0 auto', padding: '80px 32px' }}>
      <h2 style={{ fontSize: 30, textAlign: 'center', marginBottom: 12 }}>Everything your practice needs</h2>
      <p style={{ color: 'var(--text-muted)', textAlign: 'center', maxWidth: 560, margin: '0 auto 48px' }}>
        No more juggling a calendar, a payment app, a video tool and a spreadsheet. It's all here — and it's built to stay out of your way.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
        {BENEFITS.map(b => (
          <Card key={b.title}>
            <div style={{ fontSize: 30, marginBottom: 12 }} aria-hidden="true">{b.icon}</div>
            <h3 style={{ fontSize: 18, marginBottom: 6 }}>{b.title}</h3>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>{b.body}</p>
          </Card>
        ))}
      </div>
    </section>
  )
}

function HowItWorks() {
  return (
    <section style={{ background: 'rgba(243,239,232,0.6)' }}>
      <div style={{ maxWidth: 896, margin: '0 auto', padding: '80px 32px' }}>
        <h2 style={{ fontSize: 30, textAlign: 'center', marginBottom: 48 }}>Up and running this week</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {STEPS.map(s => (
            <div key={s.n} style={{ textAlign: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--color-brand-600)', color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>{s.n}</div>
              <h3 style={{ fontSize: 18, marginBottom: 6 }}>{s.title}</h3>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function PrivacyBand() {
  return (
    <section style={{ maxWidth: 896, margin: '0 auto', padding: '80px 32px' }}>
      <Card padding="xl" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 30, marginBottom: 12 }} aria-hidden="true">🔒</div>
        <h2 style={{ fontSize: 24, marginBottom: 8 }}>Privacy you can stand behind</h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: 620, margin: '0 auto', lineHeight: 1.7 }}>
          Your clients trust you with the most sensitive things. We treat their information the same way — encrypted, with UK/EU data residency, and never sold or shared. You remain the data controller, in control of your records, always.
        </p>
      </Card>
    </section>
  )
}

function FinalCTA() {
  return (
    <section style={{ background: 'linear-gradient(to bottom, var(--color-sand-50), var(--color-brand-50))' }}>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '80px 32px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 36, marginBottom: 12 }}>Start your practice on Faresay</h2>
        <p style={{ color: 'var(--text-body)', marginBottom: 32 }}>Free to begin, fair as you grow. We'll set you up personally.</p>
        <Button size="lg">Start free →</Button>
        <p style={{ fontSize: 14, color: 'var(--text-subtle)', marginTop: 24 }}>
          Looking for a therapist instead? <a href="#" onClick={e => e.preventDefault()} style={{ color: 'var(--color-brand-700)', textDecoration: 'underline' }}>Find one here</a>.
        </p>
      </div>
    </section>
  )
}

Object.assign(window, { Hero, EthosBand, Benefits, HowItWorks, PrivacyBand, FinalCTA })
