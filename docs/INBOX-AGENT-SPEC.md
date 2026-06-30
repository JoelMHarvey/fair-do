# Inbox Agent — Design Spec

**Status:** Design for review · **Default state:** OFF · **Owner:** Joel Harvey

An AI agent that watches the support inboxes (`support@`, `hello@`, `enquiries@`), and for mail from tutors or students: **acknowledges** it's being handled, **suggests a fix** when it's confident and appropriate, and **escalates** anything serious to a human. Toggleable from the metrics dashboard; **off until deliberately enabled**.

---

## 1. First principle: safety before cleverness

This agent emails real customers — wrong or tone-deaf replies cost trust, and the inboxes can carry **sensitive data** (e.g. safeguarding concerns about children). So:

- **Off by default.** Ships disabled; does nothing until an admin turns it on from the dashboard.
- **Staged autonomy** (one dial, raise it as trust grows):
  | Level | Behaviour |
  |-------|-----------|
  | `off` *(now)* | Polls nothing, sends nothing. |
  | `draft` | Triages incoming mail, writes a draft + classification into the dashboard for a human to send. **No outbound email.** |
  | `ack` | Auto-sends only a short *"we've got this, a human is on it"* acknowledgement. Fixes/escalations still drafted for review. |
  | `assist` | Auto-sends acknowledgement **and** a suggested fix **only** when the agent's confidence is high and the topic is on an allow-list (see §6). Everything else → draft + escalate. |
  - Escalation **always** notifies a human regardless of level; the agent never "closes" a serious issue itself.
- **Never auto-send on:** safeguarding, self-harm/crisis language, legal threats, data-protection requests (GDPR/erasure), payment disputes/refunds, press, or anything it isn't confident about. These **escalate**, full stop.
- **Everything is logged** (`InboxMessage` audit row): the raw inbound, the classification, the draft/sent reply, who/what acted, timestamps.
- **No secrets or other users' data** ever enter a reply. The agent's knowledge is a *curated* company/codebase brief (§5), not the live database or repo.

---

## 2. Architecture

```
support@ / hello@ / enquiries@  (Gmail, already IMAP-reachable via src/lib/mailbox.ts)
        │  poll unseen (cron, only when enabled)
        ▼
/api/cron/inbox ──► triage(email)  [src/lib/inbox-agent.ts → Anthropic]
        │                │ returns { category, severity, confidence, draftReply, reason }
        │                ▼
        │         InboxMessage (audit row)  ──►  dashboard card on /admin/health
        ▼
   action by level:
     draft   → store draft, mark needs-review
     ack     → Resend: send acknowledgement, store
     assist  → Resend: send ack (+fix if allowed/high-confidence), else escalate
     escalate→ email founder + web push; mark escalated; never auto-reply
        │
        ▼
   mark message \Seen in IMAP (so it isn't reprocessed)
```

Reuses what exists: `mailbox.ts` (IMAP), `email.ts` (Resend send), `push.ts` (founder alerts), the `/admin/health` dashboard, the cron pattern + `CronRun`.

---

## 3. The toggle (DB-backed, dashboard-controlled)

Env flags (`src/lib/flags.ts`) are baked at build time — they can't be flipped from a button. So add a tiny **runtime settings** store:

```prisma
model Setting {
  key       String   @id            // e.g. "inbox_agent_level"
  value     String                  // "off" | "draft" | "ack" | "assist"
  updatedAt DateTime @updatedAt
  updatedBy String?                 // admin clerkId
}
```

- `getSetting('inbox_agent_level')` defaults to **`off`** when the row is absent.
- The metrics dashboard (`/admin/health`) gets an **Inbox Agent** card with the level selector (off → draft → ack → assist), ADMIN-gated, posting to `/api/admin/inbox-agent` (verifies role, writes the Setting, audit-logs the change).
- The cron reads the level each run; `off` ⇒ immediate no-op.

---

## 4. Data model

```prisma
model InboxMessage {
  id            String   @id @default(cuid())
  mailbox       String   // support | hello | enquiries
  fromEmail     String
  fromRole      String?  // therapist | client | unknown (resolved from User/Therapist/Client)
  subject       String?
  bodyPreview   String   @db.Text   // truncated/sanitised; NOT necessarily the full body long-term
  category      String?  // acknowledge | suggest_fix | escalate
  severity      String?  // low | normal | high | critical
  confidence    Float?
  draftReply    String?  @db.Text
  status        String   @default("new") // new | drafted | replied | escalated | ignored
  sentAt        DateTime?
  escalatedAt   DateTime?
  handledBy     String?  // "agent" | admin clerkId
  createdAt     DateTime @default(now())
  @@index([status])
  @@index([mailbox])
}
```

Retention: because bodies can contain sensitive safeguarding data, store a **sanitised preview**, set a retention window (e.g. purge resolved rows after 90 days via the existing cleanup cron), and document Resend/Anthropic as sub-processors.

