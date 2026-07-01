# fair-do — Success Metrics Framework

## North Star Metric

**Weekly Active Tutoring Hours on Platform**

Defined as: the total number of completed lesson-hours delivered through fair-do's video classroom in a rolling 7-day window.

This metric is the single truest signal that the business is working because it is the convergence point of every hypothesis the model rests on. It requires tutors to have signed up, completed their profile, and found or brought students. It requires parents or students to have booked and shown up. It captures product stickiness on both sides of the marketplace. And because fair-do earns subscription revenue from active tutors, not per-lesson commission, a growing hours figure validates that tutors are using the platform as their primary professional home rather than parking a profile and doing sessions elsewhere.

A platform with growing active hours is a platform whose tutors are earning, whose students are learning, and whose subscription economics are sustainable.

**Week 6 target: 150 active hours/week**
**Month 6 target: 1,200 active hours/week**
**Month 12 target: 4,000 active hours/week**

---

## Phase 1 Metrics (Weeks 1–6: Launch)

| Metric | Target | Measurement Method | Owner |
|---|---|---|------|
| Tutor signups (total) | 200 by end of Week 6 | Auth events in analytics DB | Growth |
| Tutor profiles marked complete (bio, rate, subjects, photo) | 60% of signups = 120 | Profile completion score in DB | Product |
| Tutors who have delivered at least 1 session on platform | 40 | Session completion events | Product |
| Weekly active hours on platform | 150 by Week 6 | Classroom session logs | Analytics |
| Pro subscription conversions | 15 paying tutors | Stripe webhook | Finance |
| MRR at end of Week 6 | £435 | Stripe MRR dashboard | Finance |
| Parent/student signups | 80 | Auth events | Growth |
| Bookings made (any status) | 60 | Booking events in DB | Product |
| Lessons completed (confirmed both sides) | 40 | Session completion events | Product |
| Email list size (tutors, from all channels) | 300 | Mailchimp/list tool subscriber count | Marketing |
| Press mentions or editorial links | 2 | Manual tracking, Google Alerts | Marketing |
| Founding Tutor Programme enrolments | 30 | Founding-tutor flag in DB | Growth |
| NPS (tutors, post first session) | ≥ 40 | In-app survey, 7 days post first session | Product |
| Support tickets opened | < 20/week | Help desk queue | Ops |
| Critical bugs reported | 0 P0, < 5 P1 | Error tracking (Sentry/equivalent) | Engineering |

---

## Phase 2 Metrics (Months 2–6: Growth)

| Metric | Target | Measurement Method | Owner |
|---|---|---|------|
| Weekly active hours on platform | 1,200 by end of Month 6 | Classroom session logs | Analytics |
| Active tutors (delivered ≥ 1 session in last 30 days) | 500 by Month 6 | Session logs joined to tutor table | Analytics |
| Pro subscribers | 125 by Month 6 (25% of 500) | Stripe | Finance |
| MRR | £3,625 by Month 6 | Stripe MRR dashboard | Finance |
| Tutor 90-day retention (still active at 90 days post signup) | ≥ 55% | Cohort analysis, session logs | Analytics |
| Parent 60-day repeat booking rate | ≥ 40% | Booking events, rolling 60-day window | Analytics |
| Average sessions per active tutor per week | ≥ 4 | Session logs / active tutor count | Analytics |
| Organic search impressions (Google Search Console) | 15,000/month by Month 6 | GSC dashboard | Marketing |
| Organic search clicks | 1,200/month by Month 6 | GSC dashboard | Marketing |
| Tutor CAC (blended, all channels) | < £18 | Total acquisition spend / new tutor signups | Growth |
| Parent CAC (blended) | < £12 | Total acquisition spend / new parent signups | Growth |
| Email list — tutors | 2,000 by Month 6 | Email platform | Marketing |
| Tutor NPS | ≥ 50 | Quarterly in-app survey | Product |
| Parent NPS | ≥ 45 | Post-session survey, 24h after first lesson | Product |
| Churn rate — Pro subscribers (monthly) | < 5% | Stripe churn events | Finance |
| Feature adoption — whiteboard used in ≥ 1 session | 30% of active tutors | Feature flag event logs | Product |
| Feature adoption — AI post-session summary generated | 20% of Pro tutors | AI summary events | Product |
| School/B2B leads in pipeline | 5 qualified leads | CRM | Growth |
| Referrals attributed to dual-referral programme | ≥ 40 tutor signups | Referral tracking | Growth |

