'use client'

export function PrintButton({ label }: { label: string }) {
  return (
    <button
      onClick={() => window.print()}
      className="print:hidden bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-brand-700 transition"
    >
      {label}
    </button>
  )
}