---

## 5. The triage agent (`src/lib/inbox-agent.ts`)

- Model: **`claude-sonnet-4-6`** (fast, cheap, plenty for triage; escalate-decisions can optionally double-check with a stronger model later).
- Uses `@anthropic-ai/sdk`, env-gated on `ANTHROPIC_API_KEY` (no key ⇒ agent reports "not configured" and stays off).
- **System prompt = a curated brief**, version-controlled, NOT the raw codebase:
  - What fair-do is + the current model (subscription + small card fee, **no commission**, tutor = data controller, directory off, bookings gating, etc.).
  - Common issues + their real fixes (Cloudinary photo not configured, "can't find my tutor" → invite/QR flow, payout timing, password reset → fair-do.com, lesson-room access, etc.) — drawn from the actual product so suggestions are correct.
  - Hard rules: never give safeguarding advice; never promise refunds/timelines; flag safeguarding/crisis language → escalate with the safeguarding resources; British, plain, calm (reuse `voice.md` tone); never invent.
- **Structured output** (forced tool/JSON schema), validated before any action:
  ```ts
  { category: 'acknowledge'|'suggest_fix'|'escalate',
    severity: 'low'|'normal'|'high'|'critical',
    confidence: number,            // 0–1
    draftReply: string,            // the proposed email
    escalate: boolean, reason: string }
  ```
- The agent **classifies + drafts**; the *action policy* (§6), not the model, decides what actually gets sent.

---

## 6. Action policy

- **Acknowledge** — short, warm, on-brand "we've got your message, a real person is looking into it." Safe to auto-send at `ack`/`assist`.
- **Suggest fix** — auto-sent **only** at `assist`, **only** when `confidence ≥ 0.8` **and** the topic is on the allow-list (account/login, photo upload, finding-your-tutor, booking basics, general "how does fair-do work"). Otherwise → draft for review.
- **Escalate (always to a human)** when any trigger fires — **safeguarding / self-harm / crisis**, legal, GDPR/data request, payment dispute/refund, complaint about a tutor, press/partnership, or low confidence. Action: email the founder + web push, mark `escalated`, leave the customer reply to a human (except an optional neutral "we've received this and a member of the team will be in touch").

---

## 7. Inbound options

1. **IMAP poll (recommended)** — extend `mailbox.ts` to fetch unseen message bodies; the inbox cron processes them. Zero new vendors; `support@`/`hello@`/`enquiries@` just need to land in a Gmail the IMAP creds can read. Mark processed mail `\Seen`.
2. **Inbound webhook** (Cloudflare Email Routing → Worker → `/api/inbox/inbound`, or Postmark/Mailgun inbound parse) — lower latency, more setup + a new dependency.

Recommend **#1** — it reuses the existing IMAP plumbing and the cron cadence is fine for support (minutes, not seconds).

---

## 8. Operator config (to enable later)

- `IMAP_HOST/USER/PASSWORD` for the support Gmail (app password) — already the `mailbox.ts` convention; point all three aliases at it.
- `ANTHROPIC_API_KEY`.
- `RESEND_FROM` verified for the support address.
- Then flip the level on `/admin/health` (start at **`draft`**, watch the drafts, raise to `ack`, then `assist` only once you trust it).

---

## 9. Build plan (phased; everything ships OFF)

- **P1 — Foundation (done):** `Setting` model + `getSetting/setSetting`; `InboxMessage` model; dashboard **Inbox Agent** card + toggle (defaults `off`); admin toggle API.
- **P2 — Triage (done):** `@anthropic-ai/sdk` + `inbox-agent.ts` (curated brief, structured triage, pure `decideAction` policy). Unit-tested.
- **P3 — Draft mode (done):** `mailbox.ts → processUnseen` (IMAP body fetch via `mailparser`, mark-`\Seen`-after-success) + `inbox-process.ts` + `/api/cron/inbox` (every 5 min, CRON_SECRET-gated). At `draft` it triages unseen mail into `InboxMessage` drafts. No customer email sent.
- **P4 — Ack / assist (done):** auto-send acknowledgements (`ack`) and high-confidence fixes (`assist`) via Resend (threaded reply); serious mail escalates to the founder (ops email + web push) and is never auto-replied. Each behaviour gated behind raising the level.

The whole pipeline is a strict no-op until the level is raised **and** `ANTHROPIC_API_KEY` + `IMAP_*` are set.

---

## 10. Open decisions for Joel

1. **Inbound:** IMAP poll (recommended) or a webhook provider?
2. **Top autonomy you ever want:** stop at `draft` (always human-sent), allow `ack`, or allow `assist` (auto-fixes)?
3. **Escalation destination:** founder email + web push enough, or also Slack/SMS?
4. **Reply identity:** send as `support@fair-do.com` signed "fair-do Support", and should replies say a human will follow up, or stand alone?