---

## Phase 3 Metrics (Month 7+: Scale)

| Metric | Target | Measurement Method | Owner |
|---|---|---|------|
| Weekly active hours on platform | 4,000 by Month 12 | Classroom session logs | Analytics |
| Active tutors | 1,500 by Month 12 | Session logs | Analytics |
| Pro subscribers | 500 by Month 12 | Stripe | Finance |
| School subscribers | 20 by Month 12 | Stripe | Finance |
| MRR | £16,080 by Month 12 (see Financial Metrics) | Stripe | Finance |
| Tutor 12-month retention (still active at 12 months post signup) | ≥ 35% | Cohort analysis | Analytics |
| Revenue per active tutor (proxy for platform stickiness) | £3.50/tutor/month blended | MRR / active tutors | Finance |
| Marketplace bookings (parent finds new tutor via search, not brought by tutor) | ≥ 20% of all bookings | Booking attribution field | Analytics |
| Organic search — ranked keywords in top 10 (Google UK) | 25+ keywords | GSC / Ahrefs or equivalent | Marketing |
| Domain Rating / authority | ≥ 25 | Ahrefs DR | Marketing |
| Organic traffic as % of total traffic | ≥ 45% | GA4 channel grouping | Marketing |
| School/B2B contracts signed | 10 | CRM contract stage | Growth |
| App store rating (when mobile app ships, Phase 20.4) | ≥ 4.4 stars | App Store Connect / Play Console | Product |
| AI lesson plan generator adoption (Phase 16.1, once shipped) | 40% of Pro tutors use weekly | Feature event logs | Product |
| Group lesson bookings as % of all bookings | ≥ 8% | Booking type field | Product |
| Gross margin | ≥ 78% | Finance model (revenue vs hosting + support costs) | Finance |
| Media mentions (editorial, not paid) | 2+ per month | Google Alerts, Meltwater or manual | Marketing |

---

## Funnel Metrics — Tutor Acquisition

The tutor funnel runs from first contact with the brand to becoming a retained, paying professional. Every conversion rate below is a minimum viable target at steady state (Month 6 onward).

**Awareness → Website visit**
Channel mix target: 45% organic search, 25% direct/referral, 20% social, 10% paid.
Target: 5,000 unique tutor-intent sessions/month by Month 6.

**Website visit → Signup page view**
Target conversion: 18%.
Measurement: GA4 funnel, signup page as goal step.

**Signup page view → Account created**
Target conversion: 55%.
Measurement: auth events vs page views.
Below 45% triggers a signup UX audit.

**Account created → Profile complete** (bio, rate, at least 2 subjects, photo, DBS status entered)
Target conversion: 65% within 7 days of signup.
Measurement: profile completion score event fired.
Below 50% triggers an onboarding email sequence audit.

**Profile complete → First session delivered on platform**
Target conversion: 50% within 30 days of profile completion.
Measurement: first session completion event joined to tutor signup date.
This is the most critical drop-off to watch. A tutor who has not delivered a session within 30 days of completing their profile is at very high risk of permanent churn.

**First session → Active tutor (≥ 4 sessions in first 60 days)**
Target conversion: 60%.
Measurement: session count in 60-day post-first-session window.

**Active tutor → Pro subscriber**
Target conversion: 25% of tutors with ≥ 8 active students.
Measurement: Stripe subscription creation joined to session volume.

**Pro subscriber → Retained at 12 months**
Target retention: 70% of Pro subscribers still paying at Month 12.
Measurement: Stripe cohort analysis.

