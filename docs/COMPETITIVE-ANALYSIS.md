# Competitive Analysis — fair-do vs UK Tutoring Platforms

*Last updated: June 2026*

---

## Market context

The global online tutoring market is projected to reach **$427.6 billion by 2029** (CAGR ~22%). The UK private tutoring market is estimated at £6–8 billion annually. Key structural shifts in 2025–26: MyTutor was acquired by US edtech giant **IXL Learning** (May 2025), GoStudent lost its unicorn status after a revaluation below $1B (Nov 2025), and AI-native tutoring tools are emerging as a new category. The incumbents are bloated, commission-heavy, and technically conservative — a genuine opening for a leaner, fairer platform.

---

## Competitor profiles

### Tutorful

| | |
|---|---|
| **Founded** | 2015, Sheffield |
| **Size** | ~20 employees |
| **Funding** | $15.8M raised |
| **Revenue** | Not disclosed (est. sub-£5M) |
| **Tutors** | ~6,000 listed |
| **Tech stack** | Ruby on Rails · React · PostgreSQL · AWS · Stripe |
| **Classroom** | Own basic online whiteboard |

**Fee model:** 0% commission to tutors — but students pay a **35% service fee** on top of the tutor's hourly rate. A tutor charging £30/hr means the student pays **£40.50/hr**. Tutors keep their full rate; students carry all the platform overhead invisibly baked into the final price.

**Lesson planning:** No platform tools. Tutors are told to check the exam spec, identify the student's target grade, and bring their own worksheets. Entirely DIY.

**Strengths:** Largest UK marketplace brand awareness; tutors love the 0% commission narrative; large tutor supply pool.

**Weaknesses:** Students pay 35% more than the tutor's rate; no AI features; small engineering team limits product velocity; basic classroom.

---

### MyTutor

| | |
|---|---|
| **Founded** | 2013, London |
| **Size** | ~250 employees (post-IXL acquisition) |
| **Funding** | $45.4M raised; acquired by IXL Learning May 2025 |
| **Revenue** | Not disclosed (est. £10–20M pre-acquisition) |
| **Students** | 200,000+ bookings; 1,300+ school partnerships |
| **Tech stack** | Node.js · React/Next.js · AWS · MongoDB · Stripe |
| **Classroom** | Interactive whiteboard · document upload · video library · voice chat |

**Fee model:** Takes **~40% commission** from tutors (tutors retain ~52–60% of the lesson fee, plus VAT applies on the platform fee). No subscription; students pay a per-lesson charge.

**Lesson planning:** Whiteboard + document upload inside the lesson. Schools get a management panel for uploading student groups via CSV and assigning tutors. No AI lesson planning; tutors bring their own materials.

**Strengths:** Deep UK school penetration (1,300+ schools); now backed by IXL Learning's US resources and product library; strong brand with GCSE/A-level parents; richer classroom than Tutorful.

**Weaknesses:** Very high commission (tutors hate it); IXL acquisition risks brand dilution and US-centric product priorities; no AI tooling; complex school contracting slows growth.

---

### Superprof

| | |
|---|---|
| **Founded** | 2013, Paris |
| **Size** | ~9,200 employees globally |
| **Revenue** | Est. $25–250M (wide range across sources) |
| **Tutors** | 10M+ listed globally (very low quality bar) |
| **Tech stack** | PHP/Laravel · React · MySQL · Cloudflare CDN |
| **Classroom** | Tutors arrange their own (external tools) |

**Fee model for students:** **£39/month Student Pass** subscription to contact tutors. **Tutors:** 0% if payment arranged direct; 10% if using platform payments; or pay ~$99/yr Premium pass to avoid the 10%.

**Lesson planning:** None. Purely a directory — students find tutors and all lesson management happens off-platform via WhatsApp, Zoom, etc.

**Strengths:** Massive global directory; brand recognition; zero barrier for tutors to list.

**Weaknesses:** No quality control (10M listed, almost no vetting); no integrated classroom, payments, or scheduling; students pay a monthly fee even if lessons are infrequent; platform has almost no product depth.

---

### Tutor Hunt

| | |
|---|---|
| **Founded** | 2004, UK |
| **Size** | Small (~10 employees, est.) |
| **Revenue** | Not disclosed |
| **Tutors** | Large UK directory, unvetted |
| **Tech stack** | PHP · jQuery · MySQL (legacy stack) |
| **Classroom** | None (contact-and-arrange model) |

