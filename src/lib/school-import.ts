// School member CSV import (M2.4) — pure parsing + validation, dependency-free
// so it unit-tests without a database. The API route
// (src/app/api/school/import/route.ts) owns the database semantics: matching
// existing students by email, auto-creating structure rows, dry-run vs commit.

export const MAX_IMPORT_ROWS = 500

// Downloadable template. Columns: firstName,lastName,email are required;
// yearGroup and house are optional; any number of class1,class2,… columns.
export const IMPORT_TEMPLATE_CSV =
  [
    'firstName,lastName,email,yearGroup,house,class1,class2',
    'Ada,Lovelace,ada.lovelace@example.com,Year 9,Austen,9B,Set 1 Maths',
    'Alan,Turing,alan.turing@example.com,Year 11,Byron,11A,',
  ].join('\r\n') + '\r\n'

export type ImportRow = {
  line: number // 1-based line number in the file (header = line 1)
  firstName: string
  lastName: string
  email: string // normalised to lowercase
  yearGroup: string | null
  house: string | null
  classes: string[]
}

export type ImportRowError = { line: number; message: string }

export type ParsedImport = { rows: ImportRow[]; errors: ImportRowError[] }

/**
 * Minimal RFC 4180-style CSV parser: quoted fields (commas/newlines inside
 * quotes, "" escapes), CRLF or LF line endings, UTF-8 BOM stripped. Returns
 * raw rows of cells — no trimming, no header handling.
 */
export function parseCsv(text: string): string[][] {
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1) // Excel prepends a BOM
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false
  let i = 0
  while (i < text.length) {
    const ch = text[i]
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i += 2; continue } // escaped quote
        inQuotes = false; i++; continue
      }
      field += ch; i++; continue
    }
    if (ch === '"' && field === '') { inQuotes = true; i++; continue }
    if (ch === ',') { row.push(field); field = ''; i++; continue }
    if (ch === '\r' || ch === '\n') {
      if (ch === '\r' && text[i + 1] === '\n') i++
      row.push(field); rows.push(row)
      row = []; field = ''; i++; continue
    }
    field += ch; i++
  }
  if (field !== '' || row.length > 0) { row.push(field); rows.push(row) } // final unterminated line
  return rows
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_NAME = 100
const MAX_EMAIL = 200

/**
 * Parse + validate a member-import CSV. The header row is required and must
 * contain firstName, lastName and email columns (case-insensitive; yearGroup,
 * house and class1…classN are optional). Rows failing validation land in
 * `errors` with their line number; duplicate emails keep the first occurrence.
 * The MAX_IMPORT_ROWS cap is enforced by the caller so it can report the
 * over-limit count.
 */
export function parseImportCsv(text: string): ParsedImport {
  const rows: ImportRow[] = []
  const errors: ImportRowError[] = []
  const raw = parseCsv(text)
  const headerIdx = raw.findIndex(cells => cells.some(c => c.trim() !== ''))
  if (headerIdx === -1) return { rows, errors: [{ line: 1, message: 'The file is empty' }] }

  const header = raw[headerIdx].map(h => h.trim().toLowerCase())
  const col = (name: string) => header.indexOf(name.toLowerCase())
  const iFirst = col('firstName')
  const iLast = col('lastName')
  const iEmail = col('email')
  if (iFirst < 0 || iLast < 0 || iEmail < 0) {
    return { rows, errors: [{ line: headerIdx + 1, message: 'Header row must include firstName, lastName and email columns' }] }
  }
  const iYear = col('yearGroup')
  const iHouse = col('house')
  const classCols = header.flatMap((h, idx) => (/^class\d*$/.test(h) ? [idx] : []))

  const seen = new Set<string>()
  for (let r = headerIdx + 1; r < raw.length; r++) {
    const line = r + 1
    const cells = raw[r]
    if (cells.every(c => c.trim() === '')) continue // blank line
    const firstName = (cells[iFirst] ?? '').trim()
    const lastName = (cells[iLast] ?? '').trim()
    const email = (cells[iEmail] ?? '').trim().toLowerCase()
    if (!firstName || !lastName) { errors.push({ line, message: 'firstName and lastName are required' }); continue }
    if (firstName.length > MAX_NAME || lastName.length > MAX_NAME) { errors.push({ line, message: `Names must be ${MAX_NAME} characters or fewer` }); continue }
    if (!EMAIL_RE.test(email) || email.length > MAX_EMAIL) { errors.push({ line, message: email ? `"${email}" is not a valid email` : 'email is required' }); continue }
    if (seen.has(email)) { errors.push({ line, message: `Duplicate email "${email}" — already on an earlier row` }); continue }
    const classes = [...new Set(classCols.map(idx => (cells[idx] ?? '').trim()).filter(Boolean))]
    const yearGroup = iYear >= 0 ? (cells[iYear] ?? '').trim() || null : null
    const house = iHouse >= 0 ? (cells[iHouse] ?? '').trim() || null : null
    // Structure names get auto-created in commit mode — keep them sane.
    if ([yearGroup, house, ...classes].some(v => v !== null && v.length > MAX_NAME)) {
      errors.push({ line, message: `Year group, house and class names must be ${MAX_NAME} characters or fewer` })
      continue
    }
    seen.add(email)
    rows.push({ line, firstName, lastName, email, yearGroup, house, classes })
  }
  return { rows, errors }
}
