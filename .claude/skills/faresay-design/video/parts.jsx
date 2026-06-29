// Faresay onboarding film — "Maya sets up her practice".
// A calm, on-brand walkthrough of a therapist's first-time setup.
// Built on the animations.jsx timeline engine (globals on window).
const { Stage, Sprite, useTime, useSprite, Easing, interpolate, clamp } = window

// ── Brand tokens (literals so the film is self-contained & export-safe) ──
const C = {
  brand50: '#f0faf7', brand100: '#d7f0e8', brand200: '#b0e1d3', brand400: '#4fad99',
  brand500: '#2f9180', brand600: '#217567', brand700: '#1d5d53', brand900: '#193e39',
  sand50: '#faf8f5', sand100: '#f3efe8', sand200: '#e8e1d5', sand300: '#d6cab7',
  sand400: '#b8a78e', sand500: '#9c8870', sand600: '#80705c', sand800: '#4a4137', sand900: '#2e2920',
  coral500: '#e1542f', coral50: '#fef4f0', coral200: '#fac7b3', coral600: '#c93f1f',
  amber50: '#fffbeb', amber700: '#b45309', white: '#ffffff',
}
const SERIF = "'Fraunces', Georgia, serif"
const SANS = "'Inter', system-ui, sans-serif"

// ── Small helpers ──
const lerp = (a, b, t) => a + (b - a) * t
const typed = (full, p) => full.slice(0, Math.round(full.length * clamp(p, 0, 1)))

// ── Logo ──
function Logo({ size = 26, tone = 'dark', word = true }) {
  const light = tone === 'light'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <svg viewBox="0 0 28 28" width={size} height={size}>
        <circle cx="14" cy="14" r="14" fill={light ? C.white : C.brand600} />
        <path d="M9 18c0-3 2-5 5-5s5 2 5 5M9.5 11.5c.8-1.2 2.3-2 4.5-2s3.7.8 4.5 2"
          fill="none" stroke={light ? C.brand600 : C.white} strokeWidth="1.8" strokeLinecap="round" />
      </svg>
      {word && <span style={{ fontFamily: SERIF, fontWeight: 600, fontSize: size * 0.74, letterSpacing: '-0.02em', color: light ? C.white : C.brand900 }}>faresay</span>}
    </div>
  )
}

// ── Lotus (static SVG; scale animated via timeline) ──
function Lotus({ size = 120, bloom = 1 }) {
  const s = lerp(0.7, 1, clamp(bloom, 0, 1))
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" style={{ transform: `scale(${s})`, transformOrigin: '50% 75%', filter: 'drop-shadow(0 14px 30px rgba(33,117,103,0.20))' }}>
      <defs>
        <radialGradient id="flH" cx="50%" cy="55%" r="55%"><stop offset="0%" stopColor="#7fc4b8" stopOpacity="0.9" /><stop offset="100%" stopColor="#7fc4b8" stopOpacity="0" /></radialGradient>
        <linearGradient id="flP" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2f9183" /><stop offset="100%" stopColor="#217567" /></linearGradient>
        <linearGradient id="flL" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#57b3a4" /><stop offset="100%" stopColor="#2f9183" /></linearGradient>
      </defs>
      <circle cx="100" cy="118" r="78" fill="url(#flH)" opacity={lerp(0.2, 0.55, clamp(bloom, 0, 1))} />
      <g fill="url(#flP)">
        {[-58, 58, -34, 34].map((r, i) => <path key={i} d="M100 150 C76 132 70 86 100 40 C130 86 124 132 100 150 Z" style={{ transformBox: 'fill-box', transformOrigin: '50% 100%', transform: `rotate(${r * lerp(1, 1, 1)}deg)` }} />)}
      </g>
      <g fill="url(#flL)">
        {[-20, 20].map((r, i) => <path key={i} d="M100 150 C80 134 76 96 100 56 C124 96 120 134 100 150 Z" style={{ transformBox: 'fill-box', transformOrigin: '50% 100%', transform: `rotate(${r}deg)` }} />)}
      </g>
      <g fill="#bfe6df">
        {[-8, 8, 0].map((r, i) => <path key={i} d="M100 150 C86 138 84 108 100 74 C116 108 114 138 100 150 Z" style={{ transformBox: 'fill-box', transformOrigin: '50% 100%', transform: `rotate(${r}deg)` }} />)}
      </g>
    </svg>
  )
}

// ── Browser chrome (fixed frame for the whole film) ──
const BX = 150, BY = 64, BW = 980, BH = 588, BAR = 46
const SX = BX, SY = BY + BAR, SW = BW, SH = BH - BAR

