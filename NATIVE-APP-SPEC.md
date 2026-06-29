# Faresay — Native Mobile App: Build Specification

**Status:** M0–M3 complete, M4 in progress · **Owner:** Joel Harvey · **Last updated:** 2026-06-27
**Backend it targets:** the existing Faresay web app (Next.js 16, Prisma 6 / Neon Postgres, Clerk, Stripe Connect, Daily.co)

---

## Current status (2026-06-27)

### Done ✓

**M0 — Foundations**
- Expo SDK 52 app scaffolded in `native/` (Expo Router v4, TypeScript strict, `@clerk/clerk-expo`, React Query v5, Zod DTOs)
- Clerk sign-in screen with SecureStore token cache
- 5-tab shell: Home, Clients, Calendar, Messages, More
- Backend: `/api/mobile/v1/dashboard`, `/api/mobile/v1/clients`

**M1 — Core practice**
- Backend: client detail, calendar, availability (GET+PUT), earnings, profile endpoints
- Native screens: client detail with booking modal (`DateTimePicker`), calendar/availability tabs, earnings, profile (read-only with "Edit on Faresay →" web link), More menu

**M2 — Sessions & comms**
- Session join screen (Daily Prebuilt via `expo-web-browser`, full-screen)
- Message thread list + full chat UI (bubbles, day separators, send, marks-read on open)
- Push notifications: `NativeDevice` Prisma model, Expo Push Service, `POST /api/push/device` registration, `push.ts` extended to fan-out to both web-push and Expo push
- Backend: session room token endpoint (`/api/mobile/v1/sessions/[id]/room`), message thread endpoints

**M3 — Compliance & polish**
- Biometric lock (`expo-local-authentication`): cold start + re-lock after 30s in background
- Clinical React Query cache (`client*` keys) cleared on background (UK GDPR Art. 9)
- Sentry with `beforeSend` PII scrub (email, phone, card, clinical keywords); stores opaque Clerk ID only
- `OfflineBanner` via NetInfo with animated fade
- Settings screen: biometric toggle, push notification status, sign-out with confirmation
- `ErrorBoundary` with Sentry capture in prod
- iOS privacy manifest in `app.json` (`NSPrivacyTracking: false` + required API reason codes)
- Accessibility: `accessibilityRole` + `accessibilityLabel` on all interactive elements

**EAS setup**
- `eas-cli` installed, project created at expo.dev/accounts/faresay-ltd/projects/faresay
- `eas.json` with development / preview / production profiles
- `app.json`: `owner: faresay-ltd`, EAS project UUID `34038bcf-c8bb-43f4-b996-ff2801540142`
- Sentry: DSN set as EAS secret (`EXPO_PUBLIC_SENTRY_DSN`), org `faresay-ltd`, project `apple-ios` wired into Expo plugin
- `NativeDevice` Prisma model pushed to production Neon DB ✓

### Blocked — waiting (ETA ~5 days)

| Blocker | Needed for |
|---|---|
| Apple Developer account | `eas build --platform ios`, TestFlight, App Store |
| Google Play account | `eas build --platform android`, Play Store |
| `SENTRY_AUTH_TOKEN` EAS secret | Source map uploads on every build |
| Brand assets: `icon.png`, `splash.png`, `assets/notification-icon.png` (1024×1024 PNG) | Builds will fail without real assets |
| `ascAppId` + `appleTeamId` in `eas.json` `submit.production.ios` | `eas submit` to TestFlight |
| Google service account JSON → `./google-service-account.json` | `eas submit` to Play Store |

### M4 — Beta → launch (next steps, in order)

1. **Add `SENTRY_AUTH_TOKEN` EAS secret**
   ```
   eas secret:create --scope project --name SENTRY_AUTH_TOKEN --value "sntrys_..."
   ```
2. **Brand assets** — drop 1024×1024 PNG into `native/assets/` as `icon.png`, `splash.png`, `notification-icon.png`
3. **First preview build** (no Apple/Google accounts needed — builds on EAS cloud)
   ```
   cd native
   eas build --platform ios --profile preview
   ```
4. **TestFlight** (needs Apple account)
   - Fill `ascAppId` + `appleTeamId` in `eas.json`
   - `eas submit --platform ios --profile production`
5. **Beta with real therapists** — recruit, gather feedback, fix
6. **App Store submission** — screenshots, metadata, review

### Open questions (§17 from original spec)

- §17.3: Is there a staging environment with separate Clerk/Stripe test/Daily keys for beta testers?
- §17.5: Clinical-data-on-device policy → resolved: **memory-only** (cache cleared on background) ✓
- §17.6: Who owns Apple/Google developer accounts and handles App Store legal counsel?

