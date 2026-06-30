/**
 * P3 — DTO schema round-trip tests
 *
 * Each DTO file exports a zod schema that validates the shape of an API
 * response. These tests confirm:
 *  1. A representative valid payload parses without throwing.
 *  2. Representative malformed payloads are rejected (safeParse fails).
 *
 * No DB, no network, no React Native — pure zod.
 */
import { describe, it, expect } from 'vitest'

import { DashboardSchema, SessionSummarySchema, AlertSchema } from './dashboard'
import { ClientsResponseSchema, ClientSummarySchema } from './clients'
import { ClientDetailSchema } from './client-detail'
import { CalendarResponseSchema, CalendarSessionSchema } from './calendar'
import { EarningsResponseSchema } from './earnings'
import { ThreadsResponseSchema, ThreadDetailSchema, MessageSchema } from './messages'
import { AvailabilityResponseSchema, AvailabilityWindowSchema } from './availability'
import { SessionRoomSchema } from './session-room'
import { ProfileResponseSchema } from './profile'

// ── Helpers ──────────────────────────────────────────────────────────────────

function rejects<T>(schema: { safeParse: (v: unknown) => { success: boolean } }, value: unknown) {
  return !schema.safeParse(value).success
}

// ── SessionSummary ────────────────────────────────────────────────────────────

const SESSION_SUMMARY = {
  id: 'sess_1',
  clientFirstName: 'Alice',
  clientLastName: 'Jones',
  clientId: 'client_1',
  scheduledAt: '2025-09-01T10:00:00.000Z',
  durationMins: 50,
  status: 'SCHEDULED',
  dailyRoomUrl: 'https://fair-do.daily.co/room-abc',
  isJoinable: false,
}

describe('SessionSummarySchema', () => {
  it('parses valid payload', () => {
    expect(SessionSummarySchema.parse(SESSION_SUMMARY)).toMatchObject({ id: 'sess_1' })
  })
  it('accepts null dailyRoomUrl', () => {
    expect(SessionSummarySchema.parse({ ...SESSION_SUMMARY, dailyRoomUrl: null }).dailyRoomUrl).toBeNull()
  })
  it('rejects missing clientFirstName', () => {
    const { clientFirstName: _, ...rest } = SESSION_SUMMARY
    expect(rejects(SessionSummarySchema, rest)).toBe(true)
  })
  it('rejects non-boolean isJoinable', () => {
    expect(rejects(SessionSummarySchema, { ...SESSION_SUMMARY, isJoinable: 'yes' })).toBe(true)
  })
})

// ── Alert ─────────────────────────────────────────────────────────────────────

describe('AlertSchema', () => {
  it('parses warning alert', () => {
    const a = AlertSchema.parse({ type: 'credential_expiry', severity: 'warning', message: 'Expires soon', daysUntil: 10 })
    expect(a.severity).toBe('warning')
  })
  it('parses critical alert with null daysUntil', () => {
    const a = AlertSchema.parse({ type: 'suspended', severity: 'critical', message: 'Suspended', daysUntil: null })
    expect(a.daysUntil).toBeNull()
  })
  it('rejects unknown severity', () => {
    expect(rejects(AlertSchema, { type: 'x', severity: 'info', message: 'x', daysUntil: null })).toBe(true)
  })
})

// ── Dashboard ─────────────────────────────────────────────────────────────────

const DASHBOARD_PAYLOAD = {
  teacher: {
    id: 'ther_1',
    firstName: 'Bob',
    lastName: 'Smith',
    status: 'ACTIVE',
    profileImageUrl: null,
    stripeOnboarded: true,
    registrationBody: 'BACP',
    sessionRatePence: 8000,
  },
  todaySessions: [SESSION_SUMMARY],
  upcomingSessions: [],
  earnings: { monthTotalPence: 16000, monthSessionCount: 2 },
  activeClientCount: 5,
  unreadMessageCount: 1,
  alerts: [],
}

describe('DashboardSchema', () => {
  it('parses full payload', () => {
    const d = DashboardSchema.parse(DASHBOARD_PAYLOAD)
    expect(d.teacher.firstName).toBe('Bob')
    expect(d.earnings.monthTotalPence).toBe(16000)
  })
  it('parses with alerts array', () => {
    const d = DashboardSchema.parse({
      ...DASHBOARD_PAYLOAD,
      alerts: [{ type: 'x', severity: 'warning', message: 'msg', daysUntil: 5 }],
    })
    expect(d.alerts).toHaveLength(1)
  })
  it('rejects invalid teacher status', () => {
    const bad = { ...DASHBOARD_PAYLOAD, teacher: { ...DASHBOARD_PAYLOAD.teacher, status: 'DISABLED' } }
    expect(rejects(DashboardSchema, bad)).toBe(true)
  })
  it('rejects missing earnings field', () => {
    const { earnings: _, ...rest } = DASHBOARD_PAYLOAD
    expect(rejects(DashboardSchema, rest)).toBe(true)
  })
})

