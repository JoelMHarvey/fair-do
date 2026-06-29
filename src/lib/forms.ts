export type FormField = {
  id: string
  label: string
  type: 'text' | 'textarea' | 'checkbox' | 'choice'
  options?: string[]
  required?: boolean
}

export type FormTemplate = { key: string; title: string; type: string; fields: FormField[] }

// Starter templates a teacher can send to a student before lessons.
export const FORM_TEMPLATES: FormTemplate[] = [
  {
    key: 'intake',
    title: 'Intake form',
    type: 'intake',
    fields: [
      { id: 'fullName', label: 'Full name', type: 'text', required: true },
      { id: 'dob', label: 'Date of birth', type: 'text' },
      { id: 'phone', label: 'Phone number', type: 'text' },
      { id: 'subject', label: 'What subject(s) do you need help with?', type: 'textarea', required: true },
      { id: 'level', label: 'What level are you studying at? (e.g. GCSE, A-Level, University)', type: 'text' },
      { id: 'goals', label: 'What are your main goals? (e.g. pass an exam, build confidence, advance skills)', type: 'textarea' },
      { id: 'history', label: 'Have you had tuition before? Anything you\'d like me to know?', type: 'textarea' },
      { id: 'emergency', label: 'Emergency contact (name & number) — required for under-18 students', type: 'text' },
    ],
  },
  {
    key: 'consent',
    title: 'Consent to tuition',
    type: 'consent',
    fields: [
      { id: 'consentTuition', label: 'I consent to begin lessons with my tutor.', type: 'checkbox', required: true },
      { id: 'consentData', label: 'I consent to my tutor processing my personal data to provide tuition (name, email, lesson history, progress notes).', type: 'checkbox', required: true },
      { id: 'signature', label: 'Type your full name to sign', type: 'text', required: true },
      { id: 'date', label: 'Today\'s date', type: 'text', required: true },
    ],
  },
]

export const TEMPLATE_BY_KEY = Object.fromEntries(FORM_TEMPLATES.map(t => [t.key, t]))