**Overall funnel efficiency summary:**
5,000 tutor-intent sessions → 900 signup page views → 495 accounts created → 322 profiles complete → 161 first sessions → 97 active tutors → 24 Pro subscribers per month at steady state (Month 6+).

---

## Funnel Metrics — Parent/Student Acquisition

**Awareness → Website visit**
Target: 8,000 unique parent-intent sessions/month by Month 6.
Channel mix: 50% organic search (subject + area keyword combos), 25% tutor referral (tutor sends their own booking link), 15% social/word of mouth, 10% paid.

Note: a meaningful portion of parent traffic arrives via a tutor's personal booking link. This segment has near-100% intent and should be segmented separately. The funnel below covers organic/paid discovery parents — the harder acquisition problem.

**Website visit → Tutor search performed**
Target conversion: 35%.
Measurement: search events in GA4 / analytics DB.

**Search performed → Tutor profile viewed**
Target: average 2.8 profiles viewed per search session.
Measurement: profile view events.

**Tutor profile viewed → Booking initiated**
Target conversion: 22%.
Measurement: booking initiation events / profile view events.

**Booking initiated → Booking confirmed** (lesson time agreed, tutor accepted)
Target conversion: 80%.
Measurement: booking status transitions.
Below 70% indicates either tutor responsiveness problems or a friction issue in the booking confirmation flow.

**Booking confirmed → Lesson completed**
Target: 90% show rate (no-show rate < 10%).
Measurement: session completion vs confirmed bookings.

**First lesson completed → Second lesson booked within 21 days**
Target: 55%.
Measurement: booking event within 21 days of first session completion.
This is the single strongest signal that a parent has found the right tutor and the platform has done its job.

**Second lesson → Ongoing regular student (≥ 1 lesson/month for 3 consecutive months)**
Target: 65% of second-lesson parents.
Measurement: booking frequency cohort, 90-day window.

**Overall discovery funnel summary:**
8,000 parent-intent sessions → 2,800 searches → 7,840 profile views → 1,725 bookings initiated → 1,380 confirmed → 1,242 lessons completed → 683 second lessons booked → 444 retained regular students per month at Month 6 scale.

---

## Financial Metrics

**Assumptions:**
- Free tier: £0. No revenue contribution. Acquisition and retention cost only.
- Pro tier: £29/month. Target 25% of tutors with ≥ 8 active students.
- School tier: £79/month. Slower ramp; B2B sales cycle 4–8 weeks.
- Tutor growth curve: bootstrapped via founding tutor programme in Weeks 1–6, then word of mouth + content + referrals accelerating from Month 3.
- Churn assumption: 5% monthly gross churn on Pro (tutors who downgrade or leave), stabilising to 3% at Month 10+ as network effects strengthen.

| Month | Active Tutors | Pro Subscribers (25%) | School Subscribers | MRR (Pro) | MRR (School) | Total MRR | Notes |
|---|---|---|---|---|---|---|---|
| 1 | 60 | 5 | 0 | £145 | £0 | £145 | Early founding tutors |
| 2 | 120 | 15 | 0 | £435 | £0 | £435 | Referral programme kicks in |
| 3 | 200 | 30 | 1 | £870 | £79 | £949 | First press mention target |
| 4 | 300 | 55 | 2 | £1,595 | £158 | £1,753 | Content + SEO traffic building |
| 5 | 400 | 80 | 3 | £2,320 | £237 | £2,557 | Exam season demand surge |
| 6 | 500 | 125 | 4 | £3,625 | £316 | £3,941 | 6-month review gate |
| 7 | 650 | 163 | 6 | £4,727 | £474 | £5,201 | Post-summer intake |
| 8 | 800 | 200 | 8 | £5,800 | £632 | £6,432 | |
| 9 | 950 | 238 | 10 | £6,902 | £790 | £7,692 | |
| 10 | 1,100 | 275 | 13 | £7,975 | £1,027 | £9,002 | |
| 11 | 1,300 | 325 | 16 | £9,425 | £1,264 | £10,689 | Mock exam season demand |
| 12 | 1,500 | 500 | 20 | £14,500 | £1,580 | £16,080 | 12-month review gate |

