// Faresay pricing page — faithful recreation of /pricing (pricing/page.tsx).
// Subscription model: Starter free · Practice £29/mo · Clinic coming soon.
const { Button, Card, Badge } = window.FaresayDesignSystem_e2ff75

const TIERS = [
  {
    name: 'Starter', price: 'Free', cadence: '',
    tagline: 'Everything to run your practice.',
    features: ['Unlimited clients', 'Scheduling + secure video', 'Card payments & payouts', 'Reminders & messaging', 'Runs on your phone'],
    note: 'A small commission (2.5%) applies on card payments + stripe transaction fee',
    cta: 'Start free', highlight: false,
  },
  {
    name: 'Practice', price: '£29', cadence: '/month',
    tagline: 'For an established solo practice.',
    features: ['Everything in Starter', 'Lower payment commission', 'Per-client pricing & packages', 'Priority support', 'Your booking page'],
    note: '1% commission + stripe transaction fee',
    cta: 'Start free', highlight: true,
  },
  {
    name: 'Clinic', price: 'Coming soon', cadence: '',
    tagline: 'For group practices & clinics.',
    features: ['Multiple therapists, one clinic', 'Shared team calendar', 'Clinic admin & reporting'],
    note: 'In development — register your interest and we\u2019ll keep you posted.',
    cta: 'Register interest', highlight: false,
  },
]

const FAQ = [
  { q: 'Do I have to pay to start?', a: 'No. Starter is free — run your whole practice on it. You only pay if you choose a plan with lower commission and extra tools.' },
  { q: 'What\u2019s the commission?', a: 'A small percentage on card payments your clients make, which covers payment processing and the platform. Paid plans reduce it. (Founding rates are lower still.)' },
  { q: 'Can I cancel any time?', a: 'Yes. No lock-in. If you cancel a paid plan it simply runs to the end of the period, then drops to Starter — your clients and records stay with you.' },
  { q: 'Are my clients mine?', a: 'Always. You own the relationship and the records. Faresay is your tool, never a middleman.' },
]

function Faq({ q, a }) {
  const [open, setOpen] = React.useState(false)
  return (
    <Card padding="none" style={{ overflow: 'hidden' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        padding: '16px 20px', background: open ? 'rgba(250,248,245,0.6)' : 'transparent', border: 'none', cursor: 'pointer',
        fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 500, color: 'var(--color-sand-800)', textAlign: 'left',
      }}>
        {q}
        <span style={{ flexShrink: 0, color: 'var(--color-brand-600)', fontSize: 18, transition: 'transform var(--dur-fast) ease', transform: open ? 'rotate(45deg)' : 'none' }} aria-hidden="true">+</span>
      </button>
      {open && <div style={{ padding: '0 20px 20px', fontSize: 14, color: 'var(--text-body)', lineHeight: 1.7 }}>{a}</div>}
    </Card>
  )
}

function Pricing() {
  return (
    <main style={{ background: 'linear-gradient(to bottom, var(--color-brand-50), var(--color-sand-50) 50%, var(--color-sand-50))' }}>
      <div style={{ maxWidth: 1024, margin: '0 auto', padding: '80px 32px' }}>
        <div style={{ textAlign: 'center', maxWidth: 560, margin: '0 auto 16px' }}>
          <h1 style={{ fontSize: 48, marginBottom: 0 }}>Simple, fair pricing</h1>
          <p style={{ color: 'var(--text-body)', marginTop: 16 }}>Start free and pay as you grow. No lock-in, no surprises — and we grow only when you do.</p>
        </div>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <Badge tone="coral">🚀 Founding pricing — locked for early therapists</Badge>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, alignItems: 'start' }}>
          {TIERS.map(t => (
            <div key={t.name} style={{
              borderRadius: 'var(--radius-xl)', padding: 28, background: 'var(--surface-card)', display: 'flex', flexDirection: 'column',
              boxShadow: 'var(--shadow-sm)',
              border: t.highlight ? '1px solid var(--color-brand-400)' : '1px solid var(--border-default)',
              outline: t.highlight ? '1px solid var(--border-brand)' : 'none',
            }}>
              {t.highlight && (
                <span style={{ alignSelf: 'flex-start', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-brand-700)', background: 'var(--color-brand-50)', padding: '4px 10px', borderRadius: 9999, marginBottom: 12 }}>Most popular</span>
              )}
              <h2 style={{ fontSize: 20, marginBottom: 4 }}>{t.name}</h2>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: '0 0 16px' }}>{t.tagline}</p>
              <div style={{ marginBottom: 20 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 600, color: 'var(--text-heading)' }}>{t.price}</span>
                <span style={{ color: 'var(--text-subtle)' }}>{t.cadence}</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                {t.features.map(f => (
                  <li key={f} style={{ display: 'flex', gap: 8, fontSize: 14, color: 'var(--text-body)' }}>
                    <span style={{ color: 'var(--color-brand-600)' }} aria-hidden="true">✓</span>{f}
                  </li>
                ))}
              </ul>
              <p style={{ fontSize: 12, color: 'var(--text-subtle)', margin: '0 0 20px' }}>{t.note}</p>
              <Button variant={t.highlight ? 'primary' : 'secondary'} fullWidth>{t.cta}</Button>
            </div>
          ))}
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-subtle)', marginTop: 24 }}>
          Prices shown are launch pricing and may change. Founding therapists keep their rate.
        </p>

        <div style={{ maxWidth: 640, margin: '64px auto 0' }}>
          <h2 style={{ fontSize: 24, textAlign: 'center', marginBottom: 24 }}>Questions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {FAQ.map(f => <Faq key={f.q} {...f} />)}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 64 }}>
          <Button size="lg">Start free →</Button>
        </div>
      </div>
    </main>
  )
}

Object.assign(window, { Pricing })
