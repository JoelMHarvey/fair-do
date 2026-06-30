import { useSignIn } from '@clerk/clerk-expo'
import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSignIn() {
    if (!isLoaded) return
    setLoading(true)
    setError(null)

    try {
      const result = await signIn.create({ identifier: email, password })

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
      } else {
        setError('Sign-in could not be completed. Check your details and try again.')
      }
    } catch (e: unknown) {
      const msg =
        e instanceof Error ? e.message : 'Something went wrong. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Text style={styles.wordmark}>fair-do</Text>
          <Text style={styles.subtitle}>Practice management for teachers</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            textContentType="emailAddress"
            placeholder="you@example.com"
            placeholderTextColor="#9CA3AF"
          />

          <Text style={[styles.label, { marginTop: 16 }]}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textContentType="password"
            placeholder="••••••••"
            placeholderTextColor="#9CA3AF"
            onSubmitEditing={handleSignIn}
            returnKeyType="done"
          />

          {error != null && <Text style={styles.error}>{error}</Text>}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSignIn}
            disabled={loading || !email || !password}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Sign in</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.footer}>
            Forgotten your password? Visit fair-do.com to reset it.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F0E8' },
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  header: { marginBottom: 40 },
  wordmark: {
    fontFamily: 'System',
    fontSize: 32,
    fontWeight: '700',
    color: '#1A3A2A',
    marginBottom: 6,
  },
  subtitle: { fontSize: 15, color: '#6B7280' },
  form: {},
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 6 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  error: {
    marginTop: 12,
    color: '#DC2626',
    fontSize: 14,
  },
  button: {
    marginTop: 24,
    backgroundColor: '#1A3A2A',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  footer: { marginTop: 20, textAlign: 'center', fontSize: 13, color: '#9CA3AF' },
})
