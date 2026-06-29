// OutcomeScore model has been removed in the fair-do schema migration.
// This route is kept as a stub returning 410 Gone so existing clients degrade gracefully.

export async function POST() {
  return new Response('Outcome scores are not supported in this version.', { status: 410 })
}

export async function DELETE() {
  return new Response('Outcome scores are not supported in this version.', { status: 410 })
}
