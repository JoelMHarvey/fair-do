# Phase 2 — Launch Checklist

Everything needed to turn on the Phase 2 features. All of them ship **dark** (flag
off) and merged to `main`, so the live site is unaffected until you do the steps below.

Work top-down: **DB first**, then the **two Stripe env renames** (needed for any paid
plan), then enable features one at a time.

Legend: 🔴 required for the feature to work · 🟠 do once · 🟢 optional

---

## 0. Apply the schema (do this first) 🔴

Six flag-gated schema changes are waiting on `main` (parent portal, lesson notes,
cancellation policy, resources, recurring bookings, + the `PARENT` role). One push
lands them all. Defaults are safe — nothing changes behaviour until a flag is on.

```bash
# Use the DIRECT (non-pooler) Neon URL — Prisma Migrate/Push needs a direct connection.
DATABASE_URL="postgresql://<user>:<pw>@ep-flat-scene-abfuas6w.eu-west-2.aws.neon.tech/neondb?sslmode=require" \
DIRECT_URL="postgresql://<user>:<pw>@ep-flat-scene-abfuas6w.eu-west-2.aws.neon.tech/neondb?sslmode=require" \
  npx prisma db push
```

Adds: `User.role` value `PARENT`; tables `ParentLink`, `ParentMessageThread`,
`ParentMessage`, `LessonTranscript`, `LessonNote`, `RecurringBooking`; columns on
`StudentDocument` (`uploadedBy`, `studentVisible`, `fileName`, `fileSizeBytes`) and
`Teacher` (`cancellationWindowHours`, `lateCancelRefundPercent`).

Verify: `... npx prisma db pull` runs clean, or load `/dashboard` (no `P2021`/`P2022`).

---

## 1. Pricing: rename the Stripe price env vars 🔴

Tiers were renamed Starter/Practice/Clinic → **Free / Pro / School** (prices
unchanged: £0 / £29 / £79). The Stripe price **ids are the same** — only the env var
**names** changed.

In Vercel → Settings → Environment Variables (Production):
- rename `STRIPE_PRICE_PRACTICE` → **`STRIPE_PRICE_PRO`**
- rename `STRIPE_PRICE_CLINIC` → **`STRIPE_PRICE_SCHOOL`**

Until done, choosing a paid plan returns "billing isn't configured" (Free still works).
Redeploy after env changes.

> **Commission split** (own 0% / marketplace 10%) is already live in code — no flag.
> It only applies to directory/marketplace bookings, which are off until
> `NEXT_PUBLIC_DIRECTORY_ENABLED=true`.

---

## 2. Cancellation policy (P2-6) — already on ✅

No flag. Defaults reproduce the old rule (full refund ≥24h ahead, otherwise none).
Teachers set their own window/refund on **/teacher/profile**. Live once §0 is pushed.

---

## 3. Interactive whiteboard (P2-1) 🟢

Adds a "🖊 Whiteboard" button to the lesson page — a shared Excalidraw board.

Env (Production):
- 🔴 `WHITEBOARD_ENABLED=true`
- 🟢 `EXCALIDRAW_ROOM_SECRET` — any random string (so room ids aren't guessable). Defaults if unset.
- 🟢 `EXCALIDRAW_SERVER_URL` — only if you self-host Excalidraw (lets it embed in-page
  instead of opening a new tab; excalidraw.com blocks iframing).

No Stripe, no DB beyond §0. All tiers.

---

## 4. Resource & homework sharing (P2-5) 🟠

Teachers upload files (≤25 MB) to a student; students download + submit back.

- 🔴 `RESOURCES_ENABLED=true`
- 🔴 **Cloudinary preset that allows raw/auto uploads.** The current photo preset is
  image-only. In Cloudinary → Settings → Upload → your unsigned preset: allow PDF/doc
  formats (resource type `auto`/`raw`). Reuses `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` +
  `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` (already set for photos).

All tiers.

---

## 5. Parent portal (P2-3) 🔴

Parents pay £4.99/mo for visibility (lessons, attendance, invoices, messages).
Gated to paid (Pro/School) teachers.

1. 🔴 `PARENT_PORTAL_ENABLED=true`
2. 🔴 Create a **£4.99/month recurring price** in Stripe → set `STRIPE_PRICE_PARENT_PORTAL`.
3. 🔴 Stripe webhook (`/api/webhooks/stripe`, existing endpoint) must subscribe to
   **`customer.subscription.updated`** and **`customer.subscription.deleted`** (so a
   parent's cancel pauses access). `checkout.session.completed` is already subscribed.

Transcripts + AI-notes tabs in the portal light up once §6 is on.

---

## 6. AI lesson notes (P2-4) 🔴

Claude drafts a lesson summary from the Daily transcript; teacher reviews + shares to
student/parent. Gated to Pro/School.

1. 🔴 `AI_NOTES_ENABLED=true`
2. 🔴 `ANTHROPIC_API_KEY` (already set if the in-app assistant works).
3. 🔴 **Daily transcription**: enable transcription on the lesson rooms, and add the
   **`transcript.ready`** event to the Daily webhook (`/api/webhooks/daily`, existing).
   Uses `claude-haiku-4-5-20251001` (cheap — ~pennies/lesson).

---

## 7. Recurring / standing bookings (P2-2) 🔴

Teacher sets a weekly slot; student saves a card once; a daily cron creates + charges
each lesson off-session. Gated to Pro/School.

1. 🔴 `RECURRING_ENABLED=true`
2. 🔴 `BOOKINGS_ENABLED=true` (the global booking gate — the cron won't charge while closed).
3. 🔴 Stripe webhook must have **`customer.subscription.*`** events (same as §5) — and the
   `recurring_card` setup is handled by the existing `checkout.session.completed`.
4. ✅ Cron is already registered in `vercel.json` (`/api/cron/recurring`, daily 07:00).
   Needs `CRON_SECRET` set (you already have it).

> Known limitation: lesson times are treated as **UTC** (no per-teacher timezone yet) —
> can be 1h off during BST. Flagged in code for a follow-up.

---

## Quick reference — all new env vars

| Var | For | Required? |
|---|---|---|
| `STRIPE_PRICE_PRO` | Pro plan (rename of `_PRACTICE`) | 🔴 paid plans |
| `STRIPE_PRICE_SCHOOL` | School plan (rename of `_CLINIC`) | 🔴 paid plans |
| `WHITEBOARD_ENABLED` | P2-1 | per feature |
| `EXCALIDRAW_ROOM_SECRET` / `EXCALIDRAW_SERVER_URL` | P2-1 | 🟢 |
| `RESOURCES_ENABLED` | P2-5 | per feature |
| `PARENT_PORTAL_ENABLED` | P2-3 | per feature |
| `STRIPE_PRICE_PARENT_PORTAL` | P2-3 (£4.99/mo price) | 🔴 with P2-3 |
| `AI_NOTES_ENABLED` | P2-4 | per feature |
| `RECURRING_ENABLED` | P2-2 | per feature |
| `BOOKINGS_ENABLED=true` | P2-2 (+ all booking) | 🔴 with P2-2 |

Redeploy after any env change. Each feature is independent — enable in any order.

## Smoke test after enabling
- **P2-3/P2-2** (money): one real run with a small amount — invite a parent → subscribe →
  portal unlocks; set a recurring slot → save card → cron creates + charges next lesson.
- **P2-4**: finish a transcribed lesson → a draft note appears on the student page →
  share → it shows on the student + parent dashboards.
- **P2-5**: upload a file as the teacher → student sees it (if visible) → student uploads back.
- **P2-1**: open a lesson → Whiteboard button → both parties land in the same board.
