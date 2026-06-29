# Native App Plan (Capacitor) — when the PWA isn't enough

> Faresay already ships as an **installable PWA** (Add to Home Screen → standalone app, app icon,
> web push). This doc is the plan for **true App Store / Play Store apps** — *only* worth doing once
> the design-partner pilot shows therapists want it. Don't pay this cost before then. Last updated: 26 June 2026

---

## Decide first: do you actually need native?
The PWA already covers ~90% of "a phone app". Go native **only** if the pilot surfaces a real need:
- Therapists expect to **find you in the App Store / Play Store** (trust + discovery).
- You need **reliable push on iOS** without the user first installing the PWA (Apple limits web push to installed PWAs).
- You want native niceties (biometric unlock, better background behaviour, native share).

If none of those bite, **stay PWA** — it's free and one codebase.

## The approach: Capacitor (wrap, don't rewrite)
**Capacitor** wraps the existing Next.js web app in a native shell — **no rewrite, same codebase**.
You keep shipping the web app; the native apps load it and add native APIs (push, etc.).

High-level steps (a few days of work, not weeks):
1. `npm i @capacitor/core @capacitor/cli` + `npx cap init`; add iOS + Android platforms.
2. Point Capacitor at the **hosted** app (load `https://faresay.com`) so the apps always show the
   live site — or export a static shell that boots into it. (Hosted-load is simplest for an app that's
   mostly server-rendered.)
3. Swap web push for **native push** (`@capacitor/push-notifications` → APNs on iOS, FCM on Android).
   Reuse the existing `PushSubscription` plumbing; add native token storage.
4. App icons + splash (we already have the brand mark + icon PNGs to reuse).
5. **Apple Developer account** ($99/yr) + **Google Play** ($25 one-off); set up signing.
6. Store listings (screenshots, description, privacy labels), submit, pass review.

## What's already done that carries over
- Installable manifest + brand app icons (192/512/maskable/apple-touch).
- Service worker + the **web-push** infrastructure (`PushSubscription` table, subscribe/send,
  SW handlers) — the data model and send-path are reusable; only the transport changes to APNs/FCM.
- A fully mobile-friendly therapist UI (shared nav + hamburger, guidance, install hint).

## Cost & effort (rough)
- **Money:** ~$99/yr (Apple) + $25 (Google) + ongoing store maintenance.
- **Time:** ~2–4 days to first TestFlight/internal build; review adds days–weeks of latency per release.
- **Ongoing:** every release goes through store review (vs the PWA, which updates instantly).

## Recommendation
**Ship and validate on the PWA.** Put "native app" on the backlog with a single trigger: *a design
partner says "I'd use this more if it were a real app I downloaded from the App Store."* If you hear
that from several, do the Capacitor wrap — it's cheap *because* the web app already exists. Until then,
native is cost + review latency for little gain.

## Linked documents
- `pp-validation-plan.md` (where the "do we need native?" signal comes from)
- `model-comparison.md` · `therapist-portal-pivot.md`
