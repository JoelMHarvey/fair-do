// Canonical teaching taxonomy — single source of truth for subjects, levels,
// age groups and teaching styles. Used by student/teacher onboarding, the
// profile form, the matching algorithm and the directory filters.

export const SUBJECTS = [
  'Maths', 'Further Maths', 'Statistics',
  'English Language', 'English Literature', 'Creative Writing', 'Study Skills',
  'Biology', 'Chemistry', 'Physics', 'Combined Science', 'Environmental Science', 'Astronomy',
  'History', 'Geography', 'Religious Studies', 'Politics', 'Philosophy', 'Classics', 'Law',
  'French', 'Spanish', 'German', 'Mandarin', 'Latin', 'Italian', 'Arabic', 'Japanese', 'Russian', 'Portuguese', 'Welsh',
  'Art & Design', 'Design & Technology', 'Media Studies', 'Music', 'Music Theory', 'Drama',
  'Computer Science', 'ICT', 'Coding / Programming', 'Electronics',
  'Economics', 'Accounting', 'Business Studies', 'Psychology', 'Sociology',
  'Physical Education', 'Health & Social Care', 'Food Technology',
  '11+ / Entrance Exams', '7+ / 8+', '13+ Common Entrance', 'Verbal & Non-verbal Reasoning',
  'UCAS / University Applications', 'Personal Statements',
  'English as a Second Language (ESL/EFL)',
  'SEN / Learning Support', 'Public Speaking',
  'Piano', 'Guitar', 'Bass Guitar', 'Violin', 'Cello', 'Flute', 'Saxophone', 'Drums', 'Ukulele', 'Singing',
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
