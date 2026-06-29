import { describe, it, expect } from 'vitest'
import { refundPercentForCancellation } from '@/lib/cancellation'

describe('refundPercentForCancellation', () => {
  it('teacher cancellation is always a full refund', () => {
    expect(refundPercentForCancellation({ hoursUntil: 1, windowHours: 48, lateRefundPercent: 0, cancelledBy: 'teacher' })).toBe(100)
  })

  it('full refund when the student cancels at/after the window', () => {
    expect(refundPercentForCancellation({ hoursUntil: 48, windowHours: 48, lateRefundPercent: 50, cancelledBy: 'student' })).toBe(100)
    expect(refundPercentForCancellation({ hoursUntil: 100, windowHours: 24, lateRefundPercent: 0, cancelledBy: 'student' })).toBe(100)
  })

  it('late student cancellation gets the configured percentage', () => {
    expect(refundPercentForCancellation({ hoursUntil: 5, windowHours: 24, lateRefundPercent: 50, cancelledBy: 'student' })).toBe(50)
    expect(refundPercentForCancellation({ hoursUntil: 5, windowHours: 24, lateRefundPercent: 0, cancelledBy: 'student' })).toBe(0)
  })

  it('clamps an out-of-range percentage', () => {
    expect(refundPercentForCancellation({ hoursUntil: 1, windowHours: 24, lateRefundPercent: 150, cancelledBy: 'student' })).toBe(100)
    expect(refundPercentForCancellation({ hoursUntil: 1, windowHours: 24, lateRefundPercent: -10, cancelledBy: 'student' })).toBe(0)
  })
})