**MRR milestones to flag:**
- £1,000 MRR: validation that the subscription model converts. Expected Month 3–4.
- £5,000 MRR: platform has product-market fit on tutor side. Expected Month 7.
- £10,000 MRR: first inflection. Expected Month 10.
- £16,000 MRR: end of Year 1 target. Basis for Series A narrative if fundraising.

**Unit economics targets by Month 6:**
- LTV (Pro tutor, 12-month average retention): £29 × 14 months (assuming 30% annual churn equivalent) = £406
- Tutor CAC target: < £18 (LTV:CAC > 22:1)
- Payback period: < 1 month on paid channels
- Gross margin target: ≥ 78% (subscription revenue minus hosting, AI API costs, Stripe fees, pro-rated support)

---

## Content & Channel Metrics

### Organic Search

| Metric | Month 3 Target | Month 6 Target | Month 12 Target | Tool |
|---|---|---|---|---|
| GSC total impressions/month | 3,000 | 15,000 | 60,000 | Google Search Console |
| GSC clicks/month | 200 | 1,200 | 5,500 | Google Search Console |
| Average CTR | 4.5% | 8% | 9.2% | Google Search Console |
| Average position (all keywords) | 28 | 18 | 12 | Google Search Console |
| Keywords ranking in positions 1–10 | 3 | 25 | 80 | GSC / Ahrefs |
| Keywords ranking in positions 11–30 | 10 | 60 | 200 | GSC / Ahrefs |
| Domain Rating (Ahrefs) | 8 | 18 | 28 | Ahrefs |
| Referring domains | 15 | 50 | 120 | Ahrefs |

**Priority keyword clusters to track from Day 1:**
- "online tutor UK no commission" and variants
- "maths tutor [city]" / "english tutor [city]" (local intent, highest parent volume)
- "tutorful alternative" / "mytutor alternative" (competitor displacement)
- "private tutor subscription platform"
- "online tutoring platform for tutors"
- "11 plus tutor online"
- "GCSE tutor online"
- "A level tutor [subject]"

### Paid Acquisition

| Metric | Target | Notes |
|---|---|---|
| Tutor CAC — Google Search | < £25 | Targeting competitor-brand and "tutor platform" keywords |
| Tutor CAC — Meta (Facebook/Instagram) | < £20 | Lookalike audiences from email list |
| Tutor CAC — blended | < £18 | Weighted average across all paid channels |
| Parent CAC — Google Search | < £15 | Subject + geography intent keywords |
| Parent CAC — Meta | < £12 | Retargeting + interest audiences |
| Parent CAC — blended | < £12 | |
| Google Ads CTR (search) | ≥ 4.5% | Below 3% triggers ad copy refresh |
| Google Ads Quality Score | ≥ 7/10 | Monitored per keyword group |
| Meta ROAS (if running conversion campaigns) | ≥ 3:1 | Revenue attributed via UTM + Stripe |
| Landing page conversion (paid traffic → signup) | ≥ 9% tutor, ≥ 6% parent | A/B tested continuously |

**Paid budget guidance for Phase 1 (Weeks 1–6):**
Spend no more than £1,500 total. Prioritise tutor acquisition via Google Search on competitor-displacement and "no commission tutoring" keywords. Do not run parent paid campaigns until tutor supply in at least 8 subjects is sufficient to convert search demand.

### Social Media

