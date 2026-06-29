'use client'

import { useState } from 'react'

export default function WhiteboardButton({ url, embeddable }: { url: string; embeddable: boolean }) {
  const [open, setOpen] = useState(false)

  if (!embeddable) {
    return (
      <button
        onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
        className="text-sm text-brand-100/90 hover:text-white transition"
      >
        🖊 Whiteboard
      </button>
    )
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="text-sm text-brand-100/90 hover:text-white transition">
        🖊 Whiteboard
      </button>
      {open && (
        <div className="fixed inset-0 z-[60] bg-brand-900/90 flex flex-col">
          <div className="flex items-center justify-between px-4 py-2 shrink-0">
            <span className="text-white text-sm font-medium">Shared whiteboard</span>
            <button onClick={() => setOpen(false)} className="text-white/90 hover:text-white text-sm px-3 py-1 rounded-lg border border-white/20">
              Close ✕
            </button>
          </div>
          <iframe
            src={url}
            title="Shared whiteboard"
            className="flex-1 w-full bg-white"
            allow="clipboard-read; clipboard-write"
          />
        </div>
      )}
    </>
  )
}
