import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useState } from 'react'
import { useLock } from '@/providers/lock-provider'

export function LockScreen() {
  const { unlock } = useLock()
  const [loading, setLoading] = useState(false)

  async function tryUnlock() {
    setLoading(true)
    await unlock()
    setLoading(false)
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View
        style={styles.body}
        accessible
        accessibilityLabel="fair-do is locked. Authenticate to continue."
      >
        <View style={styles.logoMark}>
          <Text style={styles.logoText}>F</Text>
        </View>
        <Text style={styles.title}>fair-do</Text>
        <Text style={styles.subtitle}>Authenticate to continue</Text>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonLoading]}
          onPress={tryUnlock}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel="Authenticate with Face ID or fingerprint"
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Unlock</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0F2419' },
  body: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  logoMark: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#166534',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  logoText: { fontSize: 36, fontWeight: '800', color: '#86EFAC' },
  title: { fontSize: 28, fontWeight: '700', color: '#fff', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#86EFAC', marginBottom: 48 },
  button: {
    backgroundColor: '#16A34A',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 48,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonLoading: { opacity: 0.7 },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '600' },
})
