# fair-do Cost Analysis

Internal document. Covers estimated build cost, running costs, unit economics per tier, and the school session ceiling that drives school plan banding.

---

## 1. Build Cost Estimate

| Component | Estimated effort |
|-----------|-----------------|
| Core booking + calendar | 8 weeks |
| Payments (Stripe Connect) | 4 weeks |
| Video (Daily.co) + whiteboard | 3 weeks |
| Auth + multi-role UX (Clerk) | 2 weeks |
| AI lesson notes (Anthropic) | 1 week |
| Parent portal | 3 weeks |
| Resource library | 2 weeks |
| i18n (6 locales) | 2 weeks |
| Mobile (native app) | 4 weeks |
| Marketing + public pages | 3 weeks |
| Infra, CI, observability | 2 weeks |
| **Total engineering** | **~34 weeks** |

Assuming two mid-senior engineers at ~£650/day each:

- **Low estimate:** 34 weeks × £650 × 2 = **£88,400**
- **With design, PM, and contingency:** **~£120,000–£150,000**

---

## 2. Fixed Monthly Infrastructure Costs

These costs are incurred regardless of usage volume.

| Service | Purpose | Cost (approx.) |
|---------|---------|---------------|
| Vercel Pro | Hosting + edge functions | £16/month |
| Neon (Launch) | PostgreSQL | £15/month |
| Resend Pro | Transactional email | £16/month |
| Upstash Redis | Rate limiting + queues | £5/month |
| Sentry Team | Error monitoring | £20/month |
| Cloudinary | File/resource storage | £0–8/month |
| Domain, SSL, misc | | £3/month |
| **Total fixed** | | **~£75–83/month** |

Clerk auth is free under 10,000 MAU; $0.02/MAU beyond that.

---

## 3. Variable Costs Per Lesson

These scale directly with platform usage.

### 3a. Video (Daily.co)

Daily.co charges **$0.004/minute/participant**. A standard 1:1 60-minute lesson:

```
$0.004 × 60 min × 2 participants = $0.48 ≈ £0.38 per lesson
```

| Duration | Per lesson (est.) |
|----------|------------------|
| 30 min   | £0.19 |
| 45 min   | £0.28 |
| 60 min   | £0.38 |
| 90 min   | £0.57 |

This is the single largest variable cost and the main driver of tier banding.

### 3b. AI Lesson Notes (Anthropic Haiku)

Notes are generated from a ~10k-token transcript using Claude Haiku:

```
Input:  10,000 tokens × $0.25/1M = $0.0025
Output: ~500 tokens  × $1.25/1M = $0.0006
Total:  ~$0.003 ≈ £0.002 per lesson
```

Negligible per lesson. A Pro tutor running 40 lessons/month pays under £0.10 in AI costs.

### 3c. Stripe Connect (Platform Payout Fee)

Stripe charges the **platform** (us) for each payout to a connected tutor:

- **0.25% of payout amount**, minimum 25p per payout

A £40 lesson → £0.10 platform payout fee (25p minimum applies if payout is ≤ £40).
Tutors batch payouts weekly/monthly, so actual per-lesson cost is lower when averaged.

### 3d. Other Variable Costs

- **Resend** transactional email: ~£0.0003/email (negligible)
- **Clerk**: $0.02/MAU beyond 10,000 free MAU (negligible until significant scale)

---

## 4. Unit Economics Per Subscription Tier

Modelled on a tutor averaging 4 × 60-min lessons/day, 20 working days/month = **80 lessons/month**.

### Free (£0/month)

| Item | Amount |
|------|--------|
| Revenue | £0 |
| Video (assumed 20 sessions/month — lighter user) | −£7.60 |
| Stripe Connect payout | −£1.00 |
| Net per free tutor | **−£8.60/month** |

Free users are subsidised. They convert to paid or use marketplace features (where we earn 10% commission). Keep free tier lightweight; monitor free-to-paid conversion rate.

### Pro (£29/month)

| Item | Amount |
|------|--------|
| Revenue | £29.00 |
| Video (80 sessions/month) | −£30.40 |
| AI notes (80 lessons) | −£0.16 |
| Stripe Connect payouts | −£1.50 |
| Net per Pro tutor | **−£3.06/month** |

Pro is also loss-making at high session volume. It becomes profitable only when a tutor runs fewer sessions or has a higher average lesson rate (which pushes up their payout amounts, meaning payout fees are a larger share — Stripe costs more but we still earn the flat £29).

