// Faresay app screens — client dashboard, therapist directory, booking flow.
// Recreates /dashboard, /therapists and /book/[id] using the DS components.
const { Logo, Button, Card, Badge, Tag, Avatar, Stat, TherapistCard } = window.FaresayDesignSystem_e2ff75

function AppNav({ view, go }) {
  const link = (v, label) => (
    <a href="#" onClick={(e) => { e.preventDefault(); go(v) }}
      style={{ fontSize: 14, textDecoration: 'none', fontWeight: view === v ? 600 : 400, color: view === v ? 'var(--color-brand-700)' : 'var(--text-muted)' }}>{label}</a>
  )
  return (
    <nav style={{ borderBottom: '1px solid var(--border-default)', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)', position: 'sticky', top: 0, zIndex: 40 }}>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Logo />
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {link('dashboard', 'Dashboard')}
          {link('directory', 'Find a therapist')}
          <Avatar name="Alex Rivera" size={32} />
        </div>
      </div>
    </nav>
  )
}

function Dashboard({ go, sessions }) {
  return (
    <div style={{ maxWidth: 768, margin: '0 auto', padding: '48px 24px' }}>
      <h1 style={{ fontSize: 30, marginBottom: 4 }}>Welcome back, Alex</h1>
      <p style={{ color: 'var(--text-subtle)', fontSize: 14, marginTop: 0, marginBottom: 32 }}>Your therapy dashboard</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 32 }}>
        <Stat label="Upcoming sessions" value={String(sessions.length)} accent="dark" align="left" />
        <Stat label="My therapists" value={sessions.length ? '1' : '0'} accent="dark" align="left" />
        <Stat label="Credit balance" value="£0.00" accent="brand" align="left" />
      </div>

      <section style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: 16, fontWeight: 600, color: 'var(--color-sand-900)', margin: 0 }}>Upcoming sessions</h2>
          <a href="#" onClick={(e) => { e.preventDefault(); go('directory') }} style={{ fontSize: 14, color: 'var(--color-brand-600)', textDecoration: 'none' }}>+ Book new</a>
        </div>
        {sessions.length === 0 ? (
          <Card padding="xl" style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--text-subtle)', fontSize: 14, marginTop: 0, marginBottom: 12 }}>No sessions booked yet</p>
            <Button size="sm" onClick={() => go('directory')}>Find a therapist</Button>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {sessions.map((s, i) => (
              <Card key={i} padding="md">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <Avatar name={s.name} size={44} />
                    <div>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: 'var(--color-sand-900)' }}>{s.name}</p>
                      <p style={{ margin: '2px 0 0', fontSize: 14, color: 'var(--text-subtle)' }}>{s.day} 26 June · {s.time}</p>
                    </div>
                  </div>
                  <Badge tone="brand">Confirmed</Badge>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <Card padding="lg" style={{ background: 'var(--color-brand-50)', borderColor: 'var(--border-brand)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--text-heading)' }}>Refer a friend, you both get £10</p>
            <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--text-muted)' }}>Share faresay.com/r/ALEX10 — fair therapy spreads by word of mouth.</p>
          </div>
          <Button variant="secondary" size="sm">Copy link</Button>
        </div>
      </Card>
    </div>
  )
}

function Directory({ onBook }) {
  const [sort, setSort] = React.useState('match')
  const therapists = window.FARESAY_THERAPISTS
  const tab = (v, label) => (
    <button onClick={() => setSort(v)} style={{
      padding: '8px 18px', borderRadius: 9999, fontSize: 14, fontWeight: 500, cursor: 'pointer',
      border: sort === v ? '1px solid transparent' : '1px solid var(--border-default)',
      background: sort === v ? 'var(--accent)' : 'var(--surface-card)',
      color: sort === v ? '#fff' : 'var(--text-muted)',
      fontFamily: 'var(--font-sans)', transition: 'all var(--dur-fast) ease',
    }}>{label}</button>
  )
  const sorted = [...therapists].sort((a, b) => {
    if (sort === 'cheapest') return parseInt(a.price.slice(1)) - parseInt(b.price.slice(1))
    return 0
  })
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px' }}>
      <h1 style={{ fontSize: 30, marginBottom: 8 }}>Your matches</h1>
      <p style={{ color: 'var(--text-muted)', marginTop: 0, marginBottom: 24 }}>
        Therapists suited to <span style={{ color: 'var(--color-brand-700)', fontWeight: 500 }}>anxiety, burnout</span>
      </p>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {tab('match', 'Best match')}{tab('cheapest', 'Cheapest')}{tab('soonest', 'Soonest')}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {sorted.map((t, i) => (
          <TherapistCard key={t.id} {...t} bestMatch={sort === 'match' && i === 0}
            price={t.intro || t.price} priceCaption={t.intro ? 'first session' : 'per session'}
            onBook={() => onBook(t)} onView={() => onBook(t)} />
        ))}
      </div>
    </div>
  )
}

