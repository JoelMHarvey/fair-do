import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react'
import { AppState, type AppStateStatus } from 'react-native'
import { queryClient } from '@/lib/query-client'
import { promptBiometric } from '@/lib/biometric'

// Query keys that contain special-category clinical data.
// These are cleared from memory when the app backgrounds.
const CLINICAL_QUERY_PREFIXES = ['client']

type LockContextValue = {
  locked: boolean
  unlock: () => Promise<void>
}

const LockContext = createContext<LockContextValue>({
  locked: false,
  unlock: async () => {},
})

export function useLock() {
  return useContext(LockContext)
}

export function LockProvider({ children }: { children: ReactNode }) {
  const [locked, setLocked] = useState(true)
  const appState = useRef<AppStateStatus>(AppState.currentState)
  // Track when we backgrounded so we only lock after ≥30s in background
  const backgroundedAt = useRef<number | null>(null)
  const LOCK_AFTER_MS = 30_000

  const clearClinicalCache = useCallback(() => {
    queryClient.removeQueries({
      predicate: q =>
        CLINICAL_QUERY_PREFIXES.some(prefix => String(q.queryKey[0]).startsWith(prefix)),
    })
  }, [])

  const unlock = useCallback(async () => {
    const result = await promptBiometric()
    if (result === 'success' || result === 'not_supported') {
      setLocked(false)
    }
    // 'cancelled' → stay locked
  }, [])

  // Cold start — prompt immediately
  useEffect(() => {
    unlock()
  }, [unlock])

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next: AppStateStatus) => {
      const prev = appState.current
      appState.current = next

      if (next === 'background' || next === 'inactive') {
        backgroundedAt.current = Date.now()
        clearClinicalCache()
      }

      if (next === 'active' && (prev === 'background' || prev === 'inactive')) {
        const elapsed = backgroundedAt.current
          ? Date.now() - backgroundedAt.current
          : Infinity
        backgroundedAt.current = null

        if (elapsed >= LOCK_AFTER_MS) {
          setLocked(true)
          unlock()
        }
      }
    })
    return () => sub.remove()
  }, [clearClinicalCache, unlock])

  return (
    <LockContext.Provider value={{ locked, unlock }}>
      {children}
    </LockContext.Provider>
  )
}