**Fee model:** Takes **25–33% commission** per lesson; displayed rates include the fee so students can't see the split. Tutors receive 67–75% of the listed price.

**Lesson planning:** None. Contact-and-arrange model only.

**Strengths:** Long-established; large SEO footprint; free to join for tutors.

**Weaknesses:** Very high commission; outdated platform; no classroom; no quality vetting; a legacy directory masquerading as a platform.

---

### Spires

| | |
|---|---|
| **Founded** | 2016 |
| **Size** | ~15 employees |
| **Revenue** | Not disclosed (est. sub-£3M) |
| **Tutors** | ~1,000 (top 4–5% acceptance rate) |
| **Students** | ~9,000 across 120 countries |
| **Tech stack** | Python/ML · React · BitPaper whiteboard (third-party) · custom auction engine |
| **Classroom** | BitPaper collaborative whiteboard · screen share · automatic lesson recording · file sharing |

**Fee model:** **5% fee** when tutor brings their own student via a unique referral URL; standard **35% fee** on marketplace bookings, dropping by 1% per 5 hours completed on the same job, to a floor of **20%**. Tutors pay no upfront cost.

**Lesson planning:** No platform tools. Tutors bring their own materials. BitPaper whiteboard used during lessons for drawing/annotation. Sessions recorded automatically for student replay.

**Strengths:** Highest classroom quality in the market (whiteboard + recording); very selective tutor vetting (DBS, 2+ yrs experience, top 4–5% accepted); ML-driven matching; 400+ subjects; 81% of students report a grade uplift; 4.97/5 average lesson rating.

**Weaknesses:** Expensive for marketplace bookings (35% is eye-watering); niche/premium positioning limits tutor supply; small team means slow feature development; no lesson planning tools; no parent portal; no AI features; primarily university/higher-ed focused.

---

### GoStudent

| | |
|---|---|
| **Founded** | 2017, Vienna |
| **Size** | ~2,700 employees |
| **Funding** | $779M raised; valued at ~$3.5B (now below $1B after Nov 2025 revaluation) |
| **Revenue** | Est. $338M (2026) |
| **Tutors** | 20,000+ self-employed globally |
| **Students** | 1.5M+ sessions/month in 23 countries |
| **Tech stack** | React Native (mobile) · Node.js/Go (backend) · AWS · Stripe |
| **Classroom** | Proprietary virtual classroom · screen sharing · digital quizzing · lesson recording |

**Fee model:** Students buy lesson packages on **subscription** (£21.99–£30.49/lesson depending on package size). No per-lesson flexibility; monthly commitment required.

**Lesson planning:** "Personalised learning plan" created by GoStudent ops staff at the start of each engagement. Not automated; not tutor-driven. Tutors follow the plan set by the platform.

**Strengths:** Largest funded player in the market; mobile-first (React Native iOS/Android); schools channel; structured learning plans; subscription model creates predictable revenue; DBS checks; lesson recording.

**Weaknesses:** Post-revaluation financial pressure — in decline; monthly subscription commitment is a barrier; tutors are effectively platform employees in disguise (no real autonomy); very expensive ops overhead; US/EU-centric product; personalised plans aren't truly personalised (ops-created).

---

## Head-to-head feature comparison

