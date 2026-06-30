import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = "fair-do — tutoring that's fair"
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#4f46e5',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px 96px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Decorative pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(255,255,255,0.12)',
            borderRadius: 24,
            padding: '8px 20px',
            marginBottom: 40,
            width: 'fit-content',
          }}
        >
          <div
            style={{
              color: 'rgba(255,255,255,0.9)',
              fontSize: 18,
              letterSpacing: '0.5px',
            }}
          >
            fair-do.com
          </div>
        </div>

        {/* Wordmark */}
        <div
          style={{
            color: 'white',
            fontSize: 96,
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: '-3px',
            marginBottom: 24,
          }}
        >
          fair-do
        </div>

        {/* Tagline */}
        <div
          style={{
            color: 'rgba(255,255,255,0.72)',
            fontSize: 38,
            fontWeight: 400,
            lineHeight: 1.4,
          }}
        >
          The practice tool for tutors.
        </div>

        {/* Feature pills */}
        <div
          style={{
            display: 'flex',
            gap: 12,
            marginTop: 48,
          }}
        >
          {['Scheduling', 'Secure video', 'Payments'].map((label) => (
            <div
              key={label}
              style={{
                background: 'rgba(255,255,255,0.1)',
                borderRadius: 20,
                padding: '10px 22px',
                color: 'rgba(255,255,255,0.8)',
                fontSize: 22,
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  )
}