// ── Clients ───────────────────────────────────────────────────────────────────

const CLIENT_SUMMARY = {
  matchId: 'match_1',
  clientId: 'client_1',
  firstName: 'Carol',
  lastName: 'White',
  contactEmail: 'carol@example.com',
  customRatePence: null,
  source: 'direct',
  startedAt: '2025-01-01T00:00:00.000Z',
  nextSession: {
    id: 'sess_2',
    scheduledAt: '2025-10-01T09:00:00.000Z',
    status: 'SCHEDULED',
  },
  totalSessions: 4,
  pendingForms: 0,
  unreadMessages: 2,
}

describe('ClientSummarySchema', () => {
  it('parses with nextSession', () => {
    const c = ClientSummarySchema.parse(CLIENT_SUMMARY)
    expect(c.matchId).toBe('match_1')
    expect(c.nextSession?.id).toBe('sess_2')
  })
  it('parses with null nextSession', () => {
    const c = ClientSummarySchema.parse({ ...CLIENT_SUMMARY, nextSession: null })
    expect(c.nextSession).toBeNull()
  })
  it('rejects non-number unreadMessages', () => {
    expect(rejects(ClientSummarySchema, { ...CLIENT_SUMMARY, unreadMessages: '2' })).toBe(true)
  })
})

describe('ClientsResponseSchema', () => {
  it('parses empty list', () => {
    const r = ClientsResponseSchema.parse({ clients: [] })
    expect(r.clients).toHaveLength(0)
  })
  it('parses populated list', () => {
    const r = ClientsResponseSchema.parse({ clients: [CLIENT_SUMMARY] })
    expect(r.clients[0].firstName).toBe('Carol')
  })
  it('rejects missing clients key', () => {
    expect(rejects(ClientsResponseSchema, {})).toBe(true)
  })
})

// ── ClientDetail ──────────────────────────────────────────────────────────────