| Feature | Tutorful | MyTutor | Superprof | Tutor Hunt | Spires | GoStudent | **fair-do** |
|---|---|---|---|---|---|---|---|
| Commission on marketplace bookings | 0% (tutor) / 35% (student) | 40% | 10% | 25–33% | 20–35% | Subscription | **10%** |
| Commission on tutor's own students | n/a | 40% | 0% direct | 25–33% | 5% | n/a | **0%** |
| Student subscription required | No | No | £39/mo | No | No | Yes | **No** |
| Tutor subscription | No | No | ~$99/yr optional | No | No | n/a | **Free £0 · Pro £29 · School £79** |
| Integrated video classroom | Basic | Yes | No | No | Yes | Yes | **Yes (Daily.co)** |
| Collaborative whiteboard | Basic | Yes | No | No | Yes (BitPaper) | Yes | **Yes ✅ (Excalidraw, behind flag)** |
| Lesson recording | No | No | No | No | Yes | Yes | **⬜ Planned (Phase 17.2)** |
| AI lesson plan generation | No | No | No | No | No | No | **⬜ Planned (Phase 16.1) — biggest gap** |
| AI post-session summary | No | No | No | No | No | No | **Yes ✅ (Claude Haiku, behind flag)** |
| AI study assistant (between lessons) | No | No | No | No | No | No | **⬜ Planned (Phase 16.4)** |
| Lesson materials library | No | No | No | No | No | No | **Yes ✅ (ResourceLibrary, behind flag)** |
| Parent portal | No | No | No | No | No | No | **Yes ✅ (behind flag, £4.99/mo)** |
| Progress tracking / goal setting | No | No | No | No | No | Basic (ops-set) | **⬜ Planned (Phase 18.3–18.4)** |
| Curriculum spec alignment | No | No | No | No | No | No | **⬜ Planned (Phase 19)** |
| Group lessons | No | No | No | No | No | No | **Yes ✅** |
| Gift vouchers | No | No | No | No | No | No | **Yes ✅** |
| Referral programme (dual-sided) | No | No | No | No | No | No | **Yes ✅** |
| Schools / B2B channel | No | Yes | No | No | No | Yes | **Yes ✅** |
| Trial lesson money-back guarantee | Implicit | No | No | No | No | No | **⬜ Planned (Phase 20)** |
| Lesson packages / bundles | No | No | No | No | No | Yes | **⬜ Planned (Phase 20)** |
| Mobile app | No | No | No | No | No | Yes (iOS/Android) | **⬜ In spec (Phase 20)** |
| Intro / discounted first lesson | No | No | No | No | No | No | **Yes ✅** |
| Founding-tutor programme | No | No | No | No | No | No | **Yes ✅** |
| Tutor accreditation badge | No | No | No | No | Yes (selective vetting) | No | **⬜ Fast-track (Phase 20)** |
| Tutor DBS / credential verification | Voluntary | Yes | No | No | Yes (mandatory) | Yes | **Yes ✅** |
| Safeguarding framework | Basic | Yes | No | No | Yes | Yes | **Yes ✅** |
| GDPR-compliant EU hosting | Yes | Yes | Partial | Unknown | Yes | Yes | **Yes ✅** |

---

## How competitors handle lesson plans and teaching materials

This is the biggest gap in the market — and fair-do's clearest opportunity.

### The current state of play

**Tutorful:** No platform tools whatsoever. Their own guide tells tutors to "check the exact exam specification the student is sitting, find out their target grade, and ask the student to identify the topics they wish to cover." Completely DIY. Tutors manage materials via Google Docs, PDFs emailed to students, and whatever they've built personally over years.

**MyTutor:** Has a whiteboard and document upload inside the lesson room, and a video library students can access between sessions. No lesson planning assistance. School admins upload student groups via CSV. Tutors bring their own materials; the platform provides zero planning support.

**Spires:** BitPaper whiteboard in-session for drawing/annotation. Sessions recorded so students can replay them. No lesson planning tools; no materials library. Tutors bring their own resources.

**GoStudent:** Claims "personalised learning plans" — but these are created by GoStudent's operations staff at the start of each engagement, not by tutors or AI. Tutors then follow the plan. This is a good concept, poorly executed: it's manual, slow, and the tutor has little ownership of the plan.

**Superprof / Tutor Hunt:** No tools at all. Purely contact-and-arrange models.

### The burden on tutors today

Without platform support, a tutor preparing for a new GCSE Maths student must:
1. Identify the correct exam board spec (AQA, Edexcel, OCR, WJEC)
2. Understand the student's current level and gaps (usually via a diagnostic they set themselves)
3. Plan a lesson sequence covering the full spec before the exam date
4. Create or source worksheets, practice questions, and worked examples
5. Track what's been covered across sessions (usually in a personal spreadsheet)
6. Write post-lesson notes to share with the student or parent

This takes experienced tutors 30–60 minutes of unpaid preparation per new student. For newer tutors, it's often 2–3 hours. It's the single biggest complaint in the tutoring community — and the single biggest barrier to taking on more students.

### The fair-do opportunity

fair-do has `@anthropic-ai/sdk` already in the stack. Using Claude, fair-do can:

