import { Component, type ReactNode } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as Sentry from '@sentry/react-native'

type Props = { children: ReactNode; fallback?: ReactNode }
type State = { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error) {
    // Sentry capture happens here in production; message text is scrubbed by beforeSend.
    if (!__DEV__) Sentry.captureException(error)
  }

  render() {
    if (this.state.error) {
      return (
        this.props.fallback ?? (
          <SafeAreaView style={styles.safe}>
            <View style={styles.body}>
              <Text style={styles.title}>Something went wrong</Text>
              <Text style={styles.message}>
                {__DEV__ ? this.state.error.message : 'Restart the app to continue.'}
              </Text>
              <TouchableOpacity
                style={styles.button}
                onPress={() => this.setState({ error: null })}
                accessibilityRole="button"
                accessibilityLabel="Try again"
              >
                <Text style={styles.buttonText}>Try again</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        )
      )
    }
    return this.props.children
  }
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F0E8' },
  body: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  title: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 12 },
  message: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 32, lineHeight: 20 },
  button: { backgroundColor: '#1A3A2A', borderRadius: 10, paddingHorizontal: 24, paddingVertical: 12 },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
})
