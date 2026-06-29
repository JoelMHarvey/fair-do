// Faresay onboarding film — composes the scenes on the timeline.
const { Stage, Sprite, useSprite, Easing, interpolate, clamp } = window
const F = window.Faresay
const { C, SERIF, SANS, typed, Logo, Lotus, Browser, Cursor, Stepper, Field, Btn, Screen, OptsCtx, useOpts, SX, SY, SW, SH } = F

// ── Target measurement ──────────────────────────────────────────────────────
// Each interactive box registers its element; the cursor (which lives INSIDE the
// same screen container) reads each target's centre via offsetLeft/Top walking —
// pure layout pixels, immune to the Stage's scale transform. No hand-tuned px.
function useTargets() {
  const innerRef = React.useRef(null)
  const store = React.useRef({})
  const [, force] = React.useReducer((x) => x + 1, 0)
  React.useLayoutEffect(() => { force() }, [])
  const reg = (name) => (el) => { if (el) store.current[name] = el }
  return { innerRef, reg, store }
}

// Centre of `el` relative to `stop` (the screen inner container), in layout px.
function centerOf(el, stop) {
  let x = el.offsetWidth / 2, y = el.offsetHeight / 2, n = el
  while (n && n !== stop) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent }
  return { x, y }
}

// Resolve keyframes [[t, target, press?]…] where target is a registered name
// or a literal [x, y] (screen-local). The cursor tip is nudged onto the centre.
const TIP_X = 3, TIP_Y = 2
function resolveCursor(lt, kfs, store, innerRef) {
  const stop = innerRef.current
  const pts = kfs.map((k) => {
    let c
    if (typeof k[1] === 'string') {
      const el = store.current[k[1]]
      c = (el && stop) ? centerOf(el, stop) : { x: SW / 2, y: SH / 2 }
    } else c = { x: k[1][0], y: k[1][1] }
    return [k[0], c.x, c.y, k[2] || 0]
  })
  const ts = pts.map((p) => p[0])
  const x = interpolate(ts, pts.map((p) => p[1]), Easing.easeInOutCubic)(lt) - TIP_X
  const y = interpolate(ts, pts.map((p) => p[2]), Easing.easeInOutCubic)(lt) - TIP_Y
  const pressed = interpolate(ts, pts.map((p) => p[3]))(lt) > 0.5
  return { x, y, pressed }
}
const blink = (lt) => (Math.floor(lt * 2) % 2 === 0)

// ── Caption (lower-third, calm) ──
function Caption({ text }) {
  const { localTime, duration } = useSprite()
  const o = useOpts()
  if (!o.captions) return null
  const op = clamp(Math.min(localTime / 0.4, (duration - localTime) / 0.4), 0, 1)
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 38, display: 'flex', justifyContent: 'center', opacity: op }}>
      <div style={{ fontFamily: SANS, fontSize: 16, color: C.sand600, background: 'rgba(255,255,255,0.7)', padding: '8px 20px', borderRadius: 999, border: `1px solid ${C.sand200}` }}>{text}</div>
    </div>
  )
}