function Booking({ therapist, go, confirm }) {
  const [day, setDay] = React.useState(2)
  const [slot, setSlot] = React.useState('14:00')
  const days = window.FARESAY_DAYS, slots = window.FARESAY_SLOTS
  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '40px 24px' }}>
      <a href="#" onClick={(e) => { e.preventDefault(); go('directory') }} style={{ fontSize: 14, color: 'var(--text-muted)', textDecoration: 'none' }}>← Back to matches</a>
      <Card padding="lg" style={{ marginTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Avatar name={therapist.name} size={56} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, color: 'var(--text-heading)' }}>{therapist.name}</p>
              {therapist.founding && <Badge tone="coral" icon="★">Founding</Badge>}
            </div>
            <p style={{ margin: '2px 0 0', fontSize: 14, color: 'var(--text-subtle)' }}>{therapist.credential} · {therapist.tagline}</p>
          </div>
        </div>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 0 }}>{therapist.bio}</p>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 14 }}>
          {therapist.specialisms.map(s => <Tag key={s}>{s}</Tag>)}
        </div>
      </Card>

      <h2 style={{ fontSize: 22, margin: '32px 0 16px' }}>Choose a time</h2>
      <p style={{ fontSize: 13, color: 'var(--text-subtle)', margin: '0 0 12px' }}>All times Europe/London · 50-minute session</p>
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        {days.map((d, i) => (
          <button key={i} onClick={() => setDay(i)} style={{
            width: 64, padding: '10px 0', borderRadius: 'var(--radius-md)', cursor: 'pointer', textAlign: 'center',
            border: day === i ? '1px solid var(--accent)' : '1px solid var(--border-default)',
            background: day === i ? 'var(--color-brand-50)' : 'var(--surface-card)', fontFamily: 'var(--font-sans)',
          }}>
            <div style={{ fontSize: 12, color: 'var(--text-subtle)' }}>{d.d}</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: day === i ? 'var(--color-brand-700)' : 'var(--text-body)' }}>{d.n}</div>
          </button>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 28 }}>
        {slots.map(s => (
          <button key={s} onClick={() => setSlot(s)} style={{
            padding: '12px 0', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: 15, fontWeight: 500, fontFamily: 'var(--font-sans)',
            border: slot === s ? '1px solid var(--accent)' : '1px solid var(--border-default)',
            background: slot === s ? 'var(--accent)' : 'var(--surface-card)',
            color: slot === s ? '#fff' : 'var(--text-body)',
          }}>{s}</button>
        ))}
      </div>

      <Card padding="lg">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>{therapist.intro ? 'First session (intro rate)' : 'Session fee'}</span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, color: 'var(--text-heading)' }}>{therapist.intro || therapist.price}</span>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-subtle)', margin: '0 0 16px' }}>
          {days[day].d} {days[day].n} June · {slot} · Cancel free up to 24h before
        </p>
        <Button fullWidth onClick={() => confirm({ name: therapist.name, day: days[day].d, time: slot })}>Confirm &amp; pay {therapist.intro || therapist.price}</Button>
      </Card>
    </div>
  )
}

function Confirmation({ session, go }) {
  return (
    <div style={{ maxWidth: 520, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
      <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--color-brand-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 32 }}>🌿</div>
      <h1 style={{ fontSize: 32, marginBottom: 12 }}>You're booked in</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: 16, marginTop: 0, marginBottom: 28, lineHeight: 1.6 }}>
        Your session with <strong style={{ color: 'var(--text-body)' }}>{session.name}</strong> is confirmed for {session.day} 26 June at {session.time}. We've emailed you a calendar invite and a secure video link.
      </p>
      <Button onClick={() => go('dashboard')}>Go to dashboard</Button>
    </div>
  )
}

Object.assign(window, { AppNav, Dashboard, Directory, Booking, Confirmation })
