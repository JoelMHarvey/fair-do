// Faresay marketing chrome — sticky nav + footer. Recreates SiteNav/SiteFooter.
const { Logo, Button } = window.FaresayDesignSystem_e2ff75

function Nav({ links = ['Features', 'Pricing', 'Find a therapist'] }) {
  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      borderBottom: '1px solid rgba(232,225,213,0.7)',
      background: 'rgba(250,248,245,0.8)', backdropFilter: 'blur(12px)',
    }}>
      <div style={{ maxWidth: 1152, margin: '0 auto', padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Logo />
        <div className="nav-center" style={{ display: 'flex', alignItems: 'center', gap: 28, fontSize: 14, color: 'var(--text-muted)' }}>
          {links.map(l => <a key={l} href="#" style={{ textDecoration: 'none', color: 'inherit' }} onClick={e => e.preventDefault()}>{l}</a>)}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <a href="#" onClick={e => e.preventDefault()} style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-muted)', textDecoration: 'none' }}>Sign in</a>
          <Button size="sm">Start free</Button>
        </div>
      </div>
    </nav>
  )
}

function Footer() {
  const cols = [
    { h: 'Clients', items: ['Find a therapist', 'Therapy styles', 'AI therapy?', 'Blog', 'How it works', 'Gift a session', 'FAQ'] },
    { h: 'Therapists', items: ['Join Faresay', 'Why Faresay', 'For business'] },
    { h: 'Company', items: ['About', 'Urgent help', 'Privacy', 'Terms', 'Complaints'] },
  ]
  return (
    <footer style={{ borderTop: '1px solid var(--border-default)', background: 'rgba(243,239,232,0.5)' }}>
      <div style={{ maxWidth: 1152, margin: '0 auto', padding: '48px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', gap: 32 }}>
          <div>
            <Logo />
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 12, maxWidth: 260, lineHeight: 1.6 }}>
              The simple, private way for therapists to run their practice — your clients, scheduling, secure video and payments in one place.
            </p>
          </div>
          {cols.map(c => (
            <div key={c.h}>
              <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-sand-900)', marginBottom: 12 }}>{c.h}</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {c.items.map(i => <li key={i}><a href="#" onClick={e => e.preventDefault()} style={{ fontSize: 14, color: 'var(--text-muted)', textDecoration: 'none' }}>{i}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid var(--border-default)', marginTop: 40, paddingTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontSize: 12, color: 'var(--text-subtle)', margin: 0 }}>© {new Date().getFullYear()} Faresay Ltd · Company No. 17302034 (England &amp; Wales)</p>
          <a href="#" onClick={e => e.preventDefault()} style={{ fontSize: 12, color: 'var(--text-subtle)', textDecoration: 'none' }}>In emergency call 999 — urgent help →</a>
        </div>
      </div>
    </footer>
  )
}

Object.assign(window, { Nav, Footer })