// ═══ SCENE A — Sign up (0–5) ═══
function SceneSignUp() {
  const { localTime: lt } = useSprite()
  const { reg, store, innerRef } = useTargets()
  const emailP = clamp((lt - 0.8) / 1.4, 0, 1)
  const focusEmail = lt > 0.55 && lt < 2.5
  const cur = resolveCursor(lt, [
    [0, [760, 470]], [0.7, 'email'], [2.6, 'email'],
    [3.1, 'continue'], [3.35, 'continue', 1], [3.5, 'continue'], [5, 'continue'],
  ], store, innerRef)
  return (
    <>
      <Screen innerRef={innerRef} bg={`linear-gradient(to bottom, ${C.brand50}, ${C.sand50} 60%)`}>
        <div style={{ position: 'absolute', left: 250, top: 36, width: 440, padding: 40, boxSizing: 'border-box', background: C.white, borderRadius: 24, border: `1px solid ${C.sand200}`, boxShadow: '0 12px 28px rgba(46,41,32,0.08)', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}><Lotus size={92} bloom={1} /></div>
          <div style={{ fontFamily: SERIF, fontSize: 30, fontWeight: 600, color: C.brand900, letterSpacing: '-0.02em', marginBottom: 6 }}>Create your practice</div>
          <div style={{ fontFamily: SANS, fontSize: 14.5, color: C.sand600, marginBottom: 26 }}>Free to start · set up in ~15 minutes</div>
          <div style={{ textAlign: 'left' }}>
            <Field label="Work email" value={typed('maya@chentherapy.co.uk', emailP)} caret={focusEmail && blink(lt)} focus={focusEmail} boxRef={reg('email')} />
          </div>
          <div style={{ marginTop: 18 }}><Btn label="Continue" w="100%" boxRef={reg('continue')} press={cur.pressed && lt > 3.2 && lt < 3.6 ? 1 : 0} /></div>
        </div>
        <Cursor {...cur} />
      </Screen>
    </>
  )
}

// ═══ SCENE B — Profile (5–11.5) ═══
const CHIPS = ['Anxiety', 'CBT', 'Trauma', 'Burnout', 'EMDR']
function SceneProfile() {
  const { localTime: lt } = useSprite()
  const { reg, store, innerRef } = useTargets()
  const nameP = clamp((lt - 0.5) / 1.1, 0, 1)
  const showBacp = lt > 2.4
  const rateP = clamp((lt - 2.7) / 0.7, 0, 1)
  const chipOn = (i) => (i === 0 && lt > 3.9) || (i === 1 && lt > 4.7)
  const cur = resolveCursor(lt, [
    [0, [720, 120]], [0.5, 'name'], [1.7, 'name'],
    [2.0, 'reg'], [2.2, 'reg', 1], [2.4, 'reg'],
    [2.7, 'rate'], [3.5, 'rate'],
    [3.9, 'chip0'], [4.0, 'chip0', 1], [4.1, 'chip0'],
    [4.7, 'chip1'], [4.8, 'chip1', 1], [4.9, 'chip1'],
    [5.7, 'continue'], [5.9, 'continue', 1], [6.1, 'continue'], [6.5, 'continue'],
  ], store, innerRef)
  const nameFocus = lt > 0.4 && lt < 1.8
  return (
    <>
      <Screen innerRef={innerRef}>
        <div style={{ position: 'absolute', left: 40, top: 30 }}><Logo size={22} /></div>
        <div style={{ position: 'absolute', left: 40, top: 76 }}><Stepper step={1} /></div>
        <div style={{ position: 'absolute', left: 40, top: 122, fontFamily: SERIF, fontSize: 26, fontWeight: 600, color: C.brand900, letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>Tell us about your practice</div>
        <div style={{ position: 'absolute', left: 170, top: 168, width: 640, padding: 34, boxSizing: 'border-box', background: C.white, borderRadius: 22, border: `1px solid ${C.sand200}`, boxShadow: '0 8px 22px rgba(46,41,32,0.06)' }}>
          <Field label="Full name" value={typed('Dr Maya Chen', nameP)} caret={nameFocus && blink(lt)} focus={nameFocus} boxRef={reg('name')} />
          <div style={{ display: 'flex', gap: 18, marginTop: 18 }}>
            <Field label="Registration body" value={showBacp ? 'BACP' : ''} focus={lt > 1.9 && lt < 2.6} w={272} boxRef={reg('reg')} />
            <Field label="Session rate" value={rateP > 0 ? ('£' + typed('55', rateP)) : ''} focus={lt > 2.6 && lt < 3.6} w={272} boxRef={reg('rate')} />
          </div>
          <div style={{ marginTop: 20, fontFamily: SANS, fontSize: 13, fontWeight: 500, color: C.sand800, marginBottom: 9 }}>Specialisms</div>
          <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap' }}>
            {CHIPS.map((c, i) => (
              <div key={c} ref={i === 0 ? reg('chip0') : i === 1 ? reg('chip1') : undefined} style={{ fontFamily: SANS, fontSize: 13.5, padding: '7px 15px', borderRadius: 999, border: `1px solid ${chipOn(i) ? C.brand400 : C.sand300}`, background: chipOn(i) ? C.brand50 : C.white, color: chipOn(i) ? C.brand700 : C.sand600, fontWeight: chipOn(i) ? 600 : 400 }}>{chipOn(i) ? '✓ ' : ''}{c}</div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 26 }}><Btn label="Continue" boxRef={reg('continue')} press={cur.pressed && lt > 5.8 && lt < 6.2 ? 1 : 0} /></div>
        </div>
        <Cursor {...cur} />
      </Screen>
    </>
  )
}

// ═══ SCENE C — Availability (11.5–17) ═══
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
function SceneAvailability() {
  const { localTime: lt } = useSprite()
  const { reg, store, innerRef } = useTargets()
  // rows toggle on over time; cursor taps Tue + Thu
  const on = (i) => {
    const base = [true, false, true, false, true] // Mon/Wed/Fri preset on
    if (i === 1 && lt > 1.6) return true
    if (i === 3 && lt > 2.6) return true
    return base[i] && lt > 0.4 + i * 0.12
  }
  const cur = resolveCursor(lt, [
    [0, [740, 120]],
    [1.4, 'tue'], [1.55, 'tue', 1], [1.7, 'tue'],
    [2.4, 'thu'], [2.55, 'thu', 1], [2.7, 'thu'],
    [4.6, 'continue'], [4.8, 'continue', 1], [5.0, 'continue'], [5.5, 'continue'],
  ], store, innerRef)
  return (
    <>
      <Screen innerRef={innerRef}>
        <div style={{ position: 'absolute', left: 40, top: 30 }}><Logo size={22} /></div>
        <div style={{ position: 'absolute', left: 40, top: 76 }}><Stepper step={2} /></div>
        <div style={{ position: 'absolute', left: 40, top: 122, fontFamily: SERIF, fontSize: 26, fontWeight: 600, color: C.brand900, letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>When are you available?</div>
        <div style={{ position: 'absolute', left: 40, top: 158, fontFamily: SANS, fontSize: 14, color: C.sand600 }}>Toggle your days. Set hours per day — all times Europe/London.</div>
        <div style={{ position: 'absolute', left: 170, top: 196, width: 640, background: C.white, borderRadius: 22, border: `1px solid ${C.sand200}`, boxShadow: '0 8px 22px rgba(46,41,32,0.06)', overflow: 'hidden' }}>
          {DAYS.map((d, i) => {
            const active = on(i)
            return (
              <div key={d} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 26px', borderTop: i ? `1px solid ${C.sand100}` : 'none', background: active ? C.brand50 + '88' : C.white }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div ref={i === 1 ? reg('tue') : i === 3 ? reg('thu') : undefined} style={{ width: 40, height: 23, borderRadius: 999, background: active ? C.brand600 : C.sand300, position: 'relative', transition: 'none' }}>
                    <div style={{ position: 'absolute', top: 2.5, left: active ? 20 : 2.5, width: 18, height: 18, borderRadius: '50%', background: C.white, boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }} />
                  </div>
                  <span style={{ fontFamily: SANS, fontSize: 15, fontWeight: 500, color: active ? C.sand900 : C.sand400 }}>{d}</span>
                </div>
                <span style={{ fontFamily: SANS, fontSize: 14, color: active ? C.sand700 : C.sand400, whiteSpace: 'nowrap' }}>{active ? '09:00 – 17:00' : 'Unavailable'}</span>
              </div>
            )
          })}
        </div>
        <div style={{ position: 'absolute', left: 660, top: 486 }}><Btn label="Continue" boxRef={reg('continue')} press={cur.pressed && lt > 4.7 && lt < 5.1 ? 1 : 0} /></div>
        <Cursor {...cur} />
      </Screen>
    </>
  )
}

// ═══ SCENE D — Payments (17–22.5) ═══
function ScenePayments() {
  const { localTime: lt } = useSprite()
  const { reg, store, innerRef } = useTargets()
  const connecting = lt > 1.4 && lt < 2.8
  const done = lt >= 2.8
  const cur = resolveCursor(lt, [
    [0, [740, 130]], [1.05, 'connect'], [1.3, 'connect', 1], [1.5, 'connect'], [2.8, 'connect'],
    [4.4, 'continue'], [4.6, 'continue', 1], [4.8, 'continue'], [5.5, 'continue'],
  ], store, innerRef)
  return (
    <>
      <Screen innerRef={innerRef}>
        <div style={{ position: 'absolute', left: 40, top: 30 }}><Logo size={22} /></div>
        <div style={{ position: 'absolute', left: 40, top: 76 }}><Stepper step={3} /></div>
        <div style={{ position: 'absolute', left: 40, top: 122, fontFamily: SERIF, fontSize: 26, fontWeight: 600, color: C.brand900, letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>Get paid automatically</div>
        <div style={{ position: 'absolute', left: 230, top: 186, width: 520, padding: 34, boxSizing: 'border-box', background: C.white, borderRadius: 22, border: `1px solid ${C.sand200}`, boxShadow: '0 8px 22px rgba(46,41,32,0.06)', textAlign: 'center' }}>
          <div style={{ fontSize: 30, marginBottom: 10 }}>{done ? '🌿' : '💷'}</div>
          <div style={{ fontFamily: SERIF, fontSize: 21, fontWeight: 600, color: C.brand900, marginBottom: 6 }}>{done ? 'Payouts ready' : 'Connect payouts'}</div>
          <div style={{ fontFamily: SANS, fontSize: 14, color: C.sand600, lineHeight: 1.6, marginBottom: 22, maxWidth: 380, marginLeft: 'auto', marginRight: 'auto' }}>
            {done ? 'Money lands in your bank about two business days after each session. No chasing, no spreadsheets.' : 'Securely link your bank through Stripe. Your clients pay by card; you keep what you charge.'}
          </div>
          {done ? (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: SANS, fontSize: 14, fontWeight: 600, color: C.brand700, background: C.brand50, border: `1px solid ${C.brand200}`, padding: '9px 18px', borderRadius: 999 }}>✓ Bank account connected</div>
          ) : connecting ? (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontFamily: SANS, fontSize: 14, color: C.sand600, padding: '9px 18px' }}>
              <span style={{ width: 16, height: 16, borderRadius: '50%', border: `2.5px solid ${C.sand200}`, borderTopColor: C.brand600, display: 'inline-block', transform: `rotate(${lt * 720}deg)` }} /> Connecting securely…
            </div>
          ) : (
            <Btn label="Connect with Stripe" boxRef={reg('connect')} press={cur.pressed && lt > 1.2 && lt < 1.6 ? 1 : 0} />
          )}
        </div>
        <div style={{ position: 'absolute', left: 660, top: 460 }}><Btn label="Continue" ghost={!done} boxRef={reg('continue')} press={cur.pressed && lt > 4.5 && lt < 4.9 ? 1 : 0} /></div>
        <Cursor {...cur} />
      </Screen>
    </>
  )
}

// ═══ SCENE E — Done (22.5–28.5) ═══
function SceneDone() {
  const { localTime: lt } = useSprite()
  const bloom = clamp((lt - 0.2) / 1.2, 0, 1)
  const titleOp = clamp((lt - 0.9) / 0.6, 0, 1)
  const dashY = F.lerp(40, 0, clamp((lt - 1.8) / 0.8, 0, 1))
  const dashOp = clamp((lt - 1.8) / 0.8, 0, 1)
  return (
    <Screen bg={`linear-gradient(to bottom, ${C.sand50}, ${C.brand50})`}>
      <div style={{ position: 'absolute', left: 40, top: 36 }}><Stepper step={5} /></div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 86, textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}><Lotus size={110} bloom={bloom} /></div>
        <div style={{ opacity: titleOp, marginTop: 6 }}>
          <div style={{ fontFamily: SERIF, fontSize: 34, fontWeight: 600, color: C.brand900, letterSpacing: '-0.02em' }}>You're all set, Maya</div>
          <div style={{ fontFamily: SANS, fontSize: 16, color: C.sand600, marginTop: 8 }}>Your practice is ready. Add your first client whenever you like.</div>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 200, right: 200, top: 320, opacity: dashOp, transform: `translateY(${dashY}px)` }}>
        <div style={{ background: C.white, borderRadius: 18, border: `1px solid ${C.sand200}`, boxShadow: '0 12px 28px rgba(46,41,32,0.10)', padding: 22, display: 'flex', gap: 14 }}>
          {[['Clients', '0'], ['This week', '£0'], ['Sessions', '0']].map(([l, v]) => (
            <div key={l} style={{ flex: 1, textAlign: 'center', padding: '10px 0', background: C.sand50, borderRadius: 12, border: `1px solid ${C.sand200}` }}>
              <div style={{ fontFamily: SANS, fontSize: 12, color: C.sand500 }}>{l}</div>
              <div style={{ fontFamily: SERIF, fontSize: 28, fontWeight: 600, color: C.brand700 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
    </Screen>
  )
}

// ═══ MOVIE ═══
function Movie({ opts }) {
  const o = { captions: true, pointer: true, pointerSize: 26, ripple: true, ...(opts || {}) }
  return (
    <OptsCtx.Provider value={o}>
      <Stage width={1280} height={720} duration={28.5} background={C.sand100}>
        <Browser url="faresay.com/sign-up" />
        <Sprite start={0} end={5}><SceneSignUp /></Sprite>
        <Sprite start={0} end={5}><Caption text="Maya starts her practice — one email to begin." /></Sprite>
        <Sprite start={5} end={11.5}><SceneProfile /></Sprite>
        <Sprite start={5} end={11.5}><Caption text="Step 1 — her details, rate and specialisms." /></Sprite>
        <Sprite start={11.5} end={17}><SceneAvailability /></Sprite>
        <Sprite start={11.5} end={17}><Caption text="Step 2 — the days she works." /></Sprite>
        <Sprite start={17} end={22.5}><ScenePayments /></Sprite>
        <Sprite start={17} end={22.5}><Caption text="Step 3 — connect payouts, once." /></Sprite>
        <Sprite start={22.5} end={28.5}><SceneDone /></Sprite>
      </Stage>
    </OptsCtx.Provider>
  )
}

window.Movie = Movie