| Channel | Primary Audience | Metric | Target (Month 6) | Green Threshold |
|---|---|---|---|---|
| LinkedIn | Tutors (professional) | Post impressions/month | 8,000 | > 6,000 |
| LinkedIn | Tutors | Follower growth/month | +150 | > 100 |
| LinkedIn | Tutors | Engagement rate (reactions + comments / impressions) | ≥ 3.5% | > 2.5% |
| Instagram | Parents + tutors (awareness) | Reel plays/month | 15,000 | > 10,000 |
| Instagram | Parents + tutors | Follower growth/month | +200 | > 150 |
| Instagram | Parents + tutors | Story completion rate | ≥ 65% | > 55% |
| TikTok | Younger tutors, parents of teens | Video views/month | 20,000 | > 12,000 |
| TikTok | | Profile link clicks | ≥ 1.5% of views | > 1% |
| X (Twitter) | Education sector, press | Impressions/month | 5,000 | > 3,000 |
| X | | Press contact engagements | 2+ meaningful | Any |

**Content cadence target:** 3 LinkedIn posts/week, 4 Instagram posts/week (mix of Reels and carousels), 3 TikTok videos/week, 2 X posts/week. All content to be produced from existing video scripts and article in MARKETING.md before commissioning new creative.

### Email

| List Segment | Metric | Target | Green | Amber | Red |
|---|---|---|---|---|---|
| Tutor welcome sequence (5-email series) | Open rate Email 1 | 55% | ≥ 50% | 40–49% | < 40% |
| Tutor welcome sequence | Open rate Email 3–5 | 38% | ≥ 35% | 28–34% | < 28% |
| Tutor welcome sequence | Click-through rate | 12% | ≥ 10% | 7–9% | < 7% |
| Weekly tutor newsletter | Open rate | 32% | ≥ 30% | 22–29% | < 22% |
| Weekly tutor newsletter | Click rate | 6% | ≥ 5% | 3–4% | < 3% |
| Weekly tutor newsletter | Unsubscribe rate | < 0.4% | < 0.3% | 0.3–0.6% | > 0.6% |
| Parent booking confirmation | Open rate | 85% | ≥ 80% | 70–79% | < 70% |
| Parent post-session follow-up | Click rate (rebook CTA) | 18% | ≥ 15% | 10–14% | < 10% |
| Reactivation (inactive tutor, 30+ days) | Open rate | 22% | ≥ 20% | 14–19% | < 14% |
| Reactivation | Reactivation rate (session within 14 days) | 8% | ≥ 7% | 4–6% | < 4% |

---

## Weekly Dashboard (What to Check Every Monday)

The following 10 metrics form the Monday morning dashboard. Check them in this order: the first two are health signals, the next four are growth signals, and the last four are quality signals.

| # | Metric | Green | Amber | Red | Action if Red |
|---|---|---|---|---|---|
| 1 | Weekly active hours on platform (7-day rolling) | On or above weekly trajectory to hit phase target | Within 15% below trajectory | > 15% below trajectory | Immediate investigation: check for booking cancellations, session errors, tutor churn spike |
| 2 | Pro MRR (live Stripe figure, Monday morning) | On or above monthly MRR trajectory | Within 10% below trajectory | > 10% below trajectory | Check churn events: who cancelled and when; trigger reactivation outreach within 24h |
| 3 | New tutor signups (last 7 days) | ≥ 15 in Phase 1; ≥ 40 in Phase 2 | 70–99% of target | < 70% of target | Review traffic sources; check if top-of-funnel channels dropped; escalate paid spend if organic dip |
| 4 | Profile completion rate (last 30-day signup cohort, % with complete profiles) | ≥ 65% | 50–64% | < 50% | Audit onboarding email sequence open and click rates; consider in-app prompt change |
| 5 | First session rate (tutors who signed up 14–30 days ago, % who have delivered ≥ 1 session) | ≥ 50% | 38–49% | < 38% | Trigger personal outreach to incomplete tutors; review if there is a booking flow blocker |
| 6 | Parent second-lesson booking rate (parents whose first lesson was 8–21 days ago, % who rebooked) | ≥ 55% | 42–54% | < 42% | Check NPS from that cohort; review post-session email CTA performance; flag to product if systemic |
| 7 | Session no-show rate (last 7 days, % of confirmed bookings where session did not start) | < 8% | 8–14% | > 14% | Investigate: tutor-side or parent-side? Check reminder email delivery; consider adding SMS |
| 8 | Support tickets opened (last 7 days) | < 15 | 15–25 | > 25 | Triage: what category? If payment or booking errors, escalate to engineering same day |
| 9 | Tutor NPS score (rolling 30-day, in-app survey respondents) | ≥ 45 | 35–44 | < 35 | Read verbatim responses; identify top complaint theme; assign fix to next sprint if systemic |
| 10 | Weekly active hours per active tutor (sessions intensity proxy) | ≥ 3.5 hours | 2.5–3.4 hours | < 2.5 hours | If falling while tutor count grows, platform is acquiring low-activity tutors; review acquisition channel mix |

