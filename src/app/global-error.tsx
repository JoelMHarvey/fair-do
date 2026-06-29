'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en-GB">
      <body
        style={{
          minHeight: '100vh',
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '24px',
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
          background: '#f8f7f4',
          color: '#312e81',
        }}
      >
        <h1 style={{ fontSize: '32px', fontWeight: 700, margin: '0 0 12px' }}>Something went wrong</h1>
        <p style={{ color: '#5a6a64', maxWidth: '420px', margin: '0 0 24px', lineHeight: 1.6 }}>
          We hit an unexpected error. Please try again — if it keeps happening, email{' '}
          <a href="mailto:hello@fair-do.com" style={{ color: '#4f46e5' }}>hello@fair-do.com</a>.
        </p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => reset()}
            style={{
              background: '#4f46e5',
              color: '#fff',
              border: 'none',
              padding: '12px 26px',
              borderRadius: '999px',
              fontWeight: 600,
              fontSize: '15px',
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
          {/* Hard navigation is intentional here — a full reload cleanly resets a crashed app. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a
            href="/"
            style={{
              padding: '12px 26px',
              borderRadius: '999px',
              fontWeight: 600,
              fontSize: '15px',
              color: '#4f46e5',
              border: '1px solid #cfe6df',
              textDecoration: 'none',
            }}
          >
            Back to home
          </a>
        </div>
      </body>
    </html>
  )
}
