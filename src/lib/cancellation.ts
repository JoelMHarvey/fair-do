// Configurable cancellation policy (P2-6). Decide what fraction of a lesson is
// refunded when it's cancelled. A teacher cancellation is always a full refund
// (never penalise the student for the teacher's change). A student cancellation
// is full if at least `windowHours` ahead, otherwise `lateRefundPercent`.
export function refundPercentForCancellation(opts: {
  hoursUntil: number
  windowHours: number
  lateRefundPercent: number
  cancelledBy: 'student' | 'teacher'
}): number {
  if (opts.cancelledBy === 'teacher') return 100
  return opts.hoursUntil >= opts.windowHours ? 100 : Math.max(0, Math.min(100, opts.lateRefundPercent))
}