---

## Review Cadence

### Weekly (every Monday)
- **Who:** Head of Analytics + one representative from Product and Growth
- **What:** Monday dashboard (10 metrics above), previous week's notable events, top support ticket theme
- **Duration:** 30 minutes maximum
- **Artefact:** Slack message with RAG status of all 10 metrics posted to #metrics channel before 10am
- **Trigger for escalation:** Any 3 or more Red metrics in a single week triggers a same-week emergency review with the full leadership team

### Monthly (first Tuesday of each month)
- **Who:** Full founding team
- **What:** Full funnel review against phase targets, MRR trajectory vs plan, cohort retention analysis, content and channel performance, upcoming month priorities
- **Duration:** 90 minutes
- **Artefact:** One-page metrics summary shared 24h before meeting; decisions and owners documented in meeting notes
- **Input required:** Analytics to prepare cohort charts, Finance to prepare MRR waterfall (new MRR, expansion, churn, net new), Marketing to prepare channel performance table

### Phase Gates (end of Week 6, end of Month 6, end of Month 12)
- **Who:** Founding team + any investors or advisors
- **What:** Full phase retrospective against all Phase metrics tables above; decision on whether to advance to next phase goals, adjust targets, or pivot a channel/product decision
- **Phase Gate criteria to advance from Phase 1 to Phase 2:** ≥ 150 active hours/week, ≥ 15 Pro subscribers, ≥ 40 tutors who have delivered at least one session, tutor NPS ≥ 40
- **Phase Gate criteria to advance from Phase 2 to Phase 3:** ≥ 1,200 active hours/week, ≥ 500 active tutors, ≥ 125 Pro subscribers, ≥ £3,625 MRR, tutor 90-day retention ≥ 55%, parent second-lesson rate ≥ 40%

### What Triggers a Pivot

A pivot — defined as a material change to channel mix, pricing, positioning, or product priority — should be triggered by evidence, not anxiety. The following specific conditions warrant a pivot conversation:

**Pricing pivot signal:** Pro conversion rate is below 12% of tutors with ≥ 8 active students after 90 days at scale. This suggests £29/month is not the right threshold or the value of Pro features is not being communicated. Test: reduce price to £19/month for a 60-day cohort or add a feature to the tier.

**Audience pivot signal:** Parent marketplace discovery (parents finding tutors organically via platform search, not via a tutor's own link) is below 10% of all bookings at Month 6. This means the platform is functioning as a booking tool for tutors, not as a marketplace. Response: accelerate SEO content targeting parent-intent keywords; consider a parent referral incentive.

**Channel pivot signal:** Any paid channel with tutor CAC above £35 after a minimum of £500 spend and 30-day optimisation window. Cut spend on that channel and reallocate.

**Retention pivot signal:** Tutor 90-day retention below 40% for two consecutive monthly cohorts. This is a product problem, not a marketing problem. Freeze growth spend and run a qualitative interview sprint with 10 churned tutors within 2 weeks of signal.

**North star pivot signal:** Weekly active hours plateau or decline for 3 consecutive weeks despite tutor count growing. This means tutors are signing up but not using the platform for sessions. Root cause is either a product friction in the session flow, a mismatch between tutor type being acquired and platform capability, or tutors using the profile as a lead page and conducting sessions off-platform. Investigate with session-start funnel analysis and direct tutor interviews.

---
