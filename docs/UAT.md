# UAT / demo environment

A separate, isolated instance of Faresay populated with realistic demo therapists,
ratings and availability — to show how the app looks and walk the client journey.
**Browse-only:** therapists are demo accounts (not real Stripe Connect), so booking
stays closed. Browsing, profiles, the questionnaire and matches all look real.

> Fully isolated from production: its own database, Clerk instance and Stripe test
> keys. Nothing here can touch live data, users or money.

---

## What testers can do
- See the **public directory** (`/therapists`) full of therapists with photos, ratings, badges
- Open **therapist profiles** (bio, specialisms, reviews, availability)
- **Sign up as a client** (Clerk dev), complete the questionnaire, and get **matched** to the demo therapists
- See onboarding, the help/crisis pages, FAQ, blog, gift flow, etc.

Booking is intentionally closed (no real payments in a browse demo).

---

## One-time setup (separate Vercel project)

### 1. Database — a Neon branch
In Neon, create a **branch** of the prod database (e.g. `uat`) — instant, isolated copy.
Copy its connection string for `DATABASE_URL`.

### 2. Clerk — a development instance
Use a **Clerk Development instance** (separate from prod). Note its
`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (`pk_test_…`) and `CLERK_SECRET_KEY` (`sk_test_…`).

### 3. Stripe — test mode
Use **Stripe test keys** (`sk_test_…`). No live activation needed for a browse demo.

### 4. Vercel — a dedicated project
Create a new Vercel project `faresay-uat` from the same GitHub repo (or `vercel --prod`
to a separate project). Set its production branch to `main` (or a `uat` branch if you
want to demo unreleased work). Add the env vars below, then deploy.

### 5. Environment variables (Vercel → faresay-uat → Production)
```
DATABASE_URL=postgres://…neon uat branch…
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_…
CLERK_SECRET_KEY=sk_test_…
STRIPE_SECRET_KEY=sk_test_…
NEXT_PUBLIC_APP_URL=https://faresay-uat.vercel.app   # this project's URL

ALLOW_DEMO_DATA=true        # surfaces the demo therapists (prod leaves this unset)
NEXT_PUBLIC_DEMO_MODE=true  # shows the "UAT / demo environment" banner
# BOOKINGS_ENABLED stays UNSET → booking closed (browse-only)
```
Optional (only if you want video/email to work in the walkthrough): `DAILY_API_KEY`,
`RESEND_API_KEY`, Cloudinary preset. Not needed for a browse demo.

### 6. Migrate + seed the UAT database
Point your shell at the UAT `DATABASE_URL`, then:
```bash
npx prisma migrate deploy        # apply schema to the Neon uat branch
npm run seed:uat                 # seed 6 therapists, ratings, availability, demo clients + org
```
Re-run `npm run seed:uat` any time — it's idempotent and refreshes the demo data in place.
Wipe demo data with `npm run seed:remove-demo`.

### 6b. (Optional) Seed from GitHub Actions instead of your laptop
A `UAT seed` workflow (`.github/workflows/uat-seed.yml`) does the same without a local shell:
1. Add a repo secret **`UAT_DATABASE_URL`** = the Neon `uat`-branch connection string
   (Settings → Secrets and variables → Actions, or scope it to a `uat` environment).
2. GitHub → **Actions → UAT seed → Run workflow** → choose `seed` (migrate + seed) or
   `remove-demo` (wipe demo rows). It only ever touches `UAT_DATABASE_URL` — never prod.

---

## Demo script (suggested walkthrough)
1. Open the UAT URL → note the coral **UAT banner** up top.
2. **Find a therapist** → the public directory, full of therapists with photos + ★ ratings.
3. Open a profile (e.g. Priya Nair) → bio, specialisms, reviews, availability, founding badge.
4. **Get started** → sign up as a client (Clerk dev) → complete the questionnaire.
5. Land on **Your matches** → the same demo therapists, ranked to the answers.
6. Open **/help**, **/faq**, **/gift** to show the supporting pages.
7. (Booking shows "booking opens soon" — explain payments are live only in production.)

---

## Teardown / refresh
- **Wipe demo data:** `node prisma/remove-demo-therapists.mjs` (removes `demo_*` rows).
- **Reset the whole DB:** delete and recreate the Neon `uat` branch, then migrate + seed.
- **Take UAT offline:** pause or delete the `faresay-uat` Vercel project.

## Notes
- Demo therapists use `acct_demo_*` Stripe ids and `demo_therapist_*` / `demo_client_*`
  clerkIds. Production hides them (the `ALLOW_DEMO_DATA` guard) even if seeded by accident.
- Profile photos are from pravatar.cc (allowed by the CSP `img-src https:`).
- Keep `NEXT_PUBLIC_DEMO_MODE=true` so testers never mistake UAT for the live site.