---

## 1. Summary

Faresay is a UK practice-management product therapists subscribe to: they manage their own clients, take secure video sessions, get paid, and stay compliant. The web app exists and is live. This spec is for a **native mobile app** that lets a **therapist run their practice from a phone** — the core brand promise ("run it from a phone").

The app is a **client of the existing backend.** No new database, no new auth provider, no new payment processor. The major backend workstream is a **new JSON read API** (see §11), because today most read-screens are rendered server-side (React Server Components reading Prisma directly) and are not consumable by a native client.

---

## 2. Decisions required before kickoff

| # | Decision | Recommendation | Why it matters |
|---|----------|----------------|----------------|
| D1 | **Who is the app for first** | **Therapist (practitioner) app first.** Clients stay on mobile web / PWA for now; native client app is Phase 2. | Scopes everything below. Brand pitch is therapist-from-phone. |
| D2 | **Framework** | **React Native + Expo** (one codebase → iOS + Android). | Clerk, Stripe, and Daily all ship RN SDKs. One team, fastest path. Native Swift/Kotlin is the alternative if a fully-native feel is required — roughly 2× build cost. |
| D3 | **Therapist subscription billing in-app** | **Keep subscription purchase on web** (manage plan on faresay.com); do not sell the Faresay subscription through in-app purchase. | Apple/Google take 15–30% on in-app *digital* subscriptions. Selling on web avoids it. See §10. |
| D4 | **Client→therapist session payments** | **Stripe** (real-world service exemption). | Therapy is a real-world service (like Uber/ClassPass), exempt from Apple/Google IAP. Stripe stays. See §10. |

D1 and D2 are assumed below (therapist app, Expo). Flag now if either is wrong — they change scope materially.

---

## 3. Recommended stack

- **App:** React Native via **Expo** (managed workflow + dev client for native modules).
- **Auth:** `@clerk/clerk-expo` (the backend already uses Clerk v7).
- **Video:** `@daily-co/react-native-daily-js` (+ required WebRTC native deps; needs an Expo dev/config plugin).
- **Payments shown in-app:** `@stripe/stripe-react-native` for the therapist's Connect onboarding + any in-app payment surfaces that are permissible; otherwise Stripe Checkout via in-app browser.
- **Push:** `expo-notifications` → APNs (iOS) + FCM (Android). (Existing `web-push` is browser-only — see §12.)
- **Networking:** typed client (e.g. `@tanstack/react-query` + `zod`-validated DTOs) against the new `/api/mobile/v1/*` layer.
- **Secure storage:** `expo-secure-store` (Keychain / Keystore) for tokens; **never** persist client clinical data to disk unencrypted (see §13).

---

## 4. Architecture

```
┌──────────────────────────┐         ┌───────────────────────────────────────┐
│  Native app (Expo RN)    │  HTTPS  │  Existing Faresay backend (Next.js 16) │
│  - Clerk Expo (auth)     │ Bearer  │  - Clerk session verification           │
│  - React Query data      │────────▶│  - NEW /api/mobile/v1/* read API        │
│  - Daily RN (video)      │         │  - existing mutation routes (booking,   │
│  - Stripe RN (pay/onbrd) │         │    messages, session cancel/complete…)  │
│  - Expo push (APNs/FCM)  │         │  - Prisma 6 ─▶ Neon Postgres            │
└──────────────────────────┘         │  - Stripe Connect · Daily · Resend · …  │
        │                            └───────────────────────────────────────┘
        │  device token                         │ webhooks
        └───────────────▶ /api/push/device ◀────┘  (Stripe, Clerk, Daily unchanged)
```

