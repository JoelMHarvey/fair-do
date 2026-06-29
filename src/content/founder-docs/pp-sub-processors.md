> ⚠️ DRAFT v0.1 — for UK legal counsel review. NOT legal advice. Provider regions/terms must be verified against each provider's current DPA. Last updated: 25 June 2026

# Faresay Practice Portal — Sub-processor List

This document is **Annex 3** to the Data Processing Agreement (`pp-dpa.md`). It lists the third parties Faresay engages to Process Customer Personal Data, the purpose, the data involved, the hosting location, and the international-transfer safeguard where data leaves the UK/EEA.

Customers receive **at least 14 days' notice** before a new sub-processor is added (DPA Section 6). To subscribe to change notices: email to the address on the Customer's account; changes are also posted in-product.

> **Verify before reliance:** each provider's processing region and current data-processing terms must be confirmed at finalisation — providers change defaults and sub-processor terms over time. Where a US transfer applies, the safeguard is the **UK IDTA** or the **UK Addendum to the EU SCCs**, supported by a transfer risk assessment.

---

## Infrastructure sub-processors

| Sub-processor | Purpose | Data processed | Location | Transfer safeguard |
|---|---|---|---|---|
| **Neon** | Primary database hosting (Postgres) | All structured platform data | AWS **London (eu-west-2)** — UK/EEA *[verify]* | UK/EEA — none required |
| **Vercel** | Application hosting & serverless compute | Transient request data in processing | Global edge; US parent | UK Addendum / IDTA |

## Application sub-processors

| Sub-processor | Purpose | Data processed | Location | Transfer safeguard |
|---|---|---|---|---|
| **Clerk** | Authentication & identity | Account credentials, name, email | US *[verify]* | UK Addendum / IDTA |
| **Stripe** | Payment processing & subscriptions | Payment metadata; card data (tokenised by Stripe — not stored by Faresay) | Stripe Payments Europe (Ireland) + US | SCCs / UK Addendum |
| **Daily.co** | Video session hosting | Live audio/video session media (not stored by Faresay); display names | US *[verify]* | UK Addendum / IDTA |
| **Resend** | Transactional email (bookings, reminders, receipts) | Recipient email; message content (appointment details) | US *[verify]* | UK Addendum / IDTA |
| **Twilio** | SMS appointment reminders | Client mobile number; reminder text | US / Ireland *[verify]* | SCCs / UK Addendum |

## Analytics sub-processors

| Sub-processor | Purpose | Data processed | Location | Transfer safeguard |
|---|---|---|---|---|
| **Plausible Analytics** | Cookieless web analytics | Aggregate usage only — **no cookies, no personal data, no cross-site tracking** | **EU** (EU-hosted) *[verify]* | UK/EEA — none required |

---

## Notes

- **Card details** are never stored by Faresay — they are entered directly into Stripe's PCI-DSS-compliant systems and returned to Faresay only as a token.
- **Health data** is held in the primary database (Neon) and transmitted through the application and email/SMS sub-processors only to the extent the Customer's chosen features require (e.g. an appointment reminder contains the practitioner name and time, not clinical content).
- **Plausible** is used specifically because it is cookieless and processes no personal data, minimising Faresay's analytics footprint.

---

*Draft prepared to support a UK launch. Regions and transfer mechanisms to be confirmed by a data-protection solicitor before reliance.*
