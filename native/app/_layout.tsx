import { ClerkProvider, useAuth } from '@clerk/clerk-expo'
import { Slot, useRouter, useSegments } from 'expo-router'
import { useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import * as Notifications from 'expo-notifications'
import { QueryProvider } from '@/providers/query-provider'
import { LockProvider, useLock } from '@/providers/lock-provider'
import { LockScreen } from '@/components/LockScreen'
import { OfflineBanner } from '@/components/OfflineBanner'
import { tokenCache } from '@/lib/token-cache'
import { registerForPushNotifications } from '@/lib/notifications'
import { initSentry, setSentryUser, clearSentryUser } from '@/lib/sentry'

initSentry()

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!

if (!publishableKey) {
  throw new Error('EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY is not set in .env.local')
}

function AuthGate() {
  const { isLoaded, isSignedIn, userId, getToken } = useAuth()
  const segments = useSegments()
  const router = useRouter()

  // Sync Sentry user identity (opaque Clerk ID only — no PII)
  useEffect(() => {
    if (isSignedIn && userId) {
      setSentryUser(userId)
    } else {
      clearSentryUser()
    }
  }, [isSignedIn, userId])

  // Register push token once signed in
  useEffect(() => {
    if (isSignedIn) {
      registerForPushNotifications(getToken).catch(() => {})
    }
  }, [isSignedIn, getToken])

  // Handle push notification taps
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(response => {
      const url = response.notification.request.content.data?.url as string | undefined
      if (url?.startsWith('/session/')) {
        const id = url.replace('/session/', '')
        router.push(`/session/${id}` as never)
      } else if (url?.startsWith('/messages/')) {
        router.push('/(tabs)/messages/')
      }
    })
    return () => sub.remove()
  }, [router])

  useEffect(() => {
    if (!isLoaded) return
    const inAuthGroup = segments[0] === '(auth)'
    if (!isSignedIn && !inAuthGroup) {
      router.replace('/(auth)/sign-in')
    } else if (isSignedIn && inAuthGroup) {
      router.replace('/(tabs)/')
    }
  }, [isLoaded, isSignedIn, segments, router])

  return <Slot />
}

function AppShell() {
  const { locked } = useLock()

  return (
    <View style={styles.shell}>
      <AuthGate />
      <OfflineBanner />
      {locked && <LockScreen />}
    </View>
  )
}

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <QueryProvider>
        <LockProvider>
          <AppShell />
        </LockProvider>
      </QueryProvider>
    </ClerkProvider>
  )
}

const styles = StyleSheet.create({
  shell: { flex: 1 },
})