Breakeven for Pro: **£29 ÷ £0.38/session = ~76 sessions/month** (about 4 sessions/day).

Below 76 sessions/month: Pro is profitable. Above: loss-making on video alone.

**Action:** Pro is priced correctly for an average UK tutor (20–40 sessions/month). Heavy users (60+ sessions) should be nudged to School or given usage-based add-ons.

### School (£79/month)

Break-even sessions = **£79 ÷ £0.38 = ~208 sessions/month** (≈10 sessions/day, 20 days).

This works for a single moderately busy tutor — but as soon as a second tutor joins, the school quickly exceeds the break-even and the tier becomes loss-making.

---

## 5. School Session Ceiling & Recommended Banding

### Why flat £79 breaks for multi-tutor schools

| Tutors | Sessions/day each | Monthly sessions | Video cost | £79 margin |
|--------|-------------------|-----------------|-----------|-----------|
| 1 | 5 | 100 | £38 | **+£41** ✓ |
| 2 | 5 | 200 | £76 | **+£3** ✓ (barely) |
| 3 | 5 | 300 | £114 | **−£35** ✗ |
| 5 | 5 | 500 | £190 | **−£111** ✗ |

A school with 3+ active tutors is immediately loss-making at £79/month.

### Recommended school plan banding

| Plan | Monthly fee | Max tutors | Session allowance\* | Video cost at cap | Net margin |
|------|-------------|------------|-------------------|-----------------|-----------|
| School Starter | £79 | 2 | 150 sessions | £57 | **+£22** |
| School Standard | £199 | 5 | 400 sessions | £152 | **+£47** |
| School Pro | £399 | 12 | 900 sessions | £342 | **+£57** |
| Enterprise | Custom | Unlimited | Custom | — | — |

\* Sessions above the allowance are charged at £0.50/session overage (covering video cost with a small margin).

> **Note on existing School subscribers:** The current £79 school tier is grandfathered. New multi-tutor schools should be directed to the appropriate band.

---

## 6. Cost Scaling at Volume

At 1,000 active tutors:

| Source | Monthly revenue | Monthly variable cost | Net |
|--------|----------------|----------------------|-----|
| 700 Free users | £0 | 700 × £7.60 = £5,320 | −£5,320 |
| 250 Pro | £7,250 | 250 × £30.40 = £7,600 | −£350 |
| 40 School Starter | £3,160 | 40 × £57 = £2,280 | +£880 |
| 10 School Standard+ | £1,990+ | 10 × £152 = £1,520 | +£470+ |
| Fixed infra | — | £80 | −£80 |
| **Total** | **~£12,400** | **~£16,800** | **−£4,400/month** |

At early scale, the platform runs at a loss. Profitability relies on:

1. **Marketplace commission (10%)** — tutors who receive students via the directory. A tutor doing 20 marketplace lessons at £40/lesson → £80 commission per month. Even 50 marketplace-active tutors generates £4,000/month in commission, closing most of the gap.
2. **Free-to-paid conversion** — reducing the proportion of free users.
3. **Parent portal subscriptions (£4.99/month/family)** — high-margin recurring revenue; cost is just email + a few DB queries.

---

## 7. Pricing Verdict

| Tier | Current price | Status | Recommendation |
|------|--------------|--------|---------------|
| Free | £0 | Loss-making; acceptable as CAC | Keep |
| Pro | £29/month | Break-even at ~76 sessions/month | Keep; monitor heavy users |
| School (flat) | £79/month | Loss-making above 2 tutors | Replace with banded plans |
| Enterprise | Not launched | — | Launch at custom pricing |

**Immediate action:** Activate school plan banding. School Starter at £79 is viable for 1–2 tutors; redirect larger schools to Standard/Pro/Enterprise. Add visible session allowances and overage pricing.

---

## 8. Biggest Levers

1. **Daily.co costs** — the single largest variable. Negotiate a volume deal at 5,000+ sessions/month (typically 20–30% discount). Switch to Twilio or LiveKit for even lower costs at high volume.
2. **Marketplace commissions** — zero-cost revenue; grow directory listings to increase this.
3. **Pro conversion** — each Free→Pro conversion adds ~£20 gross margin/month (at typical session volumes).
4. **Annual billing** — offering annual Pro at £249 (saving £99 vs monthly) reduces churn and improves cash flow.

---

*Last updated: June 2026. Prices in GBP. USD figures converted at $1.27/£.*
