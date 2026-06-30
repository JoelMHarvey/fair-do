import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://fair-do.com'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
})

export async function registerForPushNotifications(
  getToken: () => Promise<string | null>,
): Promise<void> {
  if (Platform.OS === 'web') return

  const { status: existing } = await Notifications.getPermissionsAsync()
  let finalStatus = existing

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }

  if (finalStatus !== 'granted') return

  let expoPushToken: string
  try {
    const tokenData = await Notifications.getExpoPushTokenAsync()
    expoPushToken = tokenData.data
  } catch {
    // Physical device required — silently skip on simulator
    return
  }

  const clerkToken = await getToken()
  if (!clerkToken) return

  await fetch(`${API_URL}/api/push/device`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${clerkToken}`,
    },
    body: JSON.stringify({
      token: expoPushToken,
      platform: Platform.OS === 'ios' ? 'ios' : 'android',
    }),
  }).catch(() => {})
}

export async function unregisterPushToken(
  getToken: () => Promise<string | null>,
  expoPushToken: string,
): Promise<void> {
  const clerkToken = await getToken()
  if (!clerkToken) return

  await fetch(`${API_URL}/api/push/device`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${clerkToken}`,
    },
    body: JSON.stringify({ token: expoPushToken }),
  }).catch(() => {})
}