function Browser({ url }) {
  return (
    <div style={{ position: 'absolute', left: BX, top: BY, width: BW, height: BH, borderRadius: 18, background: C.white, boxShadow: '0 30px 70px rgba(46,41,32,0.20), 0 6px 16px rgba(46,41,32,0.08)', overflow: 'hidden', border: `1px solid ${C.sand200}` }}>
      <div style={{ height: BAR, background: C.sand100, borderBottom: `1px solid ${C.sand200}`, display: 'flex', alignItems: 'center', padding: '0 16px', gap: 8 }}>
        <div style={{ display: 'flex', gap: 7 }}>
          <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#e9756b' }} />
          <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#f0c150' }} />
          <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#7bc47f' }} />
        </div>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <div style={{ background: C.white, border: `1px solid ${C.sand200}`, borderRadius: 999, padding: '5px 18px', fontFamily: SANS, fontSize: 12.5, color: C.sand500, display: 'flex', alignItems: 'center', gap: 7, minWidth: 280, justifyContent: 'center' }}>
            <span style={{ color: C.brand500, fontSize: 11 }}>🔒</span>{url}
          </div>
        </div>
        <div style={{ width: 52 }} />
      </div>
    </div>
  )
}

// ── Options context (driven by the Tweaks panel) ──
const OptsCtx = React.createContext({ captions: true, pointer: true, pointerSize: 26, ripple: true })
const useOpts = () => React.useContext(OptsCtx)

// ── Cursor — points its tip at (x, y). Honours the Tweaks panel. ──
function Cursor({ x, y, pressed }) {
  const o = useOpts()
  if (!o.pointer) return null
  const sz = o.pointerSize || 26
  return (
    <div style={{ position: 'absolute', left: x, top: y, zIndex: 50, pointerEvents: 'none' }}>
      {o.ripple && pressed && (
        <span style={{ position: 'absolute', left: sz * 0.18, top: sz * 0.10, width: sz * 1.5, height: sz * 1.5, marginLeft: -sz * 0.75, marginTop: -sz * 0.75, borderRadius: '50%', border: `2px solid ${C.brand500}`, opacity: 0.55, transform: 'scale(1.15)' }} />
      )}
      <div style={{ transform: `scale(${(pressed ? 0.82 : 1) * (sz / 26)})`, transformOrigin: 'top left', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.25))' }}>
        <svg width="26" height="26" viewBox="0 0 24 24"><path d="M4 2 L4 19 L9 14.5 L12 21 L15 19.5 L12 13 L19 13 Z" fill={C.white} stroke={C.sand900} strokeWidth="1.4" strokeLinejoin="round" /></svg>
      </div>
    </div>
  )
}

// ── Reusable screen primitives ──
function Stepper({ step }) {
  const labels = ['Profile', 'Availability', 'Payments', 'Done']
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 26 }}>
      {labels.map((l, i) => {
        const active = i + 1 === step, done = i + 1 < step
        return (
          <React.Fragment key={l}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: done ? C.brand600 : active ? C.brand600 : C.sand200, color: done || active ? C.white : C.sand500, fontFamily: SANS, fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{done ? '✓' : i + 1}</div>
              <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: active ? 600 : 500, color: active ? C.brand700 : done ? C.sand600 : C.sand400 }}>{l}</span>
            </div>
            {i < labels.length - 1 && <div style={{ width: 26, height: 2, background: done ? C.brand400 : C.sand200, borderRadius: 2 }} />}
          </React.Fragment>
        )
      })}
    </div>
  )
}

function Field({ label, value, caret, w = '100%', focus, boxRef }) {
  return (
    <div style={{ width: w }}>
      <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 500, color: C.sand800, marginBottom: 7 }}>{label}</div>
      <div ref={boxRef} style={{ height: 46, border: `1.5px solid ${focus ? C.brand600 : C.sand300}`, boxShadow: focus ? `0 0 0 3px ${C.brand50}` : 'none', borderRadius: 11, background: C.white, display: 'flex', alignItems: 'center', padding: '0 14px', fontFamily: SANS, fontSize: 15, color: value ? C.sand900 : C.sand400 }}>
        {value || ''}{caret && <span style={{ width: 1.5, height: 20, background: C.brand600, marginLeft: 1 }} />}
      </div>
    </div>
  )
}

function Btn({ label, w, press = 0, ghost, boxRef }) {
  return (
    <div ref={boxRef} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: 46, padding: '0 26px', width: w, borderRadius: 999, fontFamily: SANS, fontSize: 15, fontWeight: 500,
      background: ghost ? C.white : C.brand600, color: ghost ? C.brand700 : C.white, border: ghost ? `1px solid ${C.sand300}` : '1px solid transparent',
      boxShadow: ghost ? 'none' : '0 10px 22px rgba(33,117,103,0.22)', transform: `scale(${1 - press * 0.05})` }}>{label}</div>
  )
}

// ── Screen wrapper: fades content in/out within its Sprite window ──
function Screen({ children, pad = 52, bg = C.sand50, outerRef, innerRef }) {
  const { localTime, duration } = useSprite()
  const op = clamp(Math.min(localTime / 0.45, (duration - localTime) / 0.4), 0, 1)
  return (
    <div ref={outerRef} style={{ position: 'absolute', left: SX, top: SY, width: SW, height: SH, background: bg, opacity: op, overflow: 'hidden' }}>
      <div ref={innerRef} style={{ position: 'absolute', inset: 0, padding: pad, boxSizing: 'border-box' }}>{children}</div>
    </div>
  )
}

window.Faresay = { C, SERIF, SANS, lerp, typed, Logo, Lotus, Browser, Cursor, Stepper, Field, Btn, Screen, OptsCtx, useOpts, BX, BY, BW, BH, BAR, SX, SY, SW, SH }