The app talks **only** to the Faresay backend (no direct DB/Stripe/Daily access from the device, except Daily's media SDK joining a room with a backend-issued token).

---

## 5. MVP scope (Therapist app — Phase 1)

Mirror the existing web therapist surface (`/therapist/*`):

1. **Sign in / onboarding** — Clerk; resume Stripe Connect onboarding if incomplete.
2. **Dashboard** — today's sessions, upcoming, earnings snapshot, alerts (credential expiry, no-shows).
3. **Calendar / availability** — view sessions; set availability windows (timezone-aware — see §14 note).
4. **Clients** — list, client detail (notes, documents, outcome scores, forms), add a managed client.
5. **Book a session for a client** — therapist-initiated booking (online-pay or in-person), the active paid path.
6. **Run the session** — join the Daily video room from the phone; in-call access to client notes/docs.
7. **Messages** — secure threads with clients.
8. **Earnings** — payouts, commission, session history.
9. **Profile** — public listing fields, rates, credentials.
10. **Notifications** — push for new bookings, reminders, messages, payouts.

## 6. Out of scope (Phase 2+)

- Native **client** app (clients use mobile web / PWA for booking + attending).
- Group sessions UI, supervision logs, broadcast, org/corporate dashboards, gift vouchers — keep on web initially.
- In-app purchase of the Faresay subscription (web-only by decision D3).

---

## 7. Screen map (Phase 1)

```
Auth ─ Sign in ─ (Stripe onboarding resume)
Tabs:
  Home/Dashboard ─ session detail ─ join call (Daily)
  Calendar ─ availability editor
  Clients ─ client detail ─ notes/docs/outcomes/forms ─ book session
  Messages ─ thread
  More ─ Earnings · Profile · Settings (biometric lock, notifications) · Manage plan (opens web)
```

---

## 8. Authentication

- App uses **Clerk Expo** for sign-in/up and session management.
- Each backend request sends the Clerk session token as `Authorization: Bearer <token>`.
- Backend already verifies Clerk; confirm `src/proxy.ts` middleware + `auth()` accept the bearer header on `/api/mobile/v1/*` (a `src/lib/bearer.ts` helper already exists — confirm whether it covers Clerk mobile tokens or needs extension).
- **No passwords or secrets are entered into or stored by anything but Clerk's SDK.** Tokens live in `expo-secure-store`.
- Add a **biometric app-lock** (Face ID / fingerprint) gate on launch given the sensitivity of the data (§13).

---

## 9. Video (Daily.co)

- Backend already issues identified meeting tokens (`src/lib/daily.ts` → `createMeetingToken`, used in `src/app/session/[id]/page.tsx`).
- Native flow: app requests the session's room + a fresh meeting token from `/api/mobile/v1/sessions/{id}/room` (new, wraps existing logic, enforces the same 10-minute-before access window and therapist/client identity), then joins with `@daily-co/react-native-daily-js`.
- Requires camera/mic permissions, background-audio handling, and the Daily Expo config plugin. Test on physical devices early (WebRTC + simulators are unreliable).

---

## 10. Payments & App Store policy (read before building)

- **Client→therapist session payments = real-world service** (therapy delivered by a person). This is **exempt** from Apple/Google in-app-purchase rules — Stripe is allowed. Treat like Uber/ClassPass.
- **Therapist subscription to Faresay = digital subscription.** If sold inside the app, Apple/Google may demand IAP (15–30%). **Decision D3: sell it on web only.** In-app, show plan status and a "Manage your plan" action that opens faresay.com in an in-app browser. Confirm current platform rules on external-purchase links at build time (they have shifted post-2024) with the team's app-store counsel.
- Stripe Connect **onboarding** can run in-app via the Stripe RN SDK or a hosted onboarding link in an in-app browser.
- **No card numbers, bank details, or government IDs are entered into custom UI** — always Stripe-hosted/SDK fields.

---

## 11. Backend workstream — the new Mobile API (largest backend task)

The web app renders most read-screens with **React Server Components reading Prisma directly**; the existing `/api/*` routes are mostly **mutations + webhooks + cron**. The app therefore needs a **new versioned read API**, `/api/mobile/v1/*`, returning typed JSON DTOs, bearer-authed, scoped to the signed-in therapist (enforce ownership on every row — the processor/controller model depends on it).

**New read endpoints to build (DTOs to be specified with the team):**
- `GET /dashboard` — today/upcoming sessions, earnings snapshot, alerts.
- `GET /calendar?from&to` · `GET /availability` · `PUT /availability`.
- `GET /clients` · `GET /clients/{matchId}` (notes, documents, outcomes, forms).
- `GET /sessions/{id}` · `GET /sessions/{id}/room` (room + meeting token, access-window enforced).
- `GET /messages/threads` · `GET /messages/threads/{id}`.
- `GET /earnings` (payouts, commission, history).
- `GET /profile`.

**Existing mutation endpoints the app reuses (verify auth + shape):**
`/api/practice/booking`, `/api/practice/clients*`, `/api/practice/clients/[matchId]/{documents,forms,outcomes}`, `/api/messages/send`, `/api/session/[id]/cancel`, `/api/session/[id]/complete`, `/api/therapist/profile`, `/api/onboarding/*`, `/api/review`.

**New supporting endpoints:**
- `POST /api/push/device` + `DELETE` — register/unregister an APNs/FCM device token (parallel to the existing web-push `PushSubscription`; see §12).

**Data model touchpoints (Prisma):** `Therapist, User, Client, Match, Session, SessionParticipant, Message, MessageThread, Payment, Subscription, Availability, ClientDocument, ClientForm, OutcomeScore, Review, PushSubscription`. No schema changes expected beyond a device-token store for native push.

---

## 12. Push notifications

- Existing `web-push` + `PushSubscription` is **browser-only** and does not reach iOS/Android natively.
- Add: `expo-notifications` on the device → APNs (Apple) + FCM (Google); store device tokens server-side (new table or extend `PushSubscription` with a `platform`/`deviceToken`); send via APNs/FCM from the backend at the same trigger points that currently fire web-push/email (new booking, reminders, new message, payout).
- Triggers already exist in `src/lib/push.ts` and the cron jobs — extend the send path, don't reinvent the triggers.

---

## 13. Security & data protection (UK)

- **Special-category data.** Client clinical information is "special category" data under UK GDPR — highest protection. The **therapist is the data controller; Faresay is the processor.** The app must honour this: enforce per-therapist data scoping on every endpoint, and **do not cache clinical notes/documents to disk** beyond the active session (memory-only or short-lived encrypted cache, cleared on background/lock).
- **Device security:** biometric app-lock; tokens in Keychain/Keystore; certificate pinning recommended; no clinical data in logs, crash reports, or analytics payloads.
- **Transport:** TLS only; no PII in URLs/query strings (filter UTM/analytics accordingly).
- **App Store privacy labels / data-safety form** must be completed accurately (health data collected, not sold).
- **Account deletion / data export** paths must be reachable (UK GDPR rights) — coordinate with the backend erasure flow.

---

## 14. Non-functional requirements

- **Platforms:** iOS 16+, Android 10+. Phone-first; tablet a bonus.
- **Accessibility:** WCAG 2.2 AA equivalent — dynamic type, VoiceOver/TalkBack, sufficient contrast (brand palette in the design system).
- **Offline/error states:** read screens cache-and-revalidate; mutations queue or fail loudly (never silently). Clear empty/error/loading states for every screen.
- **Performance:** cold start < 3s; session-join tap → in-room < 5s on 4G.
- **Timezone correctness:** availability + slots are timezone-sensitive (the web side has a known server-local-time validation issue on self-book — the mobile API must validate slots in the therapist's `Availability.timezone`, not device or server local time).
- **Observability:** crash reporting (Sentry or similar) with PII scrubbing; analytics via the existing Plausible-compatible scheme, no health data in events.
- **Brand:** use the Faresay design system (tokens, type: Fraunces/Inter, palette) — available as the `faresay-design` skill / design-system package.

---

## 15. Deliverables

1. Expo RN app (iOS + Android) in a repo with CI, covering §5 scope.
2. The `/api/mobile/v1/*` read API + push-device endpoints in the existing Next.js backend (delivered as PRs to the Faresay repo).
3. Typed API client + DTO schemas (zod) shared contract.
4. Test suite (unit + a small E2E happy-path: sign-in → see dashboard → join a session → message a client).
5. App Store + Play Store listings, privacy labels, and submission builds (TestFlight + internal track first).
6. A short runbook: env/config, build, release, push-cert rotation.

---

## 16. Suggested milestones

- **M0 — Foundations (2–3 wks):** Expo app skeleton, Clerk Expo auth end-to-end against staging, `/api/mobile/v1/dashboard` + clients list. Bearer-auth confirmed.
- **M1 — Core practice (3–4 wks):** clients detail, calendar/availability, therapist-initiated booking, earnings. Remaining read endpoints.
- **M2 — Sessions & comms (3–4 wks):** Daily video join, in-call client info, messages, push notifications (APNs/FCM).
- **M3 — Compliance & polish (2–3 wks):** biometric lock, data-protection hardening, accessibility, error/offline states, store privacy labels.
- **M4 — Beta → launch:** TestFlight/internal beta with real therapists, fix, submit.

(Indicative; a team sizes these against the DTO detail and their velocity.)

---

## 17. Open questions for Joel to confirm

1. **D1–D4** above (audience, framework, subscription-billing approach).
2. Is there budget/appetite for the **mobile read API** as a parallel backend workstream (it is the critical path)?
3. Staging environment + test Clerk/Stripe(test)/Daily keys available to the vendor?
4. Brand assets + design-system access for the vendor (the `faresay-design` system).
5. Which **clinical-data-on-device** policy do you want (memory-only vs short-lived encrypted cache)? Affects UX offline.
6. App-store legal: who owns Apple/Google developer accounts and app-store counsel for the external-purchase question (D3)?
```
