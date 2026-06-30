import Constants from 'expo-constants'
import { useAuth } from '@clerk/clerk-expo'
import { useCallback } from 'react'
import { z } from 'zod'

const API_URL = (Constants.expoConfig?.extra?.apiUrl as string | undefined)
  ?? process.env.EXPO_PUBLIC_API_URL
  ?? 'https://fair-do.com'

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function apiFetch<T>(
  path: string,
  token: string | null,
  schema: z.ZodType<T>,
  init?: RequestInit,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init?.headers as Record<string, string>),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API_URL}${path}`, { ...init, headers })

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new ApiError(res.status, text)
  }

  const json = await res.json()
  return schema.parse(json)
}

// Hook that returns a typed fetch function pre-loaded with the Clerk session token.
// Use this inside React Query queryFns.
export function useApiFetch() {
  const { getToken } = useAuth()

  return useCallback(
    async function fetch<T>(
      path: string,
      schema: z.ZodType<T>,
      init?: RequestInit,
    ): Promise<T> {
      const token = await getToken()
      return apiFetch(path, token, schema, init)
    },
    [getToken],
  )
}

export { ApiError, apiFetch }