- **Generate a lesson plan in under 30 seconds** given: subject, level, exam board, target grade, exam date, and topics to cover. No competitor offers this. It eliminates 60–90% of prep time for new students.
- **Build a shareable materials library** where tutors upload worksheets they've created. Over time, the best materials bubble up via ratings. Creates a network effect — more tutors → better library.
- **Auto-summarise each session** using tutor notes as input. Three bullets on what was covered, two homework tasks, one thing the student is struggling with. Emailed to student and parent within minutes of the session ending. No competitor does this.
- **Tag everything to the exam spec** — AQA, Edexcel, OCR. Students see which topics they've covered, which they haven't, and what's coming next. Creates deep switching costs.

---

## Where fair-do already leads

1. **Fairest economics in the UK market.** 0% on direct students beats everyone, including Spires's 5%. Students pay the tutor's posted rate — no hidden 35% service fee like Tutorful.
2. **Group lessons.** Unique in the market. Tutors set a group rate; students book seats.
3. **Gift vouchers.** No competitor offers gift purchasing for tutoring.
4. **Double-sided referral programme.** £25 tutor / £10 student — no competitor does both.
5. **Schools B2B channel.** Org portal, email-domain auto-enrol, credit pools, CSV export. On par with GoStudent's schools channel at a fraction of their overhead.
6. **Founding-tutor programme.** Smart early-adopter incentive that locks in quality tutors before launch.
7. **Intro / discounted first lesson.** Tutor-set discount on the first booking per student. No competitor offers this natively.
8. **Tutor rate transparency.** Live percentile bar on the profile editor ("cheaper than X% of tutors"). Unique trust signal.
9. **Credential audit trail.** Every approve/reject is immutable and admin-stamped. Stronger than most platforms' informal processes.
10. **Safeguarding as a first-class feature.** /help page, dedicated safeguarding notice in onboarding, complaints queue with safeguarding category. Better than all except MyTutor.

---

## What to build to surpass the competition (prioritised)

See PROJECT.md Phases 16–20 for the full implementation plan.

**Already built, needs enabling (flip env var):**

| Feature | Env var to enable | Tier gate |
|---|---|---|
| AI post-session summary (Claude Haiku) | `AI_NOTES_ENABLED=true` + `ANTHROPIC_API_KEY` | Pro / School |
| Excalidraw collaborative whiteboard | `WHITEBOARD_ENABLED=true` | None (all) |
| Worksheet / file sharing per student | `RESOURCES_ENABLED=true` | None (all) |
| Parent portal (£4.99/mo) | `PARENT_PORTAL_ENABLED=true` | Pro / School teacher |
| Recurring weekly lessons | `RECURRING_ENABLED=true` | None (all) |

**Still to build (true gaps):**

| Priority | Feature | Beats | Effort |
|---|---|---|---|
| 1 | **AI lesson plan generator** (Phase 16.1) | All platforms — nobody has this | Low (SDK in stack) |
| 2 | Lesson recording via Daily.co API (Phase 17.2) | Tutorful, MyTutor, Superprof, Tutor Hunt | Medium |
| 3 | Goal setting per student (Phase 18.3) | All platforms | Low |
| 4 | Progress graph (Phase 18.4) | All platforms | Medium |
| 5 | AI study assistant between lessons (Phase 16.4) | All platforms | Medium |
| 6 | Curriculum spec alignment / syllabus heatmap (Phase 19) | All platforms | High |
| 7 | Trial lesson money-back guarantee (Phase 20.2) | Most platforms | None (policy only) |
| 8 | Tutors' Association accreditation (Phase 20.3) | Tutorful, GoStudent | None (partnership) |
| 9 | Mobile app (Phase 20.4) | Tutorful, MyTutor, Superprof, Spires | High |

---

*Sources: [Tutorful support](https://support.tutorful.co.uk/hc/en-us/articles/10287751640978-What-is-the-service-fee-and-what-do-you-use-it-for) · [MyTutor payments](https://www.mytutor.co.uk/tutors/tutor-payment-details/) · [Spires fees](https://help.spires.co/en/articles/4122827-platform-fees) · [GoStudent UK prices](https://www.gostudent.org/en-gb/prices/) · [Superprof charges](https://www.superprof.com/blog/charges-payments-superprof/) · [PMT Education comparison](https://www.pmt.education/blog/tutors/tutoring-platform-fees-and-commissions-explained/) · [MyTutor funding (Tracxn)](https://tracxn.com/d/companies/mytutor/__MXpdEKBYEtd6Q282SmQHkH96893ek4C1m4On35WRXaQ) · [GoStudent valuation (Compworth)](https://compworth.com/company/gostudent)*
