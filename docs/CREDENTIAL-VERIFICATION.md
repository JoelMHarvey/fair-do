# Therapist Credential Verification — SOP

**Who:** anyone with the `ADMIN` role · **Where:** [`/admin`](https://faresay.com/admin) · **Time:** ~2 minutes per therapist
**Why:** every therapist on Faresay must hold a current registration with an accredited UK body and indemnity insurance. This is the gate that protects clients — and our regulatory evidence (every decision is logged immutably).

A new therapist signs up → lands in **PENDING** → cannot take bookings until an admin verifies them here.

---

## TL;DR (the loop)

1. Open **`/admin`** → **Credential verification** → each card under **Pending review**.
2. Click **“Open [BODY] register ↗”** on the card.
3. On the register, search by the therapist's **name / number** and confirm **4 things**: name matches · number matches · status current · not expired.
4. Glance at **indemnity insurance** on the card.
5. Tick the **4 checks** → **Approve**. (Or write a reason → **Reject**.)

That's it. The decision, who made it, and your notes are logged automatically.

---

## The registers

The card links straight to the right one. For reference:

| Body | Register (check page) | Search by |
|------|----------------------|-----------|
| **BACP** | https://www.bacp.co.uk/search/Register | name or BACP membership number |
| **UKCP** | https://www.psychotherapy.org.uk/find-a-therapist/ | name, then confirm the UKCP number |
| **BPS** | https://www.hcpc-uk.org/check-the-register/ | name or **HCPC** number (HCPC is the statutory register for practitioner psychologists; BPS membership alone is not a licence) |
| **NCPS** | https://www.ncps.com/check-the-register | name or NCPS membership number |

> Source of truth for these URLs: `src/lib/credential-registers.ts`. Update there and the admin card + this table stay aligned.

---

## Step by step

For each card under **Pending review**:

1. **Read the credential block** — registration number, registration expiry (flagged amber/red if near/past), insurance status, and a link to any uploaded certificate.
2. **Open the register** (button on the card) and search by name or number.
3. **Confirm all four:**
   - **Name matches** the register entry (and the uploaded certificate, if present).
   - **Registration number matches** exactly.
   - **Status is current** — "registered" / "accredited" / "member", not lapsed, suspended, or removed.
   - **Not expired** — the register's expiry/renewal date is in the future. (The card flags if the date on file is already past.)
4. **Check insurance** — the card shows whether professional indemnity insurance was attested, with provider/expiry if given. BACP, UKCP and NCPS require members in practice to hold it. If it says **“Not attested”**, do not approve until resolved.
5. **Decide:**
   - **Approve** → tick the four checks, then click **Approve**. The therapist goes **ACTIVE** and can take bookings; they get a welcome email.
   - **Reject** → write a clear **reason**, then click **Reject**. The therapist goes **SUSPENDED** and gets a "next steps" email.

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
- Register status is **lapsed / suspended / removed**.
- Registration is **expired** with no valid renewal shown.
- **No indemnity insurance** and the body requires it.
- Uploaded certificate looks **altered or doesn't match** the register.
- Anything that doesn't add up — when in doubt, reject and ask, don't approve.

A rejected therapist can fix the issue and re-apply; re-verify them the same way.

---

## After approval — ongoing

You don't re-check manually. The daily **credentials cron** (`/api/cron/credentials`) watches accreditation **and** insurance expiry:

- nudges the therapist at **60 / 30 / 14 / 7 / 1 days** before expiry, and on the day,
- after a **14-day grace** past expiry, **auto-suspends** them from new bookings (`credentialSuspended`).

When a therapist renews and updates their dates, they return to PENDING-style review **only if** their record needs it — otherwise reminders simply re-arm. Treat a renewal the same as a first check: confirm the new expiry on the register before clearing it.

---

## Cadence

- Check the **Pending review** queue **at least once a day** (it shows a count at the top of `/admin`).
- Verify within **24 hours** of signup where you can — therapists can't earn until they're cleared, so speed is kindness.
