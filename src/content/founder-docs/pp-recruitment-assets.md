# Practice Portal — Design-Partner Recruitment & Interview Assets

> Ready-to-use copy for running `pp-validation-plan.md`: outreach, pitch, onboarding checklist,
> check-in + exit/price-ask scripts, and a DPA skeleton. Edit the [PLACEHOLDERS] and go.
> Last updated: 26 June 2026

---

## 1. Outreach messages

**Warm (someone already in your pipeline / a referral):**
> Hi [Name] — I'm building Faresay, a simple practice tool for therapists: invite your own clients,
> set your own rates, schedule + run secure video sessions, and get paid, all in one place. I'm
> looking for a handful of founding therapists to shape it with me — free while we build, and I'll
> set you up personally. You'd keep your own clients entirely; I'm not a directory and I won't get
> between you and them. Could I show you in 15 minutes this week?

**Cold (community / LinkedIn — relationship first, never spam a group):**
> Hi [Name] — I saw your [post/practice]. I'm a [founder] building a no-nonsense practice tool for
> independent therapists (clients, scheduling, video, payments — without juggling five apps). I'm
> onboarding a few founding therapists free to shape it. No catch, no directory, you keep your
> clients. Open to a quick look?

**The one-line version (DM/intro):**
> A simple all-in-one practice tool for therapists — your clients, your rates, your calendar, secure
> video, payments. Looking for founding therapists to build it with (free). 15 min?

## 2. The 90-second pitch
- **The problem:** "Running a private practice means juggling a calendar, a payment app, a video
  tool, reminders and a spreadsheet. It's admin you didn't train for."
- **What Faresay is:** "One place to run your whole practice — invite your own clients, set a rate per
  client, schedule, meet over secure video, send reminders, take payment. Set up in under 15 minutes,
  import your client list, run a real session this week."
- **The ethos:** "Fair for therapists — we grow when you grow. We don't sit between you and your
  clients; they're yours."
- **The ask:** "I'm signing a few founding therapists to build this with me — free during the pilot,
  I onboard you personally, and you lock in founder pricing. Want in?"
- **Pre-empt 'so it's like BetterHelp?':** "Opposite — BetterHelp owns the client and rents you out.
  Here *you* own the client; Faresay is just your tools."

## 3. Onboarding checklist (the < 15-minute path)
> ⚠️ **Before importing/inviting *real* clients:** the design-partner **DPA must be signed** (§6).
> Until then, onboard with the **dummy client dataset** so they can see the flow safely.

1. Turn on `PRACTICE_PORTAL_ENABLED` for their account.
2. Sign up / sign in (Clerk) → land on the therapist dashboard.
3. Set practice details (name, registration body/number).
4. **Import client list via CSV** (or add 2–3 by hand) — the import flow is built.
5. Set a **per-client rate** for one client.
6. **Book a session** (offline mode — no Stripe needed): confirm the video room + reminder fire.
7. Run one real (or dummy) session end to end.
8. ✅ Done — they can now run their caseload. (Time it; target < 15 min.)

## 4. Weekly check-in (15 min, weeks 1–6)
- What did you do in Faresay this week? (sessions, invites, payments)
- What did you stop using your old tool(s) for?
- What got in your way / felt clunky?
- What almost made you not bother?
- On a 1–10, how likely to recommend to another therapist? Why that number?

## 5. Exit interview + price ask (week 7–8)
- "Walk me through how you used it over the [6] weeks."
- "Which tools did Faresay replace? Which didn't it?"
- **PMF question:** "How would you feel if you could no longer use Faresay — very disappointed,
  somewhat, or not disappointed?" (target > 40% "very").
- **Price ask (watch the reaction):** "Faresay will be **£[29–39]/month** for the Practice plan, with a
  small commission on payments — and founder pricing locked for you. Would you sign up today?"
- If yes: **take the card** on a founder plan now (Stripe link). Intent ≠ revenue; get the commitment.
- If no/hesitant: "What would it need to do, or cost, for that to be an easy yes?"

## 6. Design-partner DPA — skeleton (⚠️ draft for counsel)
> **Get the real one from the lawyers tonight** (`pp-uk-legal-brief.md`, question 2). This skeleton is
> a placeholder so the pilot isn't blocked conceptually — **do not rely on it as executed.** No real
> client data until a counsel-approved DPA is signed per therapist.

Required Article 28 terms the DPA must contain:
- **Roles:** Therapist = **controller**; Faresay = **processor**. Subject-matter, duration, nature &
  purpose of processing; types of personal data (incl. **special-category health data**) and
  categories of data subjects (the therapist's clients).
- **Processor obligations:** process **only on documented instructions**; **confidentiality** of staff;
  **Art 32 security** (encryption in transit/at rest, access control, EU/UK residency).
- **Sub-processors:** named list (Clerk, Daily.co, Resend, Neon) with controller authorisation +
  flow-down terms; notice of changes.
- **International transfers:** mechanism (IDTA / SCCs) for any non-UK sub-processor leg.
- **Assistance:** help the controller with **DSARs**, **DPIAs**, breach handling, and regulator queries.
- **Breach:** notify the controller **without undue delay** on becoming aware.
- **Audit:** make available information to demonstrate compliance; allow audits.
- **End of contract:** **delete or return** all client data + delete copies (save legal-retention).
- **Liability / indemnity** apportioned per role.

## 7. Recruitment funnel target
For 5–8 active design partners, expect to reach ~3–5× that in conversations (warm converts far better
than cold). Track in `pivot-project-plan.md`.

## Linked documents
- `pp-validation-plan.md` (the experiment) · `pp-uk-legal-brief.md` (the DPA + role) ·
  `practice-portal-golive.md` (ops) · `pp-gtm-strategy.md`
