# Therapist referral reward — free month instead of cash

**Status:** plan. Pairs with the 0%-commission money model.

## The problem
The therapist referral reward is currently a **£25 cash bonus** (`THERAPIST_REFERRAL_BONUS_PENCE`), recorded as "owed" and paid out manually via the referrer's Connect payout. Two issues now:
1. **Free-plan referrers** pay Faresay nothing, so a cash bonus to them is pure cash outflow with no offsetting revenue — and there's no clean rail to pay cash to someone who isn't selling sessions yet.
2. We took the commission to **0%**, so referral cash isn't funded by per-session revenue any more — it would come straight off the (subscription-only) bottom line.

## The fix (your idea)
Reward = **a free month of the paid plan**, not cash.
- **Paid referrer:** apply a free month to their subscription now.
- **Free-plan referrer:** bank the free month; apply it **when they upgrade to paid**. (Aligned: they're rewarded exactly when they start paying, and it costs us a deferred discount, not cash.)

## Data model
Add to `Therapist`:
```prisma
freeMonthsOwed Int @default(0) // referral rewards, redeemed as 100%-off months on the paid plan
```
Keep `TherapistReferral` for the audit trail; repurpose `status` (pending → rewarded → redeemed) and stop using `bonusPence` for cash.

## Reward flow
1. **Referee runs first paid session** → `rewardTherapistReferralOnFirstSession` (already exists): instead of marking cash owed, **increment the referrer's `freeMonthsOwed`** and set the referral `rewarded`.
   - If the referrer **already has an active paid subscription**, apply a free month immediately (Stripe coupon on their next invoice) and don't bank it.
2. **Apply at subscribe** (`/api/practice/billing/subscribe`, paid tier): if `freeMonthsOwed > 0`, attach a **100%-off-one-month coupon** to the Checkout subscription (`discounts: [{ coupon }]`) and decrement `freeMonthsOwed`. Multiple owed months → a longer-duration coupon (`duration: 'repeating', duration_in_months: n`) or apply one per cycle.
3. **Stripe coupon:** create once (`stripe.coupons.create({ percent_off: 100, duration: 'once' })`) and reuse its id, or create per-redemption. Record redemption on the referral row.

## UI / copy
- Referral surfaces (`therapist/dashboard`, `therapist/profile`) change **"£25 per peer"** → **"a free month for every therapist you refer"** (and for free-tier: "redeemed when you upgrade").
- Show `freeMonthsOwed` on the billing page ("You have N free months waiting — they'll apply to your first paid invoices").

## Edge cases
- Abandoned checkout after decrement → decrement only on `checkout.session.completed` (webhook), not at checkout creation, so an abandoned upgrade doesn't burn the reward.
- Self-referral / duplicate already guarded by `TherapistReferral.refereeTherapistId @unique`.
- Referrer downgrades to free after earning → months stay banked for the next upgrade.
- Clinic seats: out of scope for v1 (clinic billing is its own plan).

## Build steps
1. Schema field + `prisma db push`.
2. `therapist-referral.ts`: reward grants `freeMonthsOwed` (+ apply-now if already paid).
3. `subscribe` route: attach coupon when owed; decrement in the webhook on completion.
4. Copy updates + billing-page indicator.

## Testing
- Referee first session → referrer `freeMonthsOwed` +1 (idempotent).
- Paid referrer → coupon applied immediately, not banked.
- Free referrer upgrades with owed months → 100%-off coupon attached, decremented on completion (not on abandonment).
- Self/duplicate referral → no reward.

## Effort
~1–1.5 days incl. the Stripe coupon plumbing + the webhook decrement. Needs a `db push`.
