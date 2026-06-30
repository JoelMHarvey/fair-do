# Tutor Credential Verification — SOP

**Who:** anyone with the `ADMIN` role · **Where:** [`/admin`](https://fair-do.com/admin) · **Time:** ~2 minutes per tutor
**Why:** every tutor on fair-do must hold a recognised UK teaching qualification (or appear on the relevant register), a current Enhanced DBS check, and professional indemnity insurance. This is the gate that protects students — and our safeguarding evidence (every decision is logged immutably).

A new tutor signs up → lands in **PENDING** → cannot take bookings until an admin verifies them here.

---

## TL;DR (the loop)

1. Open **`/admin`** → **Credential verification** → each card under **Pending review**.
2. Click **“Open [BODY] register ↗”** on the card.
3. On the register, search by the tutor's **name / number** and confirm **4 things**: name matches · number matches · status current · not expired.
4. Glance at the **DBS check and indemnity insurance** on the card.
5. Tick the **4 checks** → **Approve**. (Or write a reason → **Reject**.)

That's it. The decision, who made it, and your notes are logged automatically.

---

## The registers

The card links straight to the right one. For reference:

| Body | Register (check page) | Search by |
|------|----------------------|-----------|
| **QTS** (Qualified Teacher Status) | https://teacherservices.education.gov.uk/ — Teaching Regulation Agency (TRA), Employer Access Online | teacher reference number (TRN) or name + date of birth |
| **QTLS** (Qualified Teacher Learning and Skills) | https://set.et-foundation.co.uk/ — Society for Education and Training (SET) | name or SET membership number |
| **PGCE / degree** | https://hedd.ac.uk/ — Higher Education Degree Datacheck (HEDD) | name + awarding institution (confirm the qualification, not a register status) |
| **TRA prohibition check** | https://www.gov.uk/guidance/teacher-status-checks-information-for-employers — TRA list of those prohibited from teaching | teacher reference number (TRN) or name (confirm the tutor is **not** subject to a prohibition order) |

> Source of truth for these URLs: `src/lib/credential-registers.ts`. Update there and the admin card + this table stay aligned.

> `[VERIFY]` Unlike the former therapy registers (which were open public lookups), the TRA teacher record is **not** a fully open public register — employer access via DfE Sign-in may be required, and PGCE/degree verification via HEDD is a paid per-check service. Confirm the exact access route and current URLs for each before relying on this table, and reflect them in `src/lib/credential-registers.ts`. `[LEGAL] confirm` which qualification(s) fair-do will accept as the minimum onboarding bar (e.g., QTS vs QTLS vs PGCE vs subject degree), since not all tutors will hold QTS.

---

## Step by step

For each card under **Pending review**:

1. **Read the credential block** — qualification / registration number (e.g., TRN), expiry or renewal date (flagged amber/red if near/past), DBS status, insurance status, and a link to any uploaded certificate.
2. **Open the register** (button on the card) and search by name or number.
3. **Confirm all four:**
   - **Name matches** the register entry (and the uploaded certificate, if present).
   - **Number matches** exactly — the TRN, SET membership number, or qualification reference.
   - **Status is current** — "QTS awarded" / "qualified" / "current member", not lapsed, suspended, or subject to a prohibition order.
   - **Not expired** — for time-limited items (QTLS/SET membership, DBS) the renewal date is in the future. (The card flags if the date on file is already past. QTS itself does not expire.)
4. **Check DBS and insurance** — the card shows whether a current Enhanced DBS check (with Children's Barred List check for under-18 work) and professional indemnity insurance were attested, with provider/expiry if given. fair-do requires both as a condition of onboarding. If either says **“Not attested”**, do not approve until resolved.
5. **Decide:**
   - **Approve** → tick the four checks, then click **Approve**. The tutor goes **ACTIVE** and can take bookings; they get a welcome email.
   - **Reject** → write a clear **reason**, then click **Reject**. The tutor goes **SUSPENDED** and gets a "next steps" email.

---

## What gets logged

Every decision writes an immutable **`CredentialCheck`** row (the audit trail):

| Field | Value |
|-------|-------|
| `checkedByClerkId` | the admin who decided (you) |
| `registrationBody` / `registrationNumber` | what was checked |
| `method` | `manual` |
| `result` | `verified` or `rejected` |
| `notes` | the checklist summary + anything you typed |
| `createdAt` | timestamp |

Approving also sets `credentialVerified = true`, `status = ACTIVE`, and re-arms expiry reminders. This record is our evidence of due diligence — **always Approve/Reject through the admin screen, never by editing the database**, so the log stays complete.

---

## When to reject

Reject (with a reason) if any of these:

- Number **not found** on the register, or belongs to a **different name**.
- Register status is **lapsed / suspended / removed**, or the tutor is **subject to a prohibition order**.
- Qualification or membership is **expired** with no valid renewal shown.
- **No valid Enhanced DBS check**, or **no indemnity insurance**, where fair-do requires it.
- Uploaded certificate looks **altered or doesn't match** the register.
- Anything that doesn't add up — when in doubt, reject and ask, don't approve.

A rejected tutor can fix the issue and re-apply; re-verify them the same way.

---

## After approval — ongoing

You don't re-check manually. The daily **credentials cron** (`/api/cron/credentials`) watches qualification/membership, DBS, **and** insurance expiry:

- nudges the tutor at **60 / 30 / 14 / 7 / 1 days** before expiry, and on the day,
- after a **14-day grace** past expiry, **auto-suspends** them from new bookings (`credentialSuspended`).

When a tutor renews and updates their dates, they return to PENDING-style review **only if** their record needs it — otherwise reminders simply re-arm. Treat a renewal the same as a first check: confirm the new expiry on the register before clearing it.

---

## Cadence

- Check the **Pending review** queue **at least once a day** (it shows a count at the top of `/admin`).
- Verify within **24 hours** of signup where you can — tutors can't earn until they're cleared, so speed is kindness.
