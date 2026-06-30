import * as LocalAuthentication from 'expo-local-authentication'
import * as SecureStore from 'expo-secure-store'

const PREF_KEY = 'fairdo_biometric_enabled'

export async function isBiometricEnabled(): Promise<boolean> {
  const val = await SecureStore.getItemAsync(PREF_KEY).catch(() => null)
  // Default on — opt-out only. null means first launch → enabled.
  return val !== 'false'
}

export async function setBiometricEnabled(enabled: boolean): Promise<void> {
  await SecureStore.setItemAsync(PREF_KEY, enabled ? 'true' : 'false')
}

export async function isBiometricSupported(): Promise<boolean> {
  const hardware = await LocalAuthentication.hasHardwareAsync()
  if (!hardware) return false
  const enrolled = await LocalAuthentication.isEnrolledAsync()
  return enrolled
}

export type AuthResult = 'success' | 'cancelled' | 'not_supported'

export async function promptBiometric(): Promise<AuthResult> {
  const supported = await isBiometricSupported()
  if (!supported) return 'not_supported'

  const enabled = await isBiometricEnabled()
  if (!enabled) return 'success'

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Unlock fair-do',
    cancelLabel: 'Cancel',
    disableDeviceFallback: false,
    fallbackLabel: 'Use passcode',
  })

  if (result.success) return 'success'
  if (result.error === 'user_cancel' || result.error === 'system_cancel') return 'cancelled'
  return 'cancelled'
}