const CLIENT_DETAIL = {
  matchId: 'match_1',
  customRatePence: null,
  source: 'direct',
  notes: null,
  startedAt: '2025-01-01T00:00:00.000Z',
  active: true,
  client: {
    id: 'client_1',
    firstName: 'Carol',
    lastName: 'White',
    contactEmail: 'carol@example.com',
    phone: null,
    dateOfBirth: null,
    consentGiven: true,
    consentDate: '2025-01-01T00:00:00.000Z',
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  upcomingSessions: [],
  pastSessions: [],
  documents: [],
  outcomeScores: [],
  forms: [],
}

describe('ClientDetailSchema', () => {
  it('parses minimal valid payload', () => {
    const d = ClientDetailSchema.parse(CLIENT_DETAIL)
    expect(d.client.firstName).toBe('Carol')
  })
  it('parses past session with payment', () => {
    const pastSession = {
      id: 'sess_old',
      scheduledAt: '2025-05-01T10:00:00.000Z',
      durationMins: 50,
      status: 'COMPLETED',
      dailyRoomUrl: null,
      payment: { amountTotalPence: 8000, teacherPayoutPence: 7800, status: 'paid' },
    }
    const d = ClientDetailSchema.parse({ ...CLIENT_DETAIL, pastSessions: [pastSession] })
    expect(d.pastSessions[0].payment?.amountTotalPence).toBe(8000)
  })
  it('parses past session with null payment', () => {
    const pastSession = {
      id: 'sess_old',
      scheduledAt: '2025-05-01T10:00:00.000Z',
      durationMins: 50,
      status: 'NO_SHOW',
      dailyRoomUrl: null,
      payment: null,
    }
    const d = ClientDetailSchema.parse({ ...CLIENT_DETAIL, pastSessions: [pastSession] })
    expect(d.pastSessions[0].payment).toBeNull()
  })
  it('rejects missing active field', () => {
    const { active: _, ...rest } = CLIENT_DETAIL
    expect(rejects(ClientDetailSchema, rest)).toBe(true)
  })
})

// ── Calendar ──────────────────────────────────────────────────────────────────

const CALENDAR_SESSION = {
  id: 'sess_3',
  clientId: 'client_1',
  clientFirstName: 'Dave',
  clientLastName: 'Brown',
  matchId: 'match_2',
  scheduledAt: '2025-09-15T14:00:00.000Z',
  durationMins: 50,
  status: 'SCHEDULED',
  dailyRoomUrl: null,
  isJoinable: false,
}

describe('CalendarResponseSchema', () => {
  it('parses with sessions', () => {
    const r = CalendarResponseSchema.parse({
      from: '2025-09-01T00:00:00.000Z',
      to: '2025-09-30T23:59:59.000Z',
      sessions: [CALENDAR_SESSION],
    })
    expect(r.sessions).toHaveLength(1)
    expect(r.sessions[0].clientFirstName).toBe('Dave')
  })
  it('parses empty sessions', () => {
    const r = CalendarResponseSchema.parse({
      from: '2025-09-01T00:00:00.000Z',
      to: '2025-09-30T23:59:59.000Z',
      sessions: [],
    })
    expect(r.sessions).toHaveLength(0)
  })
  it('rejects missing from field', () => {
    expect(rejects(CalendarResponseSchema, { to: 'x', sessions: [] })).toBe(true)
  })
})

// ── Earnings ──────────────────────────────────────────────────────────────────

const EARNINGS_PAYLOAD = {
  currencySymbol: '£',
  monthTotalPence: 24000,
  allTimeTotalPence: 120000,
  payments: [
    {
      id: 'pay_1',
      amountTotalPence: 8000,
      teacherPayoutPence: 7800,
      platformFeePence: 200,
      currency: 'gbp',
      createdAt: '2025-09-01T12:00:00.000Z',
      clientFirstName: 'Alice',
      clientLastName: 'Jones',
      sessionScheduledAt: '2025-09-01T10:00:00.000Z',
    },
  ],
}

describe('EarningsResponseSchema', () => {
  it('parses full payload', () => {
    const e = EarningsResponseSchema.parse(EARNINGS_PAYLOAD)
    expect(e.payments[0].teacherPayoutPence).toBe(7800)
  })
  it('parses payment with null sessionScheduledAt', () => {
    const payment = { ...EARNINGS_PAYLOAD.payments[0], sessionScheduledAt: null }
    const e = EarningsResponseSchema.parse({ ...EARNINGS_PAYLOAD, payments: [payment] })
    expect(e.payments[0].sessionScheduledAt).toBeNull()
  })
  it('parses empty payments array', () => {
    const e = EarningsResponseSchema.parse({ ...EARNINGS_PAYLOAD, payments: [] })
    expect(e.payments).toHaveLength(0)
  })
  it('rejects missing currencySymbol', () => {
    const { currencySymbol: _, ...rest } = EARNINGS_PAYLOAD
    expect(rejects(EarningsResponseSchema, rest)).toBe(true)
  })
})

// ── Messages ──────────────────────────────────────────────────────────────────

const MESSAGE = {
  id: 'msg_1',
  body: 'Hello',
  fileUrl: null,
  senderClerkId: 'clerk_123',
  isFromTeacher: true,
  createdAt: '2025-09-01T11:00:00.000Z',
}

const THREAD_DETAIL = {
  id: 'thread_1',
  matchId: 'match_1',
  client: { id: 'client_1', firstName: 'Carol', lastName: 'White' },
  currentClerkId: 'clerk_456',
  messages: [MESSAGE],
}

describe('MessageSchema', () => {
  it('parses valid message', () => {
    const m = MessageSchema.parse(MESSAGE)
    expect(m.body).toBe('Hello')
  })
  it('parses message with fileUrl', () => {
    const m = MessageSchema.parse({ ...MESSAGE, fileUrl: 'https://cdn.example.com/file.pdf' })
    expect(m.fileUrl).toBe('https://cdn.example.com/file.pdf')
  })
  it('rejects missing isFromTeacher', () => {
    const { isFromTeacher: _, ...rest } = MESSAGE
    expect(rejects(MessageSchema, rest)).toBe(true)
  })
})

describe('ThreadDetailSchema', () => {
  it('parses thread with messages', () => {
    const t = ThreadDetailSchema.parse(THREAD_DETAIL)
    expect(t.messages).toHaveLength(1)
    expect(t.currentClerkId).toBe('clerk_456')
  })
  it('parses thread with empty messages', () => {
    const t = ThreadDetailSchema.parse({ ...THREAD_DETAIL, messages: [] })
    expect(t.messages).toHaveLength(0)
  })
  it('rejects missing client', () => {
    const { client: _, ...rest } = THREAD_DETAIL
    expect(rejects(ThreadDetailSchema, rest)).toBe(true)
  })
})

// ── Availability ──────────────────────────────────────────────────────────────

const AVAIL_WINDOW = {
  id: 'avail_1',
  dayOfWeek: 1, // Monday
  startTime: '09:00',
  endTime: '17:00',
  timezone: 'Europe/London',
}

describe('AvailabilityWindowSchema', () => {
  it('parses valid window', () => {
    const w = AvailabilityWindowSchema.parse(AVAIL_WINDOW)
    expect(w.dayOfWeek).toBe(1)
  })
  it('rejects dayOfWeek < 0', () => {
    expect(rejects(AvailabilityWindowSchema, { ...AVAIL_WINDOW, dayOfWeek: -1 })).toBe(true)
  })
  it('rejects dayOfWeek > 6', () => {
    expect(rejects(AvailabilityWindowSchema, { ...AVAIL_WINDOW, dayOfWeek: 7 })).toBe(true)
  })
  it('rejects non-integer dayOfWeek', () => {
    expect(rejects(AvailabilityWindowSchema, { ...AVAIL_WINDOW, dayOfWeek: 1.5 })).toBe(true)
  })
  it('rejects all 7 days 0–6 pass', () => {
    for (let d = 0; d <= 6; d++) {
      expect(AvailabilityWindowSchema.safeParse({ ...AVAIL_WINDOW, dayOfWeek: d }).success).toBe(true)
    }
  })
})

describe('AvailabilityResponseSchema', () => {
  it('parses response with windows', () => {
    const r = AvailabilityResponseSchema.parse({ availability: [AVAIL_WINDOW], timezone: 'Europe/London' })
    expect(r.availability).toHaveLength(1)
    expect(r.timezone).toBe('Europe/London')
  })
  it('parses empty availability', () => {
    const r = AvailabilityResponseSchema.parse({ availability: [], timezone: 'Europe/London' })
    expect(r.availability).toHaveLength(0)
  })
  it('rejects missing timezone', () => {
    expect(rejects(AvailabilityResponseSchema, { availability: [] })).toBe(true)
  })
})

// ── SessionRoom ───────────────────────────────────────────────────────────────

const SESSION_ROOM = {
  sessionId: 'sess_4',
  roomUrl: 'https://fair-do.daily.co/room-xyz',
  meetingToken: 'eyJ...',
  clientFirstName: 'Eve',
  clientLastName: 'Taylor',
  scheduledAt: '2025-09-10T15:00:00.000Z',
}

describe('SessionRoomSchema', () => {
  it('parses valid payload', () => {
    const r = SessionRoomSchema.parse(SESSION_ROOM)
    expect(r.sessionId).toBe('sess_4')
  })
  it('parses null meetingToken (not yet live)', () => {
    const r = SessionRoomSchema.parse({ ...SESSION_ROOM, meetingToken: null })
    expect(r.meetingToken).toBeNull()
  })
  it('rejects missing roomUrl', () => {
    const { roomUrl: _, ...rest } = SESSION_ROOM
    expect(rejects(SessionRoomSchema, rest)).toBe(true)
  })
})

// ── Profile ───────────────────────────────────────────────────────────────────

const PROFILE = {
  id: 'ther_1',
  firstName: 'Bob',
  lastName: 'Smith',
  professionalTitle: 'Psychoteacher',
  bio: 'I am a teacher.',
  tagline: null,
  profileImageUrl: null,
  registrationBody: 'BACP',
  registrationNumber: '12345',
  registrationExpiry: '2026-01-01T00:00:00.000Z',
  insuranceProvider: null,
  insuranceExpiry: null,
  credentialVerified: true,
  stripeOnboarded: true,
  status: 'ACTIVE',
  sessionRatePence: 8000,
  introRatePence: null,
  availableForNew: true,
  specialisms: ['Anxiety', 'Depression'],
  approachTags: ['CBT'],
  languages: ['en'],
  websiteUrl: null,
  country: 'GB',
  practiceName: null,
  practiceSlug: null,
}

describe('ProfileResponseSchema', () => {
  it('parses valid profile', () => {
    const p = ProfileResponseSchema.parse(PROFILE)
    expect(p.registrationBody).toBe('BACP')
    expect(p.specialisms).toEqual(['Anxiety', 'Depression'])
  })
  it('accepts PENDING and SUSPENDED status', () => {
    for (const status of ['PENDING', 'SUSPENDED'] as const) {
      expect(ProfileResponseSchema.safeParse({ ...PROFILE, status }).success).toBe(true)
    }
  })
  it('rejects unknown status', () => {
    expect(rejects(ProfileResponseSchema, { ...PROFILE, status: 'DISABLED' })).toBe(true)
  })
  it('rejects non-array specialisms', () => {
    expect(rejects(ProfileResponseSchema, { ...PROFILE, specialisms: 'Anxiety' })).toBe(true)
  })
  it('rejects missing country', () => {
    const { country: _, ...rest } = PROFILE
    expect(rejects(ProfileResponseSchema, rest)).toBe(true)
  })
})
