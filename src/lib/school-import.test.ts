import { describe, it, expect } from 'vitest'
import { parseCsv, parseImportCsv, IMPORT_TEMPLATE_CSV, MAX_IMPORT_ROWS } from './school-import'

describe('parseCsv', () => {
  it('parses simple rows', () => {
    expect(parseCsv('a,b,c\nd,e,f')).toEqual([['a', 'b', 'c'], ['d', 'e', 'f']])
  })

  it('handles CRLF line endings', () => {
    expect(parseCsv('a,b\r\nc,d\r\n')).toEqual([['a', 'b'], ['c', 'd']])
  })

  it('strips a UTF-8 BOM', () => {
    expect(parseCsv('﻿a,b\nc,d')).toEqual([['a', 'b'], ['c', 'd']])
  })

  it('handles quoted fields with commas', () => {
    expect(parseCsv('"Smith, Jane",x')).toEqual([['Smith, Jane', 'x']])
  })

  it('handles escaped quotes inside quoted fields', () => {
    expect(parseCsv('"say ""hi""",x')).toEqual([['say "hi"', 'x']])
  })

  it('handles newlines inside quoted fields', () => {
    expect(parseCsv('"line1\nline2",x\ny,z')).toEqual([['line1\nline2', 'x'], ['y', 'z']])
  })

  it('keeps empty cells', () => {
    expect(parseCsv('a,,c')).toEqual([['a', '', 'c']])
  })

  it('returns nothing for an empty string', () => {
    expect(parseCsv('')).toEqual([])
  })
})

const HEADER = 'firstName,lastName,email,yearGroup,house,class1,class2'

describe('parseImportCsv', () => {
  it('parses valid rows with structure columns', () => {
    const { rows, errors } = parseImportCsv(`${HEADER}\nAda,Lovelace,Ada@Example.com,Year 9,Austen,9B,Set 1 Maths\n`)
    expect(errors).toEqual([])
    expect(rows).toEqual([{
      line: 2,
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com', // lowercased
      yearGroup: 'Year 9',
      house: 'Austen',
      classes: ['9B', 'Set 1 Maths'],
    }])
  })

  it('accepts the downloadable template', () => {
    const { rows, errors } = parseImportCsv(IMPORT_TEMPLATE_CSV)
    expect(errors).toEqual([])
    expect(rows).toHaveLength(2)
    expect(rows[1].classes).toEqual(['11A']) // trailing empty class cell dropped
  })

  it('treats yearGroup/house/classes as optional', () => {
    const { rows, errors } = parseImportCsv('firstName,lastName,email\nAda,Lovelace,ada@example.com')
    expect(errors).toEqual([])
    expect(rows[0]).toMatchObject({ yearGroup: null, house: null, classes: [] })
  })

  it('matches header columns case-insensitively and in any order', () => {
    const { rows, errors } = parseImportCsv('EMAIL,LASTNAME,FIRSTNAME\nada@example.com,Lovelace,Ada')
    expect(errors).toEqual([])
    expect(rows[0]).toMatchObject({ firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com' })
  })

  it('rejects a file without the required header columns', () => {
    const { rows, errors } = parseImportCsv('name,email\nAda,ada@example.com')
    expect(rows).toEqual([])
    expect(errors).toEqual([{ line: 1, message: 'Header row must include firstName, lastName and email columns' }])
  })

  it('rejects an empty file', () => {
    expect(parseImportCsv('').errors).toHaveLength(1)
    expect(parseImportCsv('\n\n').errors).toHaveLength(1)
  })

  it('reports invalid emails with the line number', () => {
    const { rows, errors } = parseImportCsv(`${HEADER}\nAda,Lovelace,not-an-email,,,,`)
    expect(rows).toEqual([])
    expect(errors).toEqual([{ line: 2, message: '"not-an-email" is not a valid email' }])
  })

  it('reports missing names', () => {
    const { errors } = parseImportCsv(`${HEADER}\n,Lovelace,ada@example.com,,,,`)
    expect(errors).toEqual([{ line: 2, message: 'firstName and lastName are required' }])
  })

  it('keeps the first row and errors later duplicates of the same email', () => {
    const { rows, errors } = parseImportCsv(
      `${HEADER}\nAda,Lovelace,ada@example.com,,,,\nAda2,Lovelace2,ADA@example.com,,,,`,
    )
    expect(rows).toHaveLength(1)
    expect(rows[0].firstName).toBe('Ada')
    expect(errors).toEqual([{ line: 3, message: 'Duplicate email "ada@example.com" — already on an earlier row' }])
  })

  it('skips blank lines without erroring', () => {
    const { rows, errors } = parseImportCsv(`${HEADER}\n\nAda,Lovelace,ada@example.com,,,,\n\n`)
    expect(errors).toEqual([])
    expect(rows).toHaveLength(1)
    expect(rows[0].line).toBe(3)
  })

  it('handles quoted names containing commas', () => {
    const { rows, errors } = parseImportCsv(`${HEADER}\n"Lovelace, Ada",Byron,ada@example.com,,,,`)
    expect(errors).toEqual([])
    expect(rows[0].firstName).toBe('Lovelace, Ada')
  })

  it('dedupes repeated class names within a row', () => {
    const { rows } = parseImportCsv(`${HEADER}\nAda,Lovelace,ada@example.com,,,9B,9B`)
    expect(rows[0].classes).toEqual(['9B'])
  })

  it('rejects over-long structure names (they get auto-created on commit)', () => {
    const long = 'x'.repeat(101)
    const { rows, errors } = parseImportCsv(`${HEADER}\nAda,Lovelace,ada@example.com,${long},,,`)
    expect(rows).toEqual([])
    expect(errors).toEqual([{ line: 2, message: 'Year group, house and class names must be 100 characters or fewer' }])
  })

  it('exposes the 500-row cap for the API route', () => {
    expect(MAX_IMPORT_ROWS).toBe(500)
  })
})
