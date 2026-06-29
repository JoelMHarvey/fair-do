// Canonical teaching taxonomy — single source of truth for subjects, levels,
// age groups and teaching styles. Used by student/teacher onboarding, the
// profile form, the matching algorithm and the directory filters.

export const SUBJECTS = [
  'Maths', 'Further Maths',
  'English Language', 'English Literature',
  'Biology', 'Chemistry', 'Physics', 'Combined Science',
  'History', 'Geography', 'Religious Studies',
  'French', 'Spanish', 'German', 'Mandarin', 'Latin',
  'Art & Design', 'Music', 'Drama',
  'Computer Science', 'ICT',
  'Economics', 'Business Studies', 'Psychology', 'Sociology',
  'Physical Education',
  'UCAS / University Applications',
  'English as a Second Language (ESL/EFL)',
  'Coding / Programming',
  'Piano', 'Guitar', 'Violin', 'Drums', 'Singing',
] as const

export const LEVELS = [
  'KS1', 'KS2', 'KS3', 'GCSE', 'IGCSE', 'A-Level', 'IB', 'Scottish Highers', 'University', 'Adult',
] as const

export const AGE_GROUPS = [
  'Under 7', '7–11', '11–14', '14–16', '16–18', 'Adult',
] as const

export const TEACHING_STYLES = [
  'Structured', 'Socratic', 'Project-based', 'Exam-focused', 'Conversational', 'Hands-on',
] as const

// Qualification bodies a tutor can hold — short list + free text "Other".
export const QUALIFICATION_BODIES = [
  'QTS', 'PGCE', 'ABRSM', 'Trinity', 'CELTA', 'TEFL', 'ICF', 'Degree', 'Other',
] as const

export const GOALS = [
  'Pass an exam', 'Build confidence', 'Keep up with class', 'Advance skills', 'Catch up', 'Stretch / extension',
] as const

export const FREQUENCY = [
  'Once a week', 'Twice a week', 'Fortnightly', 'Flexible',
] as const

export type Subject = typeof SUBJECTS[number]
export type Level = typeof LEVELS[number]
export type AgeGroup = typeof AGE_GROUPS[number]
export type TeachingStyle = typeof TEACHING_STYLES[number]
