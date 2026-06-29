// Send branded test emails to yourself: node --env-file=.env.local scripts/send-test-emails.mjs
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.RESEND_FROM ?? 'Faresay <onboarding@resend.dev>'
const TO = process.argv[2] ?? 'joelmharvey@gmail.com'
const APP = process.env.NEXT_PUBLIC_APP_URL ?? 'https://faresay.com'

function layout({ heading, body, cta, preheader }) {
  return `
<div style="background:#faf8f5;padding:24px 0;font-family:Helvetica,Arial,sans-serif">
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0">${preheader}</div>` : ''}
  <div style="max-width:560px;margin:0 auto">
    <div style="padding:6px 6px 16px">
      <span style="display:inline-block;width:16px;height:16px;border-radius:5px;background:#217567;vertical-align:middle;margin-right:8px"></span>
      <span style="font-family:Georgia,'Times New Roman',serif;font-size:20px;font-weight:bold;color:#1d5d53;vertical-align:middle">faresay</span>
    </div>
    <div style="background:#ffffff;border:1px solid #e8e1d5;border-radius:16px;padding:32px">
      <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:bold;color:#193e39;margin:0 0 14px">${heading}</h1>
      <div style="color:#665a4b;font-size:15px;line-height:1.6">${body}</div>
      ${cta ? `<div style="margin-top:26px"><a href="${cta.url}" style="display:inline-block;background:#217567;color:#ffffff;padding:12px 26px;border-radius:999px;text-decoration:none;font-weight:600;font-size:15px">${cta.label}</a></div>` : ''}
    </div>
    <div style="text-align:center;padding:18px 8px;color:#b8a78e;font-size:12px;line-height:1.6">
      <p style="margin:0 0 4px">Faresay · UK therapy, fairly priced</p>
      <p style="margin:0">Not a crisis service · in an emergency call 999 or Samaritans 116 123</p>
    </div>
  </div>
</div>`
}
const s = t => `<strong style="color:#2e2920">${t}</strong>`
const a = (t, u) => `<a href="${u}" style="color:#217567;text-decoration:underline">${t}</a>`
const date = 'Wednesday, 25 June 2026 at 14:00'

const emails = [
  { subject: '[TEST] Session confirmed — Priya Nair', html: layout({
    heading: "You're booked, Alex", preheader: 'Your session with Priya is confirmed.',
    body: `<p style="margin:0 0 4px">Therapist: ${s('Priya Nair')}</p><p style="margin:0 0 4px">When: ${s(date)}</p><p style="margin:0 0 14px">Paid: ${s('£35')}</p>
      <p style="margin:0 0 6px;color:#80705c;font-size:14px">The calendar invite is attached, and the video room opens 10 minutes before your session.</p>
      <p style="margin:0;color:#80705c;font-size:14px">Need to cancel? ${a('Manage your booking', '#')} — free up to 24 hours before.</p>`,
    cta: { label: 'View session', url: APP } }) },
  { subject: '[TEST] Reminder: your session tomorrow', html: layout({
    heading: 'See you soon, Alex', preheader: 'Your session with Priya is coming up.',
    body: `<p style="margin:0 0 4px">Your session with ${s('Priya Nair')} is on ${s(date)}.</p><p style="margin:0 0 14px;color:#80705c;font-size:14px">The room opens 10 minutes before.</p><p style="margin:0;color:#80705c;font-size:14px">Can't make it? ${a('Cancel here', '#')} — cancellations within 24 hours are non-refundable.</p>`,
    cta: { label: 'View session', url: APP } }) },
  { subject: '[TEST] Session cancelled — refunded', html: layout({
    heading: 'Session cancelled', preheader: 'Your session was cancelled.',
    body: `<p style="margin:0">Your session with ${s('Priya Nair')} on ${s(date)} has been cancelled.</p><p style="margin:14px 0 0;color:#217567">A full refund has been issued — card refunds appear in 5–10 business days; credit/voucher funds are back in your balance now.</p>`,
    cta: { label: 'Find another time', url: APP + '/therapists' } }) },
  { subject: '[TEST] About your session — no-show refund', html: layout({
    heading: 'Hi Alex,', preheader: 'An update about your recent session.',
    body: `<p style="margin:0">We're sorry — it looks like your therapist didn't join the session on ${s(date)}.</p><p style="margin:14px 0 0;color:#217567">A full refund has been issued — card refunds take 5–10 business days; credit/voucher funds are back in your balance now.</p>`,
    cta: { label: 'Book another session', url: APP + '/therapists' } }) },
  { subject: "[TEST] You've been gifted £50 of therapy", html: layout({
    heading: 'A gift for you', preheader: '£50 of therapy, on someone who cares.',
    body: `<p style="margin:0 0 16px">Someone wants you to feel better. Here's £50 of therapy credit, on them.</p>
      <blockquote style="border-left:3px solid #217567;padding-left:14px;color:#665a4b;font-style:italic;margin:0 0 16px">Thinking of you 💚</blockquote>
      <div style="background:#f0faf7;border:1px solid #b0e1d3;border-radius:14px;padding:20px;text-align:center;margin:0 0 4px"><p style="font-size:13px;color:#80705c;margin:0 0 6px">Voucher code</p><p style="font-size:24px;font-weight:bold;letter-spacing:2px;color:#1d5d53;margin:0;font-family:'Courier New',monospace">FARE-7K2M-9QPX</p></div>`,
    cta: { label: 'Redeem now', url: APP + '/redeem' } }) },
  { subject: '[TEST] You\'re approved — welcome to Faresay', html: layout({
    heading: 'Welcome to Faresay, Priya', preheader: 'Your profile is live.',
    body: `<p style="margin:0 0 10px">Your BACP credentials have been verified, and your profile is now live. Clients can book sessions with you.</p><p style="margin:0;color:#80705c;font-size:14px">As a founding therapist you keep <strong style="color:#217567">90%</strong> of every session. Payouts reach your bank 2 business days after each completed session.</p>`,
    cta: { label: 'Go to your dashboard', url: APP + '/therapist/dashboard' } }) },
]

for (const e of emails) {
  const r = await resend.emails.send({ from: FROM, to: TO, subject: e.subject, html: e.html })
  console.log(r.error ? `✗ ${e.subject}: ${JSON.stringify(r.error)}` : `✓ sent: ${e.subject}`)
  await new Promise(res => setTimeout(res, 800)) // Resend sandbox allows 2 req/sec
}
console.log(`\nDone → ${TO}`)
