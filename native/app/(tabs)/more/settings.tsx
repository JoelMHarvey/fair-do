import { useState, useEffect, useCallback } from 'react'
import { View, Text, Switch, StyleSheet, TouchableOpacity, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '@clerk/clerk-expo'
import { useRouter } from 'expo-router'
import * as Notifications from 'expo-notifications'
import {
  isBiometricSupported,
  isBiometricEnabled,
  setBiometricEnabled,
} from '@/lib/biometric'

export default function SettingsScreen() {
  const { signOut } = useAuth()
  const router = useRouter()
  const [biometricSupported, setBiometricSupported] = useState(false)
  const [biometricOn, setBiometricOn] = useState(true)
  const [notifStatus, setNotifStatus] = useState<string>('–')

  const load = useCallback(async () => {
    const [supported, enabled, notifSettings] = await Promise.all([
      isBiometricSupported(),
      isBiometricEnabled(),
      Notifications.getPermissionsAsync(),
    ])
    setBiometricSupported(supported)
    setBiometricOn(enabled)
    setNotifStatus(notifSettings.status === 'granted' ? 'Enabled' : 'Disabled')
  }, [])

  useEffect(() => { load() }, [load])

  async function toggleBiometric(value: boolean) {
    setBiometricOn(value)
    await setBiometricEnabled(value)
  }

  async function requestNotifPermission() {
    const { status } = await Notifications.requestPermissionsAsync()
    setNotifStatus(status === 'granted' ? 'Enabled' : 'Disabled')
  }

  function confirmSignOut() {
    Alert.alert(
      'Sign out',
      'You will need to authenticate again to access student records.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign out', style: 'destructive', onPress: () => signOut() },
      ],
    )
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={styles.back}
        >
          <Text style={styles.backText}>‹ More</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Security</Text>
        <View style={styles.card}>
          <View
            style={styles.row}
            accessible
            accessibilityLabel={`Biometric lock, ${biometricOn ? 'enabled' : 'disabled'}`}
            accessibilityRole="none"
          >
            <View style={styles.rowMeta}>
              <Text style={styles.rowLabel}>Biometric lock</Text>
              <Text style={styles.rowSub}>
                {biometricSupported
                  ? 'Lock app after 30s in background'
                  : 'Not supported on this device'}
              </Text>
            </View>
            <Switch
              value={biometricOn}
              onValueChange={toggleBiometric}
              disabled={!biometricSupported}
              trackColor={{ false: '#E5E7EB', true: '#16A34A' }}
              thumbColor="#fff"
              accessibilityLabel="Toggle biometric lock"
              accessibilityRole="switch"
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Notifications</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowMeta}>
              <Text style={styles.rowLabel}>Push notifications</Text>
              <Text style={styles.rowSub}>{notifStatus}</Text>
            </View>
            {notifStatus === 'Disabled' && (
              <TouchableOpacity
                onPress={requestNotifPermission}
                style={styles.enableBtn}
                accessibilityRole="button"
                accessibilityLabel="Enable push notifications"
              >
                <Text style={styles.enableBtnText}>Enable</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.row}
            onPress={confirmSignOut}
            accessibilityRole="button"
            accessibilityLabel="Sign out of fair-do"
          >
            <Text style={styles.destructive}>Sign out</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.footer}>
        Clinical data is encrypted at rest and in transit.{'\n'}
        Protected under UK GDPR Article 9 (special category data).
      </Text>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F0E8' },
  header: { padding: 20, paddingBottom: 12 },
  back: { marginBottom: 4 },
  backText: { fontSize: 15, color: '#1A3A2A', fontWeight: '500' },
  title: { fontSize: 22, fontWeight: '700', color: '#1A3A2A' },
  section: { paddingHorizontal: 16, marginBottom: 20 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    paddingLeft: 4,
  },
  card: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB', overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  rowMeta: { flex: 1 },
  rowLabel: { fontSize: 15, fontWeight: '500', color: '#111827' },
  rowSub: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  enableBtn: { backgroundColor: '#1A3A2A', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  enableBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  destructive: { fontSize: 15, fontWeight: '500', color: '#DC2626' },
  footer: { paddingHorizontal: 20, fontSize: 11, color: '#9CA3AF', lineHeight: 16, textAlign: 'center' },
})
