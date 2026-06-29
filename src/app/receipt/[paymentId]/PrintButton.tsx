'use client'

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="text-sm font-medium text-brand-600 hover:text-brand-700"
    >
      Print / save PDF
    </button>
  )
}
