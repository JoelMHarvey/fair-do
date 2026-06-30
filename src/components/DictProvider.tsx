'use client'

import { createContext, useContext } from 'react'
import type { Messages } from '@/lib/locale-config'

// Client-side access to the active-locale dictionary. The root layout (a server
// component) loads the dictionary once and passes it here; any client component
// can then read copy via useDict() without prop-drilling. Server components
// should keep using getDictionary() directly instead.
const DictContext = createContext<Messages | null>(null)

export function DictProvider({ dict, children }: { dict: Messages; children: React.ReactNode }) {
  return <DictContext.Provider value={dict}>{children}</DictContext.Provider>
}

export function useDict(): Messages {
  const dict = useContext(DictContext)
  if (!dict) throw new Error('useDict must be used within <DictProvider>')
  return dict
}
