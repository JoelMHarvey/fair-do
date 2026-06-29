// Serialize an object as JSON-LD safe to embed in a <script type="application/ld+json">
// block. JSON.stringify alone leaves `</script>` intact, so user-controlled fields
// (e.g. a therapist bio) could break out of the script tag — stored XSS. Escaping
// <, > and & neutralises the breakout while staying valid JSON-LD.
export function ldJson(obj: unknown): string {
  return JSON.stringify(obj)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
}
